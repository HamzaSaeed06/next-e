'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Heart, Star, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const { addItem } = useCartStore();

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
      toast.success(`${product.name} added to bag`);
    } finally {
      setIsLoading(false);
    }
  };

  const openZoom = (e: React.MouseEvent) => {
    e.preventDefault();
    setZoomIndex(0);
    setZoomOpen(true);
  };

  const zoomPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const zoomNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <>
      <motion.div className="group relative flex flex-col bg-white border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Image Container */}
        <Link
          href={`/products/${product.slug}`}
          className="block relative aspect-square overflow-hidden bg-[#fafafa] sm:bg-[#f8f8f8]"
        >
          <Image
            src={images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-contain p-10 pb-16 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
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

          {/* Zoom Button */}
          <button
            onClick={openZoom}
            className="absolute top-3 right-12 z-10 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-md rounded shadow-sm text-gray-400 hover:text-black transition-all hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100"
            aria-label="Zoom image"
          >
            <ZoomIn size={15} />
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

        {/* Info Container */}
        <div className="flex flex-col p-4 bg-white z-10 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] truncate pr-2">
              {product.brand || 'ZEST & CO.'}
            </p>
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

      {/* Zoom Lightbox */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center"
          onClick={() => setZoomOpen(false)}
        >
          <button
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            onClick={() => setZoomOpen(false)}
          >
            <X size={22} />
          </button>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-[13px] font-medium">
            {product.name}
          </div>

          {images.length > 1 && (
            <button
              className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              onClick={zoomPrev}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div
            className="relative w-full h-full max-w-2xl max-h-[80vh] mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[zoomIndex]}
              alt={product.name}
              fill
              sizes="80vw"
              className="object-contain"
              priority
            />
          </div>

          {images.length > 1 && (
            <button
              className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              onClick={zoomNext}
            >
              <ChevronRight size={24} />
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setZoomIndex(i); }}
                  className={`w-10 h-10 relative flex-shrink-0 border-2 rounded overflow-hidden transition-all ${
                    zoomIndex === i ? 'border-white' : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumb ${i + 1}`}
                    fill
                    sizes="40px"
                    className="object-contain bg-white p-0.5"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
