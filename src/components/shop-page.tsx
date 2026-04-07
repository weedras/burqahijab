'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Heart,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProductStore } from '@/stores/product-store';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore, isProductWishlisted } from '@/stores/wishlist-store';
import { useUIStore } from '@/stores/ui-store';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

const OCCASION_OPTIONS = ['Wedding', 'Eid', 'Daily', 'Office', 'Travel'];
const FABRIC_OPTIONS = ['Chiffon', 'Crepe', 'Silk', 'Cotton', 'Nida', 'Jersey'];
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'best-selling', label: 'Best Selling' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['value'];

interface FilterState {
  categories: string[];
  occasions: string[];
  fabrics: string[];
  priceRange: [number, number];
  sort: SortOption;
  search: string;
}

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  occasions: [],
  fabrics: [],
  priceRange: [500, 10000],
  sort: 'featured',
  search: '',
};

function ProductCardShop({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const { navigateToProduct } = useUIStore();
  const [hovered, setHovered] = useState(false);

  const price = product.salePrice ?? product.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div
        className="relative mb-3 cursor-pointer overflow-hidden rounded-xl bg-gray-50 dark:bg-[#141414]"
        onClick={() => navigateToProduct(product)}
      >
        <div
          className="aspect-[3/4] w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
          style={{
            backgroundImage: product.images[0] ? `url('${product.images[0]}')` : undefined,
            backgroundColor: product.images[0] ? undefined : '#1A1A1A',
          }}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-[#d79c4a] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0A0A0A] ">
              New
            </span>
          )}
          {product.salePrice && (
            <span className="rounded-full bg-red-500/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white ">
              Sale
            </span>
          )}
          {product.isBestSeller && !product.isNew && (
            <span className="rounded-full bg-[#1A4B5C] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white ">
              Best Seller
            </span>
          )}
        </div>
        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleItem(product.id);
          }}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-sm transition-all hover:bg-gray-200 dark:hover:bg-gray-800"
          aria-label="Toggle wishlist"
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              isProductWishlisted(wishlistItems, product.id) ? 'fill-red-500 text-red-500' : 'text-gray-900 dark:text-white'
            )}
          />
        </button>
        {/* Quick Add - desktop only on hover */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
          transition={{ duration: 0.2 }}
          className="hidden md:block absolute bottom-3 left-3 right-3"
        >
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              addItem(product, product.colors[0] || 'Default', product.sizes[0] || 'One Size');
            }}
            className="h-9 w-full rounded-lg bg-[#d79c4a] text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#c48a35] active:scale-95 "
          >
            Add to Cart
          </Button>
        </motion.div>
      </div>
      {/* Info */}
      <div className="cursor-pointer" onClick={() => navigateToProduct(product)}>
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
        {/* Colors */}
        {product.colors.length > 0 && (
          <div className="mt-2 flex items-center gap-1">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color}
                className="inline-block h-3.5 w-3.5 rounded-full border border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: color }}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
      {/* Mobile Add to Cart */}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          addItem(product, product.colors[0] || 'Default', product.sizes[0] || 'One Size');
        }}
        className="mt-2 h-8 w-full rounded-lg bg-[#d79c4a] text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#c48a35] active:scale-95 md:hidden "
      >
        <ShoppingCart className="mr-1 h-3 w-3" />
        Add to Cart
      </Button>
    </motion.div>
  );
}

function FilterSection({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (opt: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-900 dark:text-white "
      >
        {title}
        <ChevronDown className={cn('h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 pt-2">
              {options.map((opt) => (
                <label
                  key={opt}
                  className="flex cursor-pointer items-center gap-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <Checkbox
                    checked={selected.includes(opt)}
                    onCheckedChange={() => onToggle(opt)}
                    className="border-gray-200 dark:border-gray-700 data-[state=checked]:bg-[#d79c4a] data-[state=checked]:border-[#d79c4a] data-[state=checked]:text-[#0A0A0A]"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSidebar({
  filters,
  onChange,
  onClear,
  categoryOptions,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClear: () => void;
  categoryOptions: string[];
}) {
  const activeCount =
    filters.categories.length +
    filters.occasions.length +
    filters.fabrics.length +
    (filters.priceRange[0] !== 500 || filters.priceRange[1] !== 10000 ? 1 : 0);

  const toggleCategory = (opt: string) => {
    const next = filters.categories.includes(opt)
      ? filters.categories.filter((c) => c !== opt)
      : [...filters.categories, opt];
    onChange({ ...filters, categories: next });
  };

  const toggleOccasion = (opt: string) => {
    const next = filters.occasions.includes(opt)
      ? filters.occasions.filter((o) => o !== opt)
      : [...filters.occasions, opt];
    onChange({ ...filters, occasions: next });
  };

  const toggleFabric = (opt: string) => {
    const next = filters.fabrics.includes(opt)
      ? filters.fabrics.filter((f) => f !== opt)
      : [...filters.fabrics, opt];
    onChange({ ...filters, fabrics: next });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between py-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white ">
          Filters
        </h3>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-[#d79c4a] hover:underline "
          >
            Clear All ({activeCount})
          </button>
        )}
      </div>

      <FilterSection
        title="Category"
        options={categoryOptions}
        selected={filters.categories}
        onToggle={toggleCategory}
      />
      <FilterSection
        title="Occasion"
        options={OCCASION_OPTIONS}
        selected={filters.occasions}
        onToggle={toggleOccasion}
      />
      <FilterSection
        title="Fabric"
        options={FABRIC_OPTIONS}
        selected={filters.fabrics}
        onToggle={toggleFabric}
      />

      {/* Price Range */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 pt-2">
        <button
          className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-900 dark:text-white "
        >
          Price Range
        </button>
        <div className="space-y-4 pt-2">
          <Slider
            value={filters.priceRange}
            onValueChange={(val) => onChange({ ...filters, priceRange: val as [number, number] })}
            min={500}
            max={10000}
            step={500}
            className="[&_[role=slider]]:bg-[#d79c4a] [&_[role=slider]]:border-[#d79c4a] [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_.relative>div]:bg-gray-200 dark:[&_.relative>div]:bg-gray-700 [&_.relative>div:first-child]:bg-[#d79c4a]"
          />
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 ">
            <span>{formatPrice(filters.priceRange[0])}</span>
            <span>{formatPrice(filters.priceRange[1])}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShopPage() {
  const { selectedCategory, selectedCollection, navigateHome, navigateToProduct } = useUIStore();
  const { products: dbProducts, categories: dbCategories, collections: dbCollections, initialize } = useProductStore();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => { initialize(); }, [initialize]);

  // Dynamic category options from the store (top-level only)
  const CATEGORY_OPTIONS = useMemo(() => {
    return dbCategories.filter((c) => !c.parentId).map((c) => c.name);
  }, [dbCategories]);

  // Determine the header
  const headerTitle = useMemo(() => {
    if (selectedCollection) {
      const col = dbCollections.find((c) => c.slug === selectedCollection || c.id === selectedCollection);
      return col?.name || 'Collection';
    }
    if (selectedCategory) {
      const cat = dbCategories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
      return cat?.name || 'Shop';
    }
    return 'All Products';
  }, [selectedCollection, selectedCategory, dbCollections, dbCategories]);

  // Get base products from collection/category selection
  const baseProducts = useMemo(() => {
    if (selectedCollection) {
      return useProductStore.getState().getProductsByCollectionSlug(selectedCollection);
    }
    if (selectedCategory) {
      return useProductStore.getState().getProductsByCategorySlug(selectedCategory);
    }
    return dbProducts;
  }, [selectedCollection, selectedCategory, dbProducts]);

  // Apply filters
  const filteredProducts = useMemo(() => {
    let result = [...baseProducts];

    // Search filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Category filter (map UI category names to category IDs)
    if (filters.categories.length > 0) {
      const categoryIds: string[] = [];
      filters.categories.forEach((catName) => {
        const cat = dbCategories.find((c) => c.name === catName);
        if (cat) {
          categoryIds.push(cat.id);
          if (cat.children) {
            cat.children.forEach((child) => categoryIds.push(child.id));
          }
        }
      });
      const productIds = new Set<string>();
      categoryIds.forEach((id) => {
        // Find products that have this category ID in their categories array
        dbProducts.forEach((p) => {
          const productCats = (p as Record<string, unknown>).categories as Array<{ id: string }> | undefined;
          if (productCats && productCats.some((c) => categoryIds.includes(c.id))) {
            productIds.add(p.id);
          }
        });
      });
      result = result.filter((p) => productIds.has(p.id));
    }

    // Occasion filter
    if (filters.occasions.length > 0) {
      result = result.filter((p) => p.occasion && filters.occasions.includes(p.occasion));
    }

    // Fabric filter
    if (filters.fabrics.length > 0) {
      result = result.filter((p) => p.fabric && filters.fabrics.includes(p.fabric));
    }

    // Price filter
    result = result.filter((p) => {
      const price = p.salePrice ?? p.price;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Sort
    switch (filters.sort) {
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'price-low':
        result.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case 'price-high':
        result.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case 'best-selling':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [baseProducts, filters, dbCategories, dbProducts]);

  // Active filter tags
  const activeTags = useMemo(() => {
    const tags: { key: string; label: string }[] = [];
    filters.categories.forEach((c) => tags.push({ key: `cat-${c}`, label: c }));
    filters.occasions.forEach((o) => tags.push({ key: `occ-${o}`, label: o }));
    filters.fabrics.forEach((f) => tags.push({ key: `fab-${f}`, label: f }));
    if (filters.priceRange[0] !== 500 || filters.priceRange[1] !== 10000) {
      tags.push({
        key: 'price',
        label: `${formatPrice(filters.priceRange[0])} - ${formatPrice(filters.priceRange[1])}`,
      });
    }
    return tags;
  }, [filters]);

  const removeTag = (key: string) => {
    if (key.startsWith('cat-')) {
      setFilters((f) => ({ ...f, categories: f.categories.filter((c) => `cat-${c}` !== key) }));
    } else if (key.startsWith('occ-')) {
      setFilters((f) => ({ ...f, occasions: f.occasions.filter((o) => `occ-${o}` !== key) }));
    } else if (key.startsWith('fab-')) {
      setFilters((f) => ({ ...f, fabrics: f.fabrics.filter((fb) => `fab-${fb}` !== key) }));
    } else if (key === 'price') {
      setFilters((f) => ({ ...f, priceRange: [500, 10000] as [number, number] }));
    }
  };

  const filterSidebar = (
    <FilterSidebar
      filters={filters}
      onChange={setFilters}
      onClear={() => setFilters(DEFAULT_FILTERS)}
      categoryOptions={CATEGORY_OPTIONS}
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white/95 backdrop-blur-md dark:bg-[#141414]/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center gap-4">
            <button
              onClick={navigateHome}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white "
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <Separator orientation="vertical" className="h-5 bg-gray-200 dark:bg-gray-700" />
            <h1 className=" text-xl text-gray-900 dark:text-white">
              {headerTitle}
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400 ">
              ({filteredProducts.length} products)
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-20">
              {filterSidebar}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search + Sort + Mobile Filter */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-3">
                {/* Mobile Filter Button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 gap-2 rounded-lg border-gray-200 dark:border-gray-700 lg:hidden "
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>Filters</span>
                      {activeTags.length > 0 && (
                        <Badge className="ml-1 h-5 min-w-[1.25rem] rounded-full bg-[#d79c4a] px-1 text-[10px] text-[#0A0A0A] ">
                          {activeTags.length}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 bg-white dark:bg-[#141414] p-0">
                    <SheetHeader className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                      <SheetTitle className="flex items-center gap-2 text-gray-900 dark:text-white ">
                        <SlidersHorizontal className="h-5 w-5 text-[#d79c4a]" />
                        Filters
                      </SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-100px)] px-6 py-4">
                      {filterSidebar}
                    </ScrollArea>
                  </SheetContent>
                </Sheet>

                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                  <Input
                   placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    className="h-10 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#141414] pl-10 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:text-gray-400 focus-visible:ring-[#d79c4a]"
                  />
                  {filters.search && (
                    <button
                      onClick={() => setFilters((f) => ({ ...f, search: '' }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sort */}
              <Select
                value={filters.sort}
                onValueChange={(val) => setFilters((f) => ({ ...f, sort: val as SortOption }))}
              >
                <SelectTrigger className="h-10 w-full rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#141414] sm:w-48 text-sm text-gray-900 dark:text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#141414] border-gray-200 dark:border-gray-700">
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm focus:bg-gray-50 dark:bg-[#141414] focus:text-gray-900 dark:text-white">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filter Tags */}
            <AnimatePresence>
              {activeTags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 flex flex-wrap items-center gap-2"
                >
                  <span className="text-xs text-gray-500 dark:text-gray-400 ">
                    Active filters:
                  </span>
                  {activeTags.map((tag) => (
                    <Badge
                      key={tag.key}
                      variant="outline"
                      className="gap-1 rounded-full border-[#d79c4a]/30 bg-[#d79c4a]/10 px-2.5 py-0.5 text-xs text-[#d79c4a] "
                    >
                      {tag.label}
                      <button
                        onClick={() => removeTag(tag.key)}
                        className="ml-0.5 text-[#d79c4a] hover:text-gray-900 dark:hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="text-xs font-medium text-[#d79c4a] hover:underline "
                  >
                    Clear All
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product Count */}
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 ">
              Showing {filteredProducts.length} of {baseProducts.length} products
            </p>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 pb-20 md:pb-4">
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <ProductCardShop key={product.id} product={product} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center gap-4 py-20 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-[#141414]">
                  <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className=" text-lg text-gray-900 dark:text-white">
                    No products found
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 ">
                    Try adjusting your filters or search term
                  </p>
                </div>
                <Button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  variant="outline"
                  className="mt-2 rounded-lg border-[#d79c4a] text-sm font-semibold text-[#d79c4a] hover:bg-[#d79c4a]/10 "
                >
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
