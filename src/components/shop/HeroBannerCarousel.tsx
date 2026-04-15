'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '@/types';

interface Slide {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
}

interface HeroBannerCarouselProps {
  banners: Banner[];
}

const DEFAULT_SLIDE: Slide = {
  title: 'Curated Excellence',
  subtitle: 'Editorial products for the modern lifestyle.',
  ctaText: 'Explore Collection',
  ctaLink: '/products',
  imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400',
};

export function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
  const slides: Slide[] = banners.length > 0 ? banners : [DEFAULT_SLIDE];
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (transitioning || idx === current) return;
    setTransitioning(true);
    setCurrent(idx);
    setTimeout(() => setTransitioning(false), 700);
  }, [transitioning, current]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [slides.length, next]);

  const slide = slides[current];

  return (
    <section className="relative h-[460px] md:h-[580px] overflow-hidden bg-black">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={s.imageUrl}
            alt={s.title}
            fill
            priority={i === 0}
            className="object-cover opacity-60"
            sizes="100vw"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50 z-10" />

      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6">
        <p className="text-[11px] text-white/70 uppercase tracking-[0.4em] font-bold mb-4 transition-all duration-500">
          New Collection
        </p>
        <h1
          key={`title-${current}`}
          className="text-4xl sm:text-5xl md:text-7xl font-bold text-white uppercase tracking-[-0.02em] leading-none mb-5 animate-fade-in"
        >
          {slide.title}
        </h1>
        <p
          key={`sub-${current}`}
          className="text-[15px] text-white/75 max-w-md mb-8 animate-fade-in"
        >
          {slide.subtitle}
        </p>
        <Link
          href={slide.ctaLink}
          className="px-8 py-4 bg-white text-black text-[13px] font-bold uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all"
        >
          {slide.ctaText}
        </Link>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 active:scale-95 transition-all shadow-lg"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 active:scale-95 transition-all shadow-lg"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-400 ${
                  i === current
                    ? 'w-7 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
