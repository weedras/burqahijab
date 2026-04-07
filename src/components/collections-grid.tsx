'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

const categories = [
  {
    name: 'Hijabs',
    image: '/images/categories/hijabs.jpg',
    slug: 'hijabs',
    description: 'Elegant wraps for every occasion',
  },
  {
    name: 'Abayas',
    image: '/images/categories/abayas.jpg',
    slug: 'abayas',
    description: 'Timeless modest fashion',
  },
  {
    name: 'Burqas',
    image: '/images/categories/burqas.jpg',
    slug: 'abayas',
    description: 'Traditional grace',
  },
  {
    name: 'Accessories',
    image: '/images/categories/accessories.jpg',
    slug: 'accessories',
    description: 'Complete your look',
  },
];

export function CollectionsGrid() {
  const { navigateToShop } = useUIStore();

  return (
    <section id="categories" className="py-12 sm:py-20 md:py-28 bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-16"
        >
          <h2 className="section-title text-gray-900 dark:text-white">
            Shop by Category
          </h2>
          <div className="section-line" />
          <p className="section-subtitle">Explore our curated collections</p>
        </motion.div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {categories.map((category, index) => (
            <motion.button
              key={category.name}
              initial={{ y: 60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              onClick={() => navigateToShop(category.slug)}
              className="group relative overflow-hidden rounded-lg aspect-[3/4]"
            >
              {/* Image */}
              <div className="absolute inset-0">
                <div
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 bg-cover bg-center"
                  style={{ backgroundImage: `url('${category.image}')` }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                <h3
                  className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 transition-transform duration-300 group-hover:-translate-y-1"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  {category.name}
                </h3>
                <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4 translate-y-0 opacity-100 sm:opacity-0 sm:translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  {category.description}
                </p>
                <span className="inline-flex items-center text-[#d79c4a] text-xs sm:text-sm font-medium translate-y-0 opacity-100 sm:opacity-0 sm:translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  Shop Now
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>

              {/* Border Hover Effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#d79c4a]/50 transition-colors duration-300 rounded-lg" />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
