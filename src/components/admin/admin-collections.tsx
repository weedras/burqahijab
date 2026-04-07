'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Loader2,
  Star,
  GripVertical,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';

interface CollectionData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  featured: boolean;
  order: number;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const emptyCollection = {
  name: '',
  slug: '',
  description: '',
  image: '',
  featured: false,
  order: 0,
};

export function AdminCollections() {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<CollectionData | null>(null);
  const [deleting, setDeleting] = useState<CollectionData | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyCollection);

  const fetchCollections = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/collections');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCollections(data.collections ?? data);
    } catch {
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCollection);
    setDialogOpen(true);
  };

  const openEdit = (item: CollectionData) => {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description ?? '',
      image: item.image ?? '',
      featured: item.featured,
      order: item.order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Collection name is required');
      return;
    }
    setSaving(true);
    try {
      const url = editing
        ? `/api/admin/collections/${editing.id}`
        : '/api/admin/collections';
      const method = editing ? 'PUT' : 'POST';

      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.name),
        description: form.description || null,
        image: form.image || null,
      };

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed');
      toast.success(editing ? 'Collection updated!' : 'Collection created!');
      setDialogOpen(false);
      fetchCollections();
    } catch {
      toast.error('Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await adminFetch(`/api/admin/collections/${deleting.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Collection deleted!');
      setDeleteOpen(false);
      fetchCollections();
    } catch {
      toast.error('Failed to delete collection');
    }
  };

  const updateField = (field: string, value: string | number | boolean) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'name') {
        updated.slug = generateSlug(value as string);
      }
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {collections.length} collection{collections.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 bg-[#d79c4a] text-[#0A0A0A] hover:bg-[#d79c4a]/90"
        >
          <Plus className="h-4 w-4" />
          Add Collection
        </Button>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Layers className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No collections yet</p>
          <Button
            variant="link"
            onClick={openCreate}
            className="mt-1 text-[#d79c4a]"
          >
            Create your first collection
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, i) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden border-border bg-card group">
                <div className="relative h-40 bg-muted">
                  {collection.image ? (
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Layers className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    {collection.featured && (
                      <Badge className="bg-[#d79c4a] text-[#0A0A0A] border-0 text-[10px] gap-1">
                        <Star className="h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-black/40 text-white border-0 text-[10px]">
                      Order: {collection.order}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {collection.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground truncate">
                        /{collection.slug}
                      </p>
                      {collection.description && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                          {collection.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-[#d79c4a]"
                        onClick={() => openEdit(collection)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setDeleting(collection);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editing ? 'Edit Collection' : 'New Collection'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-foreground">Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Collection name"
                className="border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="collection-slug"
                className="border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Collection description..."
                rows={3}
                className="border-border bg-background resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Image URL</Label>
              <Input
                value={form.image}
                onChange={(e) => updateField('image', e.target.value)}
                placeholder="https://..."
                className="border-border bg-background"
              />
              {form.image && (
                <div className="h-24 w-full overflow-hidden rounded-lg bg-muted">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <Label className="text-sm text-foreground">Featured</Label>
                <Switch
                  checked={form.featured}
                  onCheckedChange={(v) => updateField('featured', v)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Order</Label>
                <Input
                  type="number"
                  value={form.order || ''}
                  onChange={(e) => updateField('order', Number(e.target.value))}
                  placeholder="0"
                  className="border-border bg-background"
                />
              </div>
            </div>

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
                {editing ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Collection</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{deleting?.name}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground">
              Cancel
            </AlertDialogCancel>
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
