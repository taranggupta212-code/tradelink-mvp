/**
 * TradeLink MVP - TypeScript Type Definitions
 * 
 * This file contains all the TypeScript interfaces and types used throughout the application.
 * These types ensure type safety and provide clear documentation for the data structures.
 */

// ============================================
// CORE DATA TYPES
// ============================================

/**
 * Represents a trade category in the system
 * Each category has specific visual styling and job characteristics
 */
export type TradeCategory = 
  | 'Carpentry'
  | 'Plumbing' 
  | 'Electrical'
  | 'Roofing'
  | 'Landscaping'
  | 'Tiling'
  | 'Painting';

/**
 * Urgency level for job postings
 */
export type UrgencyLevel = 'Urgent' | 'Normal';

/**
 * AI confidence level for generated estimates
 */
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

// ============================================
// USER TYPES
// ============================================

/**
 * Represents a registered tradie (tradesperson) in the system
 */
export interface Tradie {
  /** Unique identifier for the tradie */
  id: string;
  /** Tradie's full name */
  name: string;
  /** Tradie's email address */
  email: string;
  /** Tradie's primary trade category */
  trade: TradeCategory;
  /** Tradie's license number */
  license: string;
  /** Password (stored as plain text for MVP - would be hashed in production) */
  password: string;
  /** Account creation timestamp */
  createdAt: Date;
}

// ============================================
// JOB TYPES
// ============================================

/**
 * Represents a customer posting a job
 */
export interface Customer {
  /** Customer's name */
  name: string;
  /** Customer's location (suburb, state) */
  location: string;
}

/**
 * AI-generated scope of work for a job
 */
export interface AIScope {
  /** Detailed description of the work to be performed */
  description: string;
  /** AI-estimated cost range */
  estimatedCost: {
    /** Lower bound of cost estimate */
    min: number;
    /** Upper bound of cost estimate */
    max: number;
  };
  /** AI-estimated duration range in days */
  estimatedDuration: {
    /** Lower bound of duration estimate */
    min: number;
    /** Upper bound of duration estimate */
    max: number;
  };
  /** AI confidence level in the estimate */
  confidence: ConfidenceLevel;
}

/**
 * Represents a job posting in the system
 */
export interface Job {
  /** Unique identifier for the job */
  id: string;
  /** Job title */
  title: string;
  /** Detailed job description */
  description: string;
  /** Customer information */
  customer: Customer;
  /** Budget range provided by customer */
  budget: {
    /** Lower bound of budget */
    min: number;
    /** Upper bound of budget */
    max: number;
  };
  /** Trade category for this job */
  category: TradeCategory;
  /** Urgency level */
  urgency: UrgencyLevel;
  /** AI-generated scope of work */
  aiScope: AIScope;
  /** Job posting date */
  postedDate: Date;
  /** Whether this job has AI-generated estimates */
  hasAIEstimate: boolean;
}

// ============================================
// QUOTE TYPES
// ============================================

/**
 * Represents a quote submitted by a tradie
 */
export interface Quote {
  /** Unique identifier for the quote */
  id: string;
  /** ID of the job this quote is for */
  jobId: string;
  /** ID of the tradie who submitted the quote */
  tradieId: string;
  /** Quoted amount in dollars */
  amount: number;
  /** Estimated duration in days */
  duration: number;
  /** Detailed scope of work (optional) */
  scope?: string;
  /** Additional notes from the tradie */
  notes: string;
  /** Quote submission timestamp */
  submittedAt: Date;
  /** Quote status */
  status: 'pending' | 'accepted' | 'rejected';
}

/**
 * Form data for creating a new quote
 */
export interface QuoteFormData {
  /** Quoted amount in dollars */
  amount: number;
  /** Estimated duration in days */
  duration: number;
  /** Additional notes from the tradie */
  notes: string;
}

// ============================================
// APP STATE TYPES
// ============================================

/**
 * Application state managed in App.tsx
 * This is the central state that gets passed to all pages via props
 */
export interface AppState {
  /** Currently logged-in tradie (null if not logged in) */
  tradie: Tradie | null;
  /** ID of the currently selected job for viewing details */
  selectedJobId: string | null;
  /** Current quote being built (for the quote builder page) */
  currentQuote: QuoteFormData | null;
  /** All quotes submitted by the current tradie */
  submittedQuotes: Quote[];
  /** IDs of jobs saved/bookmarked by the tradie */
  savedJobIds: string[];
  /** IDs of recently viewed jobs (max 5) */
  recentlyViewedIds: string[];
}

/**
 * Callback functions for updating app state
 * These are passed as props to child components
 */
export interface AppCallbacks {
  /** Update the current tradie (login/logout) */
  setTradie: (tradie: Tradie | null) => void;
  /** Set the selected job ID */
  setSelectedJobId: (jobId: string | null) => void;
  /** Set the current quote being built */
  setCurrentQuote: (quote: QuoteFormData | null) => void;
  /** Add a submitted quote */
  addSubmittedQuote: (quote: Quote) => void;
  /** Toggle a job's saved status */
  toggleSavedJob: (jobId: string) => void;
  /** Add a job to recently viewed */
  addToRecentlyViewed: (jobId: string) => void;
  /** Clear all state (logout) */
  clearState: () => void;
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

/**
 * Props for the Logo component
 */
export interface LogoProps {
  /** Whether to show the full wordmark or just the badge */
  showWordmark?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for the Header component
 */
export interface HeaderProps {
  /** Currently logged-in tradie */
  tradie: Tradie | null;
  /** Callback for logout */
  onLogout: () => void;
  /** List of saved jobs */
  savedJobs?: Job[];
  /** List of recently viewed jobs */
  recentlyViewedJobs?: Job[];
  /** List of submitted quotes */
  submittedQuotes?: Quote[];
  /** Callback to remove a saved job */
  onRemoveSavedJob?: (jobId: string) => void;
}

/**
 * Props for the BackButton component
 */
export interface BackButtonProps {
  /** Custom back action (defaults to browser back) */
  onClick?: () => void;
  /** Label text */
  label?: string;
}

/**
 * Props for the IconButton component
 */
export interface IconButtonProps {
  /** Button text */
  children: React.ReactNode;
  /** Click handler */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Icon to display on the right */
  icon?: React.ReactNode;
}

/**
 * Props for the ThreeDButton component
 */
export interface ThreeDButtonProps {
  /** Button text */
  children: React.ReactNode;
  /** Click handler */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for the JobCard component
 */
export interface JobCardProps {
  /** Job data to display */
  job: Job;
  /** Whether this job is saved/bookmarked */
  isSaved: boolean;
  /** Callback when save button is clicked */
  onSaveToggle: (jobId: string) => void;
  /** Callback when card is clicked */
  onClick: (jobId: string) => void;
}

/**
 * Props for the JobVisual component
 */
export interface JobVisualProps {
  /** Trade category for styling */
  category: TradeCategory;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for the ProfileDropdown component
 */
export interface ProfileDropdownProps {
  /** Currently logged-in tradie */
  tradie: Tradie;
  /** List of saved jobs */
  savedJobs: Job[];
  /** List of recently viewed jobs */
  recentlyViewedJobs: Job[];
  /** List of submitted quotes */
  submittedQuotes: Quote[];
  /** Callback for logout */
  onLogout: () => void;
  /** Callback to remove a saved job */
  onRemoveSavedJob: (jobId: string) => void;
}

/**
 * Props for the FormSection component
 */
export interface FormSectionProps {
  /** Section title */
  title: string;
  /** Section description */
  description?: string;
  /** Form content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for form input fields
 */
export interface FormInputProps {
  /** Input label */
  label: string;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  /** Input value */
  value: string | number;
  /** Change handler */
  onChange: (value: string | number) => void;
  /** Blur handler for validation */
  onBlur?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Error message to display */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for the AIScopeCard component
 */
export interface AIScopeCardProps {
  /** AI scope data */
  scope: AIScope;
  /** Job category for styling */
  category: TradeCategory;
  /** Whether this is editable */
  editable?: boolean;
  /** Callback when scope is edited */
  onEdit?: (scope: AIScope) => void;
}

// ============================================
// PAGE PROP TYPES
// ============================================

/**
 * Base props that all pages receive
 */
export interface BasePageProps {
  /** Application state */
  state: AppState;
  /** Application callbacks */
  callbacks: AppCallbacks;
}

/**
 * Props for the Welcome page
 */
export interface WelcomePageProps extends BasePageProps {}

/**
 * Props for the Login page
 */
export interface LoginPageProps extends BasePageProps {}

/**
 * Props for the Sign Up page
 */
export interface SignUpPageProps extends BasePageProps {}

/**
 * Props for the Onboarding page
 */
export interface OnboardingPageProps extends BasePageProps {}

/**
 * Props for the Jobs Search page
 */
export interface JobsSearchPageProps extends BasePageProps {}

/**
 * Props for the Job Details page
 */
export interface JobDetailsPageProps extends BasePageProps {
  /** Job ID from URL params */
  jobId: string;
}

/**
 * Props for the AI Quote Builder page
 */
export interface AIQuoteBuilderPageProps extends BasePageProps {
  /** Job ID from URL params */
  jobId: string;
}

/**
 * Props for the Confirmation page
 */
export interface ConfirmationPageProps extends BasePageProps {}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Generic callback function type
 */
export type Callback<T = void> = () => T;

/**
 * Callback with a single parameter
 */
export type CallbackWithParam<P, T = void> = (param: P) => T;

/**
 * Form validation result
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * LocalStorage keys used in the application
 */
export type LocalStorageKey = 
  | 'tradelink_submittedQuotes'
  | 'tradelink_savedJobIds'
  | 'tradelink_recentlyViewedIds';