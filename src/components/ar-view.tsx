'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Maximize2, Download, ChevronLeft, ChevronRight, Loader2, ShieldAlert, RotateCcw, ZoomIn, ZoomOut, Move, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ARViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onProductChange?: (direction: 'prev' | 'next') => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

interface ARViewButtonProps {
  onClick: () => void;
  className?: string;
  productName?: string;
}

// ─── Camera States ────────────────────────────────────────────────────────────

type CameraState = 'initializing' | 'active' | 'denied' | 'unavailable' | 'error';

// ─── Overlay Modes ────────────────────────────────────────────────────────────

type OverlayMode = 'center' | 'draggable';

// ─── ARViewModal ──────────────────────────────────────────────────────────────

export function ARViewModal({
  isOpen,
  onClose,
  product,
  onProductChange,
  hasPrev = false,
  hasNext = false,
}: ARViewModalProps) {
  // Camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // State
  const [cameraState, setCameraState] = useState<CameraState>('initializing');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(0.85);
  const [overlayScale, setOverlayScale] = useState(1);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('center');
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const [flashEffect, setFlashEffect] = useState(false);
  const [captureFeedback, setCaptureFeedback] = useState(false);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleControlsAutoHide = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4000);
  }, []);

  const revealControls = useCallback(() => {
    setShowControls(true);
    scheduleControlsAutoHide();
  }, [scheduleControlsAutoHide]);

  // ─── Camera ──────────────────────────────────────────────────────────────

  // Trigger counter: incremented to request a new camera attempt
  const [cameraRetryCount, setCameraRetryCount] = useState(0);
  const retryCamera = useCallback(() => setCameraRetryCount((c) => c + 1), []);

  // Sync camera state to 'initializing' when modal opens or retry is triggered (during render)
  const [prevCameraTrigger, setPrevCameraTrigger] = useState<string | null>(null);
  const currentCameraTrigger = isOpen ? `open-${cameraRetryCount}` : null;
  if (currentCameraTrigger && currentCameraTrigger !== prevCameraTrigger) {
    setPrevCameraTrigger(currentCameraTrigger);
    setCameraState('initializing');
  } else if (!currentCameraTrigger && prevCameraTrigger) {
    setPrevCameraTrigger(null);
  }

  // Core camera stop logic (no setState)
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Camera init effect — setState only in async callbacks
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    scheduleControlsAutoHide();

    (async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          if (!cancelled) setCameraState('unavailable');
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if (!cancelled) setCameraState('active');
      } catch (error) {
        if (cancelled) return;
        const err = error as DOMException;
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraState('denied');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraState('unavailable');
        } else {
          setCameraState('error');
        }
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isOpen, cameraRetryCount]);

  // Reset overlay position when product changes (synchronous state adjustment during render)
  const [prevProductId, setPrevProductId] = useState<string | null>(null);
  if (product?.id && product.id !== prevProductId) {
    setPrevProductId(product.id);
    setDragPosition({ x: 0, y: 0 });
    setSelectedImageIndex(0);
    setOverlayScale(1);
    setOverlayMode('center');
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ─── Screenshot ─────────────────────────────────────────────────────────────

  const takeScreenshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !product) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw camera feed
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Overlay product image
    const currentImage = product.images[selectedImageIndex];
    if (currentImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const imgWidth = canvas.width * 0.5 * overlayScale;
        const imgHeight = (img.naturalHeight / img.naturalWidth) * imgWidth;
        const imgX = (canvas.width - imgWidth) / 2 + dragPosition.x;
        const imgY = (canvas.height - imgHeight) / 2 + dragPosition.y;

        ctx.globalAlpha = overlayOpacity;
        ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
        ctx.globalAlpha = 1.0;

        // Brand watermark
        ctx.fillStyle = 'rgba(215, 156, 74, 0.7)';
        ctx.font = '16px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('BurqaHijab', 16, canvas.height - 16);

        // Download
        const link = document.createElement('a');
        link.download = `${product.slug}-ar-view.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        setFlashEffect(true);
        setCaptureFeedback(true);
        setTimeout(() => setFlashEffect(false), 300);
        setTimeout(() => setCaptureFeedback(false), 2000);
      };
      img.src = currentImage;
    }
  }, [product, selectedImageIndex, overlayOpacity, overlayScale, dragPosition]);

  // ─── Drag Handlers ──────────────────────────────────────────────────────────

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (overlayMode !== 'draggable') return;
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - dragPosition.x, y: e.touches[0].clientY - dragPosition.y });
    },
    [overlayMode, dragPosition]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || overlayMode !== 'draggable') return;
      e.preventDefault();
      setDragPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
      revealControls();
    },
    [isDragging, overlayMode, dragStart, revealControls]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  const cycleImage = useCallback(
    (direction: 'prev' | 'next') => {
      if (!product) return;
      const len = product.images.length;
      setSelectedImageIndex((prev) =>
        direction === 'next' ? (prev + 1) % len : (prev - 1 + len) % len
      );
    },
    [product]
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] bg-[#0A0A0A]"
        >
          {/* Camera Video Feed */}
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            playsInline
            muted
          />

          {/* Screenshot Canvas (hidden) */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera State Overlays */}
          <AnimatePresence mode="wait">
            {cameraState === 'initializing' && (
              <motion.div
                key="initializing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#0A0A0A]/95"
              >
                <Loader2 className="h-10 w-10 animate-spin text-[#d79c4a]" />
                <p className="text-sm font-medium text-white/80 font-[family-name:var(--font-inter)]">
                  Initializing camera…
                </p>
                <p className="text-xs text-white/40 font-[family-name:var(--font-inter)] max-w-[260px] text-center">
                  Please allow camera access when prompted. We need your camera to show the AR preview.
                </p>
              </motion.div>
            )}

            {cameraState === 'denied' && (
              <motion.div
                key="denied"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-[#0A0A0A]/95 px-6"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <ShieldAlert className="h-8 w-8 text-red-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-inter)]">
                    Camera Access Denied
                  </h3>
                  <p className="mt-2 text-sm text-white/50 font-[family-name:var(--font-inter)] max-w-[300px]">
                    Please enable camera permissions in your browser settings to use the AR View feature.
                  </p>
                </div>
                <Button
                  onClick={retryCamera}
                  className="rounded-lg bg-[#d79c4a] px-6 text-sm font-semibold text-[#0A0A0A] hover:bg-[#c48a35] font-[family-name:var(--font-inter)]"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </motion.div>
            )}

            {cameraState === 'unavailable' && (
              <motion.div
                key="unavailable"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-[#0A0A0A]/95 px-6"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                  <Camera className="h-8 w-8 text-amber-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-inter)]">
                    Camera Not Available
                  </h3>
                  <p className="mt-2 text-sm text-white/50 font-[family-name:var(--font-inter)] max-w-[300px]">
                    No camera was detected on this device. The AR View requires a camera to function.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="rounded-lg border-white/20 px-6 text-sm font-semibold text-white hover:bg-white/10 font-[family-name:var(--font-inter)]"
                >
                  Go Back
                </Button>
              </motion.div>
            )}

            {cameraState === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-[#0A0A0A]/95 px-6"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <ShieldAlert className="h-8 w-8 text-red-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-inter)]">
                    Camera Error
                  </h3>
                  <p className="mt-2 text-sm text-white/50 font-[family-name:var(--font-inter)] max-w-[300px]">
                    An unexpected error occurred while accessing the camera. Please try again.
                  </p>
                </div>
                <Button
                  onClick={retryCamera}
                  className="rounded-lg bg-[#d79c4a] px-6 text-sm font-semibold text-[#0A0A0A] hover:bg-[#c48a35] font-[family-name:var(--font-inter)]"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Image Overlay (visible when camera is active) */}
          {cameraState === 'active' && product && (
            <>
              {/* Draggable product overlay */}
              <div
                className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
              >
                <motion.div
                  key={`${product.id}-${selectedImageIndex}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: overlayOpacity,
                    scale: overlayScale,
                    x: dragPosition.x,
                    y: dragPosition.y,
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className={cn(
                    'relative max-h-[70vh] max-w-[85vw] rounded-2xl overflow-hidden shadow-2xl',
                    'pointer-events-auto',
                    overlayMode === 'draggable' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                  )}
                  style={{
                    backdropFilter: 'blur(2px)',
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={revealControls}
                >
                  {product.images[selectedImageIndex] ? (
                    <img
                      src={product.images[selectedImageIndex]}
                      alt={product.name}
                      className="h-auto max-h-[70vh] w-auto max-w-[85vw] rounded-2xl object-contain"
                      style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))' }}
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-64 w-64 items-center justify-center rounded-2xl bg-white/5">
                      <ImageOff className="h-12 w-12 text-white/20" />
                    </div>
                  )}

                  {/* Product name badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 py-5 pt-10"
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#d79c4a] font-[family-name:var(--font-inter)]">
                      AR Preview
                    </p>
                    <p className="mt-1 text-sm font-medium text-white font-[family-name:var(--font-inter)]">
                      {product.name}
                    </p>
                  </motion.div>
                </motion.div>
              </div>

              {/* Image navigation dots */}
              {product.images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300 font-[family-name:var(--font-inter)]',
                        selectedImageIndex === idx
                          ? 'w-6 bg-[#d79c4a]'
                          : 'w-2 bg-white/40 hover:bg-white/60'
                      )}
                    />
                  ))}
                </div>
              )}

              {/* ─── Top Controls ──────────────────────────────────────────── */}
              <motion.div
                animate={{
                  opacity: showControls ? 1 : 0,
                  y: showControls ? 0 : -16,
                }}
                transition={{ duration: 0.3 }}
                className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4"
              >
                {/* Branding */}
                <div className="flex items-center gap-3 rounded-full bg-black/50 px-4 py-2.5 backdrop-blur-md">
                  <Camera className="h-4 w-4 text-[#d79c4a]" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/90 font-[family-name:var(--font-inter)]">
                    AR View
                  </span>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition-all hover:bg-black/70 active:scale-95"
                  aria-label="Close AR View"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </motion.div>

              {/* ─── Bottom Controls ───────────────────────────────────────── */}
              <motion.div
                animate={{
                  opacity: showControls ? 1 : 0,
                  y: showControls ? 0 : 16,
                }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-20 left-0 right-0 z-30 flex items-center justify-center gap-2 px-4"
                onClick={revealControls}
              >
                {/* Switch to prev product */}
                {onProductChange && hasPrev && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductChange('prev');
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition-all hover:bg-black/70 active:scale-95"
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </button>
                )}

                {/* Prev image */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleImage('prev');
                  }}
                  disabled={product.images.length <= 1}
                  className={cn(
                    'flex h-12 items-center justify-center rounded-full bg-black/50 px-4 backdrop-blur-md transition-all active:scale-95',
                    product.images.length > 1
                      ? 'hover:bg-black/70 text-white'
                      : 'opacity-30 text-white/40 cursor-not-allowed'
                  )}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Capture / Screenshot */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    takeScreenshot();
                  }}
                  className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white bg-white/10 backdrop-blur-md transition-all hover:bg-white/20 active:scale-90"
                  aria-label="Take screenshot"
                >
                  {captureFeedback ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1.2 }}
                      exit={{ scale: 0 }}
                      className="h-5 w-5 rounded-full bg-emerald-400"
                    />
                  ) : (
                    <div className="h-[46px] w-[46px] rounded-full border-2 border-white bg-white/90" />
                  )}
                </button>

                {/* Next image */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleImage('next');
                  }}
                  disabled={product.images.length <= 1}
                  className={cn(
                    'flex h-12 items-center justify-center rounded-full bg-black/50 px-4 backdrop-blur-md transition-all active:scale-95',
                    product.images.length > 1
                      ? 'hover:bg-black/70 text-white'
                      : 'opacity-30 text-white/40 cursor-not-allowed'
                  )}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Switch to next product */}
                {onProductChange && hasNext && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductChange('next');
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition-all hover:bg-black/70 active:scale-95"
                    aria-label="Next product"
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </button>
                )}
              </motion.div>

              {/* ─── Right Side Panel Controls ─────────────────────────────── */}
              <motion.div
                animate={{
                  opacity: showControls ? 1 : 0,
                  x: showControls ? 0 : 16,
                }}
                transition={{ duration: 0.3 }}
                className="absolute right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2"
                onClick={revealControls}
              >
                {/* Download */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    takeScreenshot();
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition-all hover:bg-[#d79c4a]/20 active:scale-95"
                  aria-label="Download screenshot"
                  title="Save screenshot"
                >
                  <Download className="h-5 w-5 text-white" />
                </button>

                {/* Opacity Control */}
                <div className="flex h-11 items-center justify-center rounded-full bg-black/50 px-1 backdrop-blur-md">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOverlayOpacity((o) => Math.max(0.2, o - 0.15));
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-white/10"
                    aria-label="Decrease opacity"
                    title="More transparent"
                  >
                    <Maximize2 className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>

                {/* Scale Controls */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOverlayScale((s) => Math.max(0.4, s - 0.15));
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition-all hover:bg-[#d79c4a]/20 active:scale-95"
                  aria-label="Zoom out"
                  title="Zoom out"
                >
                  <ZoomOut className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOverlayScale((s) => Math.min(2.0, s + 0.15));
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition-all hover:bg-[#d79c4a]/20 active:scale-95"
                  aria-label="Zoom in"
                  title="Zoom in"
                >
                  <ZoomIn className="h-5 w-5 text-white" />
                </button>

                {/* Move / Drag Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOverlayMode((m) => (m === 'center' ? 'draggable' : 'center'));
                    if (overlayMode === 'draggable') {
                      setDragPosition({ x: 0, y: 0 });
                    }
                  }}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-95',
                    overlayMode === 'draggable'
                      ? 'bg-[#d79c4a]/30 ring-2 ring-[#d79c4a]'
                      : 'bg-black/50 hover:bg-[#d79c4a]/20'
                  )}
                  aria-label="Toggle drag mode"
                  title={overlayMode === 'draggable' ? 'Lock position' : 'Drag to reposition'}
                >
                  <Move className="h-5 w-5 text-white" />
                </button>
              </motion.div>

              {/* Tap to show controls overlay */}
              <div
                className="absolute inset-0 z-20"
                onClick={revealControls}
              />
            </>
          )}

          {/* Flash Effect */}
          <AnimatePresence>
            {flashEffect && (
              <motion.div
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-50 bg-white"
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── ARViewButton ─────────────────────────────────────────────────────────────

export function ARViewButton({ onClick, className, productName }: ARViewButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full bg-[#0A0A0A] px-5 py-3 shadow-lg transition-all hover:shadow-xl',
        'border border-[#d79c4a]/30 hover:border-[#d79c4a]/60',
        className
      )}
      aria-label={productName ? `View ${productName} in AR` : 'View in AR'}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d79c4a]">
        <Camera className="h-4 w-4 text-[#0A0A0A]" />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-xs font-bold uppercase tracking-widest text-white font-[family-name:var(--font-inter)]">
          View in AR
        </span>
        <span className="text-[10px] text-white/50 font-[family-name:var(--font-inter)]">
          Try it on your space
        </span>
      </div>
      <Maximize2 className="ml-1 h-3.5 w-3.5 text-[#d79c4a]" />
    </motion.button>
  );
}


