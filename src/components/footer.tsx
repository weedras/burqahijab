'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
  Instagram,
  Facebook,
  ExternalLink,
  ArrowUp,
  MessageCircle,
  Twitter,
  Youtube,
  Globe,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useStoreSettings } from '@/stores/store-settings-store';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const quickLinks = [
  { label: 'Home', action: 'home' as const },
  { label: 'Shop', action: 'shop' as const },
  { label: 'About Us', action: 'about' as const },
  { label: 'Contact', action: 'contact' as const },
];

const categoryLinks = [
  { label: 'Hijabs', category: 'hijabs' },
  { label: 'Abayas', category: 'abayas' },
  { label: 'Burqas', category: 'abayas' },
  { label: 'Accessories', category: 'accessories' },
];

const customerServiceLinks = [
  { label: 'Shipping Info', action: 'shipping' as const },
  { label: 'Returns & Exchanges', action: 'returns' as const },
  { label: 'FAQ', action: 'faq' as const },
  { label: 'Size Guide', action: 'size-guide' as const },
];

const socialLinks = [
  { label: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com/burqahijab' },
  { label: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { label: 'Youtube', icon: Youtube, href: 'https://youtube.com' },
];

/* ------------------------------------------------------------------ */
/*  Payment SVG Icons (Professional)                                   */
/* ------------------------------------------------------------------ */

function VisaIcon() {
  return (
    <svg viewBox="0 0 64 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="40" rx="4" fill="#1A1F71"/>
      <path d="M25 27.5l3.2-18.5h5.1l-3.2 18.5h-5.1zm21.7-18.1c-1-.4-2.6-.8-4.6-.8-5 0-8.6 2.7-8.6 6.5 0 2.8 2.5 4.4 4.4 5.4 2 1 2.5 1.6 2.5 2.5 0 1.4-1.6 2-3.2 2-2.1 0-3.2-.3-5-1l-.7-.3-.7 4.5c1.2.6 3.5 1 5.9 1 5.4 0 8.8-2.6 8.9-6.8 0-2.2-1.3-3.9-4.2-5.3-1.7-.9-2.8-1.5-2.8-2.4 0-.8 1-1.6 2.8-1.6 1.7 0 3 .4 3.9.7l.5.2.7-4.1zm12.9-.4h-3.9c-1.2 0-2.1.4-2.7 1.6l-7.4 17.4h5.4s.9-2.5 1.1-3c.6 0 5.8 0 6.5 0 .2.7.7 3 .7 3h4.7l-4.4-18.5zm-6.3 12c.4-1.1 2-5.4 2-5.4 0 0 .4-1.1.7-1.9l.3 1.7s1 4.6 1.2 5.6h-4.2zm-26.8-12l-4.9 12.6-.5-2.6c-.9-3-3.7-6.2-6.8-7.9l4.5 16.8h5.4l8-18.9h-5.7z" fill="white"/>
      <path d="M13.8 9.4H5.3l-.1.4c6.6 1.7 10.9 5.7 12.7 10.6l-1.8-9.4c-.3-1.2-1.2-1.5-2.3-1.6z" fill="#F9A533"/>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg viewBox="0 0 64 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="40" rx="4" fill="#252525"/>
      <circle cx="24" cy="20" r="12" fill="#EB001B" opacity="0.95"/>
      <circle cx="38" cy="20" r="12" fill="#F79E1B" opacity="0.95"/>
      <path d="M31 12.5a12 12 0 0 1 0 15 12 12 0 0 1 0-15z" fill="#FF5F00"/>
      <path d="M24 9.3a12 12 0 0 1 7 3.2 12 12 0 0 0 0 15 12 12 0 0 1-7-3.2 12 12 0 0 1 0-15z" fill="#FF5F00" opacity="0.85"/>
      <path d="M38 9.3a12 12 0 0 0-7 3.2 12 12 0 0 1 0 15 12 12 0 0 0 7-3.2 12 12 0 0 0 0-15z" fill="#FF5F00" opacity="0.85"/>
    </svg>
  );
}

function PayPalIcon() {
  return (
    <svg viewBox="0 0 80 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="40" rx="4" fill="#F5F7FA"/>
      <path d="M31.5 28.2l1.6-9.5c.2-.9-.1-1.5-1.2-1.5h-3.4l-.2.2-.5 3-.2 1.1v.3c0 .6.3.9 1 .9h1.7c1.3 0 2.1-.9 2.2-2.1v-.3c0-.6-.3-.9-1-.9h-1c-.1 0-.1 0-.1-.1l.1-.7h2.2c1.4 0 2 1 1.7 2.3l-.5 3c-.3 1.5-1.4 2.3-3 2.3h-2.2c-.8 0-1.1-.5-.9-1.3l.7-4.3h3.5c.9 0 1.6.4 1.4 1.3l-.2.9" fill="#003087"/>
      <path d="M16.8 22.6h2.4c.2 0 .3-.1.3-.3l.2-.9c0-.2.1-.3.3-.3h3.4c.3 0 .4.1.3.3l-.1.6c-.1.4 0 .6.4.6h2.1c.5 0 .7-.2.8-.7l1.3-7.6c.1-.5-.1-.7-.6-.7h-2.7c-.2 0-.3.1-.3.3l-.3 1.5c0 .2-.1.3-.3.3h-3.5c-.2 0-.3-.1-.3-.3l.3-1.5c0-.2-.1-.3-.3-.3h-2.7c-.5 0-.7.2-.8.7l-1.1 6.5c-.1.5.1.7.6.7z" fill="#003087"/>
      <path d="M47.5 20.5l.5-3.1c.2-1.1-.3-1.7-1.5-1.7h-1.3c-.7 0-1.1.3-1.3.9l-2.3 6.6c-.1.2 0 .3.2.3h2.1c.3 0 .4-.1.5-.3l.5-1.7h2.1l.2 1.7c0 .2.2.3.4.3h2.3c.2 0 .3-.1.4-.3l1.3-7.6c.1-.5-.1-.7-.6-.7h-2.7c-.2 0-.3.1-.3.3l-.8 5.3z" fill="#009CDE"/>
      <path d="M39 25c-.1.6.1.9.7.9h2c.2 0 .3-.1.4-.3l.3-1.7c0-.2 0-.2-.2-.2h-1.3c-1.1 0-1.7-.5-1.5-1.6l.7-4h1.8c.2 0 .3-.1.3-.3l.3-1.8c0-.2-.1-.3-.3-.3h-1.7l.3-1.8c0-.2-.1-.3-.3-.3H37.8c-.2 0-.3.1-.3.3l-1.2 7.2c-.2 1.2.5 2 1.7 2h1z" fill="#003087"/>
      <path d="M54.2 15.7h-2.3c-.3 0-.5.2-.5.4l-1.6 8.5c0 .2.1.4.3.4h2.4c.2 0 .3-.1.3-.3l.3-1.7h2.5l-.2 1.7c0 .2.1.3.3.3h2.3c.3 0 .5-.2.5-.4l1.6-8.5c0-.2-.1-.4-.3-.4h-2.4c-.2 0-.3.1-.3.3l-.3 1.8h-2.5l.2-1.8c0-.1 0-.3-.1-.3z" fill="#009CDE"/>
      <path d="M62.8 15.7h-2.3c-.3 0-.5.2-.5.4l-1.6 8.5c0 .2.1.4.3.4h2.4c.2 0 .3-.1.3-.3l.3-1.7h2.5l-.2 1.7c0 .2.1.3.3.3h2.3c.3 0 .5-.2.5-.4l.8-4.3c.2-1.1-.3-1.7-1.5-1.7H63l.2-1.8c0-.1-.1-.1-.2-.1h-.2z" fill="#009CDE"/>
    </svg>
  );
}

function JazzCashIcon() {
  return (
    <svg viewBox="0 0 88 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="88" height="40" rx="6" fill="#E4002B"/>
      <circle cx="17" cy="20" r="10" fill="white" opacity="0.15"/>
      <text x="14" y="25" fontSize="16" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fill="white" letterSpacing="0.5">J</text>
      <text x="28" y="25.5" fontSize="14" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fill="white" letterSpacing="0.3">azz</text>
      <text x="52" y="25.5" fontSize="14" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fill="white" letterSpacing="0.3">Cash</text>
    </svg>
  );
}

function EasyPaisaIcon() {
  return (
    <svg viewBox="0 0 88 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="88" height="40" rx="6" fill="#36B37E"/>
      <circle cx="17" cy="20" r="9" fill="white" opacity="0.2"/>
      <text x="11" y="24" fontSize="13" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fill="white">EP</text>
      <text x="28" y="25" fontSize="12" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fill="white" letterSpacing="0.2">Easypaisa</text>
    </svg>
  );
}

function CODIcon() {
  return (
    <svg viewBox="0 0 72 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="40" rx="6" fill="#374151"/>
      <circle cx="16" cy="20" r="8" fill="white" opacity="0.12"/>
      <text x="8" y="24" fontSize="12" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fill="white">$</text>
      <text x="28" y="24" fontSize="11" fontFamily="Arial, Helvetica, sans-serif" fontWeight="600" fill="white" letterSpacing="0.5">Cash on Delivery</text>
    </svg>
  );
}

function BankTransferIcon() {
  return (
    <svg viewBox="0 0 88 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="88" height="40" rx="6" fill="#1E3A5F"/>
      <rect x="8" y="12" width="16" height="16" rx="2" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7"/>
      <path d="M12 17h8M16 14v8M11 22h10" stroke="white" strokeWidth="1.2" opacity="0.7" strokeLinecap="round"/>
      <text x="30" y="24" fontSize="11" fontFamily="Arial, Helvetica, sans-serif" fontWeight="600" fill="white" opacity="0.9" letterSpacing="0.2">Bank Transfer</text>
    </svg>
  );
}

const paymentIcons = [
  { component: VisaIcon, label: 'Visa' },
  { component: MastercardIcon, label: 'Mastercard' },
  { component: PayPalIcon, label: 'PayPal' },
  { component: JazzCashIcon, label: 'JazzCash' },
  { component: EasyPaisaIcon, label: 'EasyPaisa' },
  { component: BankTransferIcon, label: 'Bank Transfer' },
  { component: CODIcon, label: 'Cash on Delivery' },
];

/* ------------------------------------------------------------------ */
/*  Footer Component                                                   */
/* ------------------------------------------------------------------ */

function getInstagramHandle(url: string): string {
  try {
    const pathname = new URL(url).pathname.replace(/^\//, '');
    return pathname ? `@${pathname}` : '@burqahijab';
  } catch {
    return '@burqahijab';
  }
}

export function Footer() {
  const {
    navigateToShop,
    navigateToFaq,
    navigateToSizeGuide,
    navigateToShipping,
    navigateToReturns,
    navigateToContact,
    navigateHome,
    navigateToAbout,
  } = useUIStore();
  const { settings, fetch } = useStoreSettings();

  useEffect(() => { fetch(); }, [fetch]);

  const [socialLinks, setSocialLinks] = useState<Array<{ label: string; icon: React.ComponentType<{ className?: string }>; href: string }>>([
    { label: 'Instagram', icon: Instagram, href: 'https://instagram.com/burqahijab' },
    { label: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
    { label: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { label: 'Youtube', icon: Youtube, href: 'https://youtube.com' },
  ]);

  // Fetch social links from settings API
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        const links: Array<{ label: string; icon: React.ComponentType<{ className?: string }>; href: string }> = [];
        if (data.instagramUrl) links.push({ label: 'Instagram', icon: Instagram, href: data.instagramUrl });
        if (data.facebookUrl) links.push({ label: 'Facebook', icon: Facebook, href: data.facebookUrl });
        if (data.tiktokUrl) links.push({ label: 'TikTok', icon: Globe, href: data.tiktokUrl });
        if (data.twitterUrl) links.push({ label: 'Twitter', icon: Twitter, href: data.twitterUrl });
        if (data.youtubeUrl) links.push({ label: 'Youtube', icon: Youtube, href: data.youtubeUrl });
        if (links.length > 0) setSocialLinks(links);
      })
      .catch(() => {
        // Keep defaults on error
      });
  }, []);

  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleQuickClick = (action: string) => {
    switch (action) {
      case 'home': navigateHome(); break;
      case 'shop': navigateToShop(); break;
      case 'about': navigateToAbout(); break;
      case 'contact': navigateToContact(); break;
    }
  };

  const handleCategoryClick = (category: string) => {
    navigateToShop(category);
  };

  const handleServiceClick = (action: string) => {
    switch (action) {
      case 'faq': navigateToFaq(); break;
      case 'size-guide': navigateToSizeGuide(); break;
      case 'shipping': navigateToShipping(); break;
      case 'returns': navigateToReturns(); break;
    }
  };

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className="relative bg-gray-900 dark:bg-black">
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#d79c4a] text-white shadow-lg transition-all duration-300 hover:bg-[#c48a35] hover:shadow-xl ${
          showBackToTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Column 1: Brand + Info */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Image src="/logo-web.png" alt="BurqaHijab" width={300} height={376} className="h-14 sm:h-20 w-auto object-contain mb-4 sm:mb-6" />
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              Empowering women through elegant modest fashion. Discover our curated collection of hijabs, abayas, and accessories.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>{settings.supportEmail}</p>
              <p>{settings.phoneNumber}</p>
              <p>{settings.storeAddressShort}</p>
            </div>
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 text-gray-400 transition-all hover:border-[#d79c4a] hover:text-[#d79c4a]"
                >
                  <link.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleQuickClick(link.action)}
                    className="text-sm text-gray-400 hover:text-[#d79c4a] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
              Categories
            </h3>
            <ul className="space-y-3">
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleCategoryClick(link.category)}
                    className="text-sm text-gray-400 hover:text-[#d79c4a] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Customer Service */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
              Customer Service
            </h3>
            <ul className="space-y-3">
              {customerServiceLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleServiceClick(link.action)}
                    className="text-sm text-gray-400 hover:text-[#d79c4a] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom: Payment + Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            {/* Payment Icons */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mr-1">
                Secure Payment
              </span>
              {paymentIcons.map(({ component: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center justify-center rounded opacity-90 hover:opacity-100 transition-opacity"
                  title={label}
                >
                  <Icon />
                </div>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {settings.copyrightText} Designed with &#10084; for modest fashion.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
