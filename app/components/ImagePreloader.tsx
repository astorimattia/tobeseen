'use client';

import { useEffect } from 'react';

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

export default function ImagePreloader({ images, priority = false }: ImagePreloaderProps) {
  useEffect(() => {
    if (!priority) return;

    // Preload critical images with proper timing
    const preloadImages = () => {
      images.forEach((src) => {
        // Check if image is already loaded or being loaded
        const existingLink = document.querySelector(`link[href="${src}"]`);
        if (existingLink) return;

        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        link.crossOrigin = 'anonymous';
        // Add fetchpriority to indicate high priority
        link.setAttribute('fetchpriority', 'high');
        document.head.appendChild(link);
      });
    };

    // Use requestIdleCallback for better performance, fallback to setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadImages, { timeout: 1000 });
    } else {
      setTimeout(preloadImages, 100);
    }

    // Cleanup function
    return () => {
      images.forEach((src) => {
        const existingLink = document.querySelector(`link[href="${src}"]`);
        if (existingLink) {
          document.head.removeChild(existingLink);
        }
      });
    };
  }, [images, priority]);

  return null;
}
