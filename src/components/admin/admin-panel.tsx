'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  FolderTree,
  MessageSquareQuote,
  ArrowLeft,
  Menu,
  X,
  Store,
  LogOut,
  KeyRound,
  Sparkles,
  Settings,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { onAdminAuthExpired } from '@/lib/admin-fetch';
import type { AdminSection } from '@/types';
import { AdminDashboard } from './admin-dashboard';
import { AdminOrders } from './admin-orders';
import { AdminProducts } from './admin-products';
import { AdminCollections } from './admin-collections';
import { AdminCategories } from './admin-categories';
import { AdminTestimonials } from './admin-testimonials';
import { AdminStorefront } from './admin-storefront';
import { AdminSettings } from './admin-settings';
import { AdminLogin } from './admin-login';

const navItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingCart className="h-5 w-5" /> },
  { id: 'products', label: 'Products', icon: <Package className="h-5 w-5" /> },
  { id: 'collections', label: 'Collections', icon: <Layers className="h-5 w-5" /> },
  { id: 'categories', label: 'Categories', icon: <FolderTree className="h-5 w-5" /> },
  { id: 'testimonials', label: 'Testimonials', icon: <MessageSquareQuote className="h-5 w-5" /> },
  { id: 'storefront', label: 'Storefront', icon: <Sparkles className="h-5 w-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

export function AdminPanel() {
  const { adminSection, setAdminSection, navigateHome } = useUIStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('bhq-admin-auth') === 'true';
    }
    return false;
  });
  const [checking, setChecking] = useState(false);

  // Validate session on mount — if server session expired, force re-login
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const res = await fetch('/api/admin/auth');
        if (!res.ok) {
          // Session expired — clear client state and show login
          sessionStorage.removeItem('bhq-admin-auth');
          setIsAuthenticated(false);
        }
      } catch {
        // Network error — keep current state, don't force logout
      }
    })();
  }, [isAuthenticated]);

  // Listen for auth-expired events from admin sub-components
  useEffect(() => {
    return onAdminAuthExpired(() => {
      sessionStorage.removeItem('bhq-admin-auth');
      setIsAuthenticated(false);
    });
  }, []);

  // Change password dialog
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [changePwLoading, setChangePwLoading] = useState(false);
  const [changePwError, setChangePwError] = useState('');
  const [changePwSuccess, setChangePwSuccess] = useState(false);

  // Listen for keyboard shortcut Ctrl+Shift+A to open admin (when on home page)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        // Only works if already on admin page — this is handled by ui-store
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleChangePassword = async () => {
    setChangePwError('');
    setChangePwSuccess(false);

    if (!currentPw.trim() || !newPw.trim() || !confirmPw.trim()) {
      setChangePwError('All fields are required');
      return;
    }
    if (newPw.length < 8) {
      setChangePwError('New password must be at least 8 characters');
      return;
    }
    if (newPw !== confirmPw) {
      setChangePwError('New passwords do not match');
      return;
    }

    setChangePwLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setChangePwSuccess(true);
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
        setTimeout(() => { setChangePwOpen(false); setChangePwSuccess(false); }, 2000);
      } else {
        setChangePwError(data.error || 'Failed to change password.');
      }
    } catch {
      setChangePwError('Connection error.');
    } finally {
      setChangePwLoading(false);
    }
  };

  const openChangePw = () => {
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setChangePwError('');
    setChangePwSuccess(false);
    setChangePwOpen(true);
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('bhq-admin-auth');
    setIsAuthenticated(false);
    // Clear the server-side session cookie
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // Ignore errors - session will expire server-side anyway
    }
    navigateHome();
  };

  // Show loading while checking auth
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground text-sm"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onSuccess={handleLoginSuccess} />;
  }

  const handleNavClick = (section: AdminSection) => {
    setAdminSection(section);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (adminSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'orders':
        return <AdminOrders />;
      case 'products':
        return <AdminProducts />;
      case 'collections':
        return <AdminCollections />;
      case 'categories':
        return <AdminCategories />;
      case 'testimonials':
        return <AdminTestimonials />;
      case 'storefront':
        return <AdminStorefront />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  const currentLabel = navItems.find((n) => n.id === adminSection)?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 border-r border-border bg-card transition-transform duration-300 md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d79c4a]/10">
              <Store className="h-4 w-4 text-[#d79c4a]" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-wide text-foreground">
                Admin Panel
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator />

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-left',
                adminSection === item.id
                  ? 'bg-[#d79c4a]/10 text-[#d79c4a] shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <Separator />

        <div className="p-3 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={navigateHome}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={openChangePw}
          >
            <KeyRound className="h-4 w-4" />
            Change Password
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3 flex-1">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              {currentLabel}
            </h1>
            <div className="hidden sm:block h-5 w-px bg-border" />
            <span className="hidden sm:block text-xs text-muted-foreground">
              BurqaHijab.shop
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </header>

        {/* Page content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={adminSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-4 md:p-6"
          >
            {renderContent()}
          </motion.main>
        </AnimatePresence>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={changePwOpen} onOpenChange={setChangePwOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-[#d79c4a]" />
              Change Admin Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="currentPw">Current Password</Label>
              <Input
                id="currentPw"
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                className="border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPw">New Password</Label>
              <Input
                id="newPw"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Enter new password (min 8 chars)"
                className="border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPw">Confirm New Password</Label>
              <Input
                id="confirmPw"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
                className="border-border bg-background"
              />
            </div>

            {changePwError && (
              <p className="text-sm text-destructive">{changePwError}</p>
            )}
            {changePwSuccess && (
              <p className="text-sm text-emerald-500 font-medium">Password changed successfully!</p>
            )}

            <Button
              onClick={handleChangePassword}
              disabled={changePwLoading}
              className="w-full bg-[#d79c4a] text-[#0A0A0A] hover:bg-[#d79c4a]/90 h-11"
            >
              {changePwLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
