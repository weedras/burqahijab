'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Package,
  Plus,
  Minus,
  Sparkles,
  Clock,
  Loader2,
  ImageOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  currency: string;
  images: string[];
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  stockCount: number;
}

const MAX_FEATURED = 4;

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' },
  }),
};

export function AdminStorefront() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/products?limit=100');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleFlag = async (
    id: string,
    flag: 'isFeatured' | 'isNew',
    value: boolean,
  ) => {
    setTogglingId(id);
    try {
      const res = await adminFetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [flag]: value }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update product');
      }

      const label = flag === 'isFeatured' ? 'Featured' : 'New Arrival';
      toast.success(
        value
          ? `"${products.find((p) => p.id === id)?.name}" added as ${label}`
          : `"${products.find((p) => p.id === id)?.name}" removed from ${label}`,
      );

      fetchProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setTogglingId(null);
    }
  };

  const featuredProducts = products.filter((p) => p.isFeatured);
  const nonFeaturedProducts = products.filter((p) => !p.isFeatured);
  const newArrivalProducts = products.filter((p) => p.isNew);
  const nonNewProducts = products.filter((p) => !p.isNew);
  const isFeaturedFull = featuredProducts.length >= MAX_FEATURED;

  /* ------------------------------------------------------------------ */
  /*  Product Card                                                       */
  /* ------------------------------------------------------------------ */
  const ProductCard = ({
    product,
    index,
    badge,
    badgeColor,
    actionLabel,
    actionIcon,
    actionOnClick,
    actionDisabled,
    actionVariant,
  }: {
    product: ProductData;
    index: number;
    badge: string;
    badgeColor: string;
    actionLabel: string;
    actionIcon: React.ReactNode;
    actionOnClick: () => void;
    actionDisabled?: boolean;
    actionVariant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
  }) => {
    const images = Array.isArray(product.images) ? product.images : [];
    const isToggling = togglingId === product.id;

    return (
      <motion.div
        key={product.id}
        custom={index}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-[#d79c4a]/30 hover:shadow-lg hover:shadow-[#d79c4a]/5"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {images.length > 0 && images[0] ? (
            <img
              src={images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageOff className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}
          {/* Badge overlay */}
          <Badge
            className={`absolute top-2 right-2 border-0 text-[10px] font-semibold uppercase tracking-wider ${badgeColor}`}
          >
            {badge}
          </Badge>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-foreground truncate mb-1.5">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-sm font-semibold text-foreground">
              {product.currency} {product.price.toLocaleString()}
            </span>
            {product.salePrice !== null && product.salePrice > 0 && (
              <span className="text-xs text-emerald-400 line-through ml-1">
                {product.currency} {product.salePrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Action */}
          <Button
            size="sm"
            variant={actionVariant ?? 'outline'}
            className={`w-full gap-1.5 text-xs ${
              actionDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:border-[#d79c4a] hover:text-[#d79c4a] hover:bg-[#d79c4a]/5'
            } border-border text-muted-foreground transition-colors`}
            onClick={actionOnClick}
            disabled={actionDisabled || isToggling}
          >
            {isToggling ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              actionIcon
            )}
            {actionLabel}
          </Button>
        </div>
      </motion.div>
    );
  };

  /* ------------------------------------------------------------------ */
  /*  Loading skeleton                                                   */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-12 w-full max-w-md" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Main content                                                       */
  /* ------------------------------------------------------------------ */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Storefront Manager
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage which products appear as Featured Products and New Arrivals on your storefront.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="featured" className="w-full">
        <TabsList className="bg-muted/50 border border-border rounded-lg p-1 h-auto">
          <TabsTrigger
            value="featured"
            className="gap-2 rounded-md data-[state=active]:bg-[#d79c4a] data-[state=active]:text-[#0A0A0A] text-xs font-medium px-4 py-2 transition-all"
          >
            <Star className="h-3.5 w-3.5" />
            Featured Products
          </TabsTrigger>
          <TabsTrigger
            value="new"
            className="gap-2 rounded-md data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-xs font-medium px-4 py-2 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            New Arrivals
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/*  Featured Products Tab                                        */}
        {/* ============================================================ */}
        <TabsContent value="featured" className="mt-6 space-y-8">
          {/* Current featured */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Currently Featured
                </h3>
                <Badge className="bg-[#d79c4a]/10 text-[#d79c4a] border-0 text-[10px] font-semibold">
                  {featuredProducts.length}/{MAX_FEATURED} Featured
                </Badge>
              </div>
            </div>

            {featuredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center"
              >
                <Star className="mb-3 h-10 w-10 text-[#d79c4a]/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  No featured products yet
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Add products from the selection below to feature them on your storefront.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {featuredProducts.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    badge="Featured"
                    badgeColor="bg-[#d79c4a] text-[#0A0A0A]"
                    actionLabel="Remove from Featured"
                    actionIcon={<Minus className="h-3.5 w-3.5" />}
                    actionOnClick={() => toggleFlag(product.id, 'isFeatured', false)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Available products to feature */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Add to Featured
                </h3>
                <Badge variant="secondary" className="text-[10px]">
                  {nonFeaturedProducts.length} available
                </Badge>
              </div>
              {isFeaturedFull && (
                <p className="text-xs text-amber-400/80 flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5" />
                  Maximum {MAX_FEATURED} featured products reached
                </p>
              )}
            </div>

            {nonFeaturedProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center"
              >
                <Package className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  All products are already featured
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Remove a featured product above to add a different one.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {nonFeaturedProducts.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    badge="Available"
                    badgeColor="bg-muted text-muted-foreground"
                    actionLabel="Add to Featured"
                    actionIcon={<Plus className="h-3.5 w-3.5" />}
                    actionOnClick={() => toggleFlag(product.id, 'isFeatured', true)}
                    actionDisabled={isFeaturedFull}
                  />
                ))}
              </div>
            )}
          </section>
        </TabsContent>

        {/* ============================================================ */}
        {/*  New Arrivals Tab                                             */}
        {/* ============================================================ */}
        <TabsContent value="new" className="mt-6 space-y-8">
          {/* Current new arrivals */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Currently Marked as New
                </h3>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px] font-semibold">
                  {newArrivalProducts.length} product{newArrivalProducts.length !== 1 ? 's' : ''} marked as new
                </Badge>
              </div>
            </div>

            {newArrivalProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center"
              >
                <Clock className="mb-3 h-10 w-10 text-emerald-400/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  No new arrivals marked
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Mark products as new from the selection below to highlight them on your storefront.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {newArrivalProducts.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    badge="New"
                    badgeColor="bg-emerald-500 text-white"
                    actionLabel="Remove from New"
                    actionIcon={<Minus className="h-3.5 w-3.5" />}
                    actionOnClick={() => toggleFlag(product.id, 'isNew', false)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Available products to mark as new */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Mark as New
                </h3>
                <Badge variant="secondary" className="text-[10px]">
                  {nonNewProducts.length} available
                </Badge>
              </div>
            </div>

            {nonNewProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center"
              >
                <Package className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  All products are marked as new
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Remove the new flag from some products above to add different ones.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {nonNewProducts.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    badge="Available"
                    badgeColor="bg-muted text-muted-foreground"
                    actionLabel="Mark as New"
                    actionIcon={<Plus className="h-3.5 w-3.5" />}
                    actionOnClick={() => toggleFlag(product.id, 'isNew', true)}
                  />
                ))}
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
