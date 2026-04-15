import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import {
  getFeaturedProducts,
  getTrendingProducts,
  getNewArrivals,
} from '@/lib/services/productService';
import type { Product } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home — Curated Collections',
  description:
    'Explore trending, featured, and new arrival products at Zest & Partners.',
};

// ─── Revalidate every 60 seconds (ISR) ──────────────────────────────────────
export const revalidate = 60;

// ─── Server-side data fetching ───────────────────────────────────────────────
async function getHomeData() {
  const [trending, featured, newArrivals] = await Promise.all([
    getTrendingProducts(8).catch((e) => {
      console.error('Trending Products Error:', e.message);
      return [] as Product[];
    }),
    getFeaturedProducts(4).catch((e) => {
      console.error('Featured Products Error:', e.message);
      return [] as Product[];
    }),
    getNewArrivals(4).catch((e) => {
      console.error('New Arrivals Error:', e.message);
      return [] as Product[];
    }),
  ]);
  return { trending, featured, newArrivals };
}

// ─── Sub-components ──────────────────────────────────────────────────────────
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

const categories = [
  {
    name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600', // fresh tech laptop
    slug: 'electronics',
  },
  {
    name: 'Fashion',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600', // fashion rack
    slug: 'fashion',
  },
  {
    name: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600', // beautiful home interior
    slug: 'home',
  },
  {
    name: 'Beauty',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600', // beauty products skin care
    slug: 'beauty',
  },
];

// ─── Page (Server Component) ─────────────────────────────────────────────────
export default async function HomePage() {
  const { trending, featured, newArrivals } = await getHomeData();

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative h-[520px] md:h-[640px] overflow-hidden bg-black">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400"
          alt="Zest & Partners — Hero"
          fill
          priority
          className="object-cover opacity-60"
          sizes="100vw"
        />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6 z-10">
          <p className="text-[11px] text-white/70 uppercase tracking-[0.4em] font-bold mb-4">
            New Collection
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-white uppercase tracking-[-0.02em] leading-none mb-6">
            Curated
            <br />
            Excellence
          </h1>
          <p className="text-[15px] text-white/70 max-w-sm mb-8">
            Editorial products for the modern lifestyle.
          </p>
          <Link
            href="/products"
            className="px-8 py-4 bg-white text-black text-[13px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all"
          >
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader title="Shop by Category" link="/products" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative aspect-[4/3] overflow-hidden"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-bold text-base uppercase tracking-widest">
                    {cat.name}
                  </h3>
                  <p className="text-white/70 text-[12px] font-medium mt-1">
                    Shop Now →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white/70 font-medium text-[13px] uppercase tracking-widest">
                  Limited Time
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Flash Sale: Up to 70% Off
              </h2>
              <p className="text-white/60 mt-2 text-[14px]">
                Grab these deals before they are gone!
              </p>
            </div>
            <Link
              href="/products?flash=true"
              className="px-8 py-4 bg-white text-black text-[13px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all"
            >
              Shop Flash Sale
            </Link>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            title="Trending Now"
            subtitle="Most popular products this week"
            icon={TrendingUp}
            link="/products?sort=popular"
          />
          <ProductGrid products={trending} />
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
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
      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            title="New Arrivals"
            subtitle="Fresh additions to our collection"
            icon={Clock}
            link="/products?sort=newest"
          />
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
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
              className="px-6 py-3 bg-white text-black font-bold text-[13px] uppercase tracking-widest hover:bg-white/90 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
