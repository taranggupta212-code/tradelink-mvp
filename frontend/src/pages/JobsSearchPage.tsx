/**
 * TradeLink MVP - Jobs Search Page
 * 
 * Fetches jobs from the backend API instead of local sample data.
 * Full sticky header. 2-column grid on desktop, 1 column on mobile.
 * Displays job cards with save functionality.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Briefcase, AlertCircle } from 'lucide-react';
import type { JobsSearchPageProps, Job, TradeCategory } from '../types';
import Header from '../components/ui/Header';
import JobCard from '../components/ui/JobCard';
import * as backendApi from '../lib/backendApi';

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
 * Jobs Search page component
 */
const JobsSearchPage: React.FC<JobsSearchPageProps> = ({ state, callbacks }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // API state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trade categories for filtering
  const categories = [
    { value: 'all', label: 'All Trades' },
    { value: 'Carpentry', label: 'Carpentry' },
    { value: 'Plumbing', label: 'Plumbing' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Roofing', label: 'Roofing' },
    { value: 'Landscaping', label: 'Landscaping' },
    { value: 'Tiling', label: 'Tiling' },
    { value: 'Painting', label: 'Painting' }
  ];

  /**
   * Fetch jobs from the backend API on mount
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchJobs() {
      setLoading(true);
      setError(null);
      try {
        const apiJobs = await backendApi.getJobs();
        if (!cancelled) {
          setJobs(apiJobs.map(mapApiJob));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load jobs');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchJobs();
    return () => { cancelled = true; };
  }, []);

  /**
   * Filter jobs based on search query and category
   */
  const filteredJobs = useMemo(() => {
    let result = jobs;

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(job => job.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.customer.location.toLowerCase().includes(query)
      );
    }

    return result;
  }, [jobs, searchQuery, selectedCategory]);

  /**
   * Handle job card click
   */
  const handleJobClick = (jobId: string) => {
    callbacks.setSelectedJobId(jobId);
    callbacks.addToRecentlyViewed(jobId);
    navigate(`/jobs/${jobId}`);
  };

  /**
   * Handle save toggle
   */
  const handleSaveToggle = (jobId: string) => {
    callbacks.toggleSavedJob(jobId);
  };

  /**
   * Check if a job is saved
   */
  const isJobSaved = (jobId: string) => {
    return state.savedJobIds.includes(jobId);
  };

  // Build a partial job list for the header dropdowns
  const savedJobsForHeader = jobs.filter(job => state.savedJobIds.includes(job.id));
  const recentJobsForHeader = jobs.filter(job => state.recentlyViewedIds.includes(job.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <Header 
        tradie={state.tradie} 
        onLogout={callbacks.clearState}
        savedJobs={savedJobsForHeader}
        recentlyViewedJobs={recentJobsForHeader}
        submittedQuotes={state.submittedQuotes}
        onRemoveSavedJob={callbacks.toggleSavedJob}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, description, or location..."
                className="form-input pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Filter size={20} />
                <span>Filters</span>
              </button>

              {showFilters && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold text-navy">Trade Category</p>
                  </div>
                  <div className="py-2">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => {
                          setSelectedCategory(category.value);
                          setShowFilters(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-200 ${
                          selectedCategory === category.value ? 'text-orange font-medium' : 'text-gray-700'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange text-white text-sm rounded-full">
                  <Briefcase size={14} />
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-1 hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-navy text-white text-sm rounded-full">
                  <Search size={14} />
                  "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Count */}
          {!loading && !error && (
            <p className="text-gray-600">
              Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-navy rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-navy mb-2">Failed to load jobs</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && !error && filteredJobs.length > 0 && (
          <div className="grid-jobs">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={isJobSaved(job.id)}
                onSaveToggle={handleSaveToggle}
                onClick={handleJobClick}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredJobs.length === 0 && (
          <div className="empty-state py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-navy mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'There are currently no jobs available'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="btn btn-secondary"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsSearchPage;