'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  Tag,
  Settings,
  Loader2,
  Clock,
  CheckCircle,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { getAllOrders } from '@/lib/services/orderService';
import { getProducts } from '@/lib/services/productService';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatPrice, formatDate, toDate } from '@/utils/formatters';
import type { Order } from '@/types';
import Image from 'next/image';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
    pendingOrders: 0,
    todayOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [orders, productsData, usersSnap] = await Promise.all([
          getAllOrders(200),
          getProducts({ pageSize: 200 }),
          getDocs(query(collection(db, 'users'), limit(200))),
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
        const pendingOrders = orders.filter((o) => o.status === 'pending').length;
        const todayOrders = orders.filter((o) => {
          const d = toDate(o.createdAt);
          return d >= today;
        }).length;

        const lowStock = productsData.products.filter(
          (p) => p.stock <= (p.lowStockThreshold || 5)
        ).length;

        setStats({
          revenue,
          orders: orders.length,
          products: productsData.products.length,
          customers: usersSnap.size,
          pendingOrders,
          todayOrders,
        });
        setLowStockCount(lowStock);
        setRecentOrders(orders.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.revenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Orders', value: stats.orders.toLocaleString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Products', value: stats.products.toLocaleString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Customers', value: stats.customers.toLocaleString(), icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const quickLinks = [
    { href: '/admin/products/new', icon: Package, label: 'Add Product', desc: 'Add a new product to the store' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'Manage Orders', desc: `${stats.pendingOrders} pending orders` },
    { href: '/admin/coupons', icon: Tag, label: 'Coupons', desc: 'Create discount codes' },
    { href: '/admin/settings', icon: Settings, label: 'Store Settings', desc: 'Banners, policies, shipping' },
    { href: '/admin/users', icon: Users, label: 'Customers', desc: 'View and manage accounts' },
    { href: '/admin/analytics', icon: TrendingUp, label: 'Analytics', desc: 'Sales reports' },
  ];

  const STATUS_COLOR: Record<string, string> = {
    pending:   'bg-amber-50 text-amber-700',
    confirmed: 'bg-blue-50 text-blue-700',
    shipped:   'bg-purple-50 text-purple-700',
    delivered: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-[13px] mt-1">
            {stats.todayOrders > 0
              ? `${stats.todayOrders} new order${stats.todayOrders !== 1 ? 's' : ''} today`
              : "Welcome back, Admin."}
          </p>
        </div>
        {loading && <Loader2 className="animate-spin text-orange-500" size={20} />}
      </div>

      {/* Alerts */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-[13px] font-semibold text-amber-800">
            {lowStockCount} product{lowStockCount !== 1 ? 's are' : ' is'} running low on stock.{' '}
            <Link href="/admin/products" className="underline">Review inventory →</Link>
          </p>
        </div>
      )}

      {stats.pendingOrders > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <Clock size={18} className="text-blue-600 flex-shrink-0" />
          <p className="text-[13px] font-semibold text-blue-800">
            {stats.pendingOrders} order{stats.pendingOrders !== 1 ? 's' : ''} waiting for confirmation.{' '}
            <Link href="/admin/orders?status=pending" className="underline">Process now →</Link>
          </p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-slate-500">{stat.label}</p>
                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <Icon size={15} className={stat.color} />
                </div>
              </div>
              {loading ? (
                <div className="h-7 bg-slate-100 rounded animate-pulse" />
              ) : (
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-[13px] font-bold text-slate-700 uppercase tracking-widest">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-[12px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag size={32} className="text-slate-200 mb-3" />
              <p className="text-[13px] text-slate-400">No orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/50 transition-colors group"
                >
                  <div className="flex -space-x-1 flex-shrink-0">
                    {order.items.slice(0, 2).map((item, i) => (
                      <div key={i} className="w-9 h-9 rounded-lg border-2 border-white bg-slate-100 relative overflow-hidden">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-contain p-1 mix-blend-multiply" />
                        ) : (
                          <Package size={14} className="m-auto text-slate-300" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-900">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {order.address?.fullName || order.guestEmail || 'Guest'} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-bold text-slate-900">{formatPrice(order.total)}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[order.status] || 'bg-slate-100 text-slate-600'}`}>
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-[13px] font-bold text-slate-700 uppercase tracking-widest">
              Quick Actions
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-all group"
                >
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 transition-colors">
                    <Icon size={15} className="text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-900">{link.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{link.desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-700 transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
