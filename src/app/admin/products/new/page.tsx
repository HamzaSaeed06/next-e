import { ProductForm } from '@/components/admin/ProductForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewProductPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/products"
          className="p-2 bg-white border rounded text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Product</h1>
          <p className="text-[13px] text-slate-500 mt-1">Add a new item to your catalog with variants and images.</p>
        </div>
      </div>

      <div className="bg-white border rounded shadow-sm">
        <ProductForm />
      </div>
    </div>
  );
}
