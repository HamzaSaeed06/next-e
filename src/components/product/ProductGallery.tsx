'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronUp, ChevronDown, ZoomIn, X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

export type GalleryItem =
  | { type: 'image'; url: string }
  | { type: 'video'; url: string };

export function ProductGallery({
  images,
  videoUrl,
  productName,
  isFlashSale,
  discount,
}: {
  images: string[];
  videoUrl?: string;
  productName: string;
  isFlashSale: boolean;
  discount: number;
}) {
  const validImages =
    images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];

  const items: GalleryItem[] = [
    ...validImages.map((url) => ({ type: 'image' as const, url })),
    ...(videoUrl ? [{ type: 'video' as const, url: videoUrl }] : []),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const VISIBLE_THUMBS = 4;

  useEffect(() => {
    setActiveIndex(0);
    setThumbOffset(0);
  }, [images, videoUrl]);

  useEffect(() => {
    if (activeIndex < thumbOffset) {
      setThumbOffset(activeIndex);
    } else if (activeIndex >= thumbOffset + VISIBLE_THUMBS) {
      setThumbOffset(activeIndex - VISIBLE_THUMBS + 1);
    }
  }, [activeIndex, thumbOffset]);

  const canScrollUp = thumbOffset > 0;
  const canScrollDown = thumbOffset + VISIBLE_THUMBS < items.length;

  const scrollUp = () => setThumbOffset((prev) => Math.max(0, prev - 1));
  const scrollDown = () =>
    setThumbOffset((prev) => Math.min(items.length - VISIBLE_THUMBS, prev + 1));

  const visibleThumbs = items.slice(thumbOffset, thumbOffset + VISIBLE_THUMBS);

  const openLightbox = (index: number) => {
    if (items[index]?.type === 'video') return;
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const imageItems = items.filter((i) => i.type === 'image');

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((i) => (i === 0 ? imageItems.length - 1 : i - 1));
  }, [imageItems.length]);

  const lightboxNext = useCallback(() => {
    setLightboxIndex((i) => (i === imageItems.length - 1 ? 0 : i + 1));
  }, [imageItems.length]);

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

  const activeItem = items[activeIndex];

  return (
    <>
      <div className="flex gap-3 lg:gap-4">
        {items.length > 1 && (
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
              {visibleThumbs.map((item, i) => {
                const realIndex = thumbOffset + i;
                const isActive = activeIndex === realIndex;
                return (
                  <button
                    key={realIndex}
                    onClick={() => setActiveIndex(realIndex)}
                    className={`w-14 h-14 md:w-16 md:h-16 relative flex-shrink-0 bg-[#f5f5f5] overflow-hidden transition-all border ${
                      isActive
                        ? 'border-black ring-1 ring-black'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {item.type === 'image' ? (
                      <Image
                        src={item.url}
                        alt={`${productName} view ${realIndex + 1}`}
                        fill
                        sizes="80px"
                        className="object-contain mix-blend-multiply p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <Play size={18} className="text-white fill-white" />
                      </div>
                    )}
                    {item.type === 'video' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center">
                        <span className="text-white text-[9px] font-bold uppercase tracking-wider">Video</span>
                      </div>
                    )}
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

        <div className="flex-1 min-w-0">
          <div
            className={`relative w-full bg-[#f5f5f5] overflow-hidden group ${
              activeItem?.type === 'image' ? 'cursor-zoom-in' : ''
            }`}
            style={{ height: 'min(420px, 50vw)' }}
            onClick={() => activeItem?.type === 'image' && openLightbox(activeIndex)}
          >
            {activeItem?.type === 'image' && (
              <>
                <Image
                  src={activeItem.url}
                  alt={productName}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain mix-blend-multiply p-6 transition-transform duration-500 group-hover:scale-105"
                />
                {isFlashSale && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-black text-white text-[11px] font-bold uppercase tracking-wider z-10">
                    -{Math.round(discount)}% OFF
                  </span>
                )}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-black/60 text-white text-[11px] font-medium px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ZoomIn size={13} />
                  Click to zoom
                </div>
                {items.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[11px] font-bold px-2 py-1 rounded z-10">
                    {activeIndex + 1} / {items.length}
                  </div>
                )}
              </>
            )}

            {activeItem?.type === 'video' && (
              <video
                ref={videoRef}
                src={activeItem.url}
                controls
                playsInline
                className="w-full h-full object-contain bg-black"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>

          {items.length > 1 && (
            <div className="flex gap-2 mt-3 md:hidden overflow-x-auto pb-1 scrollbar-hide">
              {items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-14 h-14 relative flex-shrink-0 bg-[#f5f5f5] overflow-hidden border transition-all ${
                    activeIndex === i ? 'border-black ring-1 ring-black' : 'border-gray-200'
                  }`}
                >
                  {item.type === 'image' ? (
                    <Image
                      src={item.url}
                      alt={`View ${i + 1}`}
                      fill
                      sizes="56px"
                      className="object-contain mix-blend-multiply p-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <Play size={14} className="text-white fill-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/92 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            onClick={closeLightbox}
          >
            <X size={22} />
          </button>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-[13px]">
            {lightboxIndex + 1} / {imageItems.length}
          </div>

          {imageItems.length > 1 && (
            <button
              className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div
            className="relative w-full h-full max-w-4xl max-h-[85vh] mx-20"
            onClick={(e) => e.stopPropagation()}
          >
            {imageItems[lightboxIndex] && (
              <Image
                src={imageItems[lightboxIndex].url}
                alt={`${productName} zoomed`}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            )}
          </div>

          {imageItems.length > 1 && (
            <button
              className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
            >
              <ChevronRight size={24} />
            </button>
          )}

          {imageItems.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 flex-wrap justify-center px-4">
              {imageItems.map((item, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-12 h-12 relative flex-shrink-0 border-2 rounded overflow-hidden transition-all ${
                    lightboxIndex === i ? 'border-white' : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <Image
                    src={item.url}
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
