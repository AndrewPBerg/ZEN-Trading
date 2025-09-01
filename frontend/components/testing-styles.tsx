import React from 'react';

const FrillyCorner = ({ position }) => {
    const positionClasses = {
      topLeft: 'top-0 left-0',
      topRight: 'top-0 right-0 transform scale-x-[-1]',
      bottomLeft: 'bottom-0 left-0 transform scale-y-[-1]',
      bottomRight: 'bottom-0 right-0 transform scale-x-[-1] scale-y-[-1]',
    };

    return (
      <div className={`absolute w-12 h-12 text-gray-400 dark:text-yellow-600/40 ${positionClasses[position]}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Corkscrew twist base */}
          <path d="M 5 5 Q 15 0, 25 5 Q 35 10, 45 5 Q 55 0, 65 5" />
          <path d="M 5 5 Q 0 15, 5 25 Q 10 35, 5 45 Q 0 55, 5 65" />
          
          {/* Decorative spirals */}
          <path d="M 10 10 Q 20 5, 30 10 Q 40 15, 50 10" strokeWidth="1.5" />
          <path d="M 10 10 Q 5 20, 10 30 Q 15 40, 10 50" strokeWidth="1.5" />
          
          {/* Inner flourishes */}
          <circle cx="15" cy="15" r="2" fill="currentColor" opacity="0.6" />
          <circle cx="25" cy="25" r="1.5" fill="currentColor" opacity="0.4" />
          <circle cx="35" cy="35" r="1" fill="currentColor" opacity="0.3" />
          
          {/* Corkscrew details */}
          <path d="M 15 8 Q 25 12, 35 8" strokeWidth="1" opacity="0.7" />
          <path d="M 8 15 Q 12 25, 8 35" strokeWidth="1" opacity="0.7" />
          
          {/* Fine decorative lines */}
          <path d="M 20 3 Q 30 7, 40 3" strokeWidth="0.8" opacity="0.5" />
          <path d="M 3 20 Q 7 30, 3 40" strokeWidth="0.8" opacity="0.5" />
        </svg>
      </div>
    );
};

export default function TarotCard({ title, subtitle, children }) {
  return (
    <div
      className="
        tarot-card
        relative
        flex flex-col
        p-8
        rounded-3xl
        w-full max-w-md
        transition
        duration-300
        ease-in-out

        // Light mode styles
        bg-white
        border border-gray-200
        shadow-lg
        hover:shadow-xl

        // Dark mode styles
        dark:bg-[#0b0907]
        dark:border-yellow-700/60
        dark:shadow-yellow-900/40
        dark:hover:shadow-yellow-500/60
      "
    >
      <FrillyCorner position="topLeft" />
      <FrillyCorner position="topRight" />
      <FrillyCorner position="bottomLeft" />
      <FrillyCorner position="bottomRight" />
      <div className="relative z-10">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-yellow-200">{title}</h3>
        {subtitle && (
          <p className="text-md text-gray-600 dark:text-yellow-400/80 mb-4">{subtitle}</p>
        )}
        <div className="flex-1 text-gray-800 dark:text-gray-200">{children}</div>
      </div>
    </div>
  );
}
