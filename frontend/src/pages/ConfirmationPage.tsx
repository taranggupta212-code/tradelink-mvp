/**
 * TradeLink MVP - Confirmation Page
 * 
 * Centered green checkmark, dynamic success message, action buttons.
 * Shows after successful quote submission.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  LogOut, 
  FileText,
  Sparkles,
  Clock,
  Loader2
} from 'lucide-react';
import type { ConfirmationPageProps } from '../types';
import Logo from '../components/ui/Logo';
import { getMyQuotes, getSavedJobs } from '../lib/backendApi';

/**
 * Confirmation page component
 * Displays success message after quote submission
 */
const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ state, callbacks }) => {
  const navigate = useNavigate();

  // Stats: null = loading, number = loaded, -1 = fetch error
  const [quotesCount, setQuotesCount] = useState<number | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [recentlyViewedCount, setRecentlyViewedCount] = useState(0);

  useEffect(() => {
    // Recently viewed from localStorage (no backend equivalent)
    const recentlyViewedIds = JSON.parse(localStorage.getItem('tradelink_recentlyViewedIds') || '[]');
    setRecentlyViewedCount(recentlyViewedIds.length);

    // Fetch live counts from backend
    const token = localStorage.getItem('tradelink_token');
    if (!token) {
      setQuotesCount(-1);
      setSavedCount(-1);
      return;
    }

    getMyQuotes(token)
      .then((quotes) => setQuotesCount(quotes.length))
      .catch(() => setQuotesCount(-1));

    getSavedJobs(token)
      .then((jobIds) => setSavedCount(jobIds.length))
      .catch(() => setSavedCount(-1));
  }, []);

  // Get the most recently submitted quote
  const lastQuote = state.submittedQuotes[state.submittedQuotes.length - 1];

  /**
   * Handle view jobs button click
   */
  const handleViewJobs = () => {
    navigate('/jobs');
  };

  /**
   * Handle create another quote button click
   */
  const handleCreateAnother = () => {
    navigate('/jobs');
  };

  /**
   * Handle logout button click
   */
  const handleLogout = () => {
    callbacks.clearState();
    navigate('/');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="md" showWordmark={true} />
          </div>

          {/* Success Card */}
          <div className="card p-8 text-center">
            {/* Success Checkmark */}
            <div className="success-checkmark mb-6">
              <CheckCircle size={48} className="text-white" />
            </div>

            {/* Success Message */}
            <h1 className="text-2xl font-bold text-navy mb-2">
              Quote Submitted!
            </h1>
            <p className="text-gray-600 mb-6">
              Your quote has been successfully sent to the customer.
            </p>

            {/* Quote Details */}
            {lastQuote && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-navy mb-3">Quote Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold text-orange">
                      {formatCurrency(lastQuote.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold text-navy">
                      {lastQuote.duration} day{lastQuote.duration !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="badge badge-normal">Pending Review</span>
                  </div>
                </div>
              </div>
            )}

            {/* What's Next Section */}
            <div className="bg-gradient-to-r from-navy/5 to-orange/5 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-navy mb-1">What's Next?</h3>
                  <p className="text-sm text-gray-600">
                    The customer will review your quote and get back to you within 24-48 hours. 
                    You'll receive a notification when they respond.
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="text-left mb-6">
              <h3 className="font-semibold text-navy mb-3">Expected Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-navy">Quote Submitted</p>
                    <p className="text-sm text-gray-600">Just now</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Clock size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Customer Review</p>
                    <p className="text-sm text-gray-600">24-48 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <FileText size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Decision & Hire</p>
                    <p className="text-sm text-gray-600">1-3 days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleViewJobs}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <span>View More Jobs</span>
                <ArrowRight size={20} />
              </button>

              <button
                onClick={handleCreateAnother}
                className="btn btn-secondary w-full flex items-center justify-center gap-2"
              >
                <FileText size={20} />
                <span>Create Another Quote</span>
              </button>

              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center justify-center gap-2 mx-auto"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="font-semibold text-navy mb-4">💡 While You Wait</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-success flex-shrink-0 mt-0.5" />
                <span>Check your email for quote confirmation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-success flex-shrink-0 mt-0.5" />
                <span>Review other available jobs in your area</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-success flex-shrink-0 mt-0.5" />
                <span>Update your profile to attract more customers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-success flex-shrink-0 mt-0.5" />
                <span>Prepare materials and tools for potential hire</span>
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
              {quotesCount === null ? (
                <Loader2 size={24} className="animate-spin text-navy mx-auto" />
              ) : quotesCount === -1 ? (
                <p className="text-2xl font-bold text-gray-400">—</p>
              ) : (
                <p className="text-2xl font-bold text-navy">{quotesCount}</p>
              )}
              <p className="text-sm text-gray-600">Quotes Sent</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
              {savedCount === null ? (
                <Loader2 size={24} className="animate-spin text-orange mx-auto" />
              ) : savedCount === -1 ? (
                <p className="text-2xl font-bold text-gray-400">—</p>
              ) : (
                <p className="text-2xl font-bold text-orange">{savedCount}</p>
              )}
              <p className="text-sm text-gray-600">Jobs Saved</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
              <p className="text-2xl font-bold text-navy">{recentlyViewedCount}</p>
              <p className="text-sm text-gray-600">Recently Viewed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>© 2026 TradeLink. All rights reserved.</p>
        <p className="mt-1">AI-powered quoting for Australian tradies</p>
      </footer>
    </div>
  );
};

export default ConfirmationPage;