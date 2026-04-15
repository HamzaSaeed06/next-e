import { Suspense } from 'react';
import type { Metadata } from 'next';
import OrderConfirmationClient from './OrderConfirmationClient';

export const metadata: Metadata = {
  title: 'Order Confirmed | Zest & Partners',
  description: 'Your order has been placed successfully.',
};

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderConfirmationSkeleton />}>
      <OrderConfirmationClient />
    </Suspense>
  );
}

function OrderConfirmationSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center animate-pulse">
      <div className="w-20 h-20 bg-[var(--neutral-100)] rounded-full mx-auto mb-6" />
      <div className="h-8 bg-[var(--neutral-100)] rounded w-3/4 mx-auto mb-4" />
      <div className="h-4 bg-[var(--neutral-100)] rounded w-1/2 mx-auto mb-2" />
      <div className="h-4 bg-[var(--neutral-100)] rounded w-2/3 mx-auto" />
    </div>
  );
}
