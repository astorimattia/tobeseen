'use client';

import { useEffect } from 'react';

interface ImagePerformanceMonitorProps {
  enabled?: boolean;
}

export default function ImagePerformanceMonitor({ enabled = true }: ImagePerformanceMonitorProps) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Track image loading performance
    const trackImagePerformance = () => {
      const images = document.querySelectorAll('img');
      
      images.forEach((img) => {
        const startTime = performance.now();
        
        const handleLoad = () => {
          const loadTime = performance.now() - startTime;
          console.log(`Image loaded in ${loadTime.toFixed(2)}ms:`, img.src);
          
          // Send to analytics if needed
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'image_load_time', {
              load_time: Math.round(loadTime),
              image_src: img.src,
              image_size: `${img.naturalWidth}x${img.naturalHeight}`
            });
          }
        };

        const handleError = () => {
          console.error('Image failed to load:', img.src);
          
          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'image_load_error', {
              image_src: img.src
            });
          }
        };

        if (img.complete) {
          handleLoad();
        } else {
          img.addEventListener('load', handleLoad, { once: true });
          img.addEventListener('error', handleError, { once: true });
        }
      });
    };

    // Monitor Core Web Vitals for images
    const monitorCoreWebVitals = () => {
      // Largest Contentful Paint (LCP) monitoring
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (lastEntry && lastEntry.element && lastEntry.element.tagName === 'IMG') {
            console.log('LCP image detected:', lastEntry.element.src, 'LCP:', lastEntry.startTime);
          }
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift (CLS) monitoring
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.sources && entry.sources.some((source: any) => source.element?.tagName === 'IMG')) {
              console.log('CLS caused by image:', entry.value);
            }
          }
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }
    };

    // Run monitoring
    trackImagePerformance();
    monitorCoreWebVitals();

    // Re-run when new images are added
    const observer = new MutationObserver(() => {
      trackImagePerformance();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [enabled]);

  return null;
}
