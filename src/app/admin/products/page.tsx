'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Package,
  ExternalLink, 
  Edit2, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';
import { getProducts } from '@/lib/services/productService';
import { formatPrice } from '@/utils/formatters';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { products: data } = await getProducts({ pageSize: 100 });
        setProducts(data);
      } catch (error) {
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-[13px] text-slate-500 mt-1">Manage your shop items, variants and inventory.</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-[13px] font-bold rounded shadow-sm hover:bg-orange-600 transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border rounded shadow-sm p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search products by name, brand or category..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded text-[13px] focus:ring-2 focus:ring-orange-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white border rounded shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
             <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-[13px] text-slate-500 animate-pulse">Loading products data...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 relative bg-slate-100 rounded border border-slate-200 p-1 flex-shrink-0">
                          <Image
                            src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                            alt={product.name}
                            fill
                            className="object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-slate-900 truncate">{product.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{product.brand ?? 'Zest Collection'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-medium text-slate-700">{formatPrice(product.price)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {product.stock <= product.lowStockThreshold ? (
                          <div className="flex items-center gap-1.5 text-red-500 bg-red-50 px-2 py-0.5 rounded text-[11px] font-bold animate-pulse">
                            <AlertCircle size={12} />
                            <span>{product.stock} Low</span>
                          </div>
                        ) : (
                          <span className="text-[13px] text-slate-600 font-medium">{product.stock} in stock</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-all"
                          title="View on Store"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <button 
                          className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-all"
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
               <Package size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No products found</h3>
            <p className="text-[13px] text-slate-500 max-w-xs mt-1">
              {searchTerm 
                ? `We couldn't find any products matching "${searchTerm}"` 
                : "It looks like you haven't added any products yet."}
            </p>
            {!searchTerm && (
              <Link 
                href="/admin/products/new"
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-[13px] font-bold rounded hover:bg-orange-600 transition-all shadow-sm"
              >
                <Plus size={18} />
                <span>Create Your First Product</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
