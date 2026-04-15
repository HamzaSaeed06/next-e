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
  increment,
  serverTimestamp,
  onSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { Product, GetProductsOptions } from '@/types';

const PRODUCTS = 'products';

const serializeDoc = (docSnap: any): Product => {
  const data = docSnap.data();
  if (data.createdAt?.toMillis) data.createdAt = data.createdAt.toMillis();
  if (data.updatedAt?.toMillis) data.updatedAt = data.updatedAt.toMillis();
  if (data.flashSaleEndsAt?.toMillis) data.flashSaleEndsAt = data.flashSaleEndsAt.toMillis();
  return { id: docSnap.id, ...data } as Product;
};

export const getProducts = async (
  options: GetProductsOptions = {}
): Promise<{ products: Product[]; lastDoc: QueryDocumentSnapshot | null }> => {
  const { category, sort, pageSize = 12 } = options;

  let q = query(
    collection(db, PRODUCTS),
    where('isActive', '==', true),
    limit(pageSize * 2)
  );

  if (category) {
    q = query(q, where('category', '==', category));
  }

  const snap = await getDocs(q);
  let products = snap.docs.map(serializeDoc);

  if (sort === 'price_asc') products.sort((a, b) => (a.price || 0) - (b.price || 0));
  else if (sort === 'price_desc') products.sort((a, b) => (b.price || 0) - (a.price || 0));
  else if (sort === 'newest') {
    products.sort((a, b) => {
      const getTime = (p: Product) => {
        const d = p.createdAt;
        if (!d) return 0;
        if (typeof d === 'object' && 'toMillis' in d) return (d as any).toMillis();
        return new Date(d as any).getTime();
      };
      return getTime(b) - getTime(a);
    });
  } else {
    products.sort((a, b) => (b.sold || 0) - (a.sold || 0));
  }

  products = products.slice(0, pageSize);

  return {
    products,
    lastDoc: products.length > 0 ? snap.docs[snap.docs.length - 1] : null,
  };
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const snap = await getDoc(doc(db, PRODUCTS, id));
  return snap.exists() ? serializeDoc(snap) : null;
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const q = query(
    collection(db, PRODUCTS),
    where('slug', '==', slug),
    where('isActive', '==', true),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.empty
    ? null
    : serializeDoc(snap.docs[0]);
};

export const incrementProductViews = async (id: string): Promise<void> => {
  try {
    await updateDoc(doc(db, PRODUCTS, id), { views: increment(1) });
  } catch (error) {
    console.error('Error incrementing product views:', error);
  }
};

export const getTrendingProducts = async (n = 8): Promise<Product[]> => {
  const q = query(
    collection(db, PRODUCTS),
    where('isActive', '==', true),
    orderBy('sold', 'desc'),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map(serializeDoc);
};

export const getNewArrivals = async (n = 8): Promise<Product[]> => {
  const q = query(
    collection(db, PRODUCTS),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc'),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map(serializeDoc);
};

export const getFeaturedProducts = async (n = 8): Promise<Product[]> => {
  const q = query(
    collection(db, PRODUCTS),
    where('isFeatured', '==', true),
    where('isActive', '==', true),
    orderBy('views', 'desc'),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map(serializeDoc);
};

export const getFlashSaleProducts = async (): Promise<Product[]> => {
  const q = query(
    collection(db, PRODUCTS),
    where('isFlashSale', '==', true),
    where('flashSaleEndsAt', '>', new Date()),
    where('isActive', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map(serializeDoc);
};

export const getProductsByCategory = async (
  category: string,
  excludeId?: string,
  n = 6
): Promise<Product[]> => {
  const q = query(
    collection(db, PRODUCTS),
    where('category', '==', category),
    where('isActive', '==', true),
    limit(n + (excludeId ? 1 : 0))
  );
  const snap = await getDocs(q);
  let products = snap.docs.map(serializeDoc);
  if (excludeId) products = products.filter((p) => p.id !== excludeId).slice(0, n);
  return products;
};

export const getRelatedProducts = async (
  product: Product,
  n = 6
): Promise<Product[]> => {
  const categoryProducts = await getProductsByCategory(product.category, product.id, n);
  if (categoryProducts.length >= n) return categoryProducts;
  const featured = await getFeaturedProducts(n);
  const combined = [...categoryProducts];
  for (const p of featured) {
    if (combined.length >= n) break;
    if (!combined.find((cp) => cp.id === p.id) && p.id !== product.id) combined.push(p);
  }
  return combined.slice(0, n);
};

export const createProduct = async (
  data: Partial<Product>
): Promise<string> => {
  const docRef = await addDoc(collection(db, PRODUCTS), {
    isActive: true,
    isFeatured: false,
    isFlashSale: false,
    views: 0,
    sold: 0,
    rating: 0,
    reviewCount: 0,
    stock: 0,
    images: [],
    attributes: [],
    variants: [],
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateProduct = async (
  id: string,
  data: Partial<Product>
): Promise<void> => {
  await updateDoc(doc(db, PRODUCTS, id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteProduct = async (id: string): Promise<void> => {
  await updateDoc(doc(db, PRODUCTS, id), {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
};

export const subscribeToProduct = (
  id: string,
  callback: (product: Product | null) => void
) =>
  onSnapshot(doc(db, PRODUCTS, id), (snap) => {
    callback(snap.exists() ? serializeDoc(snap) : null);
  });

export const checkStock = async (
  productId: string,
  quantity: number
): Promise<boolean> => {
  const product = await getProductById(productId);
  return product ? product.stock >= quantity : false;
};
