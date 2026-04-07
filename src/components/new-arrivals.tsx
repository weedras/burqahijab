'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Shield, Star, Truck, Package } from 'lucide-react';
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

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const { navigateToProduct } = useUIStore();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.5 }}
      className="group bg-white dark:bg-[#141414] rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-[#1A1A1A] cursor-pointer"
        onClick={() => navigateToProduct(product)}
      >
        <div
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 bg-cover bg-center"
          style={{
            backgroundImage: product.images[0]
              ? `url('${product.images[0]}')`
              : undefined,
          }}
        />

        {/* Badges */}
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-[#d79c4a] text-white text-xs font-medium px-3 py-1 rounded-sm">
            New
          </span>
        )}
        {product.salePrice && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-sm">
            Sale
          </span>
        )}

        {/* Hover Actions - desktop only on hover, mobile shows below */}
        <div
          className={cn(
            'hidden sm:block absolute bottom-0 left-0 right-0 p-3 flex gap-2 transition-all duration-300 translate-y-full opacity-0',
            hovered ? 'translate-y-0 opacity-100' : ''
          )}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(product, product.colors[0] || 'Default', product.sizes[0] || 'One Size');
            }}
            className="flex-1 bg-[#d79c4a] text-white text-xs font-medium py-2 sm:py-2.5 flex items-center justify-center gap-1.5 hover:bg-[#c48a35] transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to cart
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleItem(product.id);
            }}
            className="w-9 h-auto sm:w-10 flex items-center justify-center bg-white/90 dark:bg-[#0A0A0A]/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-[#0A0A0A] hover:text-red-500 transition-colors"
          >
            <Heart
              className={cn(
                'w-4 h-4',
                isProductWishlisted(wishlistItems, product.id) && 'fill-red-500 text-red-500'
              )}
            />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 pb-0">
        <h3
          className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-[#d79c4a] transition-colors"
          onClick={() => navigateToProduct(product)}
        >
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          {product.salePrice ? (
            <>
              <span className="text-sm font-semibold text-[#d79c4a]">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Mobile Add to Cart */}
      </div>
      <div className="sm:hidden px-4 pt-2 pb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            addItem(product, product.colors[0] || 'Default', product.sizes[0] || 'One Size');
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[#d79c4a] py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#c48a35] active:scale-[0.98] transition-all"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}

function Eye(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function NewArrivals() {
  const { navigateToShop } = useUIStore();
  const { products: dbProducts, initialize } = useProductStore();

  useEffect(() => { initialize(); }, [initialize]);

  const featuredProducts = useMemo(() => dbProducts.filter((p) => p.isFeatured).slice(0, 4), [dbProducts]);
  const newArrivalsList = useMemo(() => dbProducts.filter((p) => p.isNew).slice(0, 4), [dbProducts]);

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
            className="text-center mb-16"
          >
            <h2 className="section-title text-gray-900 dark:text-white">
              Featured Products
            </h2>
            <div className="section-line" />
            <p className="section-subtitle">Handpicked favorites just for you</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.length > 0
              ? featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)
              : newArrivalsList.map((product) => <ProductCard key={product.id} product={product} />)
            }
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-12"
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
