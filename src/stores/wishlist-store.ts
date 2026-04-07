import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  items: string[]; // product IDs
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) => {
        set((state) => ({
          items: state.items.includes(productId) ? state.items : [...state.items, productId],
        }));
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }));
      },

      toggleItem: (productId) => {
        const state = get();
        if (state.items.includes(productId)) {
          state.removeItem(productId);
        } else {
          state.addItem(productId);
        }
      },
    }),
    {
      name: 'burqahijab-wishlist',
    }
  )
);

// Simple helper to check if product is wishlisted
export function isProductWishlisted(items: string[], productId: string): boolean {
  return items.includes(productId);
}
