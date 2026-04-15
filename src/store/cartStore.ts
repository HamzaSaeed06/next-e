'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQty: (productId: string, qty: number, variantId?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId && i.variantId === item.variantId
                ? { ...i, qty: Math.min(i.qty + item.qty, i.stock) }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item], isOpen: true });
        }
      },
      removeItem: (productId, variantId?) =>
        set({
          items: get().items.filter(
            (i) =>
              !(
                i.productId === productId &&
                (variantId === undefined || i.variantId === variantId)
              )
          ),
        }),
      updateQty: (productId, qty, variantId?) => {
        if (qty <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId &&
            (variantId === undefined || i.variantId === variantId)
              ? { ...i, qty: Math.min(qty, i.stock) }
              : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'cart-storage' }
  )
);
