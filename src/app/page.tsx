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
import { AdminPanel } from '@/components/admin/admin-panel';
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
  home: 'BurqaHijab.shop — Where Modesty Meets Luxury',
  shop: 'Shop All Products | BurqaHijab.shop',
  wishlist: 'My Wishlist | BurqaHijab.shop',
  checkout: 'Checkout | BurqaHijab.shop',
  faq: 'FAQ | BurqaHijab.shop',
  'size-guide': 'Size Guide | BurqaHijab.shop',
  shipping: 'Shipping & Delivery | BurqaHijab.shop',
  returns: 'Returns & Exchanges | BurqaHijab.shop',
  contact: 'Contact Us | BurqaHijab.shop',
  about: 'About Us | BurqaHijab.shop',
  'brand-story-page': 'Brand Story | BurqaHijab.shop',
  careers: 'Careers | BurqaHijab.shop',
  admin: 'Admin Panel | BurqaHijab.shop',
};

const DEFAULT_TITLE = 'BurqaHijab.shop — Where Modesty Meets Luxury';

export default function Home() {
  const viewMode = useUIStore((s) => s.viewMode);
  const selectedProduct = useUIStore((s) => s.selectedProduct);
  const navigateToAdmin = useUIStore((s) => s.navigateToAdmin);

  // Dynamic page title
  useEffect(() => {
    if (viewMode === 'product' && selectedProduct) {
      document.title = `${selectedProduct.name} | BurqaHijab.shop`;
    } else {
      document.title = PAGE_TITLES[viewMode] || DEFAULT_TITLE;
    }
  }, [viewMode, selectedProduct]);

  // Invalidate product store cache when leaving admin (products may have changed)
  const invalidateProductStore = useProductStore((s) => s.invalidate);
  const prevViewModeRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevViewModeRef.current === 'admin' && viewMode !== 'admin') {
      invalidateProductStore();
    }
    prevViewModeRef.current = viewMode;
  }, [viewMode, invalidateProductStore]);

  // Secret keyboard shortcut to open admin: Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        navigateToAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateToAdmin]);

  const isContentPage = contentPages.includes(viewMode as (typeof contentPages)[number]);

  // Admin panel is a full-page takeover — no header/footer/nav
  if (viewMode === 'admin') {
    return <AdminPanel />;
  }

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
