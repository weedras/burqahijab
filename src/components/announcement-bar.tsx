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

  const messages = useMemo(() => {
    const msgs: string[] = [];
    if (settings.announcementMessage) msgs.push(settings.announcementMessage);
    if (settings.phoneNumber) msgs.push(`📞 ${settings.phoneNumber}`);
    if (settings.whatsappNumber) msgs.push(`💬 WhatsApp: ${settings.whatsappNumber}`);
    return msgs.length > 0 ? msgs : ['Welcome to BurqaHijab'];
  }, [settings.announcementMessage, settings.phoneNumber, settings.whatsappNumber]);

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
          className="relative flex items-center justify-center overflow-hidden bg-[#d79c4a] dark:bg-[#b8862e]"
          style={{ height: 32 }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center px-8 text-center text-xs font-medium tracking-wide text-white"
            >
              {messages[currentIndex]}
            </motion.p>
          </AnimatePresence>

          <button
            onClick={handleDismiss}
            className="absolute right-0 top-0 flex h-full w-10 items-center justify-center transition-colors hover:bg-white/20 active:bg-white/30"
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
