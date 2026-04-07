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
  fetchProducts: () => Promise<void>;
  fetchCategoriesAndCollections: () => Promise<void>;
  initialize: () => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategorySlug: (slug: string) => Product[];
  getProductsByCollectionSlug: (slug: string) => Product[];
  invalidate: () => void;
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  categories: [],
  collections: [],
  loading: false,
  error: null,
  initialized: false,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      // Ensure images/colors/sizes are arrays (handle both string and array)
      const products: Product[] = (Array.isArray(data) ? data : data.products || []).map((p: Record<string, unknown>) => ({
        ...p,
        images: typeof p.images === 'string' ? JSON.parse(p.images) : (Array.isArray(p.images) ? p.images : []),
        colors: typeof p.colors === 'string' ? JSON.parse(p.colors) : (Array.isArray(p.colors) ? p.colors : []),
        sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : (Array.isArray(p.sizes) ? p.sizes : []),
      }));
      set({ products, loading: false });
    } catch (err) {
      console.error('Failed to fetch products:', err);
      set({ error: 'Failed to load products', loading: false });
    }
  },

  fetchCategoriesAndCollections: async () => {
    try {
      const [catRes, colRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/collections'),
      ]);

      const categories = catRes.ok ? await catRes.json() : [];
      const collections = colRes.ok ? await colRes.json() : [];

      set({ categories, collections });
    } catch (err) {
      console.error('Failed to fetch categories/collections:', err);
    }
  },

  initialize: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    await Promise.all([
      get().fetchProducts(),
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
    // Find category by slug (or parent slug match)
    const categoryIds = new Set<string>();
    for (const cat of categories) {
      if (cat.slug === slug) {
        categoryIds.add(cat.id);
      }
      if (cat.parentId) {
        // Check parent
        const parent = categories.find((c) => c.id === cat.parentId);
        if (parent && parent.slug === slug) {
          categoryIds.add(cat.id);
        }
      }
    }
    if (categoryIds.size === 0) return products;
    // Match products that have these category IDs in their categories array
    return products.filter((p) => {
      const productCats = (p as Record<string, unknown>).categories as Array<{ id: string }> | undefined;
      if (!productCats || !Array.isArray(productCats)) return false;
      return productCats.some((c) => categoryIds.has(c.id));
    });
  },

  getProductsByCollectionSlug: (slug) => {
    const { products } = get();
    return products.filter((p) => {
      const productCols = (p as Record<string, unknown>).collections as Array<{ slug: string }> | undefined;
      if (!productCols || !Array.isArray(productCols)) return false;
      return productCols.some((c) => c.slug === slug);
    });
  },

  invalidate: () => {
    set({ initialized: false });
    get().initialize();
  },
}));
