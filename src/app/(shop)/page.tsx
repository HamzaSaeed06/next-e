import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, Clock, Zap } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { HeroBannerCarousel } from '@/components/shop/HeroBannerCarousel';
import { FlashSaleCountdown } from '@/components/shop/FlashSaleCountdown';
import {
  getFeaturedProducts,
  getTrendingProducts,
  getNewArrivals,
} from '@/lib/services/productService';
import { getStoreSettings } from '@/lib/services/storeSettingsService';
import type { Product, StoreSettings } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home — Curated Collections',
  description:
    'Explore trending, featured, and new arrival products at Zest & Partners.',
};

export const revalidate = 60;

async function getHomeData() {
  const [trending, featured, newArrivals, settings] = await Promise.all([
    getTrendingProducts(8).catch(() => [] as Product[]),
    getFeaturedProducts(4).catch(() => [] as Product[]),
    getNewArrivals(4).catch(() => [] as Product[]),
    getStoreSettings().catch(() => null as StoreSettings | null),
  ]);
  return { trending, featured, newArrivals, settings };
}

function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  link,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  link?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className="w-5 h-5 text-black" />}
          <h2 className="text-2xl md:text-3xl font-bold text-black">{title}</h2>
        </div>
        {subtitle && (
          <p className="text-[var(--text-secondary)] text-[14px]">{subtitle}</p>
        )}
      </div>
      {link && (
        <Link
          href={link}
          className="hidden sm:flex items-center gap-1 text-sm font-bold text-black hover:underline transition-colors uppercase tracking-widest"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--neutral-500)]">Check back later for new arrivals!</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

const categories = [
  {
    name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
    slug: 'electronics',
  },
  {
    name: 'Fashion',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600',
    slug: 'fashion',
  },
  {
    name: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600',
    slug: 'home',
  },
  {
    name: 'Beauty',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600',
    slug: 'beauty',
  },
];

export default async function HomePage() {
  const { trending, featured, newArrivals, settings } = await getHomeData();

  const activeBanners = settings?.banners?.filter((b) => b.isActive) ?? [];

  const showFlashBanner = settings?.flashSaleBannerActive !== false;
  const flashTitle = settings?.flashSaleBannerTitle || 'Flash Sale: Up to 70% Off';
  const flashSubtitle = settings?.flashSaleBannerSubtitle || 'Grab these deals before they are gone!';

  const announcement = settings?.announcementBarActive && settings?.announcementBar;

  return (
    <div className="min-h-screen">
      {/* Announcement Bar */}
      {announcement && (
        <div className="bg-black text-white text-center text-[11px] font-medium py-1.5 px-4 tracking-widest flex items-center justify-center">
          <span>{settings!.announcementBar}</span>
        </div>
      )}

      {/* Hero Banner Carousel */}
      <HeroBannerCarousel banners={activeBanners} />

      {/* Categories */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader title="Shop by Category" link="/products" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-sm"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                  <h3 className="text-white font-bold text-sm sm:text-base uppercase tracking-widest">
                    {cat.name}
                  </h3>
                  <p className="text-white/70 text-[11px] sm:text-[12px] font-medium mt-0.5">
                    Shop Now →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      {showFlashBanner && (
        <section className="py-10 md:py-12 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                  <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-bold text-[12px] uppercase tracking-widest">
                    Limited Time
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-white">
                  {flashTitle}
                </h2>
                <p className="text-white/60 mt-2 text-[14px]">
                  {flashSubtitle}
                </p>
                <FlashSaleCountdown />
              </div>
              <Link
                href="/products?flash=true"
                className="px-8 py-4 bg-white text-black text-[13px] font-bold uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all flex-shrink-0"
              >
                Shop Flash Sale
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trending */}
      <section className="py-12 md:py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            title="Trending Now"
            subtitle="Most popular products this week"
            icon={TrendingUp}
            link="/products?sort=popular"
          />
          <ProductGrid products={trending} />
          {trending.length > 0 && (
            <div className="text-center mt-8">
              <Link
                href="/products?sort=popular"
                className="inline-flex items-center gap-2 px-6 py-3 border border-black text-black text-[13px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all sm:hidden"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            title="Featured Products"
            subtitle="Handpicked just for you"
            icon={Sparkles}
            link="/products?featured=true"
          />
          <ProductGrid products={featured} />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 md:py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            title="New Arrivals"
            subtitle="Fresh additions to our collection"
            icon={Clock}
            link="/products?sort=newest"
          />
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🚚', title: 'Free Delivery', desc: 'On orders over PKR 5,000' },
              { icon: '🔄', title: 'Easy Returns', desc: '7-day hassle-free returns' },
              { icon: '🔒', title: 'Secure Payment', desc: 'COD & card accepted' },
              { icon: '💬', title: '24/7 Support', desc: 'We reply instantly' },
            ].map((b) => (
              <div key={b.title} className="flex flex-col items-center gap-2">
                <span className="text-3xl">{b.icon}</span>
                <p className="text-[13px] font-bold text-black">{b.title}</p>
                <p className="text-[12px] text-gray-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Join the Zest Family
          </h2>
          <p className="text-[var(--neutral-400)] mb-8 max-w-md mx-auto text-[14px]">
            Subscribe for exclusive deals, new arrivals, and insider-only discounts.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-[var(--neutral-800)] border border-[var(--neutral-700)] text-white placeholder-[var(--neutral-500)] focus:outline-none focus:border-white transition-colors text-[14px]"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-black font-bold text-[13px] uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
