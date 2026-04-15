'use client';

import { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Search,
  Copy,
} from 'lucide-react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatPrice, formatDate } from '@/utils/formatters';
import type { Coupon } from '@/types';
import toast from 'react-hot-toast';

const inputCls =
  'w-full px-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:border-slate-500 transition-all bg-white';

const EMPTY_FORM = {
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: 10,
  minOrderValue: 0,
  maxDiscount: undefined as number | undefined,
  usageLimit: 100,
  expiresAt: '',
  categories: [] as string[],
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCoupons = async () => {
    try {
      const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => {
        const c = d.data();
        if (c.expiresAt?.toMillis) c.expiresAt = new Date(c.expiresAt.toMillis());
        return { id: d.id, ...c } as Coupon;
      });
      setCoupons(data);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async () => {
    if (!form.code.trim()) { toast.error('Coupon code is required'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, 'coupons'), {
        ...form,
        code: form.code.toUpperCase().trim(),
        expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
        usedCount: 0,
        usedBy: [],
        isActive: true,
        createdAt: serverTimestamp(),
      });
      toast.success('Coupon created!');
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchCoupons();
    } catch {
      toast.error('Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      await updateDoc(doc(db, 'coupons', coupon.id), { isActive: !coupon.isActive });
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
      );
      toast.success(`Coupon ${coupon.isActive ? 'disabled' : 'enabled'}`);
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success('Coupon deleted');
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  const filtered = coupons.filter((c) =>
    !search.trim() || c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coupons</h1>
          <p className="text-[13px] text-slate-500 mt-1">Create and manage discount codes.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-[13px] font-bold rounded-lg hover:bg-orange-600 transition-all"
        >
          <Plus size={16} />
          New Coupon
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-wide">
            Create New Coupon
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Coupon Code *
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. SAVE20"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Discount Type
              </label>
              <select
                className={inputCls}
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as 'percentage' | 'fixed' }))}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (PKR)</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Discount Value
              </label>
              <input
                type="number"
                className={inputCls}
                value={form.value}
                onChange={(e) => setForm((p) => ({ ...p, value: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Min. Order (PKR)
              </label>
              <input
                type="number"
                className={inputCls}
                value={form.minOrderValue}
                onChange={(e) => setForm((p) => ({ ...p, minOrderValue: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Max Discount (PKR)
              </label>
              <input
                type="number"
                className={inputCls}
                placeholder="Leave empty for unlimited"
                value={form.maxDiscount || ''}
                onChange={(e) =>
                  setForm((p) => ({ ...p, maxDiscount: e.target.value ? Number(e.target.value) : undefined }))
                }
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Usage Limit
              </label>
              <input
                type="number"
                className={inputCls}
                value={form.usageLimit}
                onChange={(e) => setForm((p) => ({ ...p, usageLimit: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                Expiry Date
              </label>
              <input
                type="date"
                className={inputCls}
                value={form.expiresAt}
                onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900 text-white text-[13px] font-bold rounded-lg hover:bg-slate-700 transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {saving ? 'Creating...' : 'Create Coupon'}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
              className="px-5 py-2 text-[13px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search coupon codes..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded text-[13px] border border-slate-200 focus:outline-none focus:border-slate-400 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Coupon List */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Tag size={40} className="text-slate-200 mb-3" />
            <p className="font-bold text-slate-700">No coupons yet</p>
            <p className="text-[13px] text-slate-400 mt-1">
              Create your first discount coupon above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Code</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Discount</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Min. Order</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Usage</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Expires</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((coupon) => {
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt as any) < new Date();
                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[14px] text-slate-900 font-mono tracking-wide">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="p-1 text-slate-300 hover:text-slate-600 transition-colors"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] font-bold text-slate-800">
                          {coupon.type === 'percentage'
                            ? `${coupon.value}% off`
                            : `${formatPrice(coupon.value)} off`}
                        </span>
                        {coupon.maxDiscount && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Max {formatPrice(coupon.maxDiscount)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-slate-600">
                          {coupon.minOrderValue > 0 ? formatPrice(coupon.minOrderValue) : 'None'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-slate-600">
                          {coupon.usedCount}/{coupon.usageLimit}
                        </span>
                        <div className="mt-1 h-1 bg-slate-100 rounded-full w-16">
                          <div
                            className="h-full bg-slate-400 rounded-full"
                            style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[12px] ${isExpired ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                          {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'No expiry'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleActive(coupon)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border transition-all ${
                            coupon.isActive && !isExpired
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {coupon.isActive && !isExpired ? (
                            <><CheckCircle size={11} /> Active</>
                          ) : (
                            <><XCircle size={11} /> {isExpired ? 'Expired' : 'Disabled'}</>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => deleteCoupon(coupon.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
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
