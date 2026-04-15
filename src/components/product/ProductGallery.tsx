'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronUp, ChevronDown, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((i) => (i === 0 ? validImages.length - 1 : i - 1));
  }, [validImages.length]);

  const lightboxNext = useCallback(() => {
    setLightboxIndex((i) => (i === validImages.length - 1 ? 0 : i + 1));
  }, [validImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, lightboxPrev, lightboxNext]);

  return (
    <>
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
          <div
            className="aspect-[3/4] relative bg-[#f5f5f5] overflow-hidden group cursor-zoom-in"
            onClick={() => openLightbox(activeImage)}
          >
            <Image
              src={validImages[activeImage]}
              alt={productName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain mix-blend-multiply p-6 transition-transform duration-500 group-hover:scale-110"
            />

            {isFlashSale && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-black text-white text-[11px] font-bold uppercase tracking-wider z-10">
                -{Math.round(discount)}% OFF
              </span>
            )}

            {/* Zoom hint */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-black/60 text-white text-[11px] font-medium px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ZoomIn size={13} />
              Click to zoom
            </div>

            {/* Image counter */}
            {validImages.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[11px] font-bold px-2 py-1 rounded z-10">
                {activeImage + 1} / {validImages.length}
              </div>
            )}
          </div>

          {/* Mobile horizontal thumbnails */}
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

      {/* Lightbox / Zoom Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            onClick={closeLightbox}
          >
            <X size={22} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-[13px] font-medium">
            {lightboxIndex + 1} / {validImages.length}
          </div>

          {/* Prev Button */}
          {validImages.length > 1 && (
            <button
              className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Main Lightbox Image */}
          <div
            className="relative w-full h-full max-w-3xl max-h-[85vh] mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={validImages[lightboxIndex]}
              alt={`${productName} zoomed view ${lightboxIndex + 1}`}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Next Button */}
          {validImages.length > 1 && (
            <button
              className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Thumbnail strip at bottom */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {validImages.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-12 h-12 relative flex-shrink-0 border-2 rounded overflow-hidden transition-all ${
                    lightboxIndex === i ? 'border-white' : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumb ${i + 1}`}
                    fill
                    sizes="48px"
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
