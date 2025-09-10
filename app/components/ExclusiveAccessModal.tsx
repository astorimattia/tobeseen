import React, { useState, useEffect } from 'react';

interface ExclusiveAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExclusiveAccessModal: React.FC<ExclusiveAccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
        alert('Successfully subscribed to exclusive access updates!');
        setEmail('');
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Subscription failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/40 rounded-2xl p-8 w-full max-w-md relative border border-white/10 shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-3xl font-bold text-white mb-4 text-center">Get Exclusive Access</h2>
        <p className="text-zinc-300 text-center mb-6 text-sm leading-relaxed">
          Be the first to know when new documentaries drop.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 w-full">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 w-full sm:max-w-xs md:max-w-sm rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            required
          />
          <button
            type="submit"
            className="w-full sm:w-auto font-heading rounded-xl border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors duration-200 cursor-pointer"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExclusiveAccessModal;
