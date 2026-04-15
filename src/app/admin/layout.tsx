'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  Tag,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const adminNavItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/admin/settings', icon: Settings, label: 'Store Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (item: { path: string; exact?: boolean }) =>
    item.exact ? pathname === item.path : pathname.startsWith(item.path);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-[220px] bg-slate-900 fixed left-0 top-0 h-full flex flex-col z-40
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex flex-col items-start leading-none group">
            <span className="text-base font-bold text-white uppercase tracking-[0.15em]">ZEST</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.25em] mt-0.5">
              Admin Panel
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 mt-4 overflow-y-auto">
          {adminNavItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-colors rounded-sm ${
                  active
                    ? 'text-white bg-slate-800 border-l-2 border-orange-500 pl-[10px]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {active && <ChevronRight size={13} className="ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-slate-800">
          <Link
            href="/"
            className="text-[12px] text-slate-500 hover:text-white transition-colors font-medium"
          >
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[220px] min-h-screen">
        {/* Top bar for mobile */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="text-[14px] font-bold text-slate-900 uppercase tracking-widest">Admin</span>
          <Link href="/" className="text-[12px] text-slate-400 font-medium">Store →</Link>
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
