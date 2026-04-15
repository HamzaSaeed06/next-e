'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { getProductById } from '@/lib/services/productService';
import { ProductForm } from '@/components/admin/ProductForm';
import type { Product } from '@/types';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductById(id as string).then((p) => {
      setProduct(p);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500">Product not found.</p>
        <Link href="/admin/products" className="text-sm font-bold text-slate-900 underline mt-4 inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 bg-white border rounded-lg text-slate-400 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Edit Product</h1>
          <p className="text-[12px] text-slate-400 mt-0.5 truncate max-w-xs">{product.name}</p>
        </div>
      </div>
      <ProductForm initialData={product} onSuccess={() => router.push('/admin/products')} />
    </div>
  );
}
