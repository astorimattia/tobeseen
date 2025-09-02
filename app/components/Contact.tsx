import React from "react";
import SectionHeading from "./SectionHeading";
import { useState } from "react";

export default function Contact() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        console.log("Subscription successful!");
        alert("Subscription successful!");
        setEmail("");
        setIsSubscribed(true);
      } else {
        const errorData = await response.json();
        console.error("Subscription failed:", errorData.message);
        alert(`Subscription failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("There was an error subscribing:", error);
      alert("There was an error subscribing. Please try again later.");
    }
  };

  return (
    <section id="subscribe" className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-900/40 p-8">
        <SectionHeading
          eyebrow="Stay Updated"
          title="Subscribe for new work, previews & updates"
        />
        {isSubscribed ? (
          <div className="mt-8 flex flex-col items-center justify-center text-center text-white p-6 rounded-xl bg-green-600/20 border border-green-500/50">
            <p className="text-xl font-semibold mb-2">Thank you for subscribing!</p>
            <p className="text-zinc-300">You&apos;ll receive updates on new work, previews, and more shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full md:w-auto rounded-xl bg-zinc-800 border border-white/20 px-6 py-3 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/30"
              required
              disabled={isSubscribed}
            />
            <button
              type="submit"
              className="w-full md:w-auto rounded-xl bg-white text-black px-6 py-3 text-sm font-medium hover:bg-zinc-200 transition-colors cursor-pointer"
              disabled={isSubscribed}
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}


