import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Hero() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        // Autoplay was prevented. Show a UI element to let the user manually start playback.
        console.log("Autoplay prevented: ", error);
      });
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage("");

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setEmail("");
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
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
                onSubmit={handleSubscribe}
                className="w-full max-w-md"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      autoFocus
                      disabled={isSubmitting || submitStatus === 'success'}
                      className="flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || submitStatus === 'success'}
                      className="font-heading rounded-xl bg-white text-black px-6 py-2 text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {isSubmitting ? 'Subscribing...' : submitStatus === 'success' ? 'Subscribed!' : 'Subscribe'}
                    </button>
                  </div>
                  
                  {submitStatus === 'success' && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-green-400 text-center"
                    >
                      Thanks! Check your email to confirm.
                    </motion.p>
                  )}
                  
                  {submitStatus === 'error' && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-400 text-center"
                    >
                      {errorMessage}
                    </motion.p>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailForm(false);
                      setEmail("");
                      setSubmitStatus('idle');
                      setErrorMessage("");
                    }}
                    className="text-xs text-white/50 hover:text-white/80 transition-colors duration-200 text-center"
                  >
                    Cancel
                  </button>
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