'use client';

import { Home, ShoppingBag, Search, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';

const navItems = [
  { label: 'Home', icon: Home, view: 'home' as const },
  { label: 'Shop', icon: ShoppingBag, view: 'shop' as const },
  { label: 'Search', icon: Search, action: 'search' as const },
  { label: 'Wishlist', icon: Heart, action: 'wishlist' as const },
  { label: 'Account', icon: User, action: 'account' as const },
];

export function MobileNav() {
  const { viewMode, setViewMode, toggleSearch, navigateHome } = useUIStore();

  const handleClick = (item: (typeof navItems)[number]) => {
    if (item.action === 'search') {
      toggleSearch();
    } else if (item.action === 'account') {
      // Account not implemented yet — could navigate to profile
      return;
    } else if (item.action === 'wishlist') {
      setViewMode('wishlist');
      return;
    } else if (item.view === 'home') {
      navigateHome();
    } else {
      setViewMode(item.view);
    }
  };

  const isActive = (item: (typeof navItems)[number]) => {
    if (item.action === 'search') return false;
    if (item.action === 'account') return false;
    if (item.action === 'wishlist') return viewMode === 'wishlist';
    return viewMode === item.view;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-xl dark:border-gray-800 dark:bg-[#0A0A0A]/95 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-14 items-center justify-around px-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleClick(item)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 transition-colors"
          >
            <item.icon
              className={cn(
                'h-5 w-5 transition-colors',
                isActive(item) ? 'text-[#d79c4a]' : 'text-gray-500 dark:text-gray-400'
              )}
            />
            <span
              className={cn(
                'text-[10px] font-medium transition-colors',
                isActive(item) ? 'text-[#d79c4a]' : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
