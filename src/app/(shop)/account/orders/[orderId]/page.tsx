'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getOrderById } from '@/lib/services/orderService';
import { hasUserReviewedProduct } from '@/lib/services/reviewService';
import { formatPrice } from '@/utils/formatters';
import type { Order } from '@/types';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { 
  ChevronLeft, Package, CheckCircle, Truck, 
  Clock, XCircle, Star, Loader2, MapPin
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'pending',   label: 'Order Placed',     icon: Clock },
  { key: 'confirmed', label: 'Confirmed',         icon: CheckCircle },
  { key: 'shipped',   label: 'Shipped',           icon: Truck },
  { key: 'delivered', label: 'Delivered',         icon: Package },
];

const STATUS_ORDER = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewedItems, setReviewedItems] = useState<Record<string, boolean>>({});

  // Review Modal State
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    productId: string;
    productName: string;
    productImage: string;
  }>({ open: false, productId: '', productName: '', productImage: '' });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      const data = await getOrderById(orderId);
      if (!data) { router.push('/account/orders'); return; }
      setOrder(data);

      // Check which items have already been reviewed
      const reviewStatus: Record<string, boolean> = {};
      await Promise.all(
        data.items.map(async (item) => {
          reviewStatus[item.productId] = await hasUserReviewedProduct(user.uid, item.productId);
        })
      );
      setReviewedItems(reviewStatus);
      setLoading(false);
    });
    return () => unsub();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/account/orders" className="p-2 bg-white border rounded-lg text-gray-400 hover:text-gray-800 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Placed on {new Date(order.createdAt as any).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Order Status Timeline ──────────────────────────────── */}
      {!isCancelled ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-8">Order Progress</h2>
          <div className="flex items-start justify-between relative">
            {/* Connector Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 mx-10 z-0" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-black z-0 mx-10 transition-all duration-1000"
              style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`, maxWidth: 'calc(100% - 5rem)' }}
            />

            {STATUS_STEPS.map((step, i) => {
              const isDone = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex flex-col items-center gap-2 z-10 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isDone
                      ? 'bg-black border-black text-white'
                      : 'bg-white border-gray-200 text-gray-300'
                  } ${isCurrent ? 'ring-4 ring-black/10' : ''}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-[11px] font-bold text-center ${isDone ? 'text-gray-800' : 'text-gray-300'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Timeline Log */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="mt-8 space-y-3 border-t border-gray-50 pt-6">
              {[...order.timeline].reverse().map((event, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-700">{event.message}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(event.timestamp as any).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center gap-4">
          <XCircle className="text-red-400 flex-shrink-0" size={32} />
          <div>
            <p className="font-bold text-red-700">Order Cancelled</p>
            <p className="text-sm text-red-500 mt-0.5">This order has been cancelled.</p>
          </div>
        </div>
      )}

      {/* ── Order Items + Rate Buttons ────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest">Items Ordered</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-5 px-6 py-5">
              <div className="w-14 h-14 bg-gray-50 rounded-lg border flex-shrink-0 relative overflow-hidden">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-contain p-1 mix-blend-multiply" />
                ) : (
                  <Package size={18} className="m-auto text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatPrice(item.price)} × {item.qty}
                </p>
              </div>

              {/* Rate Button — only on delivered orders */}
              {isDelivered && (
                reviewedItems[item.productId] ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-[11px] font-bold flex-shrink-0">
                    <CheckCircle size={12} />
                    <span>Reviewed</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setReviewModal({
                      open: true,
                      productId: item.productId,
                      productName: item.name,
                      productImage: item.image,
                    })}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[12px] font-bold hover:bg-amber-100 transition-all flex-shrink-0 group"
                  >
                    <Star size={13} className="group-hover:scale-110 transition-transform" />
                    Rate this Product
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Delivery Address ──────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3">
        <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <MapPin size={14} /> Delivery Address
        </h2>
        <div className="text-sm text-gray-600 space-y-0.5">
          <p className="font-bold text-gray-800">{order.address?.fullName}</p>
          <p>{order.address?.line1}{order.address?.line2 && `, ${order.address.line2}`}</p>
          <p>{order.address?.city}, {order.address?.province} {order.address?.postalCode}</p>
          <p>{order.address?.phone}</p>
        </div>
      </div>

      {/* ── Order Summary ─────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3">
        <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span><span>− {formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-3">
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal.open && (
        <ReviewModal
          productId={reviewModal.productId}
          productName={reviewModal.productName}
          productImage={reviewModal.productImage}
          onClose={() => setReviewModal(p => ({ ...p, open: false }))}
          onSuccess={() => {
            // Mark as reviewed locally
            setReviewedItems(prev => ({ ...prev, [reviewModal.productId]: true }));
            setReviewModal(p => ({ ...p, open: false }));
          }}
        />
      )}
    </div>
  );
}
