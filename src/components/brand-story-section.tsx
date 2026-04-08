'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function BrandStorySection() {
  const scrollToStory = () => {
    document.getElementById('brand-story')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="brand-story"
      className="relative flex min-h-[60vh] items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('/images/brand/brand-story.png')",
          backgroundColor: '#0A0A0A',
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Geometric pattern overlay */}
      <div className="pattern-geometric absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-center">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="mb-6 text-4xl font-light leading-tight tracking-tight sm:text-5xl lg:text-6xl font-[family-name:var(--font-playfair)] text-white">
            Crafted with Purpose
          </h2>

          <p className="mx-auto mb-4 max-w-2xl text-base leading-relaxed text-white/80 font-[family-name:var(--font-inter)]">
            Every stitch tells a story. At BurqaHijab.shop, we believe that
            modesty and luxury are not opposites — they are companions. Our
            abayas and hijabs are crafted by skilled artisans in Pakistan using
            the finest fabrics sourced from around the world.
          </p>
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-white/80 font-[family-name:var(--font-inter)]">
            From the flowing drape of our chiffon abayas to the soft touch of
            our silk hijabs, every piece is designed to make you feel confident,
            beautiful, and true to yourself.
          </p>

          <Button
            onClick={scrollToStory}
            className="h-12 rounded-full bg-[#d79c4a] px-8 text-sm font-bold uppercase tracking-widest text-[#1A1A1A] transition-all hover:bg-[#c48a35] hover:shadow-[0_0_30px_rgba(215,156,74,0.3)] font-[family-name:var(--font-inter)]"
          >
            Discover Our Story
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
