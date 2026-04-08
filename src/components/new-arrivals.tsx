'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Shield, Star, Truck, Package, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductStore } from '@/stores/product-store';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore, isProductWishlisted } from '@/stores/wishlist-store';
import { useUIStore } from '@/stores/ui-store';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

const features = [
  {
    icon: Shield,
    title: 'Premium Quality',
    description: 'Crafted from the finest fabrics sourced globally',
  },
  {
    icon: Star,
    title: 'Unique Designs',
    description: 'Exclusive patterns that blend tradition with modern style',
  },
  {
    icon: Package,
    title: 'Perfect Fit',
    description: 'Available in all sizes with free alterations',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Express shipping across Pakistan and worldwide',
  },
];

function FeaturedProductCard({ product, index }: { product: Product; index: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const { navigateToProduct } = useUIStore();
  const [hovered, setHovered] = useState(false);
  const hasImage = product.images.length > 0 && product.images[0];

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigateToProduct(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigateToProduct(product); }}
    >
      {/* Card Container */}
      <div className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800/50 shadow-sm hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-500">
        {/* Image Container - Fixed aspect ratio */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 dark:bg-[#111]">
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : product.videoUrl ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-sm">
                  <Play className="h-5 w-5 fill-[#d79c4a] text-[#d79c4a] ml-0.5" />
                </div>
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Video</span>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-[#111]">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <Package className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-600">No Image</p>
              </div>
            </div>
          )}

          {/* Badges - Top Left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <span className="inline-flex items-center rounded-full bg-[#d79c4a] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A] shadow-sm">
                New
              </span>
            )}
            {product.salePrice && (
              <span className="inline-flex items-center rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                Sale
              </span>
            )}
            {product.isBestSeller && !product.isNew && (
              <span className="inline-flex items-center rounded-full bg-[#1A4B5C] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                Best Seller
              </span>
            )}
          </div>

          {/* Wishlist - Top Right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleItem(product.id);
            }}
            className={cn(
              'absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md shadow-sm transition-all duration-300',
              isProductWishlisted(wishlistItems, product.id)
                ? 'bg-red-500/90 text-white'
                : 'bg-white/70 dark:bg-black/40 text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-black/60'
            )}
            aria-label="Toggle wishlist"
          >
            <Heart className={cn('h-4 w-4', isProductWishlisted(wishlistItems, product.id) ? 'fill-white' : '')} />
          </button>

          {/* Hover Overlay - Desktop */}
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Quick Add - Desktop hover */}
          <div className="hidden sm:flex absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addItem(product, product.colors[0] || 'Default', product.sizes[0] || 'One Size');
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md py-3 text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white shadow-lg hover:bg-white dark:hover:bg-[#0A0A0A] transition-colors"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </button>
          </div>
        </div>

        {/* Info Section - Consistent height with flex column */}
        <div className="flex flex-col flex-1 p-4 pb-5">
          {/* Product Name - fixed height for consistency */}
          <h3 className="text-[13px] font-semibold leading-snug text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem] group-hover:text-[#d79c4a] transition-colors duration-300">
            {product.name}
          </h3>

          {/* Spacer pushes price to consistent position */}
          <div className="flex-1 min-h-[2.75rem]" />

          {/* Price - Always at bottom, consistent positioning */}
          <div className="flex items-baseline gap-2">
            {product.salePrice ? (
              <>
                <span className="text-sm font-bold text-[#d79c4a]">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Mobile Add to Cart */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(product, product.colors[0] || 'Default', product.sizes[0] || 'One Size');
            }}
            className="sm:hidden mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#d79c4a] py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#c48a35] active:scale-[0.98] transition-all shadow-sm"
          >
            <ShoppingCart className="h-3 w-3" />
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function NewArrivals() {
  const { navigateToShop } = useUIStore();
  const { products: dbProducts, initialize } = useProductStore();

  useEffect(() => { initialize(); }, [initialize]);

  const featuredProducts = useMemo(() => dbProducts.filter((p) => p.isFeatured).slice(0, 4), [dbProducts]);
  const newArrivalsList = useMemo(() => dbProducts.filter((p) => p.isNew).slice(0, 4), [dbProducts]);

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : newArrivalsList;

  return (
    <>
      {/* Featured Products Section */}
      <section id="products" className="py-12 sm:py-20 md:py-28 bg-[#f5f5f5] dark:bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="section-title text-gray-900 dark:text-white">
              Featured Products
            </h2>
            <div className="section-line" />
            <p className="section-subtitle">Handpicked favorites just for you</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 [grid-auto-rows:1fr]">
            {displayProducts.map((product, index) => (
              <FeaturedProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-10 sm:mt-12"
          >
            <button
              onClick={() => navigateToShop()}
              className="btn-primary border border-gray-900 text-gray-900 bg-transparent hover:bg-gray-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-gray-900"
            >
              View All Products
            </button>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals with Features */}
      <section id="new-arrivals" className="py-20 md:py-28 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Image */}
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div
                className="w-full aspect-[4/5] bg-cover bg-center rounded-lg"
                style={{ backgroundImage: "url('/images/new-arrivals.jpg')" }}
              />
            </motion.div>

            {/* Right: Features */}
            <div>
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="section-title text-gray-900 dark:text-white mb-4"
              >
                New Arrivals
              </motion.h2>
              <div className="section-line mb-8" style={{ margin: '0 0 2rem 0' }} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#d79c4a]/10 flex items-center justify-center mb-4 group-hover:bg-[#d79c4a]/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-[#d79c4a]" />
                    </div>
                    <h4
                      className="text-base font-bold text-gray-900 dark:text-white mb-2"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-10"
              >
                <button
                  onClick={() => navigateToShop(undefined, 'new-arrivals')}
                  className="btn-primary"
                >
                  Shop New Arrivals
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
