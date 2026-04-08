import { create } from 'zustand';
import type { Product, Collection, Category } from '@/types';

interface ProductState {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Actions
  fetchProducts: (attempt?: number) => Promise<void>;
  fetchCategoriesAndCollections: () => Promise<void>;
  initialize: () => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategorySlug: (slug: string) => Product[];
  getProductsByCollectionSlug: (slug: string) => Product[];
  invalidate: () => void;
}

const MAX_RETRIES = 3;
const FETCH_TIMEOUT = 15000; // 15 seconds

async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function parseArrayField<T = string>(value: unknown): T[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  categories: [],
  collections: [],
  loading: false,
  error: null,
  initialized: false,

  fetchProducts: async (attempt = 1) => {
    if (attempt === 1) set({ loading: true, error: null });
    try {
      const res = await fetchWithTimeout('/api/products', FETCH_TIMEOUT);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const products: Product[] = (Array.isArray(data) ? data : data.products || []).map((p: Record<string, unknown>) => ({
        ...p,
        images: parseArrayField<string>(p.images),
        colors: parseArrayField<string>(p.colors),
        sizes: parseArrayField<string>(p.sizes),
      }));
      set({ products, loading: false, error: null });
    } catch (err) {
      console.error(`Failed to fetch products (attempt ${attempt}/${MAX_RETRIES}):`, err);
      if (attempt < MAX_RETRIES) {
        // Retry with exponential backoff
        setTimeout(() => {
          get().fetchProducts(attempt + 1);
        }, attempt * 1000);
      } else {
        set({ error: 'Failed to load products', loading: false });
      }
    }
  },

  fetchCategoriesAndCollections: async () => {
    try {
      const [catRes, colRes] = await Promise.all([
        fetchWithTimeout('/api/categories', FETCH_TIMEOUT),
        fetchWithTimeout('/api/collections', FETCH_TIMEOUT),
      ]);

      const categories = catRes.ok ? await catRes.json() : [];
      const collections = colRes.ok ? await colRes.json() : [];

      set({ categories, collections });
    } catch (err) {
      console.error('Failed to fetch categories/collections:', err);
    }
  },

  initialize: async () => {
    // Always allow re-initialization if there's an error or no products loaded
    const state = get();
    if (state.initialized && !state.error && state.products.length > 0) return;
    set({ initialized: true, error: null });
    await Promise.all([
      get().fetchProducts(1),
      get().fetchCategoriesAndCollections(),
    ]);
  },

  getProductBySlug: (slug) => {
    return get().products.find((p) => p.slug === slug);
  },

  getProductById: (id) => {
    return get().products.find((p) => p.id === id);
  },

  getProductsByCategorySlug: (slug) => {
    const { products, categories } = get();
    const categoryIds = new Set<string>();
    for (const cat of categories) {
      if (cat.slug === slug) {
        categoryIds.add(cat.id);
      }
      if (cat.parentId) {
        const parent = categories.find((c) => c.id === cat.parentId);
        if (parent && parent.slug === slug) {
          categoryIds.add(cat.id);
        }
      }
    }
    if (categoryIds.size === 0) return products;
    return products.filter((p) => {
      const productCats = (p as unknown as Record<string, unknown>).categories as Array<{ id: string }> | undefined;
      if (!productCats || !Array.isArray(productCats)) return false;
      return productCats.some((c) => categoryIds.has(c.id));
    });
  },

  getProductsByCollectionSlug: (slug) => {
    const { products } = get();
    return products.filter((p) => {
      const productCols = (p as unknown as Record<string, unknown>).collections as Array<{ slug: string }> | undefined;
      if (!productCols || !Array.isArray(productCols)) return false;
      return productCols.some((c) => c.slug === slug);
    });
  },

  invalidate: () => {
    set({ initialized: false, error: null, loading: false });
    get().initialize();
  },
}));
