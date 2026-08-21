import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Hero() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        // Autoplay was prevented. Show a UI element to let the user manually start playback.
        console.log("Autoplay prevented: ", error);
      });
    }
  }, []);

  useEffect(() => {
    if (showEmailForm && emailInputRef.current) {
      // Use requestAnimationFrame to ensure focus happens after render
      requestAnimationFrame(() => {
        emailInputRef.current?.focus();
      });
    }
  }, [showEmailForm]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <section className="relative isolate h-screen">
      {/* Background video */}
      <div className="absolute inset-0 -z-10">
        {/* Fallback background */}
        <div className="absolute inset-0 bg-black" />
        
        {/* Video fade-in overlay */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute inset-0 bg-black z-20"
        />
        
        {/* Background video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          webkit-playsinline="true"
          x5-playsinline="true"
          src="/bg.webm"
          className="h-full w-full object-cover pointer-events-none"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mx-auto h-full max-w-6xl px-4 grid grid-rows-[1fr_auto] items-center"
      >
        {/* Main content area - perfectly centered */}
        <div className="flex items-center justify-center">
          <div className="max-w-3xl text-center">
            <h1 className="font-heading text-xl md:text-2xl leading-tight select-none">
              Stories of Raw Devotion
            </h1>
            <p className="mt-4 text-sm md:text-base text-white/80 font-light select-none">
              Discover the World&apos;s Most Hidden Rituals
            </p>
          </div>
        </div>
        
        {/* Buttons area - positioned at bottom */}
        <div className="pb-32 md:pb-20 flex justify-center">
          <AnimatePresence mode="wait">
            {!showEmailForm ? (
              <motion.div
                key="buttons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-3 w-full max-w-72"
              >
                <button
                  onClick={() => router.push('/work')}
                  className="font-heading rounded-xl bg-white text-black px-4 py-2 text-sm font-medium hover:bg-zinc-200 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer flex-1"
                >
                  View Work
                </button>
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="font-heading rounded-xl border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/20 hover:border-white/40 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer flex-1"
                >
                  Stay Updated
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                action="https://extremerituals.substack.com/api/v1/free?nojs=true"
                method="post"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-sm min-w-0 px-4"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <input
                    ref={emailInputRef}
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    required
                    className="min-w-0 w-full rounded-xl border border-white/20 bg-transparent px-4 py-2 text-base font-light text-white placeholder:text-white/40 hover:border-white/40 focus:outline-none focus:border-white/40 focus:bg-white/5 transition-all duration-300"
                  />
                  <input type="hidden" name="source" value="sacratos" />
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      type="submit"
                      className="font-heading rounded-xl border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors duration-200 cursor-pointer whitespace-nowrap flex-1 sm:flex-none"
                    >
                      Subscribe
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="font-heading rounded-xl border border-white/20 px-3 py-2 text-sm font-medium hover:bg-white/20 hover:border-white/40 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      title="Close"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
        
        {/* Down arrow */}
        <div className="absolute bottom-20 md:bottom-8 left-1/2 transform -translate-x-1/2">
          <motion.button
            onClick={() => scrollToSection('what')}
            animate={{ y: [0, 8, 0] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="text-white/60 hover:text-white/80 transition-colors duration-200 cursor-pointer"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}