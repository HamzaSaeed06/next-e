import React from 'react';
import { getTrendingProducts } from '@/lib/services/productService';
import { ProductCard } from './ProductCard';

export async function PopularThisWeek() {
  const popularProducts = await getTrendingProducts(5).catch(() => []);

  if (popularProducts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {popularProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
