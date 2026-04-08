'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Minus, Plus, Truck, ArrowRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCartStore, getCartSubtotal, getCartTotalItems } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';
import { useStoreSettings } from '@/stores/store-settings-store';
import { formatPrice } from '@/lib/format';

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const navigateHome = useUIStore((s) => s.navigateHome);
  const navigateToCheckout = useUIStore((s) => s.navigateToCheckout);
  const { settings } = useStoreSettings();

  const currentSubtotal = useMemo(() => getCartSubtotal(items), [items]);
  const itemCount = useMemo(() => getCartTotalItems(items), [items]);
  const freeShippingThreshold = Number(settings.freeShippingThreshold) || 3000;
  const remaining = Math.max(freeShippingThreshold - currentSubtotal, 0);
  const qualifiesFreeShipping = currentSubtotal >= freeShippingThreshold;
  const progress = Math.min((currentSubtotal / freeShippingThreshold) * 100, 100);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) closeCart(); }}>
      <SheetContent
        side="right"
        className="flex w-full flex-col bg-white dark:bg-[#141414] p-0 sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-[#d79c4a]" />
              <span className=" text-lg text-gray-900 dark:text-white">
                Shopping Bag
              </span>
              <span className="rounded-full bg-[#d79c4a]/20 px-2 py-0.5 text-xs font-semibold text-[#d79c4a] ">
                {itemCount}
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-1 flex-col items-center justify-center gap-6 px-6"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 dark:bg-[#141414]">
                <ShoppingBag className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="text-center">
                <p className=" text-lg text-gray-900 dark:text-white">
                  Your bag is empty
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 ">
                  Looks like you haven&apos;t added anything yet
                </p>
              </div>
              <Button
                onClick={() => {
                  closeCart();
                  navigateHome();
                }}
                className="mt-2 rounded-lg bg-[#d79c4a] px-6 font-semibold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#c48a35] "
              >
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="filled"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col overflow-hidden"
            >
              {/* Cart Items */}
              <ScrollArea className="flex-1">
                <div className="space-y-1 px-6 py-4">
                  {items.map((item) => {
                    const price = item.product.salePrice ?? item.product.price;
                    const lineTotal = price * item.quantity;

                    return (
                      <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}>
                        <div className="flex gap-4 py-4">
                          {/* Thumbnail */}
                          <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-[#141414]">
                            <div
                              className="h-full w-full bg-cover bg-center"
                              style={{
                                backgroundImage: item.product.images[0]
                                  ? `url('${item.product.images[0]}')`
                                  : undefined,
                                backgroundColor: item.product.images[0] ? undefined : '#1A1A1A',
                              }}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <h4 className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-white ">
                                {item.product.name}
                              </h4>
                              <div className="mt-1 flex items-center gap-2">
                                <span
                                  className="inline-block h-3.5 w-3.5 rounded-full border border-gray-200 dark:border-gray-700"
                                  style={{ backgroundColor: item.selectedColor }}
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400 ">
                                  {item.selectedSize}
                                </span>
                              </div>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              {/* Quantity */}
                              <div className="flex items-center gap-0 rounded-lg border border-gray-200 dark:border-gray-700">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.product.id,
                                      item.selectedColor,
                                      item.selectedSize,
                                      item.quantity - 1
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="flex h-8 w-8 items-center justify-center text-sm font-medium text-gray-900 dark:text-white ">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.product.id,
                                      item.selectedColor,
                                      item.selectedSize,
                                      item.quantity + 1
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Price + Remove */}
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white ">
                                  {formatPrice(lineTotal)}
                                </span>
                                <button
                                  onClick={() =>
                                    removeItem(item.product.id, item.selectedColor, item.selectedSize)
                                  }
                                  className="flex h-6 w-6 items-center justify-center rounded-full text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:bg-[#141414] hover:text-gray-900 dark:hover:text-white"
                                  aria-label="Remove item"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Separator className="bg-gray-200 dark:bg-gray-700" />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141414] px-6 py-5 space-y-4">
                {/* Free Shipping Progress */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[#d79c4a]" />
                    {qualifiesFreeShipping ? (
                      <span className="text-xs font-medium text-emerald-500 ">
                        You qualify for free shipping!
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ">
                        Add {formatPrice(remaining)} more for free shipping
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-50 dark:bg-[#141414]">
                    <motion.div
                      className={`h-full rounded-full ${qualifiesFreeShipping ? 'bg-emerald-500' : 'bg-[#d79c4a]'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Discount Code */}
                <div className="flex gap-2">
                  <Input
                   placeholder="Discount code"
                    className="h-10 flex-1 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#141414] text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:text-gray-400 focus-visible:ring-[#d79c4a]"
                  />
                  <Button
                    variant="outline"
                    className="h-10 rounded-lg border-[#d79c4a] text-sm font-semibold uppercase tracking-wider text-[#d79c4a] hover:bg-[#d79c4a]/10 "
                  >
                    Apply
                  </Button>
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400 ">
                    Subtotal
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white ">
                    {formatPrice(currentSubtotal)}
                  </span>
                </div>

                {/* Checkout Button */}
                <Button
                  className="h-12 w-full rounded-lg bg-[#d79c4a] text-sm font-bold uppercase tracking-widest text-[#0A0A0A] transition-all hover:bg-[#c48a35] "
                  onClick={() => {
                    closeCart();
                    navigateToCheckout();
                  }}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-center text-xs text-gray-500 dark:text-gray-400 ">
                  Taxes and shipping calculated at checkout
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
