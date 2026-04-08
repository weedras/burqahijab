'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';
import { useProductStore } from '@/stores/product-store';
import { formatPrice } from '@/lib/format';

export function AIStylingSection() {
  const addItem = useCartStore((s) => s.addItem);
  const { navigateToProduct } = useUIStore();
  const { products: dbProducts, initialize } = useProductStore();

  useEffect(() => { initialize(); }, [initialize]);

  // Show top-rated or featured products as AI suggestions
  const aiProducts = useMemo(() => {
    return dbProducts
      .filter((p) => p.isFeatured || p.isBestSeller || p.rating > 4)
      .slice(0, 3);
  }, [dbProducts]);

  return (
    <section className="relative px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Left: Styled Image */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <img
              src="/images/products/abaya-2.png"
              alt="AI-Curated Styling"
              className="aspect-[3/4] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="rounded-full bg-[#d79c4a]/20 px-3 py-1 text-xs font-medium text-[#d79c4a] backdrop-blur-sm font-[family-name:var(--font-inter)]">
                AI-Powered Styling
              </span>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center"
          >
            <h2 className="text-3xl font-normal tracking-tight sm:text-4xl font-[family-name:var(--font-playfair)] text-foreground">
              AI-Curated Styling
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground font-[family-name:var(--font-inter)]">
              Let our AI fashion advisor create the perfect look for you. Our
              intelligent styling engine considers your preferences, occasion, and
              the latest trends to curate personalized outfit suggestions.
            </p>

            {/* Product Thumbnails */}
            <div className="mt-8 space-y-4">
              {aiProducts.length > 0 ? aiProducts.map((product) => (
                <div
                  key={product.id}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-[#d79c4a]/30 hover:bg-elevated cursor-pointer"
                  onClick={() => navigateToProduct(product)}
                >
                  {/* Thumbnail */}
                  <div className="h-16 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-background">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-[#1A1A1A]">
                        <Package className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate text-sm font-medium text-foreground font-[family-name:var(--font-inter)]">
                      {product.name}
                    </h4>
                    <p className="text-sm text-[#d79c4a] font-[family-name:var(--font-inter)]">
                      {formatPrice(product.salePrice ?? product.price)}
                    </p>
                  </div>

                  {/* Add to Cart */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      addItem(
                        product,
                        product.colors[0] || 'Default',
                        product.sizes[0] || 'One Size'
                      );
                    }}
                    className="h-8 flex-shrink-0 rounded-lg border-[#d79c4a]/30 text-xs text-[#d79c4a] hover:bg-[#d79c4a]/10 hover:border-[#d79c4a] active:scale-95 font-[family-name:var(--font-inter)]"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading curated picks...
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
