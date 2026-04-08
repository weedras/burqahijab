'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  MessageCircle,
  Save,
  Loader2,
  Globe,
  Phone,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';

interface SiteSettings {
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  whatsappNumber: string;
  whatsappMessage: string;
}

const defaultSettings: SiteSettings = {
  facebookUrl: '',
  instagramUrl: 'https://instagram.com/burqahijab',
  tiktokUrl: '',
  twitterUrl: '',
  youtubeUrl: '',
  whatsappNumber: '',
  whatsappMessage: '',
};

const socialFields: {
  key: keyof SiteSettings;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  prefix: string;
  description: string;
}[] = [
  {
    key: 'instagramUrl',
    label: 'Instagram',
    icon: Instagram,
    placeholder: 'https://instagram.com/burqahijab',
    prefix: 'https://instagram.com/',
    description: 'Your Instagram profile or business page URL',
  },
  {
    key: 'facebookUrl',
    label: 'Facebook',
    icon: Facebook,
    placeholder: 'https://facebook.com/burqahijab',
    prefix: 'https://facebook.com/',
    description: 'Your Facebook page URL',
  },
  {
    key: 'tiktokUrl',
    label: 'TikTok',
    icon: Globe,
    placeholder: 'https://tiktok.com/@burqahijab',
    prefix: 'https://tiktok.com/@',
    description: 'Your TikTok profile URL',
  },
  {
    key: 'twitterUrl',
    label: 'Twitter / X',
    icon: Twitter,
    placeholder: 'https://twitter.com/burqahijab',
    prefix: 'https://twitter.com/',
    description: 'Your Twitter or X profile URL',
  },
  {
    key: 'youtubeUrl',
    label: 'YouTube',
    icon: Youtube,
    placeholder: 'https://youtube.com/@burqahijab',
    prefix: 'https://youtube.com/@',
    description: 'Your YouTube channel URL',
  },
];

export function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/settings');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSettings({ ...defaultSettings, ...data });
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save');
      }

      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: keyof SiteSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-4 mt-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Site Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your social media links and contact information. Changes appear instantly on the storefront.
        </p>
      </div>

      {/* Social Media Links */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Link2 className="h-4 w-4 text-[#d79c4a]" />
          Social Media Links
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Connect your social media profiles. Leave blank to hide a platform from the footer.
        </p>

        <div className="space-y-4">
          {socialFields.map((field) => (
            <div
              key={field.key}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-[#d79c4a]/20"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                <field.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <Label className="text-sm font-medium text-foreground">
                  {field.label}
                </Label>
                <Input
                  value={(settings as Record<string, string>)[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="border-border bg-background text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  {field.description}
                </p>
              </div>
              {(settings as Record<string, string>)[field.key] && (
                <a
                  href={(settings as Record<string, string>)[field.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-[#d79c4a] hover:border-[#d79c4a] transition-colors mt-6"
                  aria-label={`Visit ${field.label}`}
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-border" />

      {/* WhatsApp */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Phone className="h-4 w-4 text-[#d79c4a]" />
          WhatsApp Contact
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Set up a WhatsApp direct message link for customers.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <MessageCircle className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                WhatsApp Number
              </Label>
              <Input
                value={settings.whatsappNumber}
                onChange={(e) => updateField('whatsappNumber', e.target.value)}
                placeholder="+92 300 1234567"
                className="border-border bg-background text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Include country code. Example: +92 300 1234567
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <MessageCircle className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Default Message
              </Label>
              <Input
                value={settings.whatsappMessage}
                onChange={(e) => updateField('whatsappMessage', e.target.value)}
                placeholder="Hi! I'm interested in a product from BurqaHijab.shop"
                className="border-border bg-background text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Pre-filled message when customers tap the WhatsApp link
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-[#d79c4a] text-[#0A0A0A] hover:bg-[#d79c4a]/90 min-w-[140px]"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
