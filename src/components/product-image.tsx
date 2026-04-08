'use client';

import { useState, useRef } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Robust product image component with:
 * - Loading state with spinner
 * - Automatic retry on error (up to 2 retries)
 * - Graceful fallback with placeholder
 * - Cache-busting on retry to avoid stale browser cache
 */
export function ProductImage({
  src,
  alt,
  className,
  fallbackClassName,
  retryCount = 2,
  retryDelay = 1000,
}: ProductImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [prevSrc, setPrevSrc] = useState(src);
  const [retryGeneration, setRetryGeneration] = useState(0);
  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when src prop changes (synchronous during render — React-recommended pattern)
  if (prevSrc !== src) {
    setPrevSrc(src);
    setStatus('loading');
    setCurrentSrc(src);
    setRetryAttempt(0);
    setRetryGeneration((g) => g + 1);
  }

  const handleError = () => {
    if (retryAttempt < retryCount) {
      // Retry with cache-busting
      const nextAttempt = retryAttempt + 1;
      setRetryAttempt(nextAttempt);
      const separator = src.includes('?') ? '&' : '?';
      const newSrc = `${src}${separator}_retry=${nextAttempt}&t=${Date.now()}`;
      timerIdRef.current = setTimeout(() => {
        setCurrentSrc(newSrc);
        setStatus('loading');
      }, retryDelay);
    } else {
      setStatus('error');
    }
  };

  if (status === 'error' || !src) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100 dark:bg-[#141414]', fallbackClassName)}>
        <div className="flex flex-col items-center gap-1">
          <ImageOff className="h-6 w-6 text-gray-300 dark:text-gray-600" />
          <span className="text-[9px] text-gray-400 dark:text-gray-600">No Image</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" key={retryGeneration}>
      {status === 'loading' && (
        <div className={cn('absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-[#141414] z-10', fallbackClassName)}>
          <Loader2 className="h-5 w-5 text-[#d79c4a] animate-spin" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={cn(status === 'loading' ? 'invisible' : 'visible', className)}
        loading="lazy"
        onLoad={() => setStatus('loaded')}
        onError={handleError}
      />
    </div>
  );
}
