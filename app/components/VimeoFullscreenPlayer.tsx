'use client';

import React, { useState, useRef, useEffect } from 'react';

interface VimeoFullscreenPlayerProps {
  vimeoId: string;
  title: string;
}

export default function VimeoFullscreenPlayer({ vimeoId, title }: VimeoFullscreenPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronous play and fullscreen trigger on user tap
  const handlePlayClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Expand to 100% full screen viewport (works 100% on iOS Safari & mobile)
    setIsExpanded(true);
    setIsPlaying(true);

    // 2. Attempt native Fullscreen API directly in synchronous click handler
    if (containerRef.current) {
      const elem = containerRef.current as HTMLDivElement & {
        webkitRequestFullscreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      };

      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    }
  };

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${
        isExpanded
          ? 'fixed inset-0 z-50 bg-black flex flex-col justify-center items-center p-0 md:p-4'
          : 'relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-2xl'
      }`}
    >
      {/* Exit Fullscreen button */}
      {isExpanded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(false);
            if (document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
            }
          }}
          className="absolute top-4 right-4 z-50 px-4 py-2 bg-zinc-900/90 text-white rounded-full text-xs font-semibold border border-white/20 hover:bg-white hover:text-black transition-all flex items-center gap-1.5 shadow-2xl cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Exit Fullscreen
        </button>
      )}

      {isPlaying ? (
        <div className="relative w-full h-full aspect-video">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&playsinline=0&title=0&byline=0&portrait=0`}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={`${title} Vimeo Documentary`}
          />
        </div>
      ) : (
        <div
          onClick={handlePlayClick}
          onTouchEnd={handlePlayClick}
          className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 flex flex-col items-center justify-center p-6 cursor-pointer select-none group"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
            <svg className="w-9 h-9 md:w-10 md:h-10 ml-1 fill-black" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="mt-4 text-sm font-semibold text-white tracking-wider uppercase">
            Play Documentary Fullscreen
          </span>
        </div>
      )}
    </div>
  );
}
