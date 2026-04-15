import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug, getRelatedProducts } from '@/lib/services/productService';
import { discountPercent } from '@/utils/formatters';
import { ProductDetailClient } from './ProductDetailClient';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductReviews } from '@/components/product/reviews/ProductReviews';
import { PopularThisWeek } from '@/components/product/PopularThisWeek';

export const revalidate = 60;

// ─── Dynamic SEO ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.name} — ${product.brand ?? 'Zest & Partners'}`,
    description: product.description?.slice(0, 160) ?? '',
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160) ?? '',
      images: product.images[0]
        ? [{ url: product.images[0], width: 800, height: 800 }]
        : [],
    },
  };
}

// ─── Page (Server Component) ─────────────────────────────────────────────────
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4).catch(() => []);

  const isFlashSale = !!(product.isFlashSale && product.flashSalePrice);
  const displayPrice = isFlashSale ? product.flashSalePrice! : product.price;
  const comparePrice = isFlashSale ? product.price : product.comparePrice;
  const discount = comparePrice ? discountPercent(comparePrice, displayPrice) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 sm:py-12 bg-white">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] text-gray-400 mb-8 uppercase tracking-[0.2em] font-bold">
        <Link href="/" className="hover:text-black transition-colors">Homepage</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-black transition-colors">Products</Link>
        <span>/</span>
        <span className="text-black truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 xl:gap-20 mb-24">
        {/* Gallery Section */}
        <ProductGallery 
           images={product.images} 
           productName={product.name}
           isFlashSale={isFlashSale || false}
           discount={discount}
        />

        {/* Details Section */}
        <ProductDetailClient product={product} />
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <section className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-black uppercase tracking-tight">
              Related Product
            </h2>
            <Link href="/products" className="text-sm font-bold underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {related.slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section - Dynamic */}
      <section id="reviews" className="mb-24 border-t pt-16">
        <div className="flex items-center justify-between mb-12">
           <h2 className="text-xl font-bold text-black uppercase tracking-tight">Product Reviews</h2>
        </div>
        <ProductReviews 
          productId={product.id} 
          initialRating={product.rating} 
          initialReviewCount={product.reviewCount} 
        />
      </section>

      {/* Popular This Week Section - Dynamic */}
      <section className="mb-12 border-t pt-16">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-xl font-bold text-black uppercase tracking-tight">Popular this week</h2>
           <Link href="/products" className="text-sm font-bold underline">View All</Link>
        </div>
        <PopularThisWeek />
      </section>
    </div>
  );
}
