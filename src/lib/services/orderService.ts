import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import type { Order, OrderItem, Address, CartItem } from '@/types';

const ORDERS = 'orders';

// ─── Create Order ───────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  userId: string;
  guestEmail?: string | null;
  items: CartItem[];
  address: Address;
  paymentMethod: 'cod' | 'card' | 'wallet';
  couponCode?: string;
  discount?: number;
}

export const createOrder = async (payload: CreateOrderPayload): Promise<string> => {
  const { userId, guestEmail = null, items, address, paymentMethod, couponCode, discount = 0 } = payload;

  const orderItems: OrderItem[] = items.map((item) => ({
    productId: item.productId,
    name: item.name,
    price: item.price,
    image: item.image,
    qty: item.qty,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= 5000 ? 0 : 299;
  const total = subtotal + shipping - discount;

  const docRef = await addDoc(collection(db, ORDERS), {
    userId,
    guestEmail,
    items: orderItems,
    subtotal,
    discount,
    couponCode: couponCode ?? null,
    total,
    shipping,
    status: 'pending',
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    address,
    timeline: [
      {
        status: 'pending',
        message: 'Order placed successfully',
        timestamp: new Date(),
      },
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

// ─── Read Orders ─────────────────────────────────────────────────────────────

export const getOrderById = async (id: string): Promise<Order | null> => {
  const snap = await getDoc(doc(db, ORDERS, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null;
};

export const getOrdersByUser = async (userId: string, pageSize = 10): Promise<Order[]> => {
  const q = query(
    collection(db, ORDERS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
};

export const getAllOrders = async (pageSize = 50): Promise<Order[]> => {
  const q = query(
    collection(db, ORDERS),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
};

export const getOrdersByStatus = async (
  status: Order['status'],
  pageSize = 50
): Promise<Order[]> => {
  const q = query(
    collection(db, ORDERS),
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
};

// ─── Update Order ─────────────────────────────────────────────────────────────

export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
  message: string
): Promise<void> => {
  const orderRef = doc(db, ORDERS, orderId);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) throw new Error('Order not found');

  const existing = snap.data();
  const timeline = existing.timeline ?? [];

  await updateDoc(orderRef, {
    status,
    timeline: [
      ...timeline,
      { status, message, timestamp: new Date() },
    ],
    updatedAt: serverTimestamp(),
  });
};

export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: Order['paymentStatus']
): Promise<void> => {
  await updateDoc(doc(db, ORDERS, orderId), {
    paymentStatus,
    updatedAt: serverTimestamp(),
  });
};

export const cancelOrder = async (orderId: string): Promise<void> => {
  await updateOrderStatus(orderId, 'cancelled', 'Order cancelled by customer');
};

// ─── Real-time Listener ───────────────────────────────────────────────────────

export const subscribeToOrder = (
  orderId: string,
  callback: (order: Order | null) => void
) =>
  onSnapshot(doc(db, ORDERS, orderId), (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null);
  });

export const subscribeToUserOrders = (
  userId: string,
  callback: (orders: Order[]) => void
) => {
  const q = query(
    collection(db, ORDERS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
  });
};

// ─── Purchase Verification ────────────────────────────────────────────────────

/**
 * Checks if a user has a delivered or confirmed order containing a given product.
 * Used to gate the review form — only verified buyers can post a review.
 */
export const hasUserPurchasedProduct = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, ORDERS),
      where('userId', '==', userId),
      where('status', 'in', ['delivered', 'confirmed', 'shipped', 'processing'])
    );
    const snap = await getDocs(q);
    return snap.docs.some((d) => {
      const order = d.data() as Order;
      return order.items?.some((item) => item.productId === productId);
    });
  } catch {
    return false;
  }
};
