/**
 * TradeLink MVP - JobCard Component
 * 
 * Job card with themed header/edge, budget in bold orange, and AI badge.
 * Displays job summary information for the jobs search page.
 */

import React from 'react';
import { 
  MapPin, 
  Clock, 
  Bookmark,
  BookmarkCheck,
  Sparkles
} from 'lucide-react';
import type { JobCardProps } from '../../types';
import { formatBudgetRange, formatDurationRange } from '../../data/sampleJobs';
import JobVisual from './JobVisual';

/**
 * JobCard component for displaying job summaries
 * Shows job information with save functionality and AI badge
 */
const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  isSaved, 
  onSaveToggle, 
  onClick 
}) => {
  /**
   * Handle card click - navigate to job details
   */
  const handleCardClick = () => {
    onClick(job.id);
  };

  /**
   * Handle save button click - toggle saved status
   * Prevents event propagation to avoid triggering card click
   */
  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSaveToggle(job.id);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="card cursor-pointer hover:shadow-md transition-all duration-200 group"
    >
      {/* Themed Header Strip */}
      <div className="h-2 bg-gradient-to-r from-navy to-orange rounded-t-xl" />

      {/* Card Content */}
      <div className="p-4">
        {/* Job Visual */}
        <div className="mb-4">
          <JobVisual category={job.category} className="rounded-lg" />
        </div>

        {/* Job Title and Save Button */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-navy group-hover:text-orange transition-colors duration-200">
            {job.title}
          </h3>
          <button
            onClick={handleSaveClick}
            className="p-2 text-gray-400 hover:text-orange transition-colors duration-200"
            aria-label={isSaved ? 'Remove from saved' : 'Save job'}
          >
            {isSaved ? (
              <BookmarkCheck size={20} className="text-orange" />
            ) : (
              <Bookmark size={20} />
            )}
          </button>
        </div>

        {/* Customer and Location */}
        <div className="flex items-center gap-2 mb-3 text-gray-600">
          <MapPin size={16} />
          <span className="text-sm">{job.customer.name} • {job.customer.location}</span>
        </div>

        {/* Budget - Bold Orange */}
        <div className="mb-3">
          <span className="text-xl font-bold text-orange">
            {formatBudgetRange(job.budget.min, job.budget.max)}
          </span>
        </div>

        {/* Duration and Urgency */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} />
            <span className="text-sm">
              {formatDurationRange(job.aiScope.estimatedDuration.min, job.aiScope.estimatedDuration.max)}
            </span>
          </div>

          {/* Urgency Badge */}
          <span className={`badge ${job.urgency === 'Urgent' ? 'badge-urgent' : 'badge-normal'}`}>
            {job.urgency}
          </span>
        </div>

        {/* AI Badge */}
        {job.hasAIEstimate && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange rounded-full flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">AI Estimate Available</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;