'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Heart, Star } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, discountPercent } from '@/utils/formatters';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCartStore();

  const isFlashSale = product.isFlashSale && product.flashSalePrice;
  const displayPrice = isFlashSale ? product.flashSalePrice! : product.price;
  const comparePrice = isFlashSale ? product.price : product.comparePrice;
  const discount = comparePrice ? discountPercent(comparePrice, displayPrice) : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    setIsLoading(true);
    try {
      addItem({
        productId: product.id,
        name: product.name,
        price: displayPrice,
        image: product.images[0] || '',
        qty: 1,
        stock: product.stock,
      });
      toast.success(`${product.name} added to bag`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div className="group relative flex flex-col bg-white border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-[#fafafa] sm:bg-[#f8f8f8]"
      >
        <Image
          src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-contain p-10 pb-16 mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {isFlashSale && (
            <span className="px-2.5 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded shadow-sm">
              -{Math.round(discount)}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded shadow-sm">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-md rounded shadow-sm text-gray-400 hover:text-red-500 transition-all hover:scale-105 active:scale-95"
          aria-label="Wishlist"
        >
          <Heart
            size={15}
            className={isWishlisted ? 'text-red-500 fill-red-500' : ''}
          />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute left-3 right-3 bottom-3 z-20 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isLoading}
            className="w-full py-2.5 bg-black/95 backdrop-blur-sm text-white text-[12px] font-bold tracking-widest uppercase rounded flex items-center justify-center gap-2 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-[0.98]"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Quick Add'}
          </button>
        </div>
      </Link>

      {/* Info Container with Boundaries & Theme Bg */}
      <div className="flex flex-col p-4 bg-white z-10 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] truncate pr-2">
            {product.brand || 'ZEST & CO.'}
          </p>
          {/* Strict Dynamic Reviews / Ratings */}
          <div className="flex items-center gap-1">
            <Star size={11} className={product.rating > 0 ? "text-amber-400 fill-amber-400" : "text-gray-300"} />
            <span className="text-[11px] font-bold text-gray-800">
              {product.rating > 0 ? product.rating.toFixed(1) : '0.0'}
            </span>
            <span className="text-[10px] text-gray-400 font-medium ml-0.5">
              ({product.reviewCount || 0})
            </span>
          </div>
        </div>

        <Link href={`/products/${product.slug}`} className="block group/link mb-2.5">
          <h3 className="text-[14px] font-bold text-black line-clamp-1 group-hover/link:text-gray-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="text-[16px] font-extrabold text-black tracking-tight">
            {formatPrice(displayPrice)}
          </span>
          {comparePrice && (
            <span className="text-[13px] font-medium text-gray-400 line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
