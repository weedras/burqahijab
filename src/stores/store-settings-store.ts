'use client';

import { create } from 'zustand';

export interface StoreSettings {
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

export const DEFAULT_SETTINGS: StoreSettings = {
  facebookUrl: '',
  instagramUrl: 'https://instagram.com/burqahijab',
  tiktokUrl: '',
  twitterUrl: '',
  youtubeUrl: '',
  whatsappNumber: '',
  whatsappMessage: '',
  phoneNumber: '+92 300 1234567',
  supportEmail: 'support@burqahijab.shop',
  contactEmail: 'hello@burqahijab.shop',
  careersEmail: 'careers@burqahijab.shop',
  storeName: 'BurqaHijab',
  storeTagline: 'Where Modesty Meets Luxury',
  storeAddress: 'Block 9, Clifton, Karachi, Pakistan',
  storeAddressShort: 'Karachi, Pakistan',
  businessHours: 'Monday – Saturday, 10:00 AM – 8:00 PM PKT',
  copyrightText: '© 2026 BurqaHijab. All rights reserved.',
  announcementMessage: 'Free shipping on orders above PKR 3,000!',
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

interface StoreSettingsState {
  settings: StoreSettings;
  loaded: boolean;
  fetch: () => Promise<void>;
  invalidate: () => void;
}

export const useStoreSettings = create<StoreSettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  fetch: async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        set({ settings: { ...DEFAULT_SETTINGS, ...data }, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  invalidate: () => {
    const { loaded } = get();
    if (!loaded) return; // Don't re-fetch if already loading
    set({ loaded: false });
    get().fetch();
  },
}));
