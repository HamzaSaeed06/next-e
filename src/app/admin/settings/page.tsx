'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  ImageIcon,
  Tag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Megaphone,
  Sparkles,
  GripVertical,
} from 'lucide-react';
import { getStoreSettings, updateStoreSettings } from '@/lib/services/storeSettingsService';
import type { StoreSettings, Banner } from '@/types';
import toast from 'react-hot-toast';

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
        <Icon size={16} className="text-slate-600" />
        <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-semibold text-slate-700">{label}</label>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:border-slate-500 transition-all bg-white';
const textareaCls =
  'w-full px-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:border-slate-500 transition-all bg-white resize-none';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStoreSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const update = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const addBanner = () => {
    if (!settings) return;
    const newBanner: Banner = {
      id: `banner-${Date.now()}`,
      title: 'New Banner',
      subtitle: 'Enter subtitle here',
      ctaText: 'Shop Now',
      ctaLink: '/products',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400',
      isActive: true,
      order: settings.banners.length,
    };
    update('banners', [...settings.banners, newBanner]);
  };

  const updateBanner = (id: string, field: keyof Banner, value: string | boolean | number) => {
    if (!settings) return;
    update(
      'banners',
      settings.banners.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const removeBanner = (id: string) => {
    if (!settings) return;
    update('banners', settings.banners.filter((b) => b.id !== id));
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateStoreSettings(settings);
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Store Settings</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Control banners, policies, shipping, and store-wide settings.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-[13px] font-bold rounded-lg hover:bg-slate-700 transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Announcement Bar */}
      <Section title="Announcement Bar" icon={Megaphone}>
        <Field label="Banner Text" hint="Shown at the very top of the site for promotions.">
          <input
            type="text"
            className={inputCls}
            value={settings.announcementBar}
            onChange={(e) => update('announcementBar', e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => update('announcementBarActive', !settings.announcementBarActive)}
            className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer flex items-center ${
              settings.announcementBarActive ? 'bg-green-500' : 'bg-slate-300'
            }`}
            style={{ height: 22, width: 40 }}
          >
            <span
              className={`absolute w-4 h-4 bg-white rounded-full shadow transition-all ${
                settings.announcementBarActive ? 'left-5' : 'left-1'
              }`}
            />
          </div>
          <span className="text-[13px] font-medium text-slate-700">
            {settings.announcementBarActive ? 'Bar is visible' : 'Bar is hidden'}
          </span>
        </label>
      </Section>

      {/* Hero Banners */}
      <Section title="Hero Banners" icon={ImageIcon}>
        <div className="space-y-4">
          {settings.banners.map((banner) => (
            <div key={banner.id} className="border border-slate-200 rounded-xl p-4 space-y-3 relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <GripVertical size={14} className="text-slate-300" />
                  <span className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">
                    Banner
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => updateBanner(banner.id, 'isActive', !banner.isActive)}
                      className={`relative flex items-center cursor-pointer rounded-full transition-colors`}
                      style={{
                        height: 20,
                        width: 36,
                        backgroundColor: banner.isActive ? '#22c55e' : '#cbd5e1',
                      }}
                    >
                      <span
                        className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${
                          banner.isActive ? 'left-[18px]' : 'left-1'
                        }`}
                      />
                    </div>
                    <span className="text-[12px] text-slate-500">{banner.isActive ? 'Active' : 'Hidden'}</span>
                  </label>
                  <button
                    onClick={() => removeBanner(banner.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Title</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={banner.title}
                    onChange={(e) => updateBanner(banner.id, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Subtitle</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={banner.subtitle}
                    onChange={(e) => updateBanner(banner.id, 'subtitle', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">CTA Text</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={banner.ctaText}
                    onChange={(e) => updateBanner(banner.id, 'ctaText', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">CTA Link</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={banner.ctaLink}
                    onChange={(e) => updateBanner(banner.id, 'ctaLink', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Image URL</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={banner.imageUrl}
                    onChange={(e) => updateBanner(banner.id, 'imageUrl', e.target.value)}
                  />
                </div>
              </div>
              {banner.imageUrl && (
                <div className="relative h-24 rounded-lg overflow-hidden bg-slate-100 mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addBanner}
          className="w-full py-2.5 border-2 border-dashed border-slate-200 text-[13px] font-semibold text-slate-500 rounded-xl hover:border-slate-400 hover:text-slate-700 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={15} />
          Add Banner
        </button>
      </Section>

      {/* Flash Sale Banner */}
      <Section title="Flash Sale Banner" icon={Sparkles}>
        <Field label="Flash Sale Title">
          <input
            type="text"
            className={inputCls}
            value={settings.flashSaleBannerTitle}
            onChange={(e) => update('flashSaleBannerTitle', e.target.value)}
          />
        </Field>
        <Field label="Flash Sale Subtitle">
          <input
            type="text"
            className={inputCls}
            value={settings.flashSaleBannerSubtitle}
            onChange={(e) => update('flashSaleBannerSubtitle', e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => update('flashSaleBannerActive', !settings.flashSaleBannerActive)}
            className="relative flex items-center cursor-pointer rounded-full transition-colors"
            style={{
              height: 22,
              width: 40,
              backgroundColor: settings.flashSaleBannerActive ? '#22c55e' : '#cbd5e1',
            }}
          >
            <span
              className={`absolute w-4 h-4 bg-white rounded-full shadow transition-all ${
                settings.flashSaleBannerActive ? 'left-5' : 'left-1'
              }`}
            />
          </div>
          <span className="text-[13px] font-medium text-slate-700">
            {settings.flashSaleBannerActive ? 'Flash sale banner visible' : 'Flash sale banner hidden'}
          </span>
        </label>
      </Section>

      {/* Shipping */}
      <Section title="Shipping & Delivery" icon={Truck}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Free Delivery Threshold (PKR)"
            hint="Orders above this amount get free delivery."
          >
            <input
              type="number"
              className={inputCls}
              value={settings.freeDeliveryThreshold}
              onChange={(e) => update('freeDeliveryThreshold', Number(e.target.value))}
            />
          </Field>
          <Field
            label="Standard Shipping Cost (PKR)"
            hint="Applied when order is below the free threshold."
          >
            <input
              type="number"
              className={inputCls}
              value={settings.standardShippingCost}
              onChange={(e) => update('standardShippingCost', Number(e.target.value))}
            />
          </Field>
        </div>
        <Field
          label="Delivery Estimate"
          hint="Shown on product pages (e.g., 3–5 working days)."
        >
          <input
            type="text"
            className={inputCls}
            value={settings.deliveryEstimate}
            onChange={(e) => update('deliveryEstimate', e.target.value)}
          />
        </Field>
      </Section>

      {/* Return Policy */}
      <Section title="Return Policy" icon={RotateCcw}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Return Window (Days)" hint="How many days customers have to return an item.">
            <input
              type="number"
              className={inputCls}
              value={settings.returnPolicyDays}
              onChange={(e) => update('returnPolicyDays', Number(e.target.value))}
            />
          </Field>
        </div>
        <Field label="Return Policy Text" hint="Shown on product pages and checkout.">
          <textarea
            className={textareaCls}
            rows={3}
            value={settings.returnPolicy}
            onChange={(e) => update('returnPolicy', e.target.value)}
          />
        </Field>
      </Section>

      {/* Warranty */}
      <Section title="Warranty Policy" icon={ShieldCheck}>
        <Field label="Warranty Policy Text" hint="Shown on product pages.">
          <textarea
            className={textareaCls}
            rows={3}
            value={settings.warrantyPolicy}
            onChange={(e) => update('warrantyPolicy', e.target.value)}
          />
        </Field>
      </Section>

      {/* Save Button */}
      <div className="flex justify-end pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white text-[14px] font-bold rounded-xl hover:bg-slate-700 transition-all disabled:opacity-60 shadow-lg"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
