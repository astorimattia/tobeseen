import React, { useEffect } from 'react';

interface ExclusiveAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExclusiveAccessModal: React.FC<ExclusiveAccessModalProps> = ({
  isOpen,
  onClose,
}) => {
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-gradient-to-br from-zinc-900 to-zinc-900/40 rounded-2xl p-8 w-full max-w-md relative border border-white/10 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
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
        <h2 className="text-3xl font-bold text-white mb-4 text-center">Subscribe on Substack</h2>
        <p className="text-zinc-300 text-center mb-6 text-sm leading-relaxed">
          Documentary photography and writing on extreme rituals and the people who keep them alive.
        </p>
        <div className="w-full">
          <iframe
            src="https://extremerituals.substack.com/embed"
            width="100%"
            height="180"
            style={{ border: '1px solid #EEE', background: 'white', borderRadius: '8px' }}
            frameBorder="0"
            scrolling="no"
          ></iframe>
        </div>
        <div className="mt-4 text-center">
          <a
            href="https://extremerituals.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white text-sm transition-colors duration-200 underline"
          >
            View the publication →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ExclusiveAccessModal;
