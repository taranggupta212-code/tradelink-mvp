/**
 * TradeLink - Job Details Page
 * 
 * Fetches job details and AI quote from the backend API.
 * Sticky header. 60/40 desktop split.
 * Left: customer info, large JobVisual, budget.
 * Right: Sticky AI-Generated Scope card, action buttons.
 * Includes AI reliability note.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Bookmark, 
  BookmarkCheck,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import type { JobDetailsPageProps, Job, TradeCategory } from '../types';
import Header from '../components/ui/Header';
import BackButton from '../components/ui/BackButton';
import JobVisual from '../components/ui/JobVisual';
import { formatBudgetRange, formatDurationRange } from '../data/sampleJobs';
import * as backendApi from '../lib/backendApi';

/**
 * Convert a backend ApiJob (single job with aiScope) into the frontend Job type
 */
function mapApiJob(apiJob: backendApi.ApiJob): Job {
  return {
    id: apiJob.id,
    title: apiJob.title,
    description: apiJob.description,
    customer: {
      name: apiJob.customer.name,
      location: apiJob.customer.location,
    },
    budget: apiJob.budget,
    category: apiJob.category as TradeCategory,
    urgency: apiJob.urgency as 'Urgent' | 'Normal',
    aiScope: apiJob.aiScope
      ? {
          description: apiJob.aiScope.description,
          estimatedCost: apiJob.aiScope.estimatedCost,
          estimatedDuration: apiJob.aiScope.estimatedDuration,
          confidence: apiJob.aiScope.confidence as 'High' | 'Medium' | 'Low',
        }
      : {
          description: 'No AI estimate available for this job.',
          estimatedCost: { min: 0, max: 0 },
          estimatedDuration: { min: 0, max: 0 },
          confidence: 'Low' as const,
        },
    postedDate: new Date(),
    hasAIEstimate: !!apiJob.aiScope,
  };
}

/**
 * Job Details page component
 */
const JobDetailsPage: React.FC<JobDetailsPageProps> = ({ state, callbacks, jobId }) => {
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch job from backend API on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchJob() {
      setLoading(true);
      setError(null);
      try {
        const apiJob = await backendApi.getJob(jobId);
        if (!cancelled) {
          setJob(mapApiJob(apiJob));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load job');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchJob();
    return () => { cancelled = true; };
  }, [jobId]);

  // Handle save toggle
  const handleSaveToggle = () => {
    if (job) callbacks.toggleSavedJob(job.id);
  };

  // Handle quote button click
  const handleQuoteClick = () => {
    if (job) {
      callbacks.setSelectedJobId(job.id);
      navigate(`/quote/${job.id}`);
    }
  };

  const isJobSaved = job ? state.savedJobIds.includes(job.id) : false;

  // Build header data from state
  // (We don't have the full jobs list here, so saved/recent are empty in header)

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          tradie={state.tradie} 
          onLogout={callbacks.clearState}
          savedJobs={[]}
          recentlyViewedJobs={[]}
          onRemoveSavedJob={callbacks.toggleSavedJob}
        />
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-navy rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  // Error / not found state
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          tradie={state.tradie} 
          onLogout={callbacks.clearState}
          savedJobs={[]}
          recentlyViewedJobs={[]}
          onRemoveSavedJob={callbacks.toggleSavedJob}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-navy mb-4">
              {error ? 'Failed to Load Job' : 'Job Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'The job you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <button
              onClick={() => navigate('/jobs')}
              className="btn btn-primary"
            >
              Browse Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <Header 
        tradie={state.tradie} 
        onLogout={callbacks.clearState}
        savedJobs={[]}
        recentlyViewedJobs={[]}
        submittedQuotes={state.submittedQuotes}
        onRemoveSavedJob={callbacks.toggleSavedJob}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton label="Back to Jobs" onClick={() => navigate('/jobs')} />
        </div>

        {/* 60/40 Split Layout */}
        <div className="split-60-40">
          {/* Left Column - 60% */}
          <div className="space-y-6">
            {/* Job Visual */}
            <div className="card overflow-hidden">
              <JobVisual category={job.category} className="w-full h-64" />
            </div>

            {/* Job Title and Save Button */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-navy mb-2">{job.title}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{job.customer.location}</span>
                  </div>
                  <span className={`badge ${job.urgency === 'Urgent' ? 'badge-urgent' : 'badge-normal'}`}>
                    {job.urgency}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSaveToggle}
                className="p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {isJobSaved ? (
                  <BookmarkCheck size={24} className="text-orange" />
                ) : (
                  <Bookmark size={24} className="text-gray-400" />
                )}
              </button>
            </div>

            {/* Customer Info */}
            <div className="card p-6">
              <h3 className="font-semibold text-navy mb-4">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Customer Name</label>
                  <p className="text-gray-700">{job.customer.name}</p>
                </div>
                <div>
                  <label className="form-label">Location</label>
                  <p className="text-gray-700">{job.customer.location}</p>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="card p-6">
              <h3 className="font-semibold text-navy mb-4">Job Description</h3>
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </div>

            {/* Budget */}
            <div className="card p-6">
              <h3 className="font-semibold text-navy mb-4">Customer Budget</h3>
              <div className="text-3xl font-bold text-orange">
                {formatBudgetRange(job.budget.min, job.budget.max)}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Budget provided by customer for this project
              </p>
            </div>

            {/* Duration Estimate */}
            <div className="card p-6">
              <h3 className="font-semibold text-navy mb-4">Estimated Duration</h3>
              <div className="flex items-center gap-3">
                <Clock size={24} className="text-navy" />
                <span className="text-xl font-semibold text-navy">
                  {formatDurationRange(job.aiScope.estimatedDuration.min, job.aiScope.estimatedDuration.max)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - 40% - Sticky */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* AI-Generated Scope Card */}
            <div className="ai-scope-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-orange rounded-full flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Estimate</h3>
                  <p className="text-sm text-white/80">Powered by TradeLink AI</p>
                </div>
              </div>

              {/* AI Cost Estimate */}
              <div className="mb-4">
                <p className="text-sm text-white/80 mb-1">Estimated Cost</p>
                <div className="text-2xl font-bold text-white">
                  {formatBudgetRange(job.aiScope.estimatedCost.min, job.aiScope.estimatedCost.max)}
                </div>
              </div>

              {/* AI Duration Estimate */}
              <div className="mb-4">
                <p className="text-sm text-white/80 mb-1">Estimated Duration</p>
                <div className="text-lg font-semibold text-white">
                  {formatDurationRange(job.aiScope.estimatedDuration.min, job.aiScope.estimatedDuration.max)}
                </div>
              </div>

              {/* Confidence Indicator */}
              <div className="mb-4">
                <p className="text-sm text-white/80 mb-2">Confidence Level</p>
                <div className="confidence-dots">
                  <div className={`confidence-dot ${job.aiScope.confidence === 'High' || job.aiScope.confidence === 'Medium' || job.aiScope.confidence === 'Low' ? 'filled' : 'empty'}`} />
                  <div className={`confidence-dot ${job.aiScope.confidence === 'High' || job.aiScope.confidence === 'Medium' ? 'filled' : 'empty'}`} />
                  <div className={`confidence-dot ${job.aiScope.confidence === 'High' ? 'filled' : 'empty'}`} />
                </div>
                <p className="text-xs text-white/60 mt-1">{job.aiScope.confidence} confidence</p>
                <p className="text-xs text-white/50 italic mt-2">
                  *This confidence level applies to the initial AI-generated estimate. You are free to adjust the scope and pricing to fit your professional assessment.
                </p>
              </div>

              {/* AI Scope Description */}
              <div className="pt-4 border-t border-white/20">
                <p className="text-sm text-white/80 mb-2">Scope of Work</p>
                <p className="text-sm text-white leading-relaxed">
                  {job.aiScope.description}
                </p>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-white/50 italic mt-4">
                *This is an AI-generated estimate. Actual costs and duration may vary based on specific requirements and site conditions.
              </p>
            </div>

            {/* AI Reliability Note */}
            <div className="card p-4 border-l-4 border-orange/50 bg-orange/5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Info size={18} className="text-orange" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  <span className="font-semibold text-navy">AI Estimate Notice:</span> AI estimates are a starting guide generated from limited job information and may be inaccurate. Always apply your own professional judgement before sending a quote.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleQuoteClick}
                className="btn btn-cta w-full flex items-center justify-center gap-3"
              >
                <span>Create Quote</span>
                <ArrowRight size={20} />
              </button>

              <button
                onClick={handleSaveToggle}
                className="btn btn-secondary w-full flex items-center justify-center gap-3"
              >
                {isJobSaved ? (
                  <>
                    <BookmarkCheck size={20} className="text-orange" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={20} />
                    <span>Save Job</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Stats */}
            <div className="card p-4">
              <h4 className="font-semibold text-navy mb-3">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-success" />
                  <span>AI Analysis Complete</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-success" />
                  <span>Customer Verified</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-success" />
                  <span>Location Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;