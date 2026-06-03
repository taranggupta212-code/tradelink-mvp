/**
 * TradeLink - Backend API Helper
 *
 * Single source for all HTTP calls to the FastAPI backend.
 * Every function reads the base URL from import.meta.env.VITE_API_BASE_URL.
 * Protected endpoints accept a token and send it as a Bearer header.
 */

/** Base URL for the backend API, loaded from Vite env */
const BASE_URL: string = import.meta.env.VITE_API_BASE_URL as string;

// ============================================================
// Internal helpers
// ============================================================

/**
 * Build the full URL for a backend endpoint.
 */
function url(path: string): string {
  return `${BASE_URL}${path}`;
}

/**
 * Common fetch wrapper that throws a friendly error on non-2xx responses.
 */
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url(path), options);

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.detail) {
        // FastAPI uses { detail: "..." } for error messages
        errorMessage = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
      } else if (body.message) {
        errorMessage = body.message;
      }
    } catch {
      // Response body wasn't JSON — use default message
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

/**
 * Build standard JSON headers, optionally with a Bearer token.
 */
function headers(token?: string): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

// ============================================================
// Response types (matching backend API responses)
// ============================================================

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    trade_type?: string;
    license_number?: string;
  };
}

export interface SignupResponse {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

export interface ApiJob {
  id: string;
  title: string;
  description: string;
  customer: {
    name: string;
    location: string;
    initials: string;
  };
  budget: {
    min: number;
    max: number;
  };
  category: string;
  urgency: string;
  postedTimeAgo: string;
  customerRating: number | null;
  aiScope?: {
    description: string;
    estimatedCost: { min: number; max: number };
    estimatedDuration: { min: number; max: number };
    confidence: string;
  };
  aiQuoteSuggestion?: {
    scope_of_work: string;
    estimated_cost: number;
    estimated_duration: string;
    confidence_level: string;
  };
}

export interface ApiQuote {
  id: string;
  user_id: string;
  job_id: string;
  job_title: string;
  customer_name: string;
  amount: number;
  duration: string | null;
  notes: string | null;
  created_at: string;
}

// ============================================================
// Auth endpoints
// ============================================================

/**
 * Register a new user via the backend.
 * The backend calls Supabase Auth and a DB trigger creates the profile row.
 */
export async function signup(
  email: string,
  password: string,
  fullName: string,
  tradeType: string,
  licenseNumber: string,
): Promise<SignupResponse> {
  return request<SignupResponse>('/auth/signup', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
      trade_type: tradeType,
      license_number: licenseNumber,
    }),
  });
}

/**
 * Log in an existing user.
 * Returns the access token and user profile from Supabase.
 */
export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });
}

// ============================================================
// Job endpoints (public — no token required)
// ============================================================

/**
 * Fetch all available jobs from the backend.
 */
export async function getJobs(): Promise<ApiJob[]> {
  return request<ApiJob[]>('/jobs', {
    method: 'GET',
    headers: headers(),
  });
}

/**
 * Fetch a single job by ID, including the backend-generated AI quote suggestion.
 */
export async function getJob(jobId: string): Promise<ApiJob> {
  return request<ApiJob>(`/jobs/${encodeURIComponent(jobId)}`, {
    method: 'GET',
    headers: headers(),
  });
}

// ============================================================
// Quote endpoints (protected — token required)
// ============================================================

/**
 * Submit a new quote for a job.
 */
export async function submitQuote(
  jobId: string,
  amount: number,
  duration: string,
  notes: string,
  token: string,
): Promise<ApiQuote> {
  return request<ApiQuote>('/quotes', {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({
      job_id: jobId,
      amount,
      duration,
      notes,
    }),
  });
}

/**
 * Get all quotes submitted by the authenticated user.
 */
export async function getMyQuotes(token: string): Promise<ApiQuote[]> {
  return request<ApiQuote[]>('/quotes', {
    method: 'GET',
    headers: headers(token),
  });
}

// ============================================================
// Saved Jobs endpoints (protected — token required)
// ============================================================

/**
 * Get the authenticated user's saved job IDs.
 */
export async function getSavedJobs(token: string): Promise<string[]> {
  const data = await request<{ job_ids: string[] }>('/saved-jobs', {
    method: 'GET',
    headers: headers(token),
  });
  return data.job_ids;
}

/**
 * Save (bookmark) a job.
 */
export async function saveJob(
  jobId: string,
  token: string,
): Promise<void> {
  await request<unknown>('/saved-jobs', {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ job_id: jobId }),
  });
}

/**
 * Remove a saved job (un-bookmark).
 */
export async function unsaveJob(
  jobId: string,
  token: string,
): Promise<void> {
  await request<unknown>(`/saved-jobs/${encodeURIComponent(jobId)}`, {
    method: 'DELETE',
    headers: headers(token),
  });
}