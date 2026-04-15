'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  Loader2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { getAllOrders } from '@/lib/services/orderService';
import { formatPrice } from '@/utils/formatters';
import type { Order } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders(500).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  const now = new Date();
  const thisMonth = orders.filter((o) => {
    const d = new Date(o.createdAt as any);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = orders.filter((o) => {
    const d = new Date(o.createdAt as any);
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
  });

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const thisMonthRevenue = thisMonth.reduce((s, o) => s + (o.total || 0), 0);
  const lastMonthRevenue = lastMonth.reduce((s, o) => s + (o.total || 0), 0);
  const revenueChange = lastMonthRevenue > 0
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0;

  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Revenue by month (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const monthOrders = orders.filter((o) => {
      const od = new Date(o.createdAt as any);
      return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
    });
    return {
      month,
      revenue: monthOrders.reduce((s, o) => s + (o.total || 0), 0),
      orders: monthOrders.length,
    };
  });

  // Status breakdown
  const statusData = [
    { name: 'Pending', value: orders.filter((o) => o.status === 'pending').length, color: '#f59e0b' },
    { name: 'Confirmed', value: orders.filter((o) => o.status === 'confirmed').length, color: '#3b82f6' },
    { name: 'Shipped', value: orders.filter((o) => o.status === 'shipped').length, color: '#8b5cf6' },
    { name: 'Delivered', value: orders.filter((o) => o.status === 'delivered').length, color: '#10b981' },
    { name: 'Cancelled', value: orders.filter((o) => o.status === 'cancelled').length, color: '#ef4444' },
  ];

  const stats = [
    {
      label: 'Total Revenue',
      value: formatPrice(totalRevenue),
      sub: `${formatPrice(thisMonthRevenue)} this month`,
      icon: DollarSign,
      change: revenueChange,
    },
    {
      label: 'Total Orders',
      value: orders.length.toLocaleString(),
      sub: `${thisMonth.length} this month`,
      icon: ShoppingBag,
      change: null,
    },
    {
      label: 'Avg. Order Value',
      value: formatPrice(avgOrderValue),
      sub: `${deliveredOrders} delivered`,
      icon: TrendingUp,
      change: null,
    },
    {
      label: 'Pending Orders',
      value: pendingOrders.toString(),
      sub: 'Awaiting confirmation',
      icon: Package,
      change: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-[13px] text-slate-500 mt-1">
          Sales overview and performance metrics.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-medium text-slate-500">{stat.label}</p>
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Icon size={15} className="text-slate-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
              <div className="flex items-center gap-1">
                {stat.change !== null && (
                  <>
                    {stat.change >= 0 ? (
                      <ArrowUpRight size={13} className="text-green-500" />
                    ) : (
                      <ArrowDownRight size={13} className="text-red-500" />
                    )}
                    <span className={`text-[11px] font-bold ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(stat.change).toFixed(1)}%
                    </span>
                    <span className="text-[11px] text-slate-400">vs last month</span>
                  </>
                )}
                {stat.change === null && (
                  <span className="text-[11px] text-slate-400">{stat.sub}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[14px] font-bold text-slate-900">Monthly Revenue</h2>
            <span className="text-[12px] text-slate-400">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [formatPrice(value), 'Revenue']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-[14px] font-bold text-slate-900 mb-6">Order Status</h2>
          <div className="space-y-4">
            {statusData.map((s) => {
              const pct = orders.length > 0 ? (s.value / orders.length) * 100 : 0;
              return (
                <div key={s.name}>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="font-medium text-slate-600">{s.name}</span>
                    <span className="font-bold text-slate-900">{s.value}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders Trend */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[14px] font-bold text-slate-900">Orders per Month</h2>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#0f172a"
              strokeWidth={2}
              dot={{ r: 4, fill: '#0f172a' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
