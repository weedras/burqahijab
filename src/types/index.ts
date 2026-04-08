export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  fabricCare: string | null;
  shipReturn: string | null;
  price: number;
  salePrice: number | null;
  currency: string;
  images: string[];
  videoUrl: string | null;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  occasion: string | null;
  fabric: string | null;
  colors: string[];
  sizes: string[];
  rating: number;
  reviewCount: number;
  stockCount: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  children?: Category[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

export interface Review {
  id: string;
  author: string;
  location: string | null;
  rating: number;
  text: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  author: string;
  location: string;
  text: string;
  rating: number;
  photoUrl: string | null;
}

export type ViewMode = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'admin' | 'faq' | 'size-guide' | 'shipping' | 'returns' | 'contact' | 'about' | 'brand-story-page' | 'careers' | 'wishlist';

export type AdminSection = 'dashboard' | 'orders' | 'products' | 'collections' | 'categories' | 'testimonials' | 'storefront' | 'settings';
