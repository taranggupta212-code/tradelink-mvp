/**
 * TradeLink - Main Application Component
 *
 * Central state hub for the entire application.
 * Manages routing, auth state, and passes data/callbacks to pages.
 * Auth tokens and user data are stored in localStorage.
 * Protected routes redirect to /login when no token is present.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { AppState, AppCallbacks, Tradie, QuoteFormData } from './types';
import * as backendApi from './lib/backendApi';

// Import pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import OnboardingPage from './pages/OnboardingPage';
import JobsSearchPage from './pages/JobsSearchPage';
import JobDetailsPage from './pages/JobDetailsPage';
import AIQuoteBuilderPage from './pages/AIQuoteBuilderPage';
import ConfirmationPage from './pages/ConfirmationPage';

/**
 * LocalStorage keys
 */
const STORAGE_KEYS = {
  TOKEN: 'tradelink_token',
  USER: 'tradelink_user',
  RECENTLY_VIEWED_IDS: 'tradelink_recentlyViewedIds',
} as const;

/**
 * Protected Route wrapper.
 * Redirects to /login if there is no auth token in localStorage.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * Main App component
 */
const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    tradie: null,
    selectedJobId: null,
    currentQuote: null,
    submittedQuotes: [],
    savedJobIds: [],
    recentlyViewedIds: [],
  });

  // ---- Restore auth and persisted state on mount ----
  useEffect(() => {
    try {
      // Restore auth from localStorage
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const savedRecentlyViewed = localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED_IDS);

      setState(prev => ({
        ...prev,
        tradie: savedUser ? JSON.parse(savedUser) : null,
        recentlyViewedIds: savedRecentlyViewed ? JSON.parse(savedRecentlyViewed) : [],
      }));
    } catch (error) {
      console.error('Error loading persisted state:', error);
    }
  }, []);

  // ---- Fetch saved jobs from backend when user is logged in ----
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return;

    backendApi.getSavedJobs(token)
      .then(ids => {
        setState(prev => ({ ...prev, savedJobIds: ids }));
      })
      .catch(err => {
        console.error('Error fetching saved jobs:', err);
      });
  }, [state.tradie]);

  // ---- Persist recently viewed IDs to localStorage ----
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.RECENTLY_VIEWED_IDS,
        JSON.stringify(state.recentlyViewedIds),
      );
    } catch (error) {
      console.error('Error persisting recently viewed IDs:', error);
    }
  }, [state.recentlyViewedIds]);

  // ---- Callbacks ----

  /**
   * Set the current tradie (login).
   * Stores the user object in localStorage.
   */
  const setTradie = useCallback((tradie: Tradie | null) => {
    setState(prev => ({ ...prev, tradie }));
    if (tradie) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(tradie));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, []);

  /**
   * Set the selected job ID
   */
  const setSelectedJobId = useCallback((jobId: string | null) => {
    setState(prev => ({ ...prev, selectedJobId: jobId }));
  }, []);

  /**
   * Set the current quote being built
   */
  const setCurrentQuote = useCallback((quote: QuoteFormData | null) => {
    setState(prev => ({ ...prev, currentQuote: quote }));
  }, []);

  /**
   * Add a submitted quote (kept for compatibility, but quotes are now
   * primarily fetched from the backend via getMyQuotes)
   */
  const addSubmittedQuote = useCallback((_quote: unknown) => {
    // No-op for localStorage — quotes are persisted by the backend.
    // The page will re-fetch from the API after submission.
  }, []);

  /**
   * Toggle a job's saved status via the backend API.
   * Updates local state optimistically.
   */
  const toggleSavedJob = useCallback(async (jobId: string) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return;

    const isCurrentlySaved = state.savedJobIds.includes(jobId);

    // Optimistic update
    setState(prev => ({
      ...prev,
      savedJobIds: isCurrentlySaved
        ? prev.savedJobIds.filter(id => id !== jobId)
        : [...prev.savedJobIds, jobId],
    }));

    try {
      if (isCurrentlySaved) {
        await backendApi.unsaveJob(jobId, token);
      } else {
        await backendApi.saveJob(jobId, token);
      }
    } catch (err) {
      console.error('Error toggling saved job:', err);
      // Revert optimistic update on failure
      setState(prev => ({
        ...prev,
        savedJobIds: isCurrentlySaved
          ? [...prev.savedJobIds, jobId]
          : prev.savedJobIds.filter(id => id !== jobId),
      }));
    }
  }, [state.savedJobIds]);

  /**
   * Add a job to recently viewed (max 5).
   * Stays in localStorage since it's local convenience data.
   */
  const addToRecentlyViewed = useCallback((jobId: string) => {
    setState(prev => {
      const filtered = prev.recentlyViewedIds.filter(id => id !== jobId);
      const updated = [jobId, ...filtered].slice(0, 5);
      return { ...prev, recentlyViewedIds: updated };
    });
  }, []);

  /**
   * Clear all state (logout).
   * Removes auth token, user, and recently viewed from localStorage.
   */
  const clearState = useCallback(() => {
    setState({
      tradie: null,
      selectedJobId: null,
      currentQuote: null,
      submittedQuotes: [],
      savedJobIds: [],
      recentlyViewedIds: [],
    });
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.RECENTLY_VIEWED_IDS);
  }, []);

  // Callbacks object to pass to pages
  const callbacks: AppCallbacks = {
    setTradie,
    setSelectedJobId,
    setCurrentQuote,
    addSubmittedQuote,
    toggleSavedJob,
    addToRecentlyViewed,
    clearState,
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<WelcomePage state={state} callbacks={callbacks} />} />
        <Route path="/login" element={<LoginPage state={state} callbacks={callbacks} />} />
        <Route path="/signup" element={<SignUpPage state={state} callbacks={callbacks} />} />
        <Route path="/onboarding" element={<OnboardingPage state={state} callbacks={callbacks} />} />

        {/* Protected routes — require auth token */}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <JobsSearchPage state={state} callbacks={callbacks} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <JobDetailsPageWrapper state={state} callbacks={callbacks} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quote/:id"
          element={
            <ProtectedRoute>
              <AIQuoteBuilderPageWrapper state={state} callbacks={callbacks} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/confirmation"
          element={
            <ProtectedRoute>
              <ConfirmationPage state={state} callbacks={callbacks} />
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown routes to welcome */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

/**
 * Wrapper for JobDetailsPage to extract URL params using useParams
 */
const JobDetailsPageWrapper: React.FC<{
  state: AppState;
  callbacks: AppCallbacks;
}> = ({ state, callbacks }) => {
  const jobId = window.location.pathname.split('/').pop() || '';
  return (
    <JobDetailsPage
      state={state}
      callbacks={callbacks}
      jobId={jobId}
    />
  );
};

/**
 * Wrapper for AIQuoteBuilderPage to extract URL params using useParams
 */
const AIQuoteBuilderPageWrapper: React.FC<{
  state: AppState;
  callbacks: AppCallbacks;
}> = ({ state, callbacks }) => {
  const jobId = window.location.pathname.split('/').pop() || '';
  return (
    <AIQuoteBuilderPage
      state={state}
      callbacks={callbacks}
      jobId={jobId}
    />
  );
};

export default App;