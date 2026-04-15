'use client';

import { useState, useEffect } from 'react';
import { 
  Users,
  Search,
  Shield,
  ShoppingBag,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDate, formatPrice } from '@/utils/formatters';
import type { User as AppUser } from '@/types';
import toast from 'react-hot-toast';

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  admin:   { label: 'Admin',   color: 'bg-red-50 text-red-700 border-red-200' },
  manager: { label: 'Manager', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  user:    { label: 'Customer',color: 'bg-green-50 text-green-700 border-green-200' },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(200));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => {
          const u = d.data();
          if (u.createdAt?.toMillis) u.createdAt = new Date(u.createdAt.toMillis());
          if (u.lastSeen?.toMillis) u.lastSeen = new Date(u.lastSeen.toMillis());
          return { uid: d.id, ...u } as AppUser;
        });
        setUsers(data);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.displayName?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin' || u.role === 'manager').length,
    active: users.filter((u) => u.isOnline).length,
    totalOrders: users.reduce((s, u) => s + (u.totalOrders || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-[13px] text-slate-500 mt-1">Manage your customer accounts and roles.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'text-blue-600' },
          { label: 'Admins/Managers', value: stats.admins, icon: Shield, color: 'text-purple-600' },
          { label: 'Currently Online', value: stats.active, icon: UserCheck, color: 'text-green-600' },
          { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-orange-600' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-medium text-slate-500">{s.label}</p>
                <Icon size={16} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name or email..."
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
            <Loader2 className="animate-spin text-orange-500" size={32} />
            <p className="text-[13px] text-slate-400">Loading users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Users size={40} className="text-slate-200 mb-3" />
            <p className="font-bold text-slate-700">No users found</p>
            <p className="text-[13px] text-slate-400 mt-1">
              {search ? `No results for "${search}"` : 'No users registered yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">User</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Orders</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Spent</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Points</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Joined</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((user) => {
                  const roleCfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
                  return (
                    <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-[13px] font-bold text-slate-600 flex-shrink-0 overflow-hidden">
                            {user.photoURL ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                            ) : (
                              user.displayName?.charAt(0)?.toUpperCase() || '?'
                            )}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-slate-900">{user.displayName || 'N/A'}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full border ${roleCfg.color}`}>
                          {roleCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] font-semibold text-slate-700">
                          {user.totalOrders || 0}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-slate-700">
                          {formatPrice(user.totalSpent || 0)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-slate-500">{user.loyaltyPoints || 0} pts</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[12px] text-slate-400">{formatDate(user.createdAt)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            user.isOnline ? 'text-green-600' : 'text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.isOnline ? 'bg-green-500' : 'bg-slate-300'
                            }`}
                          />
                          {user.isOnline ? 'Online' : 'Offline'}
                        </span>
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
