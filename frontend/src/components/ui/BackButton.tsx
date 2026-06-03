/**
 * TradeLink MVP - BackButton Component
 * 
 * Simple back navigation button with optional custom label.
 * Uses browser history by default or custom onClick handler.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { BackButtonProps } from '../../types';

/**
 * BackButton component for navigation
 * Provides consistent back navigation across the application
 */
const BackButton: React.FC<BackButtonProps> = ({ 
  onClick, 
  label = 'Back' 
}) => {
  const navigate = useNavigate();

  /**
   * Handle click event
   * Uses custom onClick if provided, otherwise uses browser back navigation
   */
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 text-gray-600 hover:text-navy transition-colors duration-200 group"
    >
      <ArrowLeft 
        size={20} 
        className="group-hover:-translate-x-1 transition-transform duration-200" 
      />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default BackButton;