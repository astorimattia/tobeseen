'use client';

import React, { useState, useRef, useEffect } from 'react';

interface VimeoFullscreenPlayerProps {
  vimeoId: string;
  title: string;
}

export default function VimeoFullscreenPlayer({ vimeoId, title }: VimeoFullscreenPlayerProps) {
  const [isMobilePlaying, setIsMobilePlaying] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMobilePlayClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMobileExpanded(true);
    setIsMobilePlaying(true);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileExpanded) {
        setIsMobileExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileExpanded]);

  return (
    <div className="w-full">
      {/* DESKTOP PLAYER: Standard Vimeo Player with full bottom toolbar & controls */}
      <div className="hidden md:block relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-2xl">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0&title=0&byline=0&portrait=0&controls=1`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={`${title} Vimeo Documentary`}
        />
      </div>

      {/* MOBILE PLAYER: Tap to expand & play fullscreen on iOS / Android */}
      <div className="block md:hidden">
        <div
          ref={containerRef}
          className={`${
            isMobileExpanded
              ? 'fixed inset-0 z-50 bg-black flex flex-col justify-center items-center p-0'
              : 'relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-2xl'
          }`}
        >
          {isMobileExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileExpanded(false);
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

          {isMobilePlaying ? (
            <div className="relative w-full h-full aspect-video">
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&playsinline=0&title=0&byline=0&portrait=0&controls=1`}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={`${title} Vimeo Documentary`}
              />
            </div>
          ) : (
            <div
              onClick={handleMobilePlayClick}
              onTouchEnd={handleMobilePlayClick}
              className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 flex flex-col items-center justify-center p-6 cursor-pointer select-none group"
            >
              <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-9 h-9 ml-1 fill-black" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="mt-4 text-xs font-semibold text-white tracking-wider uppercase">
                Tap to Play Fullscreen
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
