/**
 * TradeLink MVP - Logo Component
 * 
 * Text-based logo with navy badge containing white "TL" and wordmark.
 * Supports different sizes and optional wordmark display.
 */

import React from 'react';
import type { LogoProps } from '../../types';

/**
 * Logo component for TradeLink branding
 * Displays a navy badge with "TL" initials and optional wordmark
 */
const Logo: React.FC<LogoProps> = ({ 
  showWordmark = true, 
  size = 'md',
  className = '' 
}) => {
  // Size configurations
  const sizeClasses = {
    sm: {
      badge: 'w-8 h-8 text-xs',
      wordmark: 'text-lg',
      gap: 'gap-2'
    },
    md: {
      badge: 'w-10 h-10 text-sm',
      wordmark: 'text-xl',
      gap: 'gap-3'
    },
    lg: {
      badge: 'w-12 h-12 text-base',
      wordmark: 'text-2xl',
      gap: 'gap-4'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center ${currentSize.gap} ${className}`}>
      {/* Badge with TL initials */}
      <div 
        className={`
          ${currentSize.badge} 
          bg-navy 
          rounded-lg 
          flex 
          items-center 
          justify-center 
          text-white 
          font-bold
          shadow-sm
        `}
      >
        TL
      </div>
      
      {/* Wordmark */}
      {showWordmark && (
        <div className={`${currentSize.wordmark} font-bold`}>
          <span className="logo-trade">Trade</span>
          <span className="logo-link">Link</span>
        </div>
      )}
    </div>
  );
};

export default Logo;