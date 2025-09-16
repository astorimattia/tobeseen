'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface FullScreenImageViewerProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mode?: 'digital' | 'analog';
}

export default function FullScreenImageViewer({
  images,
  initialIndex,
  isOpen,
  onClose,
  title,
  mode = 'digital'
}: FullScreenImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [showLoading, setShowLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  // Minimum scroll distance to exit full screen (in px)
  const minScrollDistance = 80;

  const goToPrevious = React.useCallback(() => {
    startLoading();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = React.useCallback(() => {
    startLoading();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    if (isOpen) {
      startLoading();
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, images.length, onClose, goToPrevious, goToNext]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    
    // Check if it's a horizontal swipe (for image navigation)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe left - go to next image
        goToNext();
      } else {
        // Swipe right - go to previous image
        goToPrevious();
      }
    }
    
    // Check if it's a downward scroll (to exit full screen)
    if (deltaY < -minScrollDistance) {
      onClose();
    }
  };

  const startLoading = () => {
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    setIsImageLoading(true);
    // Show loading overlay after 0.2 seconds
    loadingTimeoutRef.current = setTimeout(() => {
      setShowLoading(true);
    }, 200);
  };

  const stopLoading = () => {
    setShowLoading(false);
    // Clear the timeout if it exists
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  const handleImageLoad = () => {
    stopLoading();
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    stopLoading();
    setIsImageLoading(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-[9999] bg-black flex items-center justify-center"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[10000] text-white hover:text-zinc-300 transition-colors cursor-pointer"
        aria-label="Close full screen view"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Title */}
      <div className="absolute top-4 left-4 z-[10000] text-white max-w-[60%]">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-lg font-medium truncate">{title}</h2>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            mode === 'analog' 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}>
            {mode === 'analog' ? 'Analog' : 'Digital'}
          </div>
        </div>
        <p className="text-sm text-zinc-400">
          {currentIndex + 1} of {images.length}
        </p>
      </div>

      {/* Navigation arrows - hidden on mobile, shown on larger screens */}
      <button
        onClick={goToPrevious}
        className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-[10000] text-white hover:text-zinc-300 transition-colors p-2"
        aria-label="Previous image"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-[10000] text-white hover:text-zinc-300 transition-colors p-2"
        aria-label="Next image"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Main image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-full max-h-full">
          <Image
            src={images[currentIndex]}
            alt={`${title} photo ${currentIndex + 1}`}
            fill
            className={`object-contain ${isImageLoading ? 'invisible' : ''}`}
            priority
            quality={95}
            sizes="100vw"
            onLoad={handleImageLoad}
            onError={handleImageError}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>
      </div>

      {/* Loading overlay - only shows after 0.5 seconds */}
      {showLoading && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-[10002]">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      )}

      {/* Image counter dots */}
      <div className="fixed left-1/2 bottom-6 -translate-x-1/2 z-[10001] flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              startLoading();
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
}
