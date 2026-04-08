'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useStoreSettings } from '@/stores/store-settings-store';

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const { announcementDismissed, dismissAnnouncement } = useUIStore();
  const { settings, fetch } = useStoreSettings();

  const messages = useMemo(() => [settings.announcementMessage], [settings.announcementMessage]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    dismissAnnouncement();
    try {
      localStorage.setItem(
        'announcement-dismissed',
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      );
    } catch {
      // localStorage not available
    }
  }, [dismissAnnouncement]);

  useEffect(() => {
    try {
      const dismissedUntil = localStorage.getItem('announcement-dismissed');
      if (dismissedUntil) {
        const until = new Date(dismissedUntil);
        if (new Date() < until) {
          dismissAnnouncement();
          return;
        }
      }
    } catch {
      // localStorage not available
    }
  }, [dismissAnnouncement]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  if (announcementDismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 32, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative flex items-center justify-center overflow-hidden bg-[#1a1a1a] dark:bg-[#1a1a1a]"
          style={{ height: 32 }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center px-8 text-center text-[11px] sm:text-xs font-medium tracking-wide text-white/80"
            >
              {messages[currentIndex]}
            </motion.p>
          </AnimatePresence>

          <button
            onClick={handleDismiss}
            className="absolute right-2 flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            aria-label="Dismiss announcement"
          >
            <X className="h-3 w-3 text-white/60" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
