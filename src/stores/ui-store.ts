import { create } from 'zustand';
import type { ViewMode, Product, AdminSection } from '@/types';

interface UIState {
  viewMode: ViewMode;
  selectedProduct: Product | null;
  selectedCategory: string | null;
  selectedCollection: string | null;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  announcementDismissed: boolean;
  adminSection: AdminSection;
  setViewMode: (mode: ViewMode) => void;
  setSelectedProduct: (product: Product | null) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedCollection: (collection: string | null) => void;
  toggleSearch: () => void;
  toggleMobileMenu: () => void;
  dismissAnnouncement: () => void;
  navigateToProduct: (product: Product) => void;
  navigateToShop: (category?: string, collection?: string) => void;
  navigateHome: () => void;
  navigateToAdmin: (section?: AdminSection) => void;
  setAdminSection: (section: AdminSection) => void;
  navigateToFaq: () => void;
  navigateToSizeGuide: () => void;
  navigateToShipping: () => void;
  navigateToReturns: () => void;
  navigateToContact: () => void;
  navigateToAbout: () => void;
  navigateToBrandStory: () => void;
  navigateToCareers: () => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  viewMode: 'home',
  selectedProduct: null,
  selectedCategory: null,
  selectedCollection: null,
  searchOpen: false,
  mobileMenuOpen: false,
  announcementDismissed: false,
  adminSection: 'dashboard',

  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedCollection: (collection) => set({ selectedCollection: collection }),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  dismissAnnouncement: () => set({ announcementDismissed: true }),
  setAdminSection: (section) => set({ adminSection: section }),

  navigateToProduct: (product) => {
    set({ selectedProduct: product, viewMode: 'product' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  navigateToShop: (category, collection) => {
    set({
      viewMode: 'shop',
      selectedCategory: category ?? null,
      selectedCollection: collection ?? null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  navigateHome: () => {
    set({ viewMode: 'home', selectedProduct: null, selectedCategory: null, selectedCollection: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  navigateToAdmin: (section) => {
    set({
      viewMode: 'admin',
      adminSection: section ?? 'dashboard',
      selectedProduct: null,
      selectedCategory: null,
      selectedCollection: null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  navigateToFaq: () => {
    set({ viewMode: 'faq', selectedProduct: null, selectedCategory: null, selectedCollection: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  navigateToSizeGuide: () => {
    set({ viewMode: 'size-guide', selectedProduct: null, selectedCategory: null, selectedCollection: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  navigateToShipping: () => {
    set({ viewMode: 'shipping', selectedProduct: null, selectedCategory: null, selectedCollection: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  navigateToReturns: () => {
    set({ viewMode: 'returns', selectedProduct: null, selectedCategory: null, selectedCollection: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  navigateToContact: () => {
    set({ viewMode: 'contact', selectedProduct: null, selectedCategory: null, selectedCollection: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  navigateToAbout: () => {
    set({ viewMode: 'about', selectedProduct: null, selectedCategory: null, selectedCollection: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  navigateToBrandStory: () => {
    set({ viewMode: 'brand-story-page', selectedProduct: null, selectedCategory: null, selectedCollection: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  navigateToCareers: () => {
    set({ viewMode: 'careers', selectedProduct: null, selectedCategory: null, selectedCollection: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
}));
