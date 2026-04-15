import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard' };

const statCards = [
  { label: 'Total Revenue', value: 'PKR 2.4M', icon: TrendingUp, change: '+12%' },
  { label: 'Total Orders', value: '1,284', icon: ShoppingBag, change: '+8%' },
  { label: 'Products', value: '342', icon: Package, change: '+3%' },
  { label: 'Customers', value: '5,621', icon: Users, change: '+18%' },
];

const quickLinks = [
  { href: '/admin/products', icon: Package, label: 'Manage Products', desc: 'Add, edit, or archive products' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Manage Orders', desc: 'Process and update order status' },
  { href: '/admin/users', icon: Users, label: 'Manage Users', desc: 'View and manage customer accounts' },
  { href: '/admin/analytics', icon: TrendingUp, label: 'Analytics', desc: 'Sales reports and performance' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, Admin. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center">
                  <Icon size={16} className="text-slate-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs font-medium text-green-600">{stat.change} this month</p>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-base font-bold text-slate-700 uppercase tracking-widest mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white rounded-lg border border-slate-200 p-5 flex items-center gap-4 hover:border-slate-900 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 transition-colors">
                  <Icon size={18} className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">{link.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{link.desc}</p>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Back to store */}
      <div className="pt-4 border-t border-slate-200">
        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
          ← View Store
        </Link>
      </div>
    </div>
  );
}
