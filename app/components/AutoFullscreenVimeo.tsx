'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AutoFullscreenVimeoProps {
  vimeoId: string;
  title: string;
}

interface VimeoPlayerInstance {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setMuted: (muted: boolean) => Promise<void>;
  on: (event: string, callback: (data: unknown) => void) => void;
}

declare global {
  interface Window {
    Vimeo?: {
      Player: new (element: HTMLIFrameElement | string, options?: Record<string, unknown>) => VimeoPlayerInstance;
    };
  }
}

export default function AutoFullscreenVimeo({ vimeoId, title }: AutoFullscreenVimeoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const vimeoPlayerRef = useRef<VimeoPlayerInstance | null>(null);

  useEffect(() => {
    const loadScript = () => {
      return new Promise<void>((resolve) => {
        if (window.Vimeo && window.Vimeo.Player) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://player.vimeo.com/api/player.js';
        script.async = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    loadScript().then(() => {
      if (iframeRef.current && window.Vimeo) {
        try {
          const player = new window.Vimeo.Player(iframeRef.current);
          vimeoPlayerRef.current = player;
        } catch (err) {
          console.error('Vimeo init error:', err);
        }
      }
    });
  }, [vimeoId]);

  const handleStartPlay = async (e: React.MouseEvent | React.TouchEvent) => {
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

    if (vimeoPlayerRef.current) {
      try {
        await vimeoPlayerRef.current.setMuted(false);
        await vimeoPlayerRef.current.setVolume(1.0);
        await vimeoPlayerRef.current.play();
      } catch (err) {
        console.error('Vimeo play error:', err);
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

      {/* Single iframe element for seamless user gesture audio activation */}
      <div className="relative w-full h-full aspect-video">
        <iframe
          ref={iframeRef}
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0&muted=0&autopause=0&playsinline=0&title=0&byline=0&portrait=0&controls=1`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          title={`${title} Vimeo Documentary`}
        />

        {/* Play Overlay before starting */}
        {!isPlaying && (
          <div
            onClick={handleStartPlay}
            onTouchEnd={handleStartPlay}
            className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors flex items-center justify-center cursor-pointer z-10 group"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 md:w-9 md:h-9 ml-1 fill-black" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
