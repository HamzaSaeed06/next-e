'use client';

import { useRouter, usePathname } from 'next/navigation';
import { SlidersHorizontal, Search } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/types';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'];
const SORT_OPTIONS = [
  { value: '', label: 'Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];

interface ProductsClientProps {
  products: Product[];
  initialCategory?: string;
  initialSort?: string;
  query?: string;
}

export function ProductsClient({
  products,
  initialCategory,
  initialSort,
  query,
}: ProductsClientProps) {
  const router = useRouter();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black uppercase tracking-tight">
          {initialCategory
            ? initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1)
            : 'All Products'}
        </h1>
        {query && (
          <p className="text-[var(--neutral-500)] mt-1 text-sm">
            Showing results for &ldquo;<strong>{query}</strong>&rdquo; — {products.length} found
          </p>
        )}
        {!query && (
          <p className="text-[var(--neutral-500)] mt-1 text-sm">
            {products.length} products
          </p>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-[var(--border-default)]">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 flex-1">
          {CATEGORIES.map((cat) => {
            const val = cat === 'All' ? '' : cat.toLowerCase();
            const isActive = (initialCategory ?? '') === val;
            return (
              <button
                key={cat}
                onClick={() => updateFilter('category', val)}
                className={`px-4 py-1.5 text-[12px] font-bold uppercase tracking-widest border transition-all ${
                  isActive
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-[var(--neutral-600)] border-[var(--border-default)] hover:border-black hover:text-black'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[var(--neutral-500)]" />
          <select
            value={initialSort ?? ''}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="text-[13px] font-medium border border-[var(--border-default)] px-3 py-1.5 focus:outline-none focus:border-black bg-white"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Search size={48} className="text-[var(--neutral-200)] mb-4" strokeWidth={1} />
          <h2 className="text-xl font-bold text-black mb-2">No products found</h2>
          <p className="text-[var(--neutral-500)] text-sm">
            Try adjusting your filters or search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
