"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Hero() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
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
    setMessage(null);

    const isValid = /.+@.+\..+/.test(email);
    if (!isValid) {
      setMessage({ type: "error", text: "Enter a valid email" });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Subscription failed" }));
        throw new Error(data.message || "Subscription failed");
      }

      setMessage({ type: "success", text: "Thanks! You're on the list." });
      setEmail("");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setMessage({ type: "error", text: errorMessage });
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
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src="/bg.webm"
          className="h-full w-full object-cover"
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
            <h1 className="font-heading text-xl md:text-2xl leading-tight">
              some things deserve to be seen
            </h1>
          </div>
        </div>
        
        {/* CTA area - positioned at bottom */}
        <div className="pb-22 md:pb-12 flex justify-center">
          <div className="flex flex-col items-center justify-center gap-3 w-full max-w-3xl">
            <div className="flex items-center justify-center gap-3 w-full">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-auto mx-auto">
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-80 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  aria-label="Email address"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto font-heading rounded-xl border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors duration-200 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Subscribing…' : 'Subscribe'}
                </button>
              </form>
            </div>
            {message && (
              <p className={`${message.type === 'success' ? 'text-green-400' : 'text-red-400'} text-xs`}>{message.text}</p>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
