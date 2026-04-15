'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

/**
 * AuthInitializer — mounts the Firebase auth listener.
 * This must be a client component nested inside the root layout.
 */
function AuthInitializer() {
  useAuth();
  return null;
}

/**
 * AppProviders wraps all global client-side providers:
 * - Firebase auth state synchronization
 * - react-hot-toast notification system
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthInitializer />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#111',
            color: '#fff',
            borderRadius: '2px',
            fontSize: '13px',
            fontWeight: 500,
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#fff', secondary: '#111' },
          },
          error: {
            iconTheme: { primary: '#fff', secondary: '#b71c1c' },
            style: { background: '#b71c1c' },
          },
        }}
      />
    </>
  );
}
