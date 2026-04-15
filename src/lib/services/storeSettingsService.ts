import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { StoreSettings } from '@/types';

const SETTINGS_DOC = 'config/storeSettings';

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Zest & Partners',
  storeTagline: 'Editorial E-Commerce',
  freeDeliveryThreshold: 5000,
  standardShippingCost: 299,
  returnPolicyDays: 30,
  returnPolicy: '30-day hassle-free returns on all unused items.',
  warrantyPolicy: '1-year manufacturer warranty on all products.',
  deliveryEstimate: '3–5 working days',
  announcementBar: 'Free delivery on orders over PKR 5,000!',
  announcementBarActive: true,
  banners: [
    {
      id: 'default-1',
      title: 'Curated Excellence',
      subtitle: 'Editorial products for the modern lifestyle.',
      ctaText: 'Explore Collection',
      ctaLink: '/products',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400',
      isActive: true,
      order: 0,
    },
  ],
  flashSaleBannerTitle: 'Flash Sale: Up to 70% Off',
  flashSaleBannerSubtitle: 'Grab these deals before they are gone!',
  flashSaleBannerActive: true,
};

export const getStoreSettings = async (): Promise<StoreSettings> => {
  try {
    const snap = await getDoc(doc(db, SETTINGS_DOC));
    if (!snap.exists()) return DEFAULT_SETTINGS;
    const data = snap.data();
    if (data.updatedAt?.toMillis) data.updatedAt = new Date(data.updatedAt.toMillis());
    return { ...DEFAULT_SETTINGS, ...data } as StoreSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const updateStoreSettings = async (
  settings: Partial<StoreSettings>
): Promise<void> => {
  const ref = doc(db, SETTINGS_DOC);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      ...DEFAULT_SETTINGS,
      ...settings,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      ...snap.data(),
      ...settings,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
};
