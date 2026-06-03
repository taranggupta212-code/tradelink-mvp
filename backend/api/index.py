"""
TradeLink Backend - FastAPI Application
=========================================
The main API server for the TradeLink platform.
Handles authentication (via Supabase Auth), job listings,
quotes, and saved jobs.

All routes are prefixed with /api (e.g. /api/health, /api/jobs).

Usage:
    # From the backend/ directory:
    uvicorn api.index:app --reload --port 8000
"""

import os
import sys
from typing import Optional

# Add the backend directory to Python's path so we can import database.py.
# This is needed because uvicorn runs from the backend/ directory,
# and api/index.py is one level deeper.
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx

# Load environment variables from .env
load_dotenv(os.path.join(backend_dir, ".env"))

# Import our database helper
from database import execute_query, execute_command


# ================================================================
# FastAPI App Setup
# ================================================================

# The FastAPI instance MUST be named 'app' for uvicorn to find it.
app = FastAPI(
    title="TradeLink API",
    description="AI-Assisted Smart Quoting Platform for Australian Tradies",
    version="1.0.0",
)

# --- CORS (Cross-Origin Resource Sharing) ---
# This allows the React frontend (running on a different port/domain)
# to make requests to this API.
# - localhost:5173 = local Vite dev server
# - *.vercel.app = deployed frontend on Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",  # Vite sometimes picks another port
        "https://*.vercel.app",
    ],
    # Allow credentials (cookies, auth headers)
    allow_credentials=True,
    # Allow all HTTP methods
    allow_methods=["*"],
    # Allow all headers (including Authorization)
    allow_headers=["*"],
)


# ================================================================
# Environment Variables
# ================================================================

# Supabase project URL (e.g. https://xyz.supabase.co)
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
# Supabase publishable key (safe to expose in client-side code)
SUPABASE_KEY = os.environ.get("SUPABASE_PUBLISHABLE_KEY", "")


# ================================================================
# Pydantic Models (Request/Response Schemas)
# ================================================================
# These define the shape of data the API accepts and returns.
# FastAPI uses them for automatic validation and documentation.

class HealthResponse(BaseModel):
    """Response model for the health check endpoint."""
    status: str


class SignupRequest(BaseModel):
    """Request body for user signup."""
    email: str
    password: str
    full_name: str
    trade_type: str
    license_number: str


class LoginRequest(BaseModel):
    """Request body for user login."""
    email: str
    password: str


class LoginResponse(BaseModel):
    """Response model for successful login."""
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str
    user: dict


class QuoteRequest(BaseModel):
    """Request body for submitting a quote."""
    job_id: str
    amount: int
    duration: Optional[str] = None
    notes: Optional[str] = None


class SaveJobRequest(BaseModel):
    """Request body for saving a job."""
    job_id: str


class AIQuoteSuggestion(BaseModel):
    """AI-generated quote suggestion for a job."""
    scope_of_work: str
    estimated_cost: int
    estimated_duration: str
    confidence_level: str


# ================================================================
# Authentication Helper
# ================================================================
# This verifies that the user is logged in by checking their
# Supabase access token (passed in the Authorization header).
#
# HOW IT WORKS:
# 1. The frontend sends: Authorization: Bearer <access_token>
# 2. We call Supabase's /auth/v1/user endpoint with that token
# 3. Supabase tells us who the user is (id, email, metadata)
# 4. We return the user info so protected endpoints can use it
#
# NOTE FOR PRODUCTION: This approach calls Supabase on every request.
# A production app would verify the JWT locally (faster, no network call).
# For this MVP, this approach is simpler and perfectly functional.

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    FastAPI dependency that extracts and verifies the user's auth token.
    
    Usage in a route:
        @app.get("/api/protected")
        async def protected_route(user = Depends(get_current_user)):
            user_id = user["id"]
            ...
    """
    # Check that the Authorization header exists and starts with "Bearer"
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid Authorization header. "
                   "Expected format: 'Bearer <token>'"
        )
    
    # Extract the token (remove the "Bearer " prefix)
    token = authorization.replace("Bearer ", "")
    
    # Call Supabase Auth to verify the token and get user info
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": SUPABASE_KEY,
                },
                timeout=10.0,
            )
        
        # If Supabase returns an error, the token is invalid
        if response.status_code != 200:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token. Please log in again."
            )
        
        # Return the user data from Supabase
        return response.json()
    
    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Could not verify authentication. Supabase may be unreachable."
        )


# ================================================================
# AI Smart Quote Logic
# ================================================================

def generate_ai_quote(job: dict) -> dict:
    """
    Generate an AI-powered quote suggestion based on the job data.
    
    This function analyzes the job's trade, budget range, and other
    factors to produce a realistic quote suggestion. The frontend
    displays this in the AI Scope card on the job details page.
    
    Args:
        job: A dictionary containing job data (from the jobs table).
             Expected keys: trade, budget_min, budget_max, title, etc.
    
    Returns:
        A dict matching the AIQuoteSuggestion schema with:
        - scope_of_work: Trade-specific work description
        - estimated_cost: Calculated cost estimate (AUD)
        - estimated_duration: Time estimate (e.g. "3-5 days")
        - confidence_level: "High", "Medium", or "Low"
    """
    trade = job.get("trade", "General")
    budget_min = job.get("budget_min", 0)
    budget_max = job.get("budget_max", 0)
    
    # --- Scope of Work ---
    # Template a trade-specific description
    scope_templates = {
        "Carpentry": (
            "Complete carpentry work including material sourcing, preparation, "
            "installation, finishing, and site cleanup. All work to comply with "
            "Australian building codes and standards."
        ),
        "Plumbing": (
            "Complete plumbing work including assessment, material procurement, "
            "installation/repair, pressure testing, and compliance certification "
            "to AS/NZS 3500 standards."
        ),
        "Electrical": (
            "Complete electrical work including assessment, rewiring/installation, "
            "switchboard compliance, testing and tagging, and Certificate of "
            "Electrical Safety (COES) issuance."
        ),
        "Roofing": (
            "Complete roofing work including inspection, material sourcing, "
            "repair/replacement of damaged sections, waterproofing, and "
            "cleanup. All work to comply with NCC/BCA requirements."
        ),
        "Landscaping": (
            "Complete landscaping work including site preparation, material "
            "delivery, earthworks, planting/retaining wall construction, "
            "irrigation setup, and final site cleanup."
        ),
        "Tiling": (
            "Complete tiling work including surface preparation, waterproofing, "
            "tile cutting and laying, grouting, sealing, and cleanup. "
            "All work to AS 3958.1 standards."
        ),
        "Painting": (
            "Complete painting work including surface preparation, priming, "
            "two coats of premium paint, cutting in, and full site cleanup. "
            "All surfaces to be properly prepped and protected."
        ),
    }
    scope_of_work = scope_templates.get(
        trade,
        "Complete trade work including assessment, material sourcing, "
        "professional execution, quality assurance, and site cleanup."
    )
    
    # --- Estimated Cost ---
    # Start with the midpoint of the budget range
    midpoint = (budget_min + budget_max) / 2
    
    # Adjust based on trade (some trades tend to cost more within their range)
    trade_adjustments = {
        "Electrical": 0.08,   # Electrical tends to run higher
        "Carpentry": 0.05,    # Carpentry slightly higher
        "Plumbing": 0.03,     # Plumbing slightly higher
        "Roofing": 0.0,       # Roofing at midpoint
        "Landscaping": -0.03, # Landscaping slightly lower
        "Tiling": 0.0,        # Tiling at midpoint
        "Painting": -0.05,    # Painting tends to be lower
    }
    
    adjustment = trade_adjustments.get(trade, 0.0)
    estimated_cost = int(midpoint * (1 + adjustment))
    
    # Clamp to within the budget range (safety check)
    estimated_cost = max(budget_min, min(budget_max, estimated_cost))
    
    # --- Estimated Duration ---
    # Derive from the estimated cost (rough banding)
    if estimated_cost < 1500:
        estimated_duration = "1-2 days"
    elif estimated_cost < 3000:
        estimated_duration = "3-5 days"
    else:
        estimated_duration = "5-10 days"
    
    # --- Confidence Level ---
    # Based on how wide the budget range is relative to the midpoint
    # A narrow range = more predictable = higher confidence
    if budget_max == 0:
        confidence_level = "Low"
    else:
        range_ratio = (budget_max - budget_min) / budget_max
        if range_ratio < 0.2:
            # Range is less than 20% of max → very predictable
            confidence_level = "High"
        elif range_ratio < 0.4:
            # Range is 20-40% of max → moderately predictable
            confidence_level = "Medium"
        else:
            # Wide range → harder to estimate
            confidence_level = "Low"
    
    return {
        "scope_of_work": scope_of_work,
        "estimated_cost": estimated_cost,
        "estimated_duration": estimated_duration,
        "confidence_level": confidence_level,
    }


# ================================================================
# Helper: Format a database job row into API response format
# ================================================================

def format_job_response(job: dict, include_ai_quote: bool = False) -> dict:
    """
    Convert a raw database job row into the format the frontend expects.
    
    The database stores flat columns (budget_min, budget_max, customer_name, etc.)
    but the frontend TypeScript interface expects nested objects.
    
    Args:
        job: Raw database row as a dict.
        include_ai_quote: If True, include an AI quote suggestion.
    
    Returns:
        A dict matching the frontend's Job TypeScript interface.
    """
    result = {
        "id": job["id"],
        "title": job["title"],
        "description": job.get("description", ""),
        "customer": {
            "name": job["customer_name"],
            "location": job["location"],
            "initials": job.get("customer_initials", ""),
        },
        "budget": {
            "min": job["budget_min"],
            "max": job["budget_max"],
        },
        "category": job["trade"],
        "urgency": "Urgent" if job.get("urgent") else "Normal",
        "postedTimeAgo": job.get("posted_time_ago", ""),
        "customerRating": float(job["customer_rating"]) if job.get("customer_rating") else None,
    }
    
    # Include AI quote if requested (used for the single-job detail endpoint)
    if include_ai_quote:
        ai_quote = generate_ai_quote(job)
        result["aiScope"] = {
            "description": ai_quote["scope_of_work"],
            "estimatedCost": {
                "min": int(job["budget_min"]),
                "max": int(job["budget_max"]),
            },
            "estimatedDuration": {
                "min": 1,
                "max": 10,
            },
            "confidence": ai_quote["confidence_level"],
        }
        result["aiQuoteSuggestion"] = ai_quote
    
    return result


# ================================================================
# API Endpoints
# ================================================================

# ---- Health Check ----

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """
    Simple health check endpoint.
    Returns {"status": "ok"} to confirm the API is running.
    Useful for monitoring and deployment checks.
    """
    return {"status": "ok"}


# ---- Authentication ----

@app.post("/api/auth/signup")
async def signup(request: SignupRequest):
    """
    Register a new user (tradie) on the platform.
    
    This calls Supabase Auth to create the user account.
    The user's full_name, trade_type, and license_number are stored
    in Supabase's user_metadata field, and a trigger automatically
    copies them into the public.profiles table.
    
    Request body:
        - email: User's email address
        - password: User's chosen password (min 6 characters)
        - full_name: Tradie's full name
        - trade_type: Primary trade (e.g. "Carpentry")
        - license_number: License or ABN number
    
    Returns:
        Supabase Auth signup response (user info + session tokens).
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SUPABASE_URL}/auth/v1/signup",
            headers={
                "apikey": SUPABASE_KEY,
                "Content-Type": "application/json",
            },
            json={
                "email": request.email,
                "password": request.password,
                "data": {
                    "full_name": request.full_name,
                    "trade_type": request.trade_type,
                    "license_number": request.license_number,
                },
            },
            timeout=15.0,
        )
    
    if response.status_code != 200:
        # Forward Supabase's error message to the frontend
        error_data = response.json()
        error_msg = error_data.get("msg", error_data.get("message", "Signup failed"))
        raise HTTPException(status_code=400, detail=error_msg)
    
    return response.json()


@app.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Log in an existing user.
    
    Calls Supabase Auth's token endpoint to verify credentials
    and get access/refresh tokens.
    
    Request body:
        - email: User's email address
        - password: User's password
    
    Returns:
        - access_token: JWT for authenticating API requests
        - refresh_token: Token to get a new access_token when it expires
        - expires_in: Seconds until the access_token expires
        - token_type: Always "bearer"
        - user: User info from Supabase (id, email, metadata)
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers={
                "apikey": SUPABASE_KEY,
                "Content-Type": "application/json",
            },
            json={
                "email": request.email,
                "password": request.password,
            },
            timeout=15.0,
        )
    
    if response.status_code != 200:
        error_data = response.json()
        error_msg = error_data.get("error_description", error_data.get("msg", "Login failed"))
        raise HTTPException(status_code=401, detail=error_msg)
    
    data = response.json()
    return {
        "access_token": data["access_token"],
        "refresh_token": data["refresh_token"],
        "expires_in": data["expires_in"],
        "token_type": data["token_type"],
        "user": data["user"],
    }


# ---- Jobs ----

@app.get("/api/jobs")
async def get_jobs():
    """
    Get all available job postings.
    
    Returns an array of jobs from the public.jobs table.
    Each job includes customer info, budget range, trade category,
    and urgency flag. Does NOT require authentication.
    
    Returns:
        Array of job objects.
    """
    rows = execute_query("SELECT * FROM public.jobs ORDER BY created_at DESC")
    return [format_job_response(row) for row in rows]


@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    """
    Get a single job by ID, including an AI-generated quote suggestion.
    
    The AI quote is generated dynamically by the backend's
    generate_ai_quote() function — it analyzes the job's trade,
    budget range, and other factors to produce a realistic estimate.
    
    Path parameter:
        - job_id: The job's ID (e.g. "job-1")
    
    Returns:
        Job object with an additional aiQuoteSuggestion field.
    """
    rows = execute_query(
        "SELECT * FROM public.jobs WHERE id = %s",
        (job_id,)
    )
    
    if not rows:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found")
    
    return format_job_response(rows[0], include_ai_quote=True)


# ---- Quotes (Protected) ----

@app.post("/api/quotes")
async def create_quote(
    request: QuoteRequest,
    user: dict = Depends(get_current_user),
):
    """
    Submit a new quote for a job. (Requires authentication)
    
    The quote is saved to the public.quotes table, linked to
    the authenticated user.
    
    Request body:
        - job_id: ID of the job being quoted
        - amount: Quoted price in AUD (must be > 0)
        - duration: Estimated duration (e.g. "3-5 days")
        - notes: Additional notes for the customer
    
    Returns:
        The created quote object.
    """
    user_id = user["id"]
    
    # Look up the job to get its title and customer name
    job_rows = execute_query(
        "SELECT title, customer_name FROM public.jobs WHERE id = %s",
        (request.job_id,)
    )
    if not job_rows:
        raise HTTPException(status_code=404, detail=f"Job '{request.job_id}' not found")
    
    job = job_rows[0]
    
    # Insert the quote into the database
    sql = """
        INSERT INTO public.quotes (user_id, job_id, job_title, customer_name, amount, duration, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id, user_id, job_id, job_title, customer_name, amount, duration, notes, created_at
    """
    from database import get_connection
    from psycopg2.extras import RealDictCursor
    
    conn = None
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, (
                user_id,
                request.job_id,
                job["title"],
                job["customer_name"],
                request.amount,
                request.duration,
                request.notes,
            ))
            result = dict(cur.fetchone())
            conn.commit()
            return result
    finally:
        if conn:
            conn.close()


@app.get("/api/quotes")
async def get_quotes(user: dict = Depends(get_current_user)):
    """
    Get all quotes submitted by the authenticated user. (Requires authentication)
    
    Returns quotes ordered by most recent first.
    
    Returns:
        Array of quote objects.
    """
    user_id = user["id"]
    rows = execute_query(
        "SELECT * FROM public.quotes WHERE user_id = %s ORDER BY created_at DESC",
        (user_id,)
    )
    return rows


# ---- Saved Jobs (Protected) ----

@app.get("/api/saved-jobs")
async def get_saved_jobs(user: dict = Depends(get_current_user)):
    """
    Get the authenticated user's saved job IDs. (Requires authentication)
    
    Returns:
        Object with a "job_ids" array of saved job ID strings.
    """
    user_id = user["id"]
    rows = execute_query(
        "SELECT job_id FROM public.saved_jobs WHERE user_id = %s",
        (user_id,)
    )
    # Return just the list of job_id strings for easy frontend consumption
    return {"job_ids": [row["job_id"] for row in rows]}


@app.post("/api/saved-jobs")
async def save_job(
    request: SaveJobRequest,
    user: dict = Depends(get_current_user),
):
    """
    Save (bookmark) a job for the authenticated user. (Requires authentication)
    
    If the job is already saved, this is a no-op (due to UNIQUE constraint
    with ON CONFLICT handling).
    
    Request body:
        - job_id: ID of the job to save
    
    Returns:
        Confirmation message.
    """
    user_id = user["id"]
    
    # Use INSERT ... ON CONFLICT DO NOTHING to handle duplicate saves gracefully
    execute_command(
        "INSERT INTO public.saved_jobs (user_id, job_id) VALUES (%s, %s) ON CONFLICT (user_id, job_id) DO NOTHING",
        (user_id, request.job_id)
    )
    return {"message": "Job saved", "job_id": request.job_id}


@app.delete("/api/saved-jobs/{job_id}")
async def delete_saved_job(
    job_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Remove a saved job for the authenticated user. (Requires authentication)
    
    Path parameter:
        - job_id: ID of the job to unsave
    
    Returns:
        Confirmation message.
    """
    user_id = user["id"]
    execute_command(
        "DELETE FROM public.saved_jobs WHERE user_id = %s AND job_id = %s",
        (user_id, job_id)
    )
    return {"message": "Job unsaved", "job_id": job_id}