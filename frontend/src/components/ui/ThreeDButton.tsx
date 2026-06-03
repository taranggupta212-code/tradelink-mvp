/**
 * TradeLink MVP - ThreeDButton Component
 * 
 * 3D-style button used ONLY for "Send Quote" action.
 * Creates a tactile, pressed-button effect with shadow depth.
 */

import React from 'react';
import type { ThreeDButtonProps } from '../../types';

/**
 * ThreeDButton component for special emphasis actions
 * Creates a 3D pressed effect with layered shadows
 * Used exclusively for the "Send Quote" action
 */
const ThreeDButton: React.FC<ThreeDButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false, 
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        btn-3d
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default ThreeDButton;