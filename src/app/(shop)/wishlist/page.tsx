'use client';

import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, discountPercent } from '@/utils/formatters';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleAddToCart = (product: any) => {
    const isFlashSale = product.isFlashSale && product.flashSalePrice;
    const price = isFlashSale ? product.flashSalePrice : product.price;
    addItem({
      productId: product.id,
      name: product.name,
      price,
      image: product.images?.[0] || '',
      qty: 1,
      stock: product.stock,
    });
    toast.success(`${product.name} added to bag`);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400 uppercase tracking-widest mb-2">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-black">Wishlist</span>
          </div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight flex items-center gap-3">
            <Heart size={22} className="text-red-500 fill-red-500" />
            My Wishlist
            {items.length > 0 && (
              <span className="text-lg font-normal text-gray-400">({items.length} items)</span>
            )}
          </h1>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-[12px] font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <Heart size={36} className="text-red-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-[13px] text-gray-400 mb-8 max-w-xs">
            Save items you love and come back to them anytime.
          </p>
          <Link
            href="/products"
            className="flex items-center gap-2 px-8 py-3 bg-black text-white text-[13px] font-bold rounded hover:bg-gray-900 transition-all"
          >
            <ArrowLeft size={16} /> Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((product) => {
            const isFlashSale = product.isFlashSale && product.flashSalePrice;
            const displayPrice = isFlashSale ? product.flashSalePrice! : product.price;
            const comparePrice = isFlashSale ? product.price : product.comparePrice;
            const discount = comparePrice ? discountPercent(comparePrice, displayPrice) : 0;
            const image = product.images?.[0] || '';
            const isOutOfStock = product.stock === 0;

            return (
              <div
                key={product.id}
                className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300"
              >
                {/* Remove Button */}
                <button
                  onClick={() => {
                    removeItem(product.id);
                    toast.success('Removed from wishlist');
                  }}
                  className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-sm text-gray-400 hover:text-red-500 transition-all hover:scale-110"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={14} />
                </button>

                {/* Flash Sale badge */}
                {isFlashSale && discount > 0 && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded shadow-sm">
                      -{Math.round(discount)}%
                    </span>
                  </div>
                )}

                {/* Image */}
                <Link href={`/products/${product.slug}`}>
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain p-8 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingBag size={40} className="text-gray-200" />
                      </div>
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest bg-white px-3 py-1 rounded border border-red-200">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {product.brand || 'ZEST & CO.'}
                    </p>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-[14px] font-bold text-gray-900 hover:text-gray-500 transition-colors line-clamp-2 mt-0.5">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[17px] font-extrabold text-black">
                      {formatPrice(displayPrice)}
                    </span>
                    {comparePrice && comparePrice > displayPrice && (
                      <span className="text-[13px] text-gray-400 line-through">
                        {formatPrice(comparePrice)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock}
                    className="w-full py-2.5 bg-black text-white text-[12px] font-bold rounded flex items-center justify-center gap-2 hover:bg-gray-900 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag size={14} />
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
