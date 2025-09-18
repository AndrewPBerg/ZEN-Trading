import React from 'react';

// Tarot-style corner decorations similar to custom-tarot-card.tsx
const TarotCorners = ({ className }: { className?: string }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className || ''}`}>
      {/* Top corners */}
      <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-gray-400/60 dark:border-yellow-600/60" />
      <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-gray-400/60 dark:border-yellow-600/60" />
      {/* Bottom corners */}
      <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-gray-400/60 dark:border-yellow-600/60" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-gray-400/60 dark:border-yellow-600/60" />
      {/* Center mystical symbols */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-400/80 dark:bg-yellow-600/80 rounded-full" />
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-400/80 dark:bg-yellow-600/80 rounded-full" />
    </div>
  )
};

interface TarotCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function TarotCard({ title, subtitle, children }: TarotCardProps) {
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
      <TarotCorners />
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
