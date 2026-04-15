import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  increment,
  serverTimestamp,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { Review } from '@/types';

const REVIEWS = 'reviews';

// Helper to sanitize Firestore Timestamps for Next.js Server Components
const serializeReview = (docSnap: any): Review => {
  const data = typeof docSnap.data === 'function' ? docSnap.data() : docSnap;
  const serialized = { ...data };
  
  if (serialized.createdAt?.toMillis) serialized.createdAt = serialized.createdAt.toMillis();
  
  return { id: docSnap.id, ...serialized } as Review;
};

export const getReviewsByProduct = async (
  productId: string,
  sortBy: 'recent' | 'helpful' = 'recent'
): Promise<Review[]> => {
  const q = query(
    collection(db, REVIEWS),
    where('productId', '==', productId),
    orderBy(sortBy === 'recent' ? 'createdAt' : 'helpful', 'desc')
  );

  const snap = await getDocs(q);
  return snap.docs.map(serializeReview);
};

export const addReview = async (
  data: Omit<Review, 'id' | 'createdAt' | 'helpful' | 'reported'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, REVIEWS), {
    ...data,
    helpful: 0,
    reported: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const hasUserReviewedProduct = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, REVIEWS),
      where('productId', '==', productId),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch {
    return false;
  }
};

export const markReviewHelpful = async (reviewId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, REVIEWS, reviewId), { helpful: increment(1) });
  } catch (error) {
    console.error('Error marking review helpful:', error);
  }
};
