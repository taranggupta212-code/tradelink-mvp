# TradeLink Backend

FastAPI backend for the TradeLink AI-Assisted Quoting Platform. Connects to a Supabase PostgreSQL database and provides REST API endpoints for authentication, jobs, quotes, and saved jobs.

## Quick Start

### Windows (PowerShell)

```powershell
# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Test the database connection
python test_database_connection.py

# Create tables and seed data
python setup_database.py

# Verify tables exist
python check_tables.py

# Start the development server
uvicorn api.index:app --reload --port 8000
```

### macOS / Linux

```bash
# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Test the database connection
python test_database_connection.py

# Create tables and seed data
python setup_database.py

# Verify tables exist
python check_tables.py

# Start the development server
uvicorn api.index:app --reload --port 8000
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `DATABASE_URL` | PostgreSQL connection string (URL-encode special chars in password) |

> **Note:** The `.env` file is git-ignored and should never be committed to version control.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/signup` | No | Register a new user |
| POST | `/api/auth/login` | No | Log in and get tokens |
| GET | `/api/jobs` | No | List all jobs |
| GET | `/api/jobs/{job_id}` | No | Get a job with AI quote suggestion |
| POST | `/api/quotes` | Yes | Submit a quote |
| GET | `/api/quotes` | Yes | List user's quotes |
| GET | `/api/saved-jobs` | Yes | Get user's saved job IDs |
| POST | `/api/saved-jobs` | Yes | Save a job |
| DELETE | `/api/saved-jobs/{job_id}` | Yes | Remove a saved job |

## Interactive API Docs

Once the server is running, open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) for the Swagger UI.

## Database Tables

- **profiles** - Tradie profile data (auto-created on signup via trigger)
- **jobs** - Job postings (seeded with 5 demo jobs)
- **quotes** - User-submitted quotes
- **saved_jobs** - User-bookmarked jobs

## Project Structure

```
backend/
├── api/
│   ├── __init__.py      # Makes api/ a Python package
│   └── index.py         # FastAPI app with all endpoints
├── sql/
│   └── setup.sql        # Database schema + seed data
├── .env                 # Real credentials (git-ignored)
├── .env.example         # Credential template
├── database.py          # Database connection helpers
├── setup_database.py    # Runs setup.sql against Supabase
├── test_database_connection.py  # Connection test
├── check_tables.py      # Verifies tables exist
├── requirements.txt     # Python dependencies
└── README.md            # This file