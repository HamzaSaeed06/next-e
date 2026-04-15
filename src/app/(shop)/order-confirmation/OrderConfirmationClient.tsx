'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, MapPin, CreditCard, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { getOrderById } from '@/lib/services/orderService';
import { formatPrice } from '@/utils/formatters';
import type { Order } from '@/types';

export default function OrderConfirmationClient() {
  const params = useSearchParams();
  const orderId = params.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) { setError(true); setLoading(false); return; }
    getOrderById(orderId)
      .then((o) => { if (o) setOrder(o); else setError(true); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-[var(--neutral-300)]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <XCircle size={64} className="mx-auto text-red-400 mb-6" strokeWidth={1} />
        <h1 className="text-2xl font-black uppercase tracking-tight mb-3">Order Not Found</h1>
        <p className="text-[var(--neutral-500)] mb-8">We couldn&apos;t find your order. Please check your email for confirmation.</p>
        <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-[13px] font-bold uppercase tracking-widest hover:bg-black/90 transition-all">
          Continue Shopping <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
    shipped: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    delivered: 'bg-green-50 text-green-800 border-green-200',
    cancelled: 'bg-red-50 text-red-800 border-red-200',
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">

      {/* Hero */}
      <div className="text-center mb-12">
        <CheckCircle2 size={72} className="mx-auto text-black mb-5" strokeWidth={1} />
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Order Confirmed!</h1>
        <p className="text-[var(--neutral-500)]">
          Thank you! Your order <span className="font-bold text-black">#{order.id.slice(0, 8).toUpperCase()}</span> has been placed.
        </p>
        <div className={`inline-flex mt-4 px-4 py-2 rounded border text-[12px] font-bold uppercase tracking-widest ${statusColor[order.status] ?? 'bg-[var(--neutral-100)]'}`}>
          {order.status}
        </div>
      </div>

      {/* Order Items */}
      <div className="border border-[var(--border-default)] bg-white mb-6">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-default)]">
          <Package size={16} strokeWidth={1.5} />
          <h2 className="text-[13px] font-bold uppercase tracking-widest">Items Ordered</h2>
        </div>
        <div className="divide-y divide-[var(--border-default)]">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between px-6 py-4 text-[13px]">
              <div className="flex items-center gap-3">
                <span className="text-[var(--neutral-400)] tabular-nums">×{item.qty}</span>
                <span className="font-medium text-black">{item.name}</span>
              </div>
              <span className="font-bold tabular-nums">{formatPrice(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Address */}
      <div className="border border-[var(--border-default)] bg-white mb-6">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-default)]">
          <MapPin size={16} strokeWidth={1.5} />
          <h2 className="text-[13px] font-bold uppercase tracking-widest">Delivery Address</h2>
        </div>
        <div className="px-6 py-4 text-[13px] text-[var(--neutral-600)] leading-relaxed">
          <p className="font-bold text-black">{order.address.fullName}</p>
          <p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
          <p>{order.address.city}, {order.address.province} {order.address.postalCode}</p>
          <p>{order.address.country}</p>
          <p className="mt-1">{order.address.phone}</p>
        </div>
      </div>

      {/* Payment & Totals */}
      <div className="border border-[var(--border-default)] bg-white mb-10">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-default)]">
          <CreditCard size={16} strokeWidth={1.5} />
          <h2 className="text-[13px] font-bold uppercase tracking-widest">Payment</h2>
        </div>
        <div className="px-6 py-4 space-y-2 text-[13px]">
          <div className="flex justify-between">
            <span className="text-[var(--neutral-500)]">Method</span>
            <span className="font-bold uppercase">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--neutral-500)]">Payment Status</span>
            <span className={`font-bold uppercase ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
              {order.paymentStatus}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[var(--border-default)] text-[16px] font-extrabold text-black">
            <span>Total Paid</span>
            <span className="tabular-nums">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/products"
          className="flex-1 h-14 bg-black text-white text-[13px] font-bold uppercase tracking-widest hover:bg-black/90 transition-all flex items-center justify-center gap-2"
        >
          Continue Shopping <ArrowRight size={14} />
        </Link>
        <Link
          href="/"
          className="flex-1 h-14 border border-black text-black text-[13px] font-bold uppercase tracking-widest hover:bg-[var(--neutral-50)] transition-all flex items-center justify-center"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
