/**
 * TradeLink MVP - FormSection Component
 * 
 * Reusable form wrapper with title and description.
 * Provides consistent styling for form sections across the application.
 */

import React from 'react';
import type { FormSectionProps } from '../../types';

/**
 * FormSection component for organizing form content
 * Wraps form fields with consistent styling and optional title/description
 */
const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  description, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`form-section ${className}`}>
      {/* Section Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-navy">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {/* Form Content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;