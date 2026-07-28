'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AutoFullscreenVimeoProps {
  vimeoId: string;
  title: string;
}

export default function AutoFullscreenVimeo({ vimeoId, title }: AutoFullscreenVimeoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStartPlay = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsFullscreen(true);
    setIsPlaying(true);

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
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-black flex flex-col justify-center items-center p-0'
          : 'relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-2xl'
      }`}
    >
      {/* Exit Fullscreen Close Button */}
      {isFullscreen && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(false);
            if (document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
            }
          }}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-zinc-900/90 text-white rounded-full flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-all shadow-2xl cursor-pointer"
          aria-label="Exit Fullscreen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {isPlaying ? (
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
          onClick={handleStartPlay}
          onTouchEnd={handleStartPlay}
          className="absolute inset-0 cursor-pointer group"
        >
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0&title=0&byline=0&portrait=0&controls=0`}
            className="w-full h-full pointer-events-none"
            title={`${title} Vimeo Preview`}
          />
          {/* Subtle click/tap overlay to trigger instant fullscreen without text */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 md:w-9 md:h-9 ml-1 fill-black" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
