'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Store,
  Phone,
  MapPin,
  Link2,
  MessageCircle,
  Truck,
  RotateCcw,
  Save,
  Loader2,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Clock,
  Shield,
  CreditCard,
  Building,
  Megaphone,
  Tag,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';

// ─── Interface ────────────────────────────────────────────────────────

interface StoreSettings {
  // Social
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  // Contact
  whatsappNumber: string;
  whatsappMessage: string;
  phoneNumber: string;
  supportEmail: string;
  contactEmail: string;
  careersEmail: string;
  // Store Info
  storeName: string;
  storeTagline: string;
  storeAddress: string;
  storeAddressShort: string;
  businessHours: string;
  copyrightText: string;
  announcementMessage: string;
  // Shipping
  freeShippingThreshold: string;
  shippingCostDomestic: string;
  shippingCostExpress: string;
  domesticDeliveryDays: string;
  internationalDeliveryDays: string;
  freeShippingInternational: string;
  // Returns
  returnWindowDays: string;
  refundDaysJazzCash: string;
  refundDaysBank: string;
}

// ─── Default values ──────────────────────────────────────────────────

const defaultSettings: StoreSettings = {
  storeName: 'BurqaHijab',
  storeTagline: 'Where Modesty Meets Luxury',
  announcementMessage: 'Free shipping on orders above PKR 3,000!',
  copyrightText: '© 2026 BurqaHijab. All rights reserved.',
  phoneNumber: '+92 300 1234567',
  supportEmail: 'support@burqahijab.shop',
  contactEmail: 'hello@burqahijab.shop',
  careersEmail: 'careers@burqahijab.shop',
  storeAddress: 'Block 9, Clifton, Karachi, Pakistan',
  storeAddressShort: 'Karachi, Pakistan',
  businessHours: 'Monday – Saturday, 10:00 AM – 8:00 PM PKT',
  facebookUrl: '',
  instagramUrl: 'https://instagram.com/burqahijab',
  tiktokUrl: '',
  twitterUrl: '',
  youtubeUrl: '',
  whatsappNumber: '',
  whatsappMessage: '',
  freeShippingThreshold: '3000',
  shippingCostDomestic: '250',
  shippingCostExpress: '450',
  domesticDeliveryDays: '3-5',
  internationalDeliveryDays: '7-14',
  freeShippingInternational: '250',
  returnWindowDays: '14',
  refundDaysJazzCash: '3-5',
  refundDaysBank: '3-5',
};

// ─── Field config type ───────────────────────────────────────────────

interface FieldConfig {
  key: keyof StoreSettings;
  label: string;
  placeholder: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  iconColor?: string;
  prefix?: string;
  type?: string;
}

interface SectionConfig {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  fields: FieldConfig[];
}

// ─── Section definitions ─────────────────────────────────────────────

const sections: SectionConfig[] = [
  {
    title: 'Store Identity',
    description: 'Your store name, tagline, and branding details shown across the site.',
    icon: Store,
    iconColor: 'text-[#d79c4a]',
    fields: [
      {
        key: 'storeName',
        label: 'Store Name',
        placeholder: 'BurqaHijab',
        description: 'The primary name displayed in the header, footer, and browser tab.',
        icon: Building,
        iconBg: 'bg-[#d79c4a]/10',
        iconColor: 'text-[#d79c4a]',
      },
      {
        key: 'storeTagline',
        label: 'Store Tagline',
        placeholder: 'Where Modesty Meets Luxury',
        description: 'A short memorable phrase shown below the store name in the header.',
        icon: Tag,
        iconBg: 'bg-[#d79c4a]/10',
        iconColor: 'text-[#d79c4a]',
      },
      {
        key: 'announcementMessage',
        label: 'Announcement Banner',
        placeholder: 'Free shipping on orders above PKR 3,000!',
        description: 'Message displayed in the top announcement bar across all pages.',
        icon: Megaphone,
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-500',
      },
      {
        key: 'copyrightText',
        label: 'Copyright Text',
        placeholder: '© 2026 BurqaHijab. All rights reserved.',
        description: 'Footer copyright notice. Update the year as needed.',
        icon: FileText,
        iconBg: 'bg-muted',
        iconColor: 'text-muted-foreground',
      },
    ],
  },
  {
    title: 'Contact Information',
    description: 'Phone numbers and email addresses displayed to customers.',
    icon: Phone,
    iconColor: 'text-[#d79c4a]',
    fields: [
      {
        key: 'phoneNumber',
        label: 'Phone Number',
        placeholder: '+92 300 1234567',
        description: 'Primary customer support phone number shown in the footer.',
        icon: Phone,
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
      },
      {
        key: 'supportEmail',
        label: 'Support Email',
        placeholder: 'support@burqahijab.shop',
        description: 'Email address for customer support inquiries.',
        icon: Mail,
        iconBg: 'bg-[#d79c4a]/10',
        iconColor: 'text-[#d79c4a]',
        type: 'email',
      },
      {
        key: 'contactEmail',
        label: 'General Contact Email',
        placeholder: 'hello@burqahijab.shop',
        description: 'General purpose contact email for partnerships and media.',
        icon: Mail,
        iconBg: 'bg-purple-500/10',
        iconColor: 'text-purple-500',
        type: 'email',
      },
      {
        key: 'careersEmail',
        label: 'Careers Email',
        placeholder: 'careers@burqahijab.shop',
        description: 'Email for job applications and career-related inquiries.',
        icon: Mail,
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-500',
        type: 'email',
      },
    ],
  },
  {
    title: 'Store Location & Hours',
    description: 'Physical store address and operating hours displayed in the footer.',
    icon: MapPin,
    iconColor: 'text-[#d79c4a]',
    fields: [
      {
        key: 'storeAddress',
        label: 'Full Store Address',
        placeholder: 'Block 9, Clifton, Karachi, Pakistan',
        description: 'Complete street address shown on the Contact page and footer.',
        icon: MapPin,
        iconBg: 'bg-red-500/10',
        iconColor: 'text-red-500',
      },
      {
        key: 'storeAddressShort',
        label: 'Short Address',
        placeholder: 'Karachi, Pakistan',
        description: 'Abbreviated address for compact display areas like the footer.',
        icon: MapPin,
        iconBg: 'bg-orange-500/10',
        iconColor: 'text-orange-500',
      },
      {
        key: 'businessHours',
        label: 'Business Hours',
        placeholder: 'Monday – Saturday, 10:00 AM – 8:00 PM PKT',
        description: 'Operating hours shown in the footer and Contact page.',
        icon: Clock,
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
      },
    ],
  },
  {
    title: 'Social Media Links',
    description: 'Connect your social profiles. Leave blank to hide a platform from the footer.',
    icon: Link2,
    iconColor: 'text-[#d79c4a]',
    fields: [
      {
        key: 'instagramUrl',
        label: 'Instagram',
        placeholder: 'https://instagram.com/burqahijab',
        prefix: 'https://instagram.com/',
        description: 'Your Instagram profile or business page URL.',
        icon: Instagram,
        iconBg: 'bg-pink-500/10',
        iconColor: 'text-pink-500',
      },
      {
        key: 'facebookUrl',
        label: 'Facebook',
        placeholder: 'https://facebook.com/burqahijab',
        prefix: 'https://facebook.com/',
        description: 'Your Facebook page URL.',
        icon: Facebook,
        iconBg: 'bg-blue-600/10',
        iconColor: 'text-blue-600',
      },
      {
        key: 'tiktokUrl',
        label: 'TikTok',
        placeholder: 'https://tiktok.com/@burqahijab',
        prefix: 'https://tiktok.com/@',
        description: 'Your TikTok profile URL.',
        icon: Globe,
        iconBg: 'bg-gray-800/10',
        iconColor: 'text-gray-800 dark:text-gray-200',
      },
      {
        key: 'twitterUrl',
        label: 'Twitter / X',
        placeholder: 'https://twitter.com/burqahijab',
        prefix: 'https://twitter.com/',
        description: 'Your Twitter or X profile URL.',
        icon: Twitter,
        iconBg: 'bg-sky-500/10',
        iconColor: 'text-sky-500',
      },
      {
        key: 'youtubeUrl',
        label: 'YouTube',
        placeholder: 'https://youtube.com/@burqahijab',
        prefix: 'https://youtube.com/@',
        description: 'Your YouTube channel URL.',
        icon: Youtube,
        iconBg: 'bg-red-600/10',
        iconColor: 'text-red-600',
      },
    ],
  },
  {
    title: 'WhatsApp',
    description: 'Set up a WhatsApp direct message link for customers.',
    icon: MessageCircle,
    iconColor: 'text-[#d79c4a]',
    fields: [
      {
        key: 'whatsappNumber',
        label: 'WhatsApp Number',
        placeholder: '+92 300 1234567',
        description: 'Include country code. Used for the floating WhatsApp chat button.',
        icon: Phone,
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-500',
      },
      {
        key: 'whatsappMessage',
        label: 'Default Message',
        placeholder: "Hi! I'm interested in a product from BurqaHijab.shop",
        description: 'Pre-filled message when customers tap the WhatsApp link.',
        icon: MessageCircle,
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-500',
      },
    ],
  },
  {
    title: 'Shipping Settings',
    description: 'Configure shipping costs, free shipping thresholds, and delivery estimates.',
    icon: Truck,
    iconColor: 'text-[#d79c4a]',
    fields: [
      {
        key: 'freeShippingThreshold',
        label: 'Free Shipping Threshold (PKR)',
        placeholder: '3000',
        description: 'Orders above this amount qualify for free domestic shipping.',
        icon: Shield,
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-500',
        type: 'number',
      },
      {
        key: 'shippingCostDomestic',
        label: 'Domestic Shipping Cost (PKR)',
        placeholder: '250',
        description: 'Standard domestic shipping fee for orders below the threshold.',
        icon: Truck,
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
        type: 'number',
      },
      {
        key: 'shippingCostExpress',
        label: 'Express Shipping Cost (PKR)',
        placeholder: '450',
        description: 'Express / overnight shipping fee within Pakistan.',
        icon: Truck,
        iconBg: 'bg-purple-500/10',
        iconColor: 'text-purple-500',
        type: 'number',
      },
      {
        key: 'domesticDeliveryDays',
        label: 'Domestic Delivery Estimate',
        placeholder: '3-5',
        description: 'Expected delivery window for domestic orders (e.g., "3-5" days).',
        icon: Clock,
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-500',
      },
      {
        key: 'internationalDeliveryDays',
        label: 'International Delivery Estimate',
        placeholder: '7-14',
        description: 'Expected delivery window for international orders (e.g., "7-14" days).',
        icon: Clock,
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-500',
      },
      {
        key: 'freeShippingInternational',
        label: 'International Free Shipping Threshold (PKR)',
        placeholder: '250',
        description: 'Orders above this amount qualify for free international shipping.',
        icon: Globe,
        iconBg: 'bg-sky-500/10',
        iconColor: 'text-sky-500',
        type: 'number',
      },
    ],
  },
  {
    title: 'Return Policy',
    description: 'Configure return window and refund processing times.',
    icon: RotateCcw,
    iconColor: 'text-[#d79c4a]',
    fields: [
      {
        key: 'returnWindowDays',
        label: 'Return Window (Days)',
        placeholder: '14',
        description: 'Number of days a customer has to initiate a return after delivery.',
        icon: RotateCcw,
        iconBg: 'bg-orange-500/10',
        iconColor: 'text-orange-500',
        type: 'number',
      },
      {
        key: 'refundDaysJazzCash',
        label: 'JazzCash Refund Timeline',
        placeholder: '3-5',
        description: 'Expected number of days for JazzCash refunds to process.',
        icon: CreditCard,
        iconBg: 'bg-red-500/10',
        iconColor: 'text-red-500',
      },
      {
        key: 'refundDaysBank',
        label: 'Bank Transfer Refund Timeline',
        placeholder: '3-5',
        description: 'Expected number of days for bank transfer refunds to process.',
        icon: CreditCard,
        iconBg: 'bg-blue-600/10',
        iconColor: 'text-blue-600',
      },
    ],
  },
];

// ─── Loading Skeleton ────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Section skeletons */}
      {Array.from({ length: 3 }).map((_, si) => (
        <div key={si} className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-72" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: si === 0 ? 4 : si === 1 ? 3 : 2 }).map((_, fi) => (
              <Skeleton key={fi} className="h-[88px] w-full rounded-xl" />
            ))}
          </div>
        </div>
      ))}

      {/* Save button skeleton */}
      <div className="flex justify-end pt-4">
        <Skeleton className="h-10 w-[140px]" />
      </div>
    </div>
  );
}

// ─── Field Card ──────────────────────────────────────────────────────

function FieldCard({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  onChange: (key: keyof StoreSettings, value: string) => void;
}) {
  const Icon = field.icon;

  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-[#d79c4a]/20">
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${field.iconBg || 'bg-muted'}`}
      >
        <Icon className={`h-4 w-4 ${field.iconColor || 'text-muted-foreground'}`} />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <Label className="text-sm font-medium text-foreground">
          {field.label}
        </Label>
        <Input
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          type={field.type || 'text'}
          className="border-border bg-background text-sm"
        />
        <p className="text-[11px] text-muted-foreground">
          {field.description}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export function AdminSettings() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
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

  const updateField = (key: keyof StoreSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

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

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Store Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your store information, shipping policies, and contact details. Changes appear instantly on the storefront.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {sections.map((section, sectionIdx) => {
          const SectionIcon = section.icon;

          return (
            <div key={section.title}>
              {/* Section header */}
              <div className="space-y-1 mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <SectionIcon className={`h-4 w-4 ${section.iconColor || 'text-[#d79c4a]'}`} />
                  {section.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {section.description}
                </p>
              </div>

              {/* Section fields */}
              <div className="space-y-3">
                {section.fields.map((field) => (
                  <FieldCard
                    key={field.key}
                    field={field}
                    value={(settings as Record<string, string>)[field.key] || ''}
                    onChange={updateField}
                  />
                ))}
              </div>

              {/* Separator between sections (not after last) */}
              {sectionIdx < sections.length - 1 && (
                <Separator className="mt-8 bg-border" />
              )}
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 pb-2">
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
