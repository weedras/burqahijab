'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

const slides = [
  {
    image: '/images/hero/hero-1.jpg',
    heading: 'ELEGANCE IN MODESTY',
    subtitle: 'Discover our new collection of premium hijabs and abayas',
    cta: 'Shop Now',
    ctaLink: 'new-arrivals',
  },
  {
    image: '/images/hero/hero-2.jpg',
    heading: 'TIMELESS BEAUTY',
    subtitle: 'Handcrafted abayas for every occasion',
    cta: 'Explore Abayas',
    ctaLink: 'abayas',
  },
  {
    image: '/images/hero/hero-3.jpg',
    heading: 'GRACE REDEFINED',
    subtitle: 'Modest fashion that empowers',
    cta: 'New Arrivals',
    ctaLink: 'new-arrivals',
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { navigateToShop } = useUIStore();

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    const interval = setInterval(goNext, 6000);
    return () => clearInterval(interval);
  }, [goNext]);

  const handleCtaClick = (ctaLink: string) => {
    navigateToShop(undefined, ctaLink);
  };

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden sm:h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${slides[currentSlide].image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20 sm:from-black/70 sm:via-black/40 sm:to-transparent" />

          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center pb-16 sm:pb-0">
            <div className="max-w-xl sm:max-w-2xl">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                {slides[currentSlide].heading}
              </motion.h1>

              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-sm sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed"
              >
                {slides[currentSlide].subtitle}
              </motion.p>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                className="flex flex-wrap gap-3 sm:gap-4"
              >
                <button
                  onClick={() => handleCtaClick(slides[currentSlide].ctaLink)}
                  className="btn-primary text-xs sm:text-sm px-5 sm:px-8 py-2.5 sm:py-3.5"
                >
                  {slides[currentSlide].cta}
                </button>
                {currentSlide === 0 && (
                  <button
                    onClick={() => navigateToShop()}
                    className="btn-outline border-white text-white hover:bg-white hover:text-black text-xs sm:text-sm px-5 sm:px-8 py-2.5 sm:py-3.5"
                  >
                    View Collection
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev/Next - small on mobile */}
      <button
        onClick={goPrev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center border border-white/30 text-white hover:bg-white/10 hover:border-[#d79c4a] transition-all duration-300 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center border border-white/30 text-white hover:bg-white/10 hover:border-[#d79c4a] transition-all duration-300 z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
              i === currentSlide
                ? 'bg-[#d79c4a] w-6 sm:w-8'
                : 'bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator - desktop only */}
      <div className="absolute bottom-8 right-8 hidden lg:flex flex-col items-center text-white/70 z-10">
        <span className="text-xs uppercase tracking-widest mb-2 rotate-90 origin-center">
          Scroll
        </span>
        <div className="w-[1px] h-12 bg-white/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-4 bg-[#d79c4a] animate-bounce" />
        </div>
      </div>
    </section>
  );
}
