'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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

  // Reset active image when image set changes (e.g., color selection)
  useEffect(() => {
    setActiveImage(0);
  }, [images]);

  // Default fallback if no images provided
  const validImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square relative bg-[#f9f9f9] overflow-hidden group">
        <Image
          src={validImages[activeImage]}
          alt={productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain mix-blend-multiply p-8 transition-transform duration-500 group-hover:scale-105"
        />
        {isFlashSale && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-black text-white text-[11px] font-bold uppercase tracking-wider rounded">
            -{Math.round(discount)}% OFF
          </span>
        )}
      </div>

      {/* Thumbnails list - Display exactly up to 4 to match image */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {validImages.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`aspect-square relative bg-[#f9f9f9] overflow-hidden transition-all ${
                activeImage === i ? 'ring-2 ring-black' : 'hover:opacity-75'
              }`}
            >
              <Image
                src={img}
                alt={`${productName} view ${i + 1}`}
                fill
                sizes="150px"
                className="object-contain mix-blend-multiply p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
