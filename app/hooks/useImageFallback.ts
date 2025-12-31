'use client';

import { useState, useCallback } from 'react';

/**
 * Hook to handle image fallback when Next.js Image optimization fails
 * Returns state and handlers to fallback to regular img tag
 */
export function useImageFallback() {
  const [useFallback, setUseFallback] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback((onError?: () => void) => {
    // If Next.js Image fails, try fallback to regular img tag
    if (!useFallback) {
      setUseFallback(true);
      setHasError(false); // Reset error to try fallback
    } else {
      setHasError(true);
      onError?.();
    }
  }, [useFallback]);

  const getFallbackSrc = useCallback((src: string) => {
    // If src is already a direct path, use it as-is
    if (src.startsWith('/') || src.startsWith('http')) {
      return src;
    }
    return src;
  }, []);

  return {
    useFallback,
    hasError,
    handleError,
    getFallbackSrc,
  };
}

