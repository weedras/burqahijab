'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Trash2, ShoppingBag, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useCartStore } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';
import { useProductStore } from '@/stores/product-store';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

export function WishlistPage() {
  const wishlistItems = useWishlistStore((s) => s.items);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const addItem = useCartStore((s) => s.addItem);
  const { navigateHome, navigateToProduct } = useUIStore();
  const { products: dbProducts, initialize } = useProductStore();

  useEffect(() => { initialize(); }, [initialize]);

  const wishlistedProducts = dbProducts.filter((p) => wishlistItems.includes(p.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      {/* Top Bar */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141414]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center gap-4">
            <button
              onClick={navigateHome}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white "
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-400 fill-red-400" />
              <h1 className=" text-xl text-gray-900 dark:text-white">
                My Wishlist
              </h1>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 ">
              ({wishlistedProducts.length} items)
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {wishlistedProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-20 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 dark:bg-[#141414]">
              <Heart className="h-10 w-10 text-gray-500 dark:text-gray-400/40" />
            </div>
            <h2 className=" text-xl text-gray-900 dark:text-white">
              Your wishlist is empty
            </h2>
            <p className="max-w-md text-sm text-gray-500 dark:text-gray-400 ">
              Browse our collection and tap the heart icon on items you love to save them here.
            </p>
            <Button
              onClick={navigateHome}
              className="mt-2 rounded-full bg-[#d79c4a] px-6 text-sm font-semibold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#c48a35] "
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Start Shopping
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <AnimatePresence>
              {wishlistedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group"
                >
                  {/* Image */}
                  <div
                    className="relative mb-3 cursor-pointer overflow-hidden rounded-xl bg-gray-50 dark:bg-[#141414]"
                    onClick={() => navigateToProduct(product)}
                  >
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="aspect-[3/4] w-full flex items-center justify-center bg-gray-100 dark:bg-[#1A1A1A]">
                        <Package className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                      </div>
                    )}
                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItem(product.id);
                      }}
                      className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500/90 text-white transition-all hover:bg-red-600"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Info */}
                  <div
                    className="cursor-pointer"
                    onClick={() => navigateToProduct(product)}
                  >
                    <h3 className="line-clamp-2 text-sm font-medium leading-tight text-gray-900 dark:text-white ">
                      {product.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      {product.salePrice ? (
                        <>
                          <span className="text-sm font-semibold text-[#d79c4a] ">
                            {formatPrice(product.salePrice)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 line-through ">
                            {formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-gray-900 dark:text-white ">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(product, product.colors[0] || 'Default', product.sizes[0] || 'One Size');
                    }}
                    className="mt-2 h-8 w-full rounded-lg bg-[#d79c4a] text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#c48a35] active:scale-95 "
                  >
                    <ShoppingBag className="mr-1 h-3 w-3" />
                    Add to Cart
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
