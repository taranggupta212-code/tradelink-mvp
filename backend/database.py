"""
TradeLink Backend - Database Connection Module
================================================
Handles connecting to the Supabase PostgreSQL database using psycopg2.
Loads credentials from the .env file and provides helper functions
for executing queries and commands.

Usage:
    from database import get_connection, execute_query, execute_command
    
    # Fetch rows
    jobs = execute_query("SELECT * FROM public.jobs")
    
    # Insert/update/delete
    execute_command("INSERT INTO public.quotes ...", (user_id, job_id, ...))
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables from the .env file in the backend directory.
# This makes os.environ["DATABASE_URL"] etc. available.
load_dotenv()


def get_connection():
    """
    Create and return a new database connection.
    
    Reads the DATABASE_URL environment variable set in .env.
    Returns a psycopg2 connection object.
    
    NOTE: For a production app, you'd use a connection pool (e.g. psycopg2.pool)
    to avoid opening a new connection for every request. For this MVP, a simple
    connection-per-request approach is fine.
    
    Returns:
        psycopg2.connection: A connection to the PostgreSQL database.
    """
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise ValueError(
            "DATABASE_URL is not set. Make sure you have a .env file "
            "in the backend/ directory with DATABASE_URL defined."
        )
    
    # Connect to the database using the URL from .env
    conn = psycopg2.connect(database_url)
    return conn


def execute_query(sql: str, params: tuple = None) -> list[dict]:
    """
    Execute a SELECT query and return results as a list of dictionaries.
    
    Each dictionary has column names as keys and row values as values.
    This makes it easy to convert to JSON for API responses.
    
    Args:
        sql: The SQL query string (can use %s placeholders).
        params: Optional tuple of parameters for the query.
    
    Returns:
        list[dict]: Query results as a list of dictionaries.
    
    Example:
        jobs = execute_query("SELECT * FROM public.jobs WHERE trade = %s", ("Plumbing",))
        # Returns: [{"id": "job-2", "title": "Bathroom Waterproofing", ...}]
    """
    conn = None
    try:
        conn = get_connection()
        # RealDictCursor returns rows as dictionaries instead of tuples
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            results = cur.fetchall()
            # Convert RealDictRow objects to plain dicts for JSON compatibility
            return [dict(row) for row in results]
    finally:
        # Always close the connection when done
        if conn:
            conn.close()


def execute_command(sql: str, params: tuple = None) -> int:
    """
    Execute an INSERT, UPDATE, or DELETE command.
    
    Automatically commits the transaction on success.
    Returns the number of rows affected.
    
    Args:
        sql: The SQL command string (can use %s placeholders).
        params: Optional tuple of parameters for the command.
    
    Returns:
        int: Number of rows affected by the command.
    
    Example:
        rows = execute_command(
            "INSERT INTO public.quotes (user_id, job_id, ...) VALUES (%s, %s, ...)",
            (user_id, job_id, ...)
        )
    """
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute(sql, params)
            conn.commit()  # Save the changes to the database
            return cur.rowcount
    finally:
        if conn:
            conn.close()