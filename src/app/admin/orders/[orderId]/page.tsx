'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  Package,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
  User,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { getOrderById, updateOrderStatus } from '@/lib/services/orderService';
import { formatPrice, formatDate, toDate } from '@/utils/formatters';
import type { Order } from '@/types';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
];

const STATUS_ORDER = ['pending', 'confirmed', 'shipped', 'delivered'];

const NEXT_STATUS: Record<string, { status: Order['status']; label: string; message: string }> = {
  pending:   { status: 'confirmed', label: 'Confirm Order',    message: 'Order confirmed by store.' },
  confirmed: { status: 'shipped',   label: 'Mark as Shipped',  message: 'Order has been shipped.' },
  shipped:   { status: 'delivered', label: 'Mark as Delivered',message: 'Order delivered successfully.' },
};

export default function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getOrderById(orderId as string).then((data) => {
      setOrder(data);
      setLoading(false);
    });
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!order) return;
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, next.status, next.message);
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: next.status,
              timeline: [
                ...(prev.timeline || []),
                { status: next.status, message: next.message, timestamp: new Date() },
              ],
            }
          : prev
      );
      toast.success(`Order status updated to ${next.status}`);
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!order || !confirm('Cancel this order?')) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, 'cancelled', 'Order cancelled by admin.');
      setOrder((prev) => prev ? { ...prev, status: 'cancelled' } : prev);
      toast.success('Order cancelled');
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500">Order not found.</p>
        <Link href="/admin/orders" className="text-sm font-bold text-slate-900 underline mt-4 inline-block">
          Back to orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const canAdvance = !!NEXT_STATUS[order.status];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 bg-white border rounded-lg text-slate-400 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-[12px] text-slate-400 mt-0.5">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canAdvance && !isCancelled && (
            <button
              onClick={handleStatusUpdate}
              disabled={updating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-[13px] font-bold rounded hover:bg-green-700 transition-all disabled:opacity-50"
            >
              {updating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {NEXT_STATUS[order.status]?.label}
            </button>
          )}
          {!isCancelled && order.status !== 'delivered' && (
            <button
              onClick={handleCancel}
              disabled={updating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-[13px] font-bold rounded hover:bg-red-100 transition-all disabled:opacity-50"
            >
              <XCircle size={14} />
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-6">
              Order Progress
            </h2>
            {isCancelled ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                <XCircle className="text-red-400" size={24} />
                <div>
                  <p className="font-bold text-red-700">Order Cancelled</p>
                  <p className="text-sm text-red-500 mt-0.5">This order has been cancelled.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between relative mb-6">
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 mx-10 z-0" />
                  <div
                    className="absolute top-5 left-0 h-0.5 bg-slate-900 z-0 mx-10 transition-all duration-1000"
                    style={{
                      width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                      maxWidth: 'calc(100% - 5rem)',
                    }}
                  />
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= currentStepIndex;
                    const current = i === currentStepIndex;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-2 z-10 flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            done
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'bg-white border-slate-200 text-slate-300'
                          } ${current ? 'ring-4 ring-slate-900/10' : ''}`}
                        >
                          <Icon size={17} />
                        </div>
                        <span className={`text-[11px] font-bold text-center ${done ? 'text-slate-800' : 'text-slate-300'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {order.timeline && order.timeline.length > 0 && (
                  <div className="border-t border-slate-50 pt-4 space-y-3">
                    {[...order.timeline].reverse().map((event, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 flex-shrink-0" />
                        <div>
                          <p className="text-[13px] font-medium text-slate-700">{event.message}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {toDate(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                Items Ordered ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-lg border flex-shrink-0 relative overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1.5 mix-blend-multiply"
                      />
                    ) : (
                      <Package size={20} className="m-auto text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] text-slate-900 truncate">{item.name}</p>
                    <p className="text-[12px] text-slate-400 mt-0.5">
                      {formatPrice(item.price)} × {item.qty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatPrice(item.price * item.qty)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white border rounded-xl p-5 space-y-4">
            <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              Order Summary
            </h2>
            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>− {formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span>{(order as any).shipping === 0 ? 'Free' : formatPrice((order as any).shipping || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2.5 text-[15px]">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border rounded-xl p-5 space-y-3">
            <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <CreditCard size={13} />
              Payment
            </h2>
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span className="font-semibold text-slate-800 uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span
                  className={`font-bold capitalize ${
                    order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white border rounded-xl p-5 space-y-3">
            <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <User size={13} />
              Customer
            </h2>
            <div className="space-y-1 text-[13px] text-slate-600">
              <p className="font-bold text-slate-800">{order.address?.fullName || 'N/A'}</p>
              {order.guestEmail && <p className="text-slate-400">{order.guestEmail}</p>}
              <p>{order.address?.phone}</p>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white border rounded-xl p-5 space-y-3">
            <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={13} />
              Delivery Address
            </h2>
            <div className="text-[13px] text-slate-600 space-y-0.5">
              <p>{order.address?.line1}</p>
              {order.address?.line2 && <p>{order.address.line2}</p>}
              <p>
                {order.address?.city}, {order.address?.province} {order.address?.postalCode}
              </p>
              <p>{order.address?.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
