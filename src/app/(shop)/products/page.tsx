import type { Metadata } from 'next';
import { getProducts } from '@/lib/services/productService';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/types';
import { ProductsClient } from './ProductsClient';

export const metadata: Metadata = {
  title: 'All Products',
  description:
    'Browse our full collection of curated products — electronics, fashion, home & living, and more.',
};

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>;
}) {
  const params = await searchParams;
  const { category, sort, q } = params;

  const { products } = await getProducts({
    category,
    sort: sort as any,
    pageSize: 24,
  }).catch(() => ({ products: [] as Product[], lastDoc: null }));

  // Client-side text filter if query present
  const filtered = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.description?.toLowerCase().includes(q.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(q.toLowerCase()))
      )
    : products;

  return <ProductsClient products={filtered} initialCategory={category} initialSort={sort} query={q} />;
}
