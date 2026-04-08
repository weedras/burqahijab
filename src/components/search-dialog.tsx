'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useProductStore } from '@/stores/product-store';
import { useUIStore } from '@/stores/ui-store';
import { formatPrice } from '@/lib/format';

export function SearchDialog() {
  const searchOpen = useUIStore((s) => s.searchOpen);
  const toggleSearch = useUIStore((s) => s.toggleSearch);
  const navigateToProduct = useUIStore((s) => s.navigateToProduct);
  const { products: dbProducts, categories: dbCategories, initialize } = useProductStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { initialize(); }, [initialize]);

  // Auto-focus on open (only side-effect, no setState)
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Reset query when dialog opens via onOpenChange handler
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setQuery('');
      toggleSearch();
    }
  }, [toggleSearch]);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuery('');
        toggleSearch();
      }
      if (e.key === 'Escape' && searchOpen) {
        toggleSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, toggleSearch]);

  // Category lookup map for display
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of dbCategories) {
      map.set(cat.id, cat.name);
    }
    return map;
  }, [dbCategories]);

  // Get category name for a product from its categories array
  const getCategoryName = useCallback((product: { id: string } & Record<string, unknown>): string => {
    const productCats = product.categories as Array<{ id: string }> | undefined;
    if (productCats && productCats.length > 0) {
      return categoryMap.get(productCats[0].id) || '';
    }
    return '';
  }, [categoryMap]);

  // Search products
  const results = query.trim().length > 0
    ? dbProducts.filter((p) => {
        const q = query.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.fabric && p.fabric.toLowerCase().includes(q)) ||
          (p.occasion && p.occasion.toLowerCase().includes(q))
        );
      })
    : [];

  const handleSelect = useCallback(
    (productId: string) => {
      const product = dbProducts.find((p) => p.id === productId);
      if (product) {
        toggleSearch();
        navigateToProduct(product);
      }
    },
    [toggleSearch, navigateToProduct, dbProducts]
  );

  return (
    <Dialog open={searchOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="top-[20%] translate-y-0 rounded-2xl border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141414] p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Search Products</DialogTitle>
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 px-5 py-4">
          <Search className="h-5 w-5 flex-shrink-0 text-[#d79c4a]" />
          <input
            ref={inputRef}
            type="text"
           placeholder="Search abayas, hijabs, accessories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-base text-gray-900 dark:text-white outline-none placeholder:text-gray-500 dark:text-gray-400 "
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#141414] px-2 py-0.5 text-[10px] text-gray-500 dark:text-gray-400 sm:inline-block ">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.trim().length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 ">
                Start typing to search products...
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {['Abayas', 'Hijabs', 'Wedding', 'Silk', 'New'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs text-gray-500 dark:text-gray-400 transition-colors hover:border-[#d79c4a] hover:text-[#d79c4a] "
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <ul className="py-2">
              <AnimatePresence>
                {results.map((product, idx) => (
                  <motion.li
                    key={product.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: idx * 0.03 }}
                  >
                    <button
                      onClick={() => handleSelect(product.id)}
                      className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-14 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-[#141414]">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 dark:bg-[#1A1A1A]" />
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-white ">
                          {product.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 ">
                            {getCategoryName(product)}
                          </span>
                          {product.salePrice && (
                            <>
                              <span className="text-xs font-semibold text-[#d79c4a] ">
                                {formatPrice(product.salePrice)}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 line-through ">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          )}
                          {!product.salePrice && (
                            <span className="text-xs font-semibold text-gray-900 dark:text-white ">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Arrow */}
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <div className="px-5 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-[#141414] mx-auto mb-3">
                <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white ">
                No results for &quot;{query}&quot;
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 ">
                Try searching for abayas, hijabs, or accessories
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-3">
          <p className="text-center text-[10px] text-gray-500 dark:text-gray-400 ">
            Press <kbd className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#141414] px-1 text-[9px]">ESC</kbd> to close
            {' · '}
            <kbd className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#141414] px-1 text-[9px]">⌘K</kbd> to search
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
