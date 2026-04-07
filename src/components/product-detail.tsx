'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Heart, ShoppingBag, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore, isProductWishlisted } from '@/stores/wishlist-store';
import { useUIStore } from '@/stores/ui-store';
import { useProductStore } from '@/stores/product-store';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ARViewModal, ARViewButton } from '@/components/ar-view';
import type { Product } from '@/types';

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'h-4 w-4',
              rating >= star
                ? 'fill-[#d79c4a] text-[#d79c4a]'
                : 'fill-transparent text-gray-500 dark:text-gray-400/40'
            )}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400 ">
        ({count})
      </span>
    </div>
  );
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative mb-2 overflow-hidden rounded-xl bg-gray-50 dark:bg-[#141414]">
        <div
          className="aspect-[3/4] w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
          style={{
            backgroundImage: product.images[0] ? `url('${product.images[0]}')` : undefined,
            backgroundColor: product.images[0] ? undefined : '#1A1A1A',
          }}
        />
        {product.isNew && (
          <span className="absolute top-2 left-2 rounded-full bg-[#d79c4a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0A0A0A] ">
            New
          </span>
        )}
        {product.salePrice && (
          <span className="absolute top-2 left-2 rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white ">
            Sale
          </span>
        )}
      </div>
      <h4 className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-white ">
        {product.name}
      </h4>
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
    </motion.div>
  );
}

function ProductDetailContent({ product }: { product: Product }) {
  const { navigateToShop, navigateToProduct } = useUIStore();
  const addItem = useCartStore((s) => s.addItem);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const { products: dbProducts, collections: dbCollections, initialize } = useProductStore();

  useEffect(() => { initialize(); }, [initialize]);

  // State initialized from product props - resets when component remounts via key
  const [selectedColor, setSelectedColor] = useState(() => product.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState(() =>
    product.sizes.includes('M') ? 'M' : (product.sizes[0] || 'One Size')
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [arOpen, setArOpen] = useState(false);

  const displayPrice = product.salePrice ?? product.price;
  const hasMultipleColors = product.colors.length > 1;

  // Related products from same collection
  const relatedProducts = useMemo(() => {
    const productCols = (product as Record<string, unknown>).collections as Array<{ id: string }> | undefined;
    if (!productCols || productCols.length === 0) return [];
    const colIds = new Set(productCols.map((c) => c.id));
    return dbProducts.filter((p) => {
      if (p.id === product.id) return false;
      const pCols = (p as Record<string, unknown>).collections as Array<{ id: string }> | undefined;
      if (!pCols) return false;
      return pCols.some((c) => colIds.has(c.id));
    }).slice(0, 4);
  }, [product, dbProducts]);

  const collectionName = useMemo(() => {
    const productCols = (product as Record<string, unknown>).collections as Array<{ id: string }> | undefined;
    if (!productCols || productCols.length === 0) return '';
    const colId = productCols[0].id;
    return dbCollections.find((c) => c.id === colId)?.name || '';
  }, [product, dbCollections]);

  const handleAddToCart = () => {
    addItem(product, selectedColor, selectedSize, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, selectedColor, selectedSize, quantity);
    setTimeout(() => {
      useUIStore.getState().navigateToCheckout();
    }, 100);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-2 sm:px-6 lg:px-8">
      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
        {/* Left Column - Images */}
        <div className="lg:col-span-3 space-y-3">
          {/* Main Image */}
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-xl bg-gray-50 dark:bg-[#141414]"
          >
            <div
              className="aspect-[3/4] w-full bg-cover bg-center"
              style={{
                backgroundImage: product.images[selectedImage]
                  ? `url('${product.images[selectedImage]}')`
                  : undefined,
                backgroundColor: product.images[selectedImage] ? undefined : '#1A1A1A',
              }}
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && (
                <Badge className="rounded-full bg-[#d79c4a] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#0A0A0A] border-0 ">
                  New
                </Badge>
              )}
              {product.salePrice && (
                <Badge className="rounded-full bg-red-500/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white border-0 ">
                  {Math.round(((product.price - product.salePrice) / product.price) * 100)}% Off
                </Badge>
              )}
              {product.isBestSeller && (
                <Badge className="rounded-full bg-[#1A4B5C] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white border-0 ">
                  Best Seller
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    'relative h-20 w-16 overflow-hidden rounded-lg transition-all',
                    selectedImage === idx
                      ? 'ring-2 ring-[#d79c4a] ring-offset-2 ring-offset-white dark:ring-offset-[#0A0A0A]'
                      : 'ring-1 ring-border opacity-60 hover:opacity-100'
                  )}
                >
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{
                      backgroundImage: product.images[idx] ? `url('${product.images[idx]}')` : undefined,
                      backgroundColor: product.images[idx] ? undefined : '#1A1A1A',
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Name */}
          <div>
            {collectionName && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#d79c4a] ">
                {collectionName}
              </p>
            )}
            <h1 className=" text-3xl font-normal leading-tight text-gray-900 dark:text-white lg:text-[2.5rem]">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          <StarRating rating={product.rating} count={product.reviewCount} />

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {product.salePrice ? (
              <>
                <span className="text-2xl font-semibold text-[#d79c4a] ">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-lg text-gray-500 dark:text-gray-400 line-through ">
                  {formatPrice(product.price)}
                </span>
                <Badge className="rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-500 border-0 ">
                  Save {formatPrice(product.price - product.salePrice)}
                </Badge>
              </>
            ) : (
              <span className="text-2xl font-semibold text-gray-900 dark:text-white ">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Model Info */}
          <p className="text-sm text-gray-500 dark:text-gray-400 ">
            Model wears: Size M, Height 5&apos;6&quot;
          </p>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          {/* Color Selector */}
          {hasMultipleColors && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white ">
                  Color
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ">
                  {selectedColor}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'relative h-9 w-9 rounded-full transition-all',
                      selectedColor === color
                        ? 'ring-2 ring-[#d79c4a] ring-offset-2 ring-offset-white dark:ring-offset-[#0A0A0A]'
                        : 'ring-1 ring-border hover:ring-2 hover:ring-muted-foreground'
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-gray-900 dark:text-white ">
              Size
            </span>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    'flex h-10 min-w-[3rem] items-center justify-center rounded-lg border px-4 text-sm font-medium transition-all ',
                    selectedSize === size
                      ? 'border-[#d79c4a] bg-[#d79c4a]/10 text-[#d79c4a]'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-gray-900 dark:text-white ">
              Quantity
            </span>
            <div className="flex items-center gap-0 rounded-lg border border-gray-200 dark:border-gray-700 w-fit">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-10 w-12 items-center justify-center text-sm font-medium text-gray-900 dark:text-white border-x border-gray-200 dark:border-gray-700">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleAddToCart}
              disabled={addedFeedback}
              className={cn(
                'h-12 w-full rounded-lg text-sm font-bold uppercase tracking-widest transition-all ',
                addedFeedback
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#d79c4a] text-[#0A0A0A] hover:bg-[#c48a35] active:scale-[0.98]'
              )}
            >
              <AnimatePresence mode="wait">
                {addedFeedback ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Added to Bag
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    Add to Bag
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            <Button
              onClick={handleBuyNow}
              variant="outline"
              className="h-12 w-full rounded-lg border-[#d79c4a] text-sm font-bold uppercase tracking-widest text-[#d79c4a] hover:bg-[#d79c4a]/10 "
            >
              Buy Now
            </Button>

            <button
              onClick={() => toggleItem(product.id)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 transition-all hover:border-[#d79c4a] hover:text-[#d79c4a] "
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-colors',
                  isProductWishlisted(wishlistItems, product.id) ? 'fill-red-500 text-red-500' : ''
                )}
              />
              {isProductWishlisted(wishlistItems, product.id) ? 'In Wishlist' : 'Add to Wishlist'}
            </button>

            {/* AR View Button */}
            <ARViewButton onClick={() => setArOpen(true)} />
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-[#141414] p-3 text-center">
              <Truck className="h-4 w-4 text-[#d79c4a]" />
              <span className="text-[10px] text-gray-500 dark:text-gray-400 ">
                Free Shipping
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-[#141414] p-3 text-center">
              <RotateCcw className="h-4 w-4 text-[#d79c4a]" />
              <span className="text-[10px] text-gray-500 dark:text-gray-400 ">
                Easy Returns
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-[#141414] p-3 text-center">
              <Shield className="h-4 w-4 text-[#d79c4a]" />
              <span className="text-[10px] text-gray-500 dark:text-gray-400 ">
                Secure Pay
              </span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start gap-0 rounded-none border-b border-gray-200 dark:border-gray-700 bg-transparent p-0 h-auto">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent px-0 pb-3 pt-0 text-sm text-gray-500 dark:text-gray-400 data-[state=active]:border-[#d79c4a] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="fabric"
                className="rounded-none border-b-2 border-transparent px-0 pb-3 pt-0 text-sm text-gray-500 dark:text-gray-400 data-[state=active]:border-[#d79c4a] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Fabric &amp; Care
              </TabsTrigger>
              <TabsTrigger
                value="size"
                className="rounded-none border-b-2 border-transparent px-0 pb-3 pt-0 text-sm text-gray-500 dark:text-gray-400 data-[state=active]:border-[#d79c4a] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Size Guide
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="rounded-none border-b-2 border-transparent px-0 pb-3 pt-0 text-sm text-gray-500 dark:text-gray-400 data-[state=active]:border-[#d79c4a] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Shipping
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                {product.description}
              </p>
            </TabsContent>
            <TabsContent value="fabric" className="mt-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                {product.fabricCare || 'Fabric & care information not available for this product.'}
              </p>
            </TabsContent>
            <TabsContent value="size" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 ">
                  Our abayas are designed with a relaxed, modest fit. For a more fitted look, we recommend sizing down.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm ">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-2 text-left font-medium text-gray-900 dark:text-white">Size</th>
                        <th className="pb-2 text-left font-medium text-gray-900 dark:text-white">Bust (in)</th>
                        <th className="pb-2 text-left font-medium text-gray-900 dark:text-white">Length (in)</th>
                        <th className="pb-2 text-left font-medium text-gray-900 dark:text-white">Shoulder (in)</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-500 dark:text-gray-400">
                      <tr className="border-b border-gray-200 dark:border-gray-700/50">
                        <td className="py-2 text-gray-900 dark:text-white">XS</td><td className="py-2">34</td><td className="py-2">56</td><td className="py-2">14</td>
                      </tr>
                      <tr className="border-b border-gray-200 dark:border-gray-700/50">
                        <td className="py-2 text-gray-900 dark:text-white">S</td><td className="py-2">36</td><td className="py-2">57</td><td className="py-2">14.5</td>
                      </tr>
                      <tr className="border-b border-gray-200 dark:border-gray-700/50">
                        <td className="py-2 text-gray-900 dark:text-white">M</td><td className="py-2">38</td><td className="py-2">58</td><td className="py-2">15</td>
                      </tr>
                      <tr className="border-b border-gray-200 dark:border-gray-700/50">
                        <td className="py-2 text-gray-900 dark:text-white">L</td><td className="py-2">40</td><td className="py-2">59</td><td className="py-2">15.5</td>
                      </tr>
                      <tr className="border-b border-gray-200 dark:border-gray-700/50">
                        <td className="py-2 text-gray-900 dark:text-white">XL</td><td className="py-2">42</td><td className="py-2">60</td><td className="py-2">16</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-900 dark:text-white">XXL</td><td className="py-2">44</td><td className="py-2">61</td><td className="py-2">16.5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="mt-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                {product.shipReturn || 'Shipping and return information not available for this product.'}
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Complete the Look */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <div className="mb-8 flex items-center gap-4">
            <h2 className=" text-2xl text-gray-900 dark:text-white">
              Complete the Look
            </h2>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => navigateToProduct(p)}
              />
            ))}
          </div>
        </div>
      )}

      {/* AR View Modal */}
      <ARViewModal isOpen={arOpen} onClose={() => setArOpen(false)} product={product} />
    </div>
  );
}

export function ProductDetail() {
  const product = useUIStore((s) => s.selectedProduct);
  const navigateToShop = useUIStore((s) => s.navigateToShop);

  // Scroll to top when product view opens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-white dark:bg-[#0A0A0A] overflow-y-auto"
    >
      {/* Back Button */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center">
            <button
              onClick={() => navigateToShop()}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white "
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Key on product.id causes remount and state reset */}
      <ProductDetailContent key={product.id} product={product} />
    </motion.div>
  );
}
