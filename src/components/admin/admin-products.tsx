'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Loader2,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  fabricCare: string | null;
  shipReturn: string | null;
  price: number;
  salePrice: number | null;
  currency: string;
  images: string[];
  videoUrl: string | null;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  occasion: string | null;
  fabric: string | null;
  colors: string[];
  sizes: string[];
  rating: number;
  reviewCount: number;
  stockCount: number;
}

type FilterType = 'all' | 'new' | 'featured' | 'sale' | 'lowstock';

const emptyProduct = {
  name: '',
  slug: '',
  description: '',
  fabricCare: '',
  shipReturn: '',
  price: 0,
  salePrice: null as number | null,
  currency: 'PKR',
  images: [] as string[],
  videoUrl: '',
  isNew: false,
  isBestSeller: false,
  isFeatured: false,
  occasion: '',
  fabric: '',
  colors: [] as string[],
  sizes: [] as string[],
  stockCount: 0,
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function AdminProducts() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductData | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyProduct);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data.products ?? data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'new' && p.isNew) ||
      (filter === 'featured' && p.isFeatured) ||
      (filter === 'sale' && p.salePrice !== null) ||
      (filter === 'lowstock' && p.stockCount <= 5);
    return matchesSearch && matchesFilter;
  });

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ ...emptyProduct });
    setDialogOpen(true);
  };

  const openEdit = (product: ProductData) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      fabricCare: product.fabricCare ?? '',
      shipReturn: product.shipReturn ?? '',
      price: product.price,
      salePrice: product.salePrice,
      currency: product.currency,
      images: Array.isArray(product.images) ? [...product.images] : [],
      videoUrl: product.videoUrl ?? '',
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
      isFeatured: product.isFeatured,
      occasion: product.occasion ?? '',
      fabric: product.fabric ?? '',
      colors: Array.isArray(product.colors) ? [...product.colors] : [],
      sizes: Array.isArray(product.sizes) ? [...product.sizes] : [],
      stockCount: product.stockCount,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    setSaving(true);
    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.name),
        fabricCare: form.fabricCare || null,
        shipReturn: form.shipReturn || null,
        salePrice: form.salePrice || null,
        videoUrl: form.videoUrl || null,
        occasion: form.occasion || null,
        fabric: form.fabric || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');

      toast.success(editingProduct ? 'Product updated!' : 'Product created!');
      setDialogOpen(false);
      fetchProducts();
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      const res = await fetch(`/api/admin/products/${deletingProduct.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Product deleted!');
      setDeleteOpen(false);
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const updateField = (field: string, value: string | number | boolean | null | string[]) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'name') {
        updated.slug = generateSlug(value as string);
      }
      return updated;
    });
  };

  const filterButtons: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'new', label: 'New' },
    { id: 'featured', label: 'Featured' },
    { id: 'sale', label: 'On Sale' },
    { id: 'lowstock', label: 'Low Stock' },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-border bg-card"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {filterButtons.map((f) => (
              <Button
                key={f.id}
                variant={filter === f.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f.id)}
                className={
                  filter === f.id
                    ? 'bg-[#d79c4a] text-[#0A0A0A] hover:bg-[#d79c4a]/90 text-xs'
                    : 'text-xs text-muted-foreground'
                }
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 bg-[#d79c4a] text-[#0A0A0A] hover:bg-[#d79c4a]/90"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Filter className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No products found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Try adjusting your search or filters
          </p>
        </motion.div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Product</TableHead>
                <TableHead className="text-muted-foreground hidden sm:table-cell">Category</TableHead>
                <TableHead className="text-muted-foreground">Price</TableHead>
                <TableHead className="text-muted-foreground hidden md:table-cell">Stock</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product, i) => {
                const images = Array.isArray(product.images) ? product.images : [];
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-border hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {images[0] ? (
                          <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                            <img
                              src={images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {product.isNew && (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px] px-1.5 py-0">
                                New
                              </Badge>
                            )}
                            {product.isBestSeller && (
                              <Badge className="bg-amber-500/10 text-amber-400 border-0 text-[10px] px-1.5 py-0">
                                Best
                              </Badge>
                            )}
                            {product.isFeatured && (
                              <Badge className="bg-[#d79c4a]/10 text-[#d79c4a] border-0 text-[10px] px-1.5 py-0">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {product.occasion || 'General'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          PKR {product.price.toLocaleString()}
                        </span>
                        {product.salePrice && (
                          <span className="text-xs text-emerald-400">
                            PKR {product.salePrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant={product.stockCount <= 5 ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {product.stockCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-[#d79c4a]"
                          onClick={() => openEdit(product)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setDeletingProduct(product);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-right">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingProduct ? 'Edit Product' : 'New Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Name & Slug */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Product name"
                  className="border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="product-slug"
                  className="border-border bg-background"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-foreground">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Product description..."
                rows={3}
                className="border-border bg-background resize-none"
              />
            </div>

            {/* Price & Sale & Currency */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-foreground">Price *</Label>
                <Input
                  type="number"
                  value={form.price || ''}
                  onChange={(e) => updateField('price', Number(e.target.value))}
                  placeholder="0"
                  className="border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Sale Price</Label>
                <Input
                  type="number"
                  value={form.salePrice ?? ''}
                  onChange={(e) =>
                    updateField('salePrice', e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="Optional"
                  className="border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Currency</Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => updateField('currency', v)}
                >
                  <SelectTrigger className="border-border bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PKR">PKR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stock & Occasion & Fabric */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-foreground">Stock Count</Label>
                <Input
                  type="number"
                  value={form.stockCount || ''}
                  onChange={(e) => updateField('stockCount', Number(e.target.value))}
                  placeholder="0"
                  className="border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Occasion</Label>
                <Input
                  value={form.occasion ?? ''}
                  onChange={(e) => updateField('occasion', e.target.value)}
                  placeholder="e.g., Ramadan, Wedding"
                  className="border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Fabric</Label>
                <Input
                  value={form.fabric ?? ''}
                  onChange={(e) => updateField('fabric', e.target.value)}
                  placeholder="e.g., Nida, Chiffon"
                  className="border-border bg-background"
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label className="text-foreground">Image URLs</Label>
              <Textarea
                value={form.images.join(', ')}
                onChange={(e) => {
                  const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  updateField('images', arr);
                }}
                placeholder="Comma-separated image URLs"
                rows={2}
                className="border-border bg-background resize-none text-xs"
              />
              {form.images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {form.images.map((url, i) => (
                    <div
                      key={i}
                      className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted"
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Colors & Sizes */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">Colors (comma-separated hex)</Label>
                <Input
                  value={form.colors.join(', ')}
                  onChange={(e) => {
                    const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                    updateField('colors', arr);
                  }}
                  placeholder="#000000, #FFFFFF, #d79c4a"
                  className="border-border bg-background"
                />
                {form.colors.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {form.colors.map((c, i) => (
                      <div
                        key={i}
                        className="h-5 w-5 rounded-full border border-border"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Sizes (comma-separated)</Label>
                <Input
                  value={form.sizes.join(', ')}
                  onChange={(e) => {
                    const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                    updateField('sizes', arr);
                  }}
                  placeholder="S, M, L, XL, XXL"
                  className="border-border bg-background"
                />
              </div>
            </div>

            {/* Fabric Care & Shipping */}
            <div className="space-y-2">
              <Label className="text-foreground">Fabric Care Instructions</Label>
              <Textarea
                value={form.fabricCare ?? ''}
                onChange={(e) => updateField('fabricCare', e.target.value)}
                placeholder="Care instructions..."
                rows={2}
                className="border-border bg-background resize-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Shipping & Return Policy</Label>
              <Textarea
                value={form.shipReturn ?? ''}
                onChange={(e) => updateField('shipReturn', e.target.value)}
                placeholder="Shipping and return info..."
                rows={2}
                className="border-border bg-background resize-none text-sm"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <Label className="text-sm text-foreground">New</Label>
                <Switch
                  checked={form.isNew}
                  onCheckedChange={(v) => updateField('isNew', v)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <Label className="text-sm text-foreground">Best Seller</Label>
                <Switch
                  checked={form.isBestSeller}
                  onCheckedChange={(v) => updateField('isBestSeller', v)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <Label className="text-sm text-foreground">Featured</Label>
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(v) => updateField('isFeatured', v)}
                />
              </div>
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label className="text-foreground">Video URL (optional)</Label>
              <Input
                value={form.videoUrl ?? ''}
                onChange={(e) => updateField('videoUrl', e.target.value)}
                placeholder="https://..."
                className="border-border bg-background"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-border text-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 bg-[#d79c4a] text-[#0A0A0A] hover:bg-[#d79c4a]/90"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{deletingProduct?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
