'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Heart, Star, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice, discountPercent } from '@/utils/formatters';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCartStore();
  const { isWishlisted, toggleItem } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const isFlashSale = product.isFlashSale && product.flashSalePrice;
  const displayPrice = isFlashSale ? product.flashSalePrice! : product.price;
  const comparePrice = isFlashSale ? product.price : product.comparePrice;
  const discount = comparePrice ? discountPercent(comparePrice, displayPrice) : 0;

  const images = product.images?.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    setIsLoading(true);
    try {
      addItem({
        productId: product.id,
        name: product.name,
        price: displayPrice,
        image: images[0],
        qty: 1,
        stock: product.stock,
      });
      toast.success(`Added to bag!`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="group relative flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-gray-50"
      >
        <Image
          src={images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-contain p-6 pb-12 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {isFlashSale && (
            <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
              -{Math.round(discount)}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm">
              Sold Out
            </span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold uppercase rounded-sm">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleItem(product);
            toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
          }}
          className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-gray-400 hover:text-red-500 transition-all hover:scale-110 active:scale-95"
          aria-label="Wishlist"
        >
          <Heart
            size={14}
            className={wishlisted ? 'text-red-500 fill-red-500' : ''}
          />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute left-2 right-2 bottom-2 z-20 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isLoading}
            className="w-full py-2 bg-black text-white text-[11px] font-bold tracking-widest uppercase rounded-md flex items-center justify-center gap-1.5 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                <ShoppingBag size={12} />
                {product.stock === 0 ? 'Sold Out' : 'Quick Add'}
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Info */}
      <Link href={`/products/${product.slug}`} className="flex flex-col p-3 sm:p-4 bg-white z-10 border-t border-gray-100 flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] truncate pr-2">
            {product.brand || 'ZEST & CO.'}
          </p>
          {product.rating > 0 && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star size={10} className="text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-bold text-gray-600">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-[10px] text-gray-400">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}
        </div>

        <h3 className="text-[13px] font-bold text-black line-clamp-2 leading-snug mb-2 hover:text-gray-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mt-auto">
          <span className="text-[15px] font-extrabold text-black">
            {formatPrice(displayPrice)}
          </span>
          {comparePrice && comparePrice > displayPrice && (
            <span className="text-[12px] font-medium text-gray-400 line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
