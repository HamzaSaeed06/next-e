'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getOrdersByUser } from '@/lib/services/orderService';
import { formatPrice } from '@/utils/formatters';
import type { Order } from '@/types';
import { Package, ChevronRight, ShoppingBag, Loader2 } from 'lucide-react';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  confirmed:  { label: 'Confirmed',  color: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipped:    { label: 'Shipped',    color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  delivered:  { label: 'Delivered',  color: 'bg-green-50 text-green-700 border-green-200' },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-50 text-red-700 border-red-200' },
  returned:   { label: 'Returned',   color: 'bg-gray-50 text-gray-700 border-gray-200' },
};

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login?redirect=/account/orders');
        return;
      }
      const data = await getOrdersByUser(user.uid, 20);
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-400 mt-1">Track your orders and leave reviews after delivery.</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-200 rounded-2xl gap-4">
          <ShoppingBag size={40} className="text-gray-200" />
          <p className="text-gray-400 font-medium text-sm">You haven't placed any orders yet.</p>
          <Link href="/products" className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded hover:opacity-80 transition-all">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const firstItem = order.items[0];
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center gap-5 p-5 bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group"
              >
                {/* Product Thumbnail */}
                <div className="w-16 h-16 bg-gray-50 border rounded-lg flex-shrink-0 relative overflow-hidden">
                  {firstItem?.image ? (
                    <Image src={firstItem.image} alt={firstItem.name} fill className="object-contain p-1 mix-blend-multiply" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={20} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">
                    {firstItem?.name}{order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Order #{order.id.slice(0, 8).toUpperCase()} · {formatPrice(order.total)}
                  </p>
                  {order.status === 'delivered' && (
                    <p className="text-xs text-green-600 font-bold mt-1.5 flex items-center gap-1">
                      ★ Tap to rate your purchase
                    </p>
                  )}
                </div>

                {/* Status Badge + Arrow */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2.5 py-1 text-[11px] font-bold border rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
