'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthStore {
  user: User | null;
  role: 'user' | 'admin' | 'manager' | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: 'user' | 'admin' | 'manager' | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, role: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ user: s.user, role: s.role }),
    }
  )
);
