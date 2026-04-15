'use client';

import { useState, useEffect } from 'react';
import {
  Save, Loader2, Plus, Trash2, ImageIcon, Tag, Truck, ShieldCheck,
  RotateCcw, Megaphone, Sparkles, GripVertical, ChevronLeft,
  ChevronRight, Phone, Mail, MapPin, DollarSign, MessageCircle,
  Calendar, Info, Share2,
} from 'lucide-react';
import { getStoreSettings, updateStoreSettings } from '@/lib/services/storeSettingsService';
import type { StoreSettings, Banner, StorePromotion } from '@/types';
import toast from 'react-hot-toast';

function Section({
  title, icon: Icon, children, hint,
}: {
  title: string; icon: React.ElementType; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="flex items-start gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
        <Icon size={16} className="text-slate-600 mt-0.5 flex-shrink-0" />
        <div>
          <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-wide">{title}</h2>
          {hint && <p className="text-[11px] text-slate-400 mt-0.5 normal-case font-normal">{hint}</p>}
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-semibold text-slate-700">{label}</label>
      {hint && (
        <p className="flex items-start gap-1.5 text-[11px] text-slate-400">
          <Info size={11} className="mt-0.5 flex-shrink-0" />
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:border-slate-500 transition-all bg-white';
const textareaCls = 'w-full px-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:border-slate-500 transition-all bg-white resize-none';

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer" onClick={() => onChange(!value)}>
      <div
        className="relative flex items-center cursor-pointer rounded-full transition-colors"
        style={{ height: 22, width: 40, backgroundColor: value ? '#22c55e' : '#cbd5e1' }}
      >
        <span className={`absolute w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-5' : 'left-1'}`} />
      </div>
      <span className="text-[13px] font-medium text-slate-700">{label}</span>
    </label>
  );
}

// Mini banner carousel preview
function BannerCarouselPreview({ banners }: { banners: Banner[] }) {
  const active = banners.filter(b => b.isActive);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (active.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % active.length), 3500);
    return () => clearInterval(t);
  }, [active.length]);

  if (active.length === 0) {
    return (
      <div className="relative h-48 sm:h-64 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400 text-[13px] border border-dashed border-slate-300">
        No active banners — activate at least one to see a preview.
      </div>
    );
  }

  const banner = active[Math.min(idx, active.length - 1)];

  return (
    <div className="relative h-48 sm:h-64 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-black">
      {/* Background */}
      {banner.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Live Preview</p>
        <h3 className="text-xl sm:text-2xl font-bold leading-tight mb-1">{banner.title}</h3>
        <p className="text-[12px] text-white/80 mb-3">{banner.subtitle}</p>
        <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-black rounded text-[11px] font-bold w-fit">
          {banner.ctaText}
        </div>
      </div>

      {/* Prev / Next */}
      {active.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIdx(i => (i - 1 + active.length) % active.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/40 transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setIdx(i => (i + 1) % active.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/40 transition-all"
          >
            <ChevronRight size={14} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {active.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx % active.length ? 'bg-white w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Banner number */}
      <div className="absolute top-2 right-3 text-[10px] text-white/50 font-mono">
        {(idx % active.length) + 1} / {active.length}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'banners' | 'store' | 'shipping' | 'social' | 'adsense' | 'events' | 'chatbot'
  >('banners');

  useEffect(() => {
    getStoreSettings().then((s) => { setSettings(s); setLoading(false); });
  }, []);

  const update = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) =>
    setSettings(prev => (prev ? { ...prev, [key]: value } : prev));

  const addBanner = () => {
    if (!settings) return;
    const b: Banner = {
      id: `banner-${Date.now()}`,
      title: 'New Banner',
      subtitle: 'Enter subtitle here',
      ctaText: 'Shop Now',
      ctaLink: '/products',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400',
      isActive: true,
      order: settings.banners.length,
    };
    update('banners', [...settings.banners, b]);
  };

  const updateBanner = (id: string, field: keyof Banner, value: string | boolean | number) => {
    if (!settings) return;
    update('banners', settings.banners.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const removeBanner = (id: string) => {
    if (!settings) return;
    update('banners', settings.banners.filter(b => b.id !== id));
  };

  const addPromotion = () => {
    if (!settings) return;
    const p: StorePromotion = {
      id: `promo-${Date.now()}`,
      title: 'Summer Sale',
      subtitle: 'Up to 50% off selected items',
      badge: 'SALE',
      endsAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      isActive: true,
    };
    update('promotions', [...(settings.promotions || []), p]);
  };

  const updatePromotion = (id: string, field: keyof StorePromotion, value: string | boolean) => {
    if (!settings) return;
    update('promotions', (settings.promotions || []).map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePromotion = (id: string) => {
    if (!settings) return;
    update('promotions', (settings.promotions || []).filter(p => p.id !== id));
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateStoreSettings(settings);
      toast.success('Settings saved!');
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

  const TABS = [
    { key: 'banners', label: 'Banners' },
    { key: 'store', label: 'Store Info' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'social', label: 'Social & Contact' },
    { key: 'adsense', label: 'Google Ads' },
    { key: 'events', label: 'Promotions' },
    { key: 'chatbot', label: 'Chatbot' },
  ] as const;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Store Settings</h1>
        <p className="text-[13px] text-slate-500 mt-1">Manage banners, shipping, social links, ads, and more.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-[13px] font-semibold transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab: BANNERS ─────────────────────────────────────── */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <Section
            title="Announcement Bar"
            icon={Megaphone}
            hint="This thin bar appears at the very top of every page. Use it for promotions, shipping offers, or announcements."
          >
            <Field label="Bar Text" hint="Example: Free delivery on orders over PKR 5,000! | Use code SAVE10 for 10% off">
              <input type="text" className={inputCls} value={settings.announcementBar}
                onChange={e => update('announcementBar', e.target.value)} />
            </Field>
            <Toggle
              value={settings.announcementBarActive}
              onChange={v => update('announcementBarActive', v)}
              label={settings.announcementBarActive ? 'Bar is visible to customers' : 'Bar is currently hidden'}
            />
          </Section>

          <Section
            title="Hero Banners (Carousel)"
            icon={ImageIcon}
            hint="These banners rotate on the homepage as a full-width carousel. Add multiple banners — only active ones are shown. The preview below is live."
          >
            {/* Live Carousel Preview */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Live Carousel Preview</p>
              <BannerCarouselPreview banners={settings.banners} />
            </div>

            <div className="space-y-4 pt-2">
              {settings.banners.map((banner, index) => (
                <div key={banner.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical size={14} className="text-slate-300" />
                      <span className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">
                        Banner {index + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Toggle
                        value={banner.isActive}
                        onChange={v => updateBanner(banner.id, 'isActive', v)}
                        label={banner.isActive ? 'Active' : 'Hidden'}
                      />
                      <button onClick={() => removeBanner(banner.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Heading</label>
                      <input type="text" className={inputCls} value={banner.title}
                        onChange={e => updateBanner(banner.id, 'title', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Subheading</label>
                      <input type="text" className={inputCls} value={banner.subtitle}
                        onChange={e => updateBanner(banner.id, 'subtitle', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Button Text</label>
                      <input type="text" className={inputCls} value={banner.ctaText}
                        onChange={e => updateBanner(banner.id, 'ctaText', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Button Link</label>
                      <input type="text" className={inputCls} value={banner.ctaLink}
                        onChange={e => updateBanner(banner.id, 'ctaLink', e.target.value)} placeholder="/products" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">
                        Background Image URL
                        <span className="ml-2 font-normal normal-case text-slate-400">(recommended: 1400×600px, landscape)</span>
                      </label>
                      <input type="text" className={inputCls} value={banner.imageUrl}
                        onChange={e => updateBanner(banner.id, 'imageUrl', e.target.value)}
                        placeholder="https://images.unsplash.com/..." />
                    </div>
                  </div>
                  {banner.imageUrl && (
                    <div className="relative h-20 rounded-lg overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={banner.imageUrl} alt="thumb" className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addBanner}
              className="w-full py-2.5 border-2 border-dashed border-slate-200 text-[13px] font-semibold text-slate-500 rounded-xl hover:border-slate-400 hover:text-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={15} /> Add Another Banner
            </button>
          </Section>

          <Section
            title="Flash Sale Banner"
            icon={Sparkles}
            hint="A prominent call-to-action section shown on the homepage. Enable this during big sale events."
          >
            <Field label="Sale Heading" hint="Example: Flash Sale: Up to 70% Off — make it urgent!">
              <input type="text" className={inputCls} value={settings.flashSaleBannerTitle}
                onChange={e => update('flashSaleBannerTitle', e.target.value)} />
            </Field>
            <Field label="Sale Subheading" hint="Example: Grab these deals before they are gone!">
              <input type="text" className={inputCls} value={settings.flashSaleBannerSubtitle}
                onChange={e => update('flashSaleBannerSubtitle', e.target.value)} />
            </Field>
            <Toggle
              value={settings.flashSaleBannerActive}
              onChange={v => update('flashSaleBannerActive', v)}
              label={settings.flashSaleBannerActive ? 'Flash sale banner visible' : 'Flash sale banner hidden'}
            />
          </Section>
        </div>
      )}

      {/* ─── Tab: STORE INFO ─────────────────────────────────── */}
      {activeTab === 'store' && (
        <div className="space-y-6">
          <Section
            title="Store Identity"
            icon={Tag}
            hint="Basic info about your store. The store name appears in emails, notifications, and the browser tab."
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Store Name" hint="Shown in emails and the browser title bar.">
                <input type="text" className={inputCls} value={settings.storeName}
                  onChange={e => update('storeName', e.target.value)} />
              </Field>
              <Field label="Tagline" hint="A short slogan shown under the logo and in the site footer.">
                <input type="text" className={inputCls} value={settings.storeTagline}
                  onChange={e => update('storeTagline', e.target.value)} />
              </Field>
            </div>
          </Section>
        </div>
      )}

      {/* ─── Tab: SHIPPING ──────────────────────────────────── */}
      {activeTab === 'shipping' && (
        <div className="space-y-6">
          <Section
            title="Shipping & Delivery"
            icon={Truck}
            hint="These values are shown on product pages, checkout, and order confirmation emails."
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Free Delivery Threshold (PKR)"
                hint="Orders above this amount automatically qualify for free delivery at checkout.">
                <input type="number" className={inputCls} value={settings.freeDeliveryThreshold}
                  onChange={e => update('freeDeliveryThreshold', Number(e.target.value))} />
              </Field>
              <Field label="Standard Shipping Cost (PKR)"
                hint="This flat fee is charged for orders below the free-delivery threshold.">
                <input type="number" className={inputCls} value={settings.standardShippingCost}
                  onChange={e => update('standardShippingCost', Number(e.target.value))} />
              </Field>
            </div>
            <Field label="Delivery Estimate"
              hint="Shown on product pages below the Add to Cart button. Example: 3–5 working days.">
              <input type="text" className={inputCls} value={settings.deliveryEstimate}
                onChange={e => update('deliveryEstimate', e.target.value)} />
            </Field>
          </Section>

          <Section
            title="Return Policy"
            icon={RotateCcw}
            hint="Shown on product pages and during checkout. A clear return policy builds customer trust."
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Return Window (Days)"
                hint="How many days after delivery can a customer request a return? Common values: 7, 14, 30.">
                <input type="number" className={inputCls} value={settings.returnPolicyDays}
                  onChange={e => update('returnPolicyDays', Number(e.target.value))} />
              </Field>
            </div>
            <Field label="Return Policy Description"
              hint="Shown on product pages below the Checkout button. Keep it short and reassuring.">
              <textarea className={textareaCls} rows={3} value={settings.returnPolicy}
                onChange={e => update('returnPolicy', e.target.value)} />
            </Field>
          </Section>

          <Section
            title="Warranty Policy"
            icon={ShieldCheck}
            hint="Shown on product pages. Helps customers feel confident about product quality."
          >
            <Field label="Warranty Description"
              hint="Example: 1-year manufacturer warranty on all electronics. 6-month warranty on accessories.">
              <textarea className={textareaCls} rows={3} value={settings.warrantyPolicy}
                onChange={e => update('warrantyPolicy', e.target.value)} />
            </Field>
          </Section>
        </div>
      )}

      {/* ─── Tab: SOCIAL & CONTACT ──────────────────────────── */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          <Section
            title="Social Media Links"
            icon={Share2}
            hint="These links appear in the footer. Only links you fill in will be shown — leave blank to hide."
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Facebook Page URL', placeholder: 'https://facebook.com/...', badge: 'FB', color: 'bg-blue-600', key: 'socialFacebook' as const },
                { label: 'Instagram Profile URL', placeholder: 'https://instagram.com/...', badge: 'IG', color: 'bg-pink-500', key: 'socialInstagram' as const },
                { label: 'Twitter / X Profile URL', placeholder: 'https://twitter.com/...', badge: 'X', color: 'bg-slate-800', key: 'socialTwitter' as const },
                { label: 'TikTok Profile URL', placeholder: 'https://tiktok.com/@...', badge: 'TK', color: 'bg-black', key: 'socialTikTok' as const },
                { label: 'YouTube Channel URL', placeholder: 'https://youtube.com/@...', badge: 'YT', color: 'bg-red-600', key: 'socialYouTube' as const },
                { label: 'WhatsApp Number', placeholder: '+923001234567', badge: 'WA', color: 'bg-green-600', key: 'socialWhatsApp' as const },
              ].map(({ label, placeholder, badge, color, key }) => (
                <Field key={key} label={label} hint={`Paste your ${label.split(' ')[0]} URL or number. Leave blank to hide it from the footer.`}>
                  <div className="flex gap-2 items-center">
                    <span className={`${color} text-white text-[10px] font-extrabold w-7 h-7 rounded flex items-center justify-center flex-shrink-0`}>
                      {badge}
                    </span>
                    <input type="text" className={inputCls} placeholder={placeholder}
                      value={(settings[key] as string) || ''}
                      onChange={e => update(key, e.target.value)} />
                  </div>
                </Field>
              ))}
            </div>
          </Section>

          <Section
            title="Contact Information"
            icon={Mail}
            hint="Shown on the Contact Us page and footer. Helps customers reach you easily."
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Support Email" hint="Customers will email this address for help. Example: support@yourstore.com">
                <div className="flex gap-2">
                  <Mail size={16} className="text-slate-400 flex-shrink-0 mt-2.5" />
                  <input type="email" className={inputCls} placeholder="support@yourstore.com" value={settings.contactEmail || ''}
                    onChange={e => update('contactEmail', e.target.value)} />
                </div>
              </Field>
              <Field label="Phone Number" hint="Shown in the footer and contact page.">
                <div className="flex gap-2">
                  <Phone size={16} className="text-slate-400 flex-shrink-0 mt-2.5" />
                  <input type="text" className={inputCls} placeholder="+92300..." value={settings.contactPhone || ''}
                    onChange={e => update('contactPhone', e.target.value)} />
                </div>
              </Field>
            </div>
            <Field label="Store Address" hint="Shown in the footer. Example: Shop 12, Mall of Lahore, Lahore, Pakistan.">
              <div className="flex gap-2">
                <MapPin size={16} className="text-slate-400 flex-shrink-0 mt-2.5" />
                <textarea className={textareaCls} rows={2} placeholder="Your store address..." value={settings.contactAddress || ''}
                  onChange={e => update('contactAddress', e.target.value)} />
              </div>
            </Field>
          </Section>
        </div>
      )}

      {/* ─── Tab: GOOGLE ADS ────────────────────────────────── */}
      {activeTab === 'adsense' && (
        <div className="space-y-6">
          <Section
            title="Google AdSense Setup"
            icon={DollarSign}
            hint="Earn money by showing Google ads on your store. You need a Google AdSense account first — it's free to apply at adsense.google.com."
          >
            {/* How it works box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-[12px] font-bold text-blue-800">How Google AdSense works:</p>
              <ol className="list-decimal list-inside space-y-1 text-[12px] text-blue-700">
                <li>Go to <a href="https://adsense.google.com" target="_blank" rel="noreferrer" className="underline font-semibold">adsense.google.com</a> and apply with your website URL.</li>
                <li>After Google approves your site (1–2 weeks), you get a Publisher ID (e.g. pub-1234567890123456).</li>
                <li>Create Ad Units in your AdSense dashboard — each unit has an Ad Slot ID.</li>
                <li>Enter your Publisher ID and Ad Slot IDs below. Turn on AdSense to show ads.</li>
                <li>Google pays you monthly when your earnings exceed the minimum threshold.</li>
              </ol>
            </div>

            <Toggle
              value={settings.adsenseEnabled || false}
              onChange={v => update('adsenseEnabled', v)}
              label={settings.adsenseEnabled ? 'AdSense ads are active on your store' : 'AdSense is currently disabled'}
            />

            <Field label="Publisher ID"
              hint="Found in your AdSense account under Account → Account information. Looks like: pub-1234567890123456">
              <input type="text" className={inputCls} placeholder="pub-XXXXXXXXXXXXXXXX"
                value={settings.adsensePublisherId || ''}
                onChange={e => update('adsensePublisherId', e.target.value)} />
            </Field>
          </Section>

          <Section
            title="Ad Placements"
            icon={DollarSign}
            hint="Each placement below maps to a specific area of your store. Create separate Ad Units in your AdSense account for each placement and paste the Slot ID here."
          >
            <div className="space-y-5">
              <Field label="Homepage — Between Product Sections"
                hint="A banner-style ad shown between the Trending and Featured product rows on the homepage.">
                <input type="text" className={inputCls} placeholder="Ad Slot ID (e.g. 1234567890)"
                  value={settings.adsenseHomeBanner || ''}
                  onChange={e => update('adsenseHomeBanner', e.target.value)} />
              </Field>
              <Field label="Products Page — After Grid"
                hint="Shown below the product grid on the /products listing page. Good for high-traffic placement.">
                <input type="text" className={inputCls} placeholder="Ad Slot ID"
                  value={settings.adsenseProductsPage || ''}
                  onChange={e => update('adsenseProductsPage', e.target.value)} />
              </Field>
              <Field label="Product Detail Page — Below Description"
                hint="Shown on individual product pages below the description text. Good for impulse-buy ads.">
                <input type="text" className={inputCls} placeholder="Ad Slot ID"
                  value={settings.adsenseProductDetail || ''}
                  onChange={e => update('adsenseProductDetail', e.target.value)} />
              </Field>
            </div>

            {settings.adsenseEnabled && !settings.adsensePublisherId && (
              <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-[12px] text-yellow-800">
                <Info size={14} className="flex-shrink-0 mt-0.5" />
                Enter your Publisher ID above to activate ads on your store.
              </div>
            )}
          </Section>
        </div>
      )}

      {/* ─── Tab: PROMOTIONS / EVENTS ─────────────────────── */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <Section
            title="Promotions & Events"
            icon={Calendar}
            hint="Create time-limited promotions or sale events. These appear as highlight badges and banners on your store. You can schedule them in advance."
          >
            <div className="space-y-4">
              {(settings.promotions || []).length === 0 && (
                <p className="text-[13px] text-slate-400 text-center py-4">
                  No promotions yet — add your first one below.
                </p>
              )}
              {(settings.promotions || []).map((promo, index) => (
                <div key={promo.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">
                      Promotion {index + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <Toggle
                        value={promo.isActive}
                        onChange={v => updatePromotion(promo.id, 'isActive', v)}
                        label={promo.isActive ? 'Active' : 'Inactive'}
                      />
                      <button onClick={() => removePromotion(promo.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">
                        Promotion Title
                        <span className="ml-1 font-normal normal-case text-slate-400">(e.g. Eid Sale, Summer Festival)</span>
                      </label>
                      <input type="text" className={inputCls} value={promo.title}
                        onChange={e => updatePromotion(promo.id, 'title', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">
                        Badge Text
                        <span className="ml-1 font-normal normal-case text-slate-400">(e.g. SALE, 50% OFF, FESTIVE)</span>
                      </label>
                      <input type="text" className={inputCls} value={promo.badge}
                        onChange={e => updatePromotion(promo.id, 'badge', e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">
                        Subtitle / Description
                        <span className="ml-1 font-normal normal-case text-slate-400">(shown below the title)</span>
                      </label>
                      <input type="text" className={inputCls} value={promo.subtitle}
                        onChange={e => updatePromotion(promo.id, 'subtitle', e.target.value)}
                        placeholder="Up to 50% off on selected products" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wide">
                        End Date
                        <span className="ml-1 font-normal normal-case text-slate-400">(promotion expires after this date)</span>
                      </label>
                      <input type="date" className={inputCls} value={promo.endsAt}
                        onChange={e => updatePromotion(promo.id, 'endsAt', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addPromotion}
              className="w-full py-2.5 border-2 border-dashed border-slate-200 text-[13px] font-semibold text-slate-500 rounded-xl hover:border-slate-400 hover:text-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={15} /> Add Promotion
            </button>
          </Section>
        </div>
      )}

      {/* ─── Tab: CHATBOT ───────────────────────────────────── */}
      {activeTab === 'chatbot' && (
        <div className="space-y-6">
          <Section
            title="Customer Chat Assistant"
            icon={MessageCircle}
            hint="A floating chat widget appears in the bottom-right corner of your store. Customers can ask questions about shipping, returns, and products. Answers come from your store settings automatically."
          >
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
              <p className="text-[12px] font-bold text-slate-700">What the chatbot can answer automatically:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[12px] text-slate-500">
                <li>Shipping cost and delivery time</li>
                <li>Return policy and how to return an item</li>
                <li>Warranty information</li>
                <li>Store contact details and WhatsApp</li>
                <li>How to track an order</li>
                <li>How to apply a coupon</li>
              </ul>
            </div>

            <Toggle
              value={settings.chatbotEnabled || false}
              onChange={v => update('chatbotEnabled', v)}
              label={settings.chatbotEnabled ? 'Chat widget visible on your store' : 'Chat widget is hidden'}
            />

            <Field label="Assistant Name"
              hint="The name shown at the top of the chat window. Example: Zest Assistant, Sara, Support Bot.">
              <input type="text" className={inputCls} placeholder="Zest Assistant"
                value={settings.chatbotName || ''}
                onChange={e => update('chatbotName', e.target.value)} />
            </Field>

            <Field label="Opening Greeting"
              hint="The first message the chatbot sends when a customer opens the chat. Make it friendly and helpful.">
              <textarea className={textareaCls} rows={3} placeholder="Hi! How can I help you today?"
                value={settings.chatbotGreeting || ''}
                onChange={e => update('chatbotGreeting', e.target.value)} />
            </Field>
          </Section>
        </div>
      )}

      {/* Save Footer */}
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
