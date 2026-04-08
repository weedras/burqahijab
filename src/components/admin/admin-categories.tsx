'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  order: number;
  children?: CategoryData[];
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const emptyCategory = {
  name: '',
  slug: '',
  description: '',
  parentId: '' as string,
  order: 0,
};

export function AdminCategories() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryData | null>(null);
  const [deleting, setDeleting] = useState<CategoryData | null>(null);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [form, setForm] = useState(emptyCategory);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCategories(data.categories ?? data);
      // Auto-expand all on load
      const allIds = new Set<string>();
      const collectIds = (items: CategoryData[]) => {
        items.forEach((item) => {
          if (item.children && item.children.length > 0) {
            allIds.add(item.id);
            collectIds(item.children);
          }
        });
      };
      collectIds(data);
      setExpanded(allIds);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const topLevelCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  const allCategoriesFlat = useMemo(() => {
    const flat: CategoryData[] = [];
    const flatten = (items: CategoryData[]) => {
      items.forEach((item) => {
        flat.push(item);
        if (item.children) flatten(item.children);
      });
    };
    flatten(categories);
    return flat;
  }, [categories]);

  const openCreate = (parentId?: string) => {
    setEditing(null);
    setForm({ ...emptyCategory, parentId: parentId ?? '' });
    setDialogOpen(true);
  };

  const openEdit = (item: CategoryData) => {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description ?? '',
      parentId: item.parentId ?? '',
      order: item.order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setSaving(true);
    try {
      const url = editing
        ? `/api/admin/categories/${editing.id}`
        : '/api/admin/categories';
      const method = editing ? 'PUT' : 'POST';

      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.name),
        description: form.description || null,
        parentId: form.parentId || null,
      };

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed');
      toast.success(editing ? 'Category updated!' : 'Category created!');
      setDialogOpen(false);
      fetchCategories();
    } catch {
      toast.error('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await adminFetch(`/api/admin/categories/${deleting.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Category deleted!');
      setDeleteOpen(false);
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'name') {
        updated.slug = generateSlug(value as string);
      }
      return updated;
    });
  };

  const renderTree = (items: CategoryData[], depth: number = 0) => {
    return items.map((item, i) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expanded.has(item.id);
      return (
        <div key={item.id}>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="mb-2 border-border bg-card overflow-hidden">
              <CardContent className="flex items-center gap-3 p-3">
                <div style={{ paddingLeft: depth * 20 }} className="flex items-center gap-2 flex-1 min-w-0">
                  {hasChildren ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={() => toggleExpand(item.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    <span className="w-6 flex-shrink-0" />
                  )}
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#d79c4a]/10">
                    <FolderTree className="h-4 w-4 text-[#d79c4a]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </span>
                      {hasChildren && (
                        <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                          {item.children!.length}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      /{item.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {hasChildren && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-[#d79c4a] hover:text-[#d79c4a]/80 gap-1"
                      onClick={() => openCreate(item.id)}
                    >
                      <Plus className="h-3 w-3" />
                      <span className="hidden sm:inline">Sub</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-[#d79c4a]"
                    onClick={() => openEdit(item)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setDeleting(item);
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <AnimatePresence>
            {hasChildren && isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {renderTree(item.children!, depth + 1)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {allCategoriesFlat.length} categor{allCategoriesFlat.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <Button
          onClick={() => openCreate()}
          className="gap-2 bg-[#d79c4a] text-[#0A0A0A] hover:bg-[#d79c4a]/90"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Tree */}
      {topLevelCategories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <FolderTree className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No categories yet</p>
          <Button
            variant="link"
            onClick={() => openCreate()}
            className="mt-1 text-[#d79c4a]"
          >
            Create your first category
          </Button>
        </motion.div>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {renderTree(topLevelCategories)}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editing ? 'Edit Category' : 'New Category'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-foreground">Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Category name"
                className="border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="category-slug"
                className="border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Category description..."
                rows={3}
                className="border-border bg-background resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Parent Category</Label>
                <Select
                  value={form.parentId || 'none'}
                  onValueChange={(v) => updateField('parentId', v === 'none' ? '' : v)}
                >
                  <SelectTrigger className="border-border bg-background">
                    <SelectValue placeholder="None (top level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top level)</SelectItem>
                    {allCategoriesFlat
                      .filter((c) => c.id !== editing?.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
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
            <AlertDialogTitle className="text-foreground">Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{deleting?.name}&quot;?
              {deleting?.children && deleting.children.length > 0 && (
                <span className="block mt-1 text-destructive">
                  This will also affect {deleting.children.length} sub-categor
                  {deleting.children.length !== 1 ? 'ies' : 'y'}.
                </span>
              )}
              This action cannot be undone.
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
