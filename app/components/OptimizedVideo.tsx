import React, { useRef, useEffect, useState, useCallback } from "react";

interface OptimizedVideoProps {
  src: string;
  fallbackSrc?: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  onError?: (error: Event) => void;
  onLoadedData?: () => void;
  lazy?: boolean;
  threshold?: number;
}

export default function OptimizedVideo({
  src,
  fallbackSrc,
  poster,
  className = "",
  style = {},
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  onLoadStart,
  onCanPlay,
  onError,
  onLoadedData,
  lazy = true,
  threshold = 0.1,
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(!lazy);
  const [hasError, setHasError] = useState(false);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadVideo(true);
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [lazy, threshold]);

  // Video loading optimization
  useEffect(() => {
    if (!shouldLoadVideo || !videoRef.current) return;

    const video = videoRef.current;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      onLoadedData?.();
      
      if (autoPlay) {
        video.play().catch((error) => {
          console.warn('Video autoplay failed:', error);
        });
      }
    };

    const handleLoadStart = () => {
      onLoadStart?.();
    };

    const handleCanPlay = () => {
      onCanPlay?.();
    };

    const handleError = (error: Event) => {
      setHasError(true);
      onError?.(error);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [shouldLoadVideo, autoPlay, onLoadStart, onCanPlay, onError, onLoadedData]);

  // Retry mechanism for failed loads
  const retryLoad = useCallback(() => {
    if (videoRef.current && hasError) {
      setHasError(false);
      setIsVideoLoaded(false);
      videoRef.current.load();
    }
  }, [hasError]);

  const defaultPoster = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz48L3N2Zz4=";

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full"
      style={{
        transform: 'translateZ(0)', // Force GPU layer
        willChange: 'transform',
        ...style
      }}
    >
      {/* Loading indicator */}
      {shouldLoadVideo && !isVideoLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <p className="text-white/60 text-sm mb-2">Video failed to load</p>
            <button
              onClick={retryLoad}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Video element */}
      {shouldLoadVideo && (
        <video
          ref={videoRef}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          preload="metadata"
          poster={poster || defaultPoster}
          className={`w-full h-full object-cover ${className}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'translateZ(0)', // Force GPU acceleration
            willChange: 'transform'
          }}
        >
          <source src={src} type="video/webm" />
          {fallbackSrc && <source src={fallbackSrc} type="video/mp4" />}
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
