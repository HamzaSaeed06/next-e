'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

const adminNavItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-[220px] bg-slate-900 fixed left-0 top-0 h-full flex flex-col z-40">
        <div className="px-5 py-5 border-b border-slate-800">
          <Link href="/" className="flex flex-col items-start leading-none group">
            <span className="text-base font-bold text-white uppercase tracking-[0.15em]">ZEST</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.25em] mt-0.5">
              Admin Panel
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 mt-4 overflow-y-auto">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-colors rounded-sm ${
                  isActive
                    ? 'text-white bg-slate-800 border-l-2 border-orange-500 pl-[10px]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
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
      <main className="flex-1 ml-[220px] p-6 min-h-screen">{children}</main>
    </div>
  );
}
