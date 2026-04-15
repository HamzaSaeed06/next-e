/**
 * cartService.ts
 *
 * Syncs the client-side Zustand cart to a Firestore `carts/{userId}` document
 * so the cart persists across sessions and devices for authenticated users.
 * Guest carts live only in localStorage (handled by cartStore's persist).
 */

import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import type { CartItem } from '@/types';

const CARTS = 'carts';

const cartRef = (userId: string) => doc(db, CARTS, userId);

// ─── Save cart to Firestore ──────────────────────────────────────────────────

export const saveCartToFirestore = async (
  userId: string,
  items: CartItem[]
): Promise<void> => {
  await setDoc(
    cartRef(userId),
    { items, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

// ─── Load cart from Firestore ────────────────────────────────────────────────

export const loadCartFromFirestore = async (userId: string): Promise<CartItem[]> => {
  const snap = await getDoc(cartRef(userId));
  if (!snap.exists()) return [];
  const data = snap.data();
  return Array.isArray(data.items) ? (data.items as CartItem[]) : [];
};

// ─── Merge guest cart into Firestore cart ────────────────────────────────────

export const mergeGuestCart = async (
  userId: string,
  guestItems: CartItem[]
): Promise<CartItem[]> => {
  const serverItems = await loadCartFromFirestore(userId);

  const merged = [...serverItems];
  for (const guestItem of guestItems) {
    const existing = merged.find(
      (i) => i.productId === guestItem.productId && i.variantId === guestItem.variantId
    );
    if (existing) {
      existing.qty = Math.min(existing.qty + guestItem.qty, existing.stock);
    } else {
      merged.push(guestItem);
    }
  }

  await saveCartToFirestore(userId, merged);
  return merged;
};

// ─── Clear Firestore cart ────────────────────────────────────────────────────

export const clearFirestoreCart = async (userId: string): Promise<void> => {
  await updateDoc(cartRef(userId), { items: [], updatedAt: serverTimestamp() });
};

// ─── Real-time sync listener ─────────────────────────────────────────────────

export const subscribeToCart = (
  userId: string,
  callback: (items: CartItem[]) => void
) =>
  onSnapshot(cartRef(userId), (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }
    const data = snap.data();
    callback(Array.isArray(data.items) ? (data.items as CartItem[]) : []);
  });
