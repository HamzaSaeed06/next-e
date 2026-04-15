import { auth, db } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import type { User } from '@/types';

const LOYALTY_SIGNUP = 100;

const getErrorMessage = (error: { code?: string; message: string }): string => {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/popup-closed-by-user': 'Sign in was cancelled.',
  };
  return map[error.code || ''] || error.message || 'An error occurred.';
};

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  const userData = {
    uid: cred.user.uid,
    email,
    displayName: name,
    photoURL: '',
    role: 'user' as const,
    phone: '',
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
    isOnline: true,
    loyaltyPoints: LOYALTY_SIGNUP,
    totalOrders: 0,
    totalSpent: 0,
    preferredCategories: [],
    addresses: [],
  };

  await setDoc(doc(db, 'users', cred.user.uid), userData);
  return { ...userData, uid: cred.user.uid } as unknown as User;
};

export const signIn = async (email: string, password: string): Promise<User> => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userRef = doc(db, 'users', cred.user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    await updateDoc(userRef, { lastSeen: serverTimestamp(), isOnline: true });
  } else {
    await setDoc(userRef, {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || '',
      photoURL: cred.user.photoURL || '',
      role: 'user',
      phone: '',
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
      isOnline: true,
      loyaltyPoints: 0,
      totalOrders: 0,
      totalSpent: 0,
      preferredCategories: [],
      addresses: [],
    });
  }

  const userData = userSnap.exists() ? userSnap.data() : {};
  return { ...cred.user, ...userData } as unknown as User;
};

export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const userRef = doc(db, 'users', cred.user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || 'User',
      photoURL: cred.user.photoURL || '',
      role: 'user',
      phone: cred.user.phoneNumber || '',
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
      isOnline: true,
      loyaltyPoints: LOYALTY_SIGNUP,
      totalOrders: 0,
      totalSpent: 0,
      preferredCategories: [],
      addresses: [],
    });
  } else {
    await updateDoc(userRef, { lastSeen: serverTimestamp(), isOnline: true });
  }

  const userData = userSnap.exists() ? userSnap.data() : {};
  return { ...cred.user, ...userData } as unknown as User;
};

export const signOut = async (): Promise<void> => {
  const user = auth.currentUser;
  if (user) {
    await updateDoc(doc(db, 'users', user.uid), {
      isOnline: false,
      lastSeen: serverTimestamp(),
    });
  }
  await firebaseSignOut(auth);
};

export { signOut as logOut };

export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return { ...snap.data(), uid: snap.id } as User;
  } catch {
    return null;
  }
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<User>
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const observeAuth = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await getUserProfile(firebaseUser.uid);
      callback(profile ? ({ ...firebaseUser, ...profile } as User) : null);
    } else {
      callback(null);
    }
  });

// Re-export error message helper for use in UI
export { getErrorMessage };
