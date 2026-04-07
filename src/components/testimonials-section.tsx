'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { testimonials } from '@/data/seed';

const testimonialImages = [
  '/images/testimonials/testimonial-1.jpg',
  '/images/testimonials/testimonial-2.jpg',
  '/images/testimonials/testimonial-3.jpg',
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex]
  );

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [goNext]);

  const current = testimonials[currentIndex];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
  };

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title text-gray-900 dark:text-white">
            What Our Customers Say
          </h2>
          <div className="section-line" />
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="flex flex-col items-center text-center"
            >
              {/* Avatar */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#d79c4a]/30">
                  <Image
                    src={testimonialImages[currentIndex % testimonialImages.length]}
                    alt={current.author}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#d79c4a] rounded-full flex items-center justify-center">
                  <Quote className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Review text */}
              <p className="mx-auto mb-6 max-w-2xl text-lg leading-relaxed italic text-gray-700 dark:text-gray-300">
                &ldquo;{current.text}&rdquo;
              </p>

              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < current.rating
                        ? 'fill-[#d79c4a] text-[#d79c4a]'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* Author */}
              <h4
                className="text-lg font-bold text-gray-900 dark:text-white"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                {current.author}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {current.location}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={goPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:border-[#d79c4a] hover:text-[#d79c4a] transition-all dark:border-gray-600 dark:text-gray-400 dark:hover:border-[#d79c4a] dark:hover:text-[#d79c4a]"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'w-6 bg-[#d79c4a]'
                      : 'w-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:border-[#d79c4a] hover:text-[#d79c4a] transition-all dark:border-gray-600 dark:text-gray-400 dark:hover:border-[#d79c4a] dark:hover:text-[#d79c4a]"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
