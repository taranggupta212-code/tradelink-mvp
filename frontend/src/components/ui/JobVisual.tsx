/**
 * TradeLink MVP - JobVisual Component
 * 
 * 16:9 ratio placeholder for job images.
 * Uses trade-specific gradients and lucide-react icons.
 * Replaces real photos with themed visual placeholders.
 */

import React from 'react';
import { 
  Hammer, 
  Droplets, 
  Zap, 
  Home, 
  Trees, 
  Grid3X3, 
  Paintbrush,
  Wrench
} from 'lucide-react';
import type { JobVisualProps } from '../../types';
import { getTradeGradientClass } from '../../data/sampleJobs';

/**
 * JobVisual component for displaying job visuals
 * Shows trade-specific gradient background with centered icon
 * Maintains 16:9 aspect ratio
 */
const JobVisual: React.FC<JobVisualProps> = ({ 
  category, 
  className = '' 
}) => {
  // Map trade categories to lucide-react icons
  const getIcon = (tradeCategory: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Carpentry': <Hammer size={48} className="text-white" />,
      'Plumbing': <Droplets size={48} className="text-white" />,
      'Electrical': <Zap size={48} className="text-white" />,
      'Roofing': <Home size={48} className="text-white" />,
      'Landscaping': <Trees size={48} className="text-white" />,
      'Tiling': <Grid3X3 size={48} className="text-white" />,
      'Painting': <Paintbrush size={48} className="text-white" />
    };
    return icons[tradeCategory] || <Wrench size={48} className="text-white" />;
  };

  // Get the gradient class for this trade category
  const gradientClass = getTradeGradientClass(category);

  return (
    <div 
      className={`
        job-visual 
        ${gradientClass} 
        ${className}
      `}
    >
      {/* Icon centered in the visual */}
      <div className="flex items-center justify-center w-full h-full">
        {getIcon(category)}
      </div>
    </div>
  );
};

export default JobVisual;