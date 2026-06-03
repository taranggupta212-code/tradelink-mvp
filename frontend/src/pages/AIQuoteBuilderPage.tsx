/**
 * TradeLink MVP - AI Quote Builder Page
 * 
 * Sticky header. 60/40 split.
 * Left: editable form (amount, duration, scope, notes).
 * Right: sticky summary with ThreeDButton for "Send Quote".
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Clock, 
  MessageSquare,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { AIQuoteBuilderPageProps, Job, TradeCategory } from '../types';
import Header from '../components/ui/Header';
import BackButton from '../components/ui/BackButton';
import ThreeDButton from '../components/ui/ThreeDButton';
import { formatBudgetRange, formatDurationRange } from '../data/sampleJobs';
import * as backendApi from '../lib/backendApi';

const STORAGE_KEY_TOKEN = 'tradelink_token';

/**
 * Convert a backend ApiJob into the frontend Job type
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
          description: '',
          estimatedCost: { min: 0, max: 0 },
          estimatedDuration: { min: 0, max: 0 },
          confidence: 'Low' as const,
        },
    postedDate: new Date(),
    hasAIEstimate: !!apiJob.aiScope,
  };
}

/**
 * AI Quote Builder page component
 * Allows tradies to create and submit quotes for jobs
 */
const AIQuoteBuilderPage: React.FC<AIQuoteBuilderPageProps> = ({ state, callbacks, jobId }) => {
  const navigate = useNavigate();

  // Job data fetched from API
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    amount: 0,
    duration: 0,
    notes: ''
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch job from API on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchJob() {
      setLoading(true);
      setError(null);
      try {
        const apiJob = await backendApi.getJob(jobId);
        if (!cancelled) {
          const mapped = mapApiJob(apiJob);
          setJob(mapped);
          // Pre-fill form with AI suggestions
          setFormData({
            amount: Math.round((mapped.aiScope.estimatedCost.min + mapped.aiScope.estimatedCost.max) / 2),
            duration: Math.round((mapped.aiScope.estimatedDuration.min + mapped.aiScope.estimatedDuration.max) / 2),
            notes: ''
          });
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          tradie={state.tradie} 
          onLogout={callbacks.clearState}
          savedJobs={[]}
          recentlyViewedJobs={[]}
          submittedQuotes={state.submittedQuotes}
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
          submittedQuotes={state.submittedQuotes}
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

  /**
   * Validate amount field
   */
  const validateAmount = (amount: number): string => {
    if (!amount || amount <= 0) return 'Amount is required';
    if (amount < 100) return 'Amount must be at least $100';
    if (amount > 100000) return 'Amount cannot exceed $100,000';
    return '';
  };

  /**
   * Validate duration field
   */
  const validateDuration = (duration: number): string => {
    if (!duration || duration <= 0) return 'Duration is required';
    if (duration < 1) return 'Duration must be at least 1 day';
    if (duration > 365) return 'Duration cannot exceed 365 days';
    return '';
  };

  /**
   * Handle input change
   */
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Handle input blur - trigger validation
   */
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate the field
    let error = '';
    switch (field) {
      case 'amount':
        error = validateAmount(formData.amount);
        break;
      case 'duration':
        error = validateDuration(formData.duration);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  /**
   * Check if form is valid
   */
  const isFormValid = (): boolean => {
    return (
      !validateAmount(formData.amount) &&
      !validateDuration(formData.duration)
    );
  };

  /**
   * Handle form submission — submit quote to backend API
   */
  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({
      amount: true,
      duration: true,
      notes: true
    });
    
    // Validate all fields
    const amountError = validateAmount(formData.amount);
    const durationError = validateDuration(formData.duration);
    
    setErrors({
      amount: amountError,
      duration: durationError
    });
    
    if (amountError || durationError) return;

    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!token) {
      setSubmitError('You must be logged in to submit a quote.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await backendApi.submitQuote(
        job.id,
        formData.amount,
        `${formData.duration} days`,
        formData.notes,
        token
      );
      navigate('/confirmation');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Format currency for display
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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
          <BackButton label="Back to Job" onClick={() => navigate(`/jobs/${jobId}`)} />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy mb-2">Create Quote</h1>
          <p className="text-gray-600">
            Create your quote for: <span className="font-semibold">{job.title}</span>
          </p>
        </div>

        {/* 60/40 Split Layout */}
        <div className="split-60-40">
          {/* Left Column - 60% */}
          <div className="space-y-6">
            {/* AI Suggestions Banner */}
            <div className="card p-4 bg-gradient-to-r from-navy/5 to-orange/5 border-l-4 border-orange">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange rounded-full flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy">AI Suggestions Loaded</h3>
                  <p className="text-sm text-gray-600">
                    We've pre-filled this form with AI-generated estimates. Feel free to adjust as needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Amount Field */}
            <div className="card p-6">
              <label htmlFor="amount" className="form-label flex items-center gap-2">
                <DollarSign size={16} />
                Quote Amount (AUD)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg">$</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  onBlur={() => handleBlur('amount')}
                  className={`form-input pl-8 text-lg font-semibold ${errors.amount && touched.amount ? 'border-red-500' : ''}`}
                  placeholder="Enter amount"
                  min="100"
                  max="100000"
                />
              </div>
              {errors.amount && touched.amount && (
                <p className="form-error">{errors.amount}</p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                Customer budget: {formatBudgetRange(job.budget.min, job.budget.max)}
              </p>
            </div>

            {/* Duration Field */}
            <div className="card p-6">
              <label htmlFor="duration" className="form-label flex items-center gap-2">
                <Clock size={16} />
                Estimated Duration (Days)
              </label>
              <input
                type="number"
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                onBlur={() => handleBlur('duration')}
                className={`form-input text-lg font-semibold ${errors.duration && touched.duration ? 'border-red-500' : ''}`}
                placeholder="Enter duration"
                min="1"
                max="365"
              />
              {errors.duration && touched.duration && (
                <p className="form-error">{errors.duration}</p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                AI estimate: {formatDurationRange(job.aiScope.estimatedDuration.min, job.aiScope.estimatedDuration.max)}
              </p>
            </div>

            {/* Notes Field */}
            <div className="card p-6">
              <label htmlFor="notes" className="form-label flex items-center gap-2">
                <MessageSquare size={16} />
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="form-input"
                placeholder="Any additional information for the customer..."
                rows={4}
              />
              <p className="text-sm text-gray-600 mt-2">
                Include any assumptions, exclusions, or special conditions
              </p>
            </div>
          </div>

          {/* Right Column - 40% - Sticky */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Quote Summary */}
            <div className="card p-6">
              <h3 className="font-semibold text-navy mb-4">Quote Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Job</span>
                  <span className="font-semibold text-navy">{job.title}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Customer</span>
                  <span className="font-semibold text-navy">{job.customer.name}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Location</span>
                  <span className="font-semibold text-navy">{job.customer.location}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Your Quote</span>
                  <span className="text-2xl font-bold text-orange">
                    {formatCurrency(formData.amount)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-navy">
                    {formData.duration} day{formData.duration !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Status</span>
                  <span className="badge badge-normal">Ready to Send</span>
                </div>
              </div>
            </div>

            {/* AI Confidence */}
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-orange rounded-full flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-navy">AI Confidence</h4>
                  <p className="text-sm text-gray-600">{job.aiScope.confidence} confidence</p>
                </div>
              </div>
              <div className="confidence-dots">
                <div className={`confidence-dot ${job.aiScope.confidence === 'High' || job.aiScope.confidence === 'Medium' || job.aiScope.confidence === 'Low' ? 'filled' : 'empty'}`} />
                <div className={`confidence-dot ${job.aiScope.confidence === 'High' || job.aiScope.confidence === 'Medium' ? 'filled' : 'empty'}`} />
                <div className={`confidence-dot ${job.aiScope.confidence === 'High' ? 'filled' : 'empty'}`} />
              </div>
            </div>

            {/* Form Validation Status */}
            <div className="card p-4">
              <h4 className="font-semibold text-navy mb-3">Form Status</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {formData.amount > 0 && !validateAmount(formData.amount) ? (
                    <CheckCircle size={16} className="text-success" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={formData.amount > 0 && !validateAmount(formData.amount) ? 'text-gray-700' : 'text-gray-500'}>
                    Amount valid
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {formData.duration > 0 && !validateDuration(formData.duration) ? (
                    <CheckCircle size={16} className="text-success" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={formData.duration > 0 && !validateDuration(formData.duration) ? 'text-gray-700' : 'text-gray-500'}>
                    Duration valid
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="card p-4 border-l-4 border-red-500 bg-red-50">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              </div>
            )}

            {/* Send Quote Button */}
            <ThreeDButton
              onClick={handleSubmit}
              disabled={!isFormValid() || submitting}
              className="w-full py-4 text-lg"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending Quote...
                </span>
              ) : (
                'Send Quote'
              )}
            </ThreeDButton>

            {/* Tips */}
            <div className="card p-4 bg-gray-50">
              <h4 className="font-semibold text-navy mb-2">💡 Tips for a Great Quote</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Be competitive but don't undervalue your work</li>
                <li>• Include all materials and labor in your scope</li>
                <li>• Mention any warranties or guarantees</li>
                <li>• Be clear about what's not included</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIQuoteBuilderPage;