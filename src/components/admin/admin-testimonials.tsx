'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  MessageSquareQuote,
  Star,
  Loader2,
  User,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface TestimonialData {
  id: string;
  author: string;
  location: string;
  text: string;
  rating: number;
  photoUrl: string | null;
  order: number;
}

const emptyTestimonial = {
  author: '',
  location: '',
  text: '',
  rating: 5,
  photoUrl: '',
  order: 0,
};

export function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<TestimonialData | null>(null);
  const [deleting, setDeleting] = useState<TestimonialData | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyTestimonial);
  const [hoverRating, setHoverRating] = useState(0);

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/testimonials');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setTestimonials(data.testimonials ?? data);
    } catch {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyTestimonial);
    setHoverRating(0);
    setDialogOpen(true);
  };

  const openEdit = (item: TestimonialData) => {
    setEditing(item);
    setForm({
      author: item.author,
      location: item.location,
      text: item.text,
      rating: item.rating,
      photoUrl: item.photoUrl ?? '',
      order: item.order,
    });
    setHoverRating(0);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.author.trim() || !form.text.trim()) {
      toast.error('Author name and testimonial text are required');
      return;
    }
    setSaving(true);
    try {
      const url = editing
        ? `/api/admin/testimonials/${editing.id}`
        : '/api/admin/testimonials';
      const method = editing ? 'PUT' : 'POST';

      const payload = {
        ...form,
        photoUrl: form.photoUrl || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed');
      toast.success(editing ? 'Testimonial updated!' : 'Testimonial created!');
      setDialogOpen(false);
      fetchTestimonials();
    } catch {
      toast.error('Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${deleting.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Testimonial deleted!');
      setDeleteOpen(false);
      fetchTestimonials();
    } catch {
      toast.error('Failed to delete testimonial');
    }
  };

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < (interactive ? (hoverRating || form.rating) : rating);
          return (
            <Star
              key={i}
              className={`h-4 w-4 ${
                filled
                  ? 'fill-[#d79c4a] text-[#d79c4a]'
                  : 'text-muted-foreground/30'
              } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
              onMouseEnter={() => interactive && setHoverRating(i + 1)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onClick={() => interactive && updateField('rating', i + 1)}
            />
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
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
            {testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 bg-[#d79c4a] text-[#0A0A0A] hover:bg-[#d79c4a]/90"
        >
          <Plus className="h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      {/* Testimonials Grid */}
      {testimonials.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <MessageSquareQuote className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No testimonials yet</p>
          <Button
            variant="link"
            onClick={openCreate}
            className="mt-1 text-[#d79c4a]"
          >
            Add your first testimonial
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border bg-card overflow-hidden group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {testimonial.photoUrl ? (
                        <div className="flex-shrink-0 h-10 w-10 overflow-hidden rounded-full">
                          <img
                            src={testimonial.photoUrl}
                            alt={testimonial.author}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#d79c4a]/10">
                          <User className="h-4 w-4 text-[#d79c4a]" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {testimonial.author}
                          </h3>
                          {testimonial.location && (
                            <span className="text-xs text-muted-foreground truncate">
                              · {testimonial.location}
                            </span>
                          )}
                        </div>
                        {renderStars(testimonial.rating)}
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-3">
                          &quot;{testimonial.text}&quot;
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-[#d79c4a]"
                        onClick={() => openEdit(testimonial)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setDeleting(testimonial);
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
              {editing ? 'Edit Testimonial' : 'New Testimonial'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Rating */}
            <div className="space-y-2">
              <Label className="text-foreground">Rating</Label>
              <div className="flex items-center gap-3">
                {renderStars(form.rating, true)}
                <span className="text-sm text-muted-foreground">{form.rating}/5</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Author Name *</Label>
                <Input
                  value={form.author}
                  onChange={(e) => updateField('author', e.target.value)}
                  placeholder="Customer name"
                  className="border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="City, Country"
                  className="border-border bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Testimonial *</Label>
              <Textarea
                value={form.text}
                onChange={(e) => updateField('text', e.target.value)}
                placeholder="Customer testimonial..."
                rows={4}
                className="border-border bg-background resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Photo URL</Label>
                <Input
                  value={form.photoUrl}
                  onChange={(e) => updateField('photoUrl', e.target.value)}
                  placeholder="https://..."
                  className="border-border bg-background"
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

            {form.photoUrl && (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                  <img
                    src={form.photoUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-xs text-muted-foreground">Photo preview</span>
              </div>
            )}

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
            <AlertDialogTitle className="text-foreground">
              Delete Testimonial
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete the testimonial from &quot;{deleting?.author}
              &quot;? This action cannot be undone.
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
