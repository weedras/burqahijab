'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingCart,
  Menu,
  Sun,
  Moon,
  ChevronDown,
  X,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useCartStore, getCartTotalItems } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

const mainNavLinks = [
  { label: 'Home', action: 'home' as const },
  { label: 'Shop', action: 'shop' as const },
  { label: 'Categories', action: 'category' as const, slug: 'abayas' },
  { label: 'New Arrivals', action: 'collection' as const, slug: 'new-arrivals' },
  { label: 'About', action: 'about' as const },
  { label: 'Contact', action: 'contact' as const },
];

const helpLinks = [
  { label: 'FAQ', action: 'faq' as const },
  { label: 'Size Guide', action: 'size-guide' as const },
  { label: 'Shipping', action: 'shipping' as const },
  { label: 'Returns', action: 'returns' as const },
];

const categoryLinks = [
  { label: 'Hijabs', action: 'category' as const, slug: 'hijabs' },
  { label: 'Abayas', action: 'category' as const, slug: 'abayas' },
  { label: 'Burqas', action: 'category' as const, slug: 'abayas' },
  { label: 'Accessories', action: 'category' as const, slug: 'accessories' },
];

const aboutLinks = [
  { label: 'About Us', action: 'about' as const },
  { label: 'Brand Story', action: 'brand-story' as const },
  { label: 'Careers', action: 'careers' as const },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const cartItems = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const wishlistItems = useWishlistStore((s) => s.items);
  const {
    setViewMode,
    toggleSearch,
    navigateHome,
    navigateToShop,
    navigateToFaq,
    navigateToSizeGuide,
    navigateToShipping,
    navigateToReturns,
    navigateToContact,
    navigateToAbout,
    navigateToBrandStory,
    navigateToCareers,
  } = useUIStore();

  const totalItems = useMemo(() => getCartTotalItems(cartItems), [cartItems]);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleNavClick = (link: { action: string; slug?: string }) => {
    setMobileOpen(false);
    switch (link.action) {
      case 'home':
        navigateHome();
        break;
      case 'shop':
        navigateToShop();
        break;
      case 'category':
        navigateToShop(link.slug);
        break;
      case 'collection':
        navigateToShop(undefined, link.slug);
        break;
      case 'faq':
        navigateToFaq();
        break;
      case 'size-guide':
        navigateToSizeGuide();
        break;
      case 'shipping':
        navigateToShipping();
        break;
      case 'returns':
        navigateToReturns();
        break;
      case 'contact':
        navigateToContact();
        break;
      case 'about':
        navigateToAbout();
        break;
      case 'brand-story':
        navigateToBrandStory();
        break;
      case 'careers':
        navigateToCareers();
        break;
    }
  };

  const isHomePage = useUIStore((s) => s.viewMode) === 'home';
  const isTransparent = isHomePage && !scrolled;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isTransparent
          ? 'bg-transparent py-2 sm:py-5'
          : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:bg-[#0A0A0A]/95 dark:border-gray-800'
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-16">
          {/* Left: Logo */}
          <button
            onClick={navigateHome}
            className="flex items-center transition-opacity hover:opacity-80 shrink-0"
          >
            <Image
              src="/logo-web.png"
              alt="BurqaHijab"
              className="h-8 w-auto object-contain transition-all duration-300 sm:h-11"
              width={300}
              height={376}
              priority
            />
          </button>

          {/* Center: Nav Links (desktop) */}
          <nav className="hidden lg:flex items-center space-x-8">
            {mainNavLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className={cn(
                  'text-sm uppercase tracking-wider font-medium link-underline pb-1 transition-colors duration-300',
                  isTransparent
                    ? 'text-white hover:text-[#d79c4a]'
                    : 'text-gray-700 hover:text-[#d79c4a] dark:text-gray-200 dark:hover:text-[#d79c4a]'
                )}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1.5">
            <button
              onClick={toggleSearch}
              className={cn(
                'p-1.5 sm:p-2 transition-colors duration-300',
                isTransparent
                  ? 'text-white hover:text-[#d79c4a]'
                  : 'text-gray-700 hover:text-[#d79c4a] dark:text-gray-200'
              )}
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
            </button>

            <button
              className={cn(
                'hidden sm:block p-2 transition-colors duration-300',
                isTransparent
                  ? 'text-white hover:text-[#d79c4a]'
                  : 'text-gray-700 hover:text-[#d79c4a] dark:text-gray-200'
              )}
              onClick={() => setViewMode('wishlist')}
              aria-label="Wishlist"
            >
              <Heart className={cn('w-5 h-5', wishlistCount > 0 && 'fill-red-500 text-red-500')} />
            </button>

            {/* Account dropdown (desktop only) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'hidden md:flex p-2 transition-colors duration-300',
                    isTransparent
                      ? 'text-white hover:text-[#d79c4a]'
                      : 'text-gray-700 hover:text-[#d79c4a] dark:text-gray-200'
                  )}
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleNavClick({ action: 'faq' })}>
                  FAQ & Help
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavClick({ action: 'shipping' })}>
                  Track Order
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavClick({ action: 'returns' })}>
                  Returns & Exchanges
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavClick({ action: 'size-guide' })}>
                  Size Guide
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              className={cn(
                'p-1.5 sm:p-2 relative transition-colors duration-300',
                isTransparent
                  ? 'text-white hover:text-[#d79c4a]'
                  : 'text-gray-700 hover:text-[#d79c4a] dark:text-gray-200'
              )}
              onClick={openCart}
              aria-label="Cart"
            >
              <ShoppingCart className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#d79c4a] px-0.5 text-[9px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  'p-1.5 sm:p-2 transition-colors duration-300',
                  isTransparent
                    ? 'text-white hover:text-[#d79c4a]'
                    : 'text-gray-700 hover:text-[#d79c4a] dark:text-gray-200'
                )}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-[18px] h-[18px] sm:w-5 sm:h-5" /> : <Moon className="w-[18px] h-[18px] sm:w-5 sm:h-5" />}
              </button>
            )}

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className={cn(
                    'lg:hidden p-1.5 sm:p-2 transition-colors duration-300',
                    isTransparent
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-200'
                  )}
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-white dark:bg-[#0A0A0A] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Image src="/logo-web.png" alt="BurqaHijab" width={300} height={376} className="h-9 w-auto object-contain" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">BurqaHijab</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {mainNavLinks.map((link, i) => (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link)}
                      className="rounded-lg px-4 py-3 text-left text-base font-medium text-gray-900 dark:text-gray-100 transition-colors hover:bg-gray-100 hover:text-[#d79c4a] dark:hover:bg-gray-800"
                    >
                      {link.label}
                    </button>
                  ))}

                  <Separator className="my-3" />

                  <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Categories
                  </p>
                  {categoryLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link)}
                      className="rounded-lg px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 hover:text-[#d79c4a] dark:hover:bg-gray-800"
                    >
                      {link.label}
                    </button>
                  ))}

                  <Separator className="my-3" />

                  <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Help
                  </p>
                  {helpLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link)}
                      className="rounded-lg px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 hover:text-[#d79c4a] dark:hover:bg-gray-800"
                    >
                      {link.label}
                    </button>
                  ))}

                  <Separator className="my-3" />

                  <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    About
                  </p>
                  {aboutLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link)}
                      className="rounded-lg px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 hover:text-[#d79c4a] dark:hover:bg-gray-800"
                    >
                      {link.label}
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
