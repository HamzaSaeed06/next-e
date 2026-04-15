'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ShoppingBag,
  Eye,
  ChevronDown,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { getAllOrders, getOrdersByStatus } from '@/lib/services/orderService';
import { formatPrice, formatDate } from '@/utils/formatters';
import type { Order } from '@/types';
import toast from 'react-hot-toast';

type StatusFilter = 'all' | Order['status'];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   color: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200',       icon: CheckCircle },
  shipped:   { label: 'Shipped',   color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-50 text-green-700 border-green-200',    icon: Package },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200',          icon: XCircle },
  returned:  { label: 'Returned',  color: 'bg-gray-50 text-gray-700 border-gray-200',       icon: RefreshCw },
};

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const fetchOrders = async (tab: StatusFilter) => {
    setLoading(true);
    try {
      const data =
        tab === 'all'
          ? await getAllOrders(100)
          : await getOrdersByStatus(tab as Order['status'], 100);
      setOrders(data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const filtered = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.address?.fullName?.toLowerCase().includes(q) ||
      o.guestEmail?.toLowerCase().includes(q)
    );
  });

  const totalRevenue = filtered.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            {filtered.length} orders · {formatPrice(totalRevenue)} total
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 text-[13px] font-semibold rounded-md transition-all ${
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded text-[13px] border border-slate-200 focus:outline-none focus:border-slate-400 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-9 h-9 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] text-slate-400">Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag size={40} className="text-slate-200 mb-4" />
            <p className="font-bold text-slate-700">No orders found</p>
            <p className="text-[13px] text-slate-400 mt-1">
              {search ? `No results for "${search}"` : 'No orders in this category yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Order</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Items</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((order) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const Icon = cfg.icon;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-[13px] font-bold text-slate-900">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                          {order.paymentMethod?.toUpperCase()} ·{' '}
                          <span
                            className={
                              order.paymentStatus === 'paid'
                                ? 'text-green-600'
                                : 'text-amber-600'
                            }
                          >
                            {order.paymentStatus}
                          </span>
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[13px] font-semibold text-slate-800">
                          {order.address?.fullName || order.guestEmail || 'Guest'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {order.address?.city || '—'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, i) => (
                            <div
                              key={i}
                              className="w-9 h-9 rounded-lg border-2 border-white bg-slate-100 relative overflow-hidden flex-shrink-0"
                            >
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-contain p-1 mix-blend-multiply"
                                />
                              ) : (
                                <Package size={14} className="m-auto text-slate-300" />
                              )}
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-9 h-9 rounded-lg border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[14px] font-bold text-slate-900">
                          {formatPrice(order.total)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border ${cfg.color}`}
                        >
                          <Icon size={11} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[12px] text-slate-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-[12px] font-semibold rounded hover:bg-slate-700 transition-all"
                        >
                          <Eye size={13} />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
