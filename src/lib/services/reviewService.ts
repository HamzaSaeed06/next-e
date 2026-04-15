import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import type { Review } from '@/types';

const REVIEWS = 'reviews';

const serializeReview = (docSnap: any): Review => {
  const data = typeof docSnap.data === 'function' ? docSnap.data() : docSnap;
  const serialized = { ...data };
  if (serialized.createdAt?.toMillis) serialized.createdAt = serialized.createdAt.toMillis();
  if (serialized.createdAt?.seconds) serialized.createdAt = serialized.createdAt.seconds * 1000;
  return { id: docSnap.id, ...serialized } as Review;
};

// No orderBy in query — avoids requiring a composite Firestore index.
// Sorting is done client-side after fetch.
export const getReviewsByProduct = async (
  productId: string,
  sortBy: 'recent' | 'helpful' = 'recent'
): Promise<Review[]> => {
  const q = query(
    collection(db, REVIEWS),
    where('productId', '==', productId)
  );
  const snap = await getDocs(q);
  const reviews = snap.docs.map(serializeReview);

  // Sort client-side
  return reviews.sort((a, b) => {
    if (sortBy === 'helpful') return (b.helpful || 0) - (a.helpful || 0);
    // Sort by createdAt descending (recent first)
    const aTime = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt as any).getTime();
    const bTime = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt as any).getTime();
    return bTime - aTime;
  });
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
