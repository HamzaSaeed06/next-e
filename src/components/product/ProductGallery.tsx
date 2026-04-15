'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function ProductGallery({
  images,
  productName,
  isFlashSale,
  discount,
}: {
  images: string[];
  productName: string;
  isFlashSale: boolean;
  discount: number;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);

  const VISIBLE_THUMBS = 4;

  useEffect(() => {
    setActiveImage(0);
    setThumbOffset(0);
  }, [images]);

  const validImages =
    images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];

  const canScrollUp = thumbOffset > 0;
  const canScrollDown = thumbOffset + VISIBLE_THUMBS < validImages.length;

  const scrollUp = () => setThumbOffset((prev) => Math.max(0, prev - 1));
  const scrollDown = () =>
    setThumbOffset((prev) =>
      Math.min(validImages.length - VISIBLE_THUMBS, prev + 1)
    );

  const visibleThumbs = validImages.slice(
    thumbOffset,
    thumbOffset + VISIBLE_THUMBS
  );

  return (
    <div className="flex gap-3 lg:gap-4">
      {/* Vertical Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          {canScrollUp && (
            <button
              onClick={scrollUp}
              className="w-8 h-6 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors"
            >
              <ChevronUp size={16} />
            </button>
          )}

          <div className="flex flex-col gap-2">
            {visibleThumbs.map((img, i) => {
              const realIndex = thumbOffset + i;
              return (
                <button
                  key={realIndex}
                  onClick={() => setActiveImage(realIndex)}
                  className={`w-14 h-14 md:w-16 md:h-16 relative flex-shrink-0 bg-[#f5f5f5] overflow-hidden transition-all border ${
                    activeImage === realIndex
                      ? 'border-black ring-1 ring-black'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${productName} view ${realIndex + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain mix-blend-multiply p-1"
                  />
                </button>
              );
            })}
          </div>

          {canScrollDown && (
            <button
              onClick={scrollDown}
              className="w-8 h-6 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors"
            >
              <ChevronDown size={16} />
            </button>
          )}
        </div>
      )}

      {/* Main Image */}
      <div className="flex-1 relative">
        <div className="aspect-[3/4] relative bg-[#f5f5f5] overflow-hidden group">
          <Image
            src={validImages[activeImage]}
            alt={productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain mix-blend-multiply p-6 transition-transform duration-500 group-hover:scale-105"
          />

          {isFlashSale && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-black text-white text-[11px] font-bold uppercase tracking-wider">
              -{Math.round(discount)}% OFF
            </span>
          )}

          {/* Image counter */}
          {validImages.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[11px] font-bold px-2 py-1 rounded">
              {activeImage + 1} / {validImages.length}
            </div>
          )}
        </div>

        {/* Mobile horizontal thumbnails (only for small screens) */}
        {validImages.length > 1 && (
          <div className="flex gap-2 mt-3 md:hidden overflow-x-auto pb-1 scrollbar-hide">
            {validImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-14 h-14 relative flex-shrink-0 bg-[#f5f5f5] overflow-hidden border transition-all ${
                  activeImage === i
                    ? 'border-black ring-1 ring-black'
                    : 'border-gray-200'
                }`}
              >
                <Image
                  src={img}
                  alt={`View ${i + 1}`}
                  fill
                  sizes="56px"
                  className="object-contain mix-blend-multiply p-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
