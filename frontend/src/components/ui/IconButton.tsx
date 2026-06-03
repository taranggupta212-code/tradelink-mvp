/**
 * TradeLink MVP - IconButton Component
 * 
 * Primary button with right arrow icon.
 * Used for main call-to-action actions throughout the application.
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { IconButtonProps } from '../../types';

/**
 * IconButton component for primary actions
 * Displays button text with a right arrow icon
 */
const IconButton: React.FC<IconButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false, 
  className = '',
  icon
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        btn btn-primary
        flex items-center justify-center gap-3
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-navy-dark'}
        ${className}
      `}
    >
      <span>{children}</span>
      {icon || <ArrowRight size={20} />}
    </button>
  );
};

export default IconButton;