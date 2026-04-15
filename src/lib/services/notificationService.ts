import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import type { Notification } from '@/types';

const NOTIFS = 'notifications';

const serialize = (d: any): Notification => {
  const data = typeof d.data === 'function' ? d.data() : d;
  if (data.createdAt?.toMillis) data.createdAt = new Date(data.createdAt.toMillis());
  return { id: d.id, ...data } as Notification;
};

export const createNotification = async (
  data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
): Promise<string> => {
  const ref = await addDoc(collection(db, NOTIFS), {
    ...data,
    isRead: false,
    createdAt: new Date(),
  });
  return ref.id;
};

export const markNotificationRead = async (notifId: string): Promise<void> => {
  await updateDoc(doc(db, NOTIFS, notifId), { isRead: true });
};

export const markAllNotificationsRead = async (userId: string): Promise<void> => {
  const q = query(
    collection(db, NOTIFS),
    where('userId', '==', userId),
    where('isRead', '==', false)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { isRead: true })));
};

export const subscribeToUserNotifications = (
  userId: string,
  callback: (notifs: Notification[]) => void
) => {
  const q = query(
    collection(db, NOTIFS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(serialize));
  });
};
