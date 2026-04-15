import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        if (!get().items.find((i) => i.id === product.id)) {
          set((state) => ({ items: [...state.items, product] }));
        }
      },
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) })),
      toggleItem: (product) => {
        if (get().items.find((i) => i.id === product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },
      isWishlisted: (productId) => !!get().items.find((i) => i.id === productId),
      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'zest-wishlist' }
  )
);
