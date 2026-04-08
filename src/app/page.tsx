'use client';

import { useEffect, useRef } from 'react';
import { AnnouncementBar } from '@/components/announcement-bar';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { TrustSignals } from '@/components/trust-signals';
import { CollectionsGrid } from '@/components/collections-grid';
import { NewArrivals } from '@/components/new-arrivals';
import { TestimonialsSection } from '@/components/testimonials-section';
import { NewsletterSection } from '@/components/newsletter-section';
import { InstagramFeed } from '@/components/instagram-feed';
import { Footer } from '@/components/footer';
import { MobileNav } from '@/components/mobile-nav';
import { CartDrawer } from '@/components/cart-drawer';
import { ProductDetail } from '@/components/product-detail';
import { ShopPage } from '@/components/shop-page';
import { SearchDialog } from '@/components/search-dialog';
import { FaqPage } from '@/components/pages/faq-page';
import { SizeGuidePage } from '@/components/pages/size-guide-page';
import { ShippingPage } from '@/components/pages/shipping-page';
import { ReturnsPage } from '@/components/pages/returns-page';
import { ContactPage } from '@/components/pages/contact-page';
import { AboutPage } from '@/components/pages/about-page';
import { BrandStoryPage } from '@/components/pages/brand-story-page';
import { CareersPage } from '@/components/pages/careers-page';
import { WishlistPage } from '@/components/pages/wishlist-page';
import { CheckoutPage } from '@/components/checkout-page';
import { useUIStore } from '@/stores/ui-store';
import { useProductStore } from '@/stores/product-store';
import { useStoreSettings } from '@/stores/store-settings-store';

const contentPages = [
  'faq',
  'size-guide',
  'shipping',
  'returns',
  'contact',
  'about',
  'brand-story-page',
  'careers',
] as const;

function ContentPageRenderer({ view }: { view: (typeof contentPages)[number] }) {
  switch (view) {
    case 'faq':
      return <FaqPage />;
    case 'size-guide':
      return <SizeGuidePage />;
    case 'shipping':
      return <ShippingPage />;
    case 'returns':
      return <ReturnsPage />;
    case 'contact':
      return <ContactPage />;
    case 'about':
      return <AboutPage />;
    case 'brand-story-page':
      return <BrandStoryPage />;
    case 'careers':
      return <CareersPage />;
  }
}

const PAGE_TITLES: Record<string, string> = {
  home: 'BurqaHijab — Where Modesty Meets Luxury',
  shop: 'Shop All Products | BurqaHijab',
  wishlist: 'My Wishlist | BurqaHijab',
  checkout: 'Checkout | BurqaHijab',
  faq: 'FAQ | BurqaHijab',
  'size-guide': 'Size Guide | BurqaHijab',
  shipping: 'Shipping & Delivery | BurqaHijab',
  returns: 'Returns & Exchanges | BurqaHijab',
  contact: 'Contact Us | BurqaHijab',
  about: 'About Us | BurqaHijab',
  'brand-story-page': 'Brand Story | BurqaHijab',
  careers: 'Careers | BurqaHijab',
};

const DEFAULT_TITLE = 'BurqaHijab — Where Modesty Meets Luxury';

export default function Home() {
  const viewMode = useUIStore((s) => s.viewMode);
  const selectedProduct = useUIStore((s) => s.selectedProduct);

  // Dynamic page title
  useEffect(() => {
    if (viewMode === 'product' && selectedProduct) {
      document.title = `${selectedProduct.name} | BurqaHijab`;
    } else {
      document.title = PAGE_TITLES[viewMode] || DEFAULT_TITLE;
    }
  }, [viewMode, selectedProduct]);

  // Invalidate product & settings store cache when leaving pages (data may have changed in admin)
  const invalidateProductStore = useProductStore((s) => s.invalidate);
  const invalidateSettingsStore = useStoreSettings((s) => s.invalidate);
  const prevViewModeRef = useRef<string | null>(null);
  
  useEffect(() => {
    // If we were just away from the page, refresh data
    if (prevViewModeRef.current !== viewMode) {
      invalidateProductStore();
      invalidateSettingsStore();
    }
    prevViewModeRef.current = viewMode;
  }, [viewMode, invalidateProductStore, invalidateSettingsStore]);

  const isContentPage = contentPages.includes(viewMode as (typeof contentPages)[number]);
  const isHomePage = viewMode === 'home';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0A0A]">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        {isHomePage && (
          <>
            <HeroSection />
            <TrustSignals />
            <CollectionsGrid />
            <NewArrivals />
            <TestimonialsSection />
            <NewsletterSection />
            <InstagramFeed />
          </>
        )}
        {viewMode === 'shop' && <ShopPage />}
        {viewMode === 'product' && <ProductDetail />}
        {viewMode === 'wishlist' && <WishlistPage />}
        {viewMode === 'checkout' && <CheckoutPage />}
        {isContentPage && (
          <ContentPageRenderer view={viewMode as (typeof contentPages)[number]} />
        )}
      </main>
      {viewMode !== 'product' && viewMode !== 'checkout' && <Footer />}
      {viewMode !== 'checkout' && <MobileNav />}
      <CartDrawer />
      <SearchDialog />
    </div>
  );
}
