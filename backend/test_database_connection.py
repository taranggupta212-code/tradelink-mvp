"""
TradeLink Backend - Database Connection Test
==============================================
A simple script to verify that the backend can connect to the
Supabase PostgreSQL database using the credentials in .env.

Run this first to make sure everything is configured correctly.

Usage:
    python test_database_connection.py
"""

from database import get_connection


def test_connection() -> None:
    """
    Test the database connection and print the result.
    
    This does NOT print any credentials or the DATABASE_URL.
    It only prints whether the connection succeeded or failed.
    """
    conn = None
    try:
        # Attempt to connect
        conn = get_connection()
        
        # Run a simple query to confirm the connection works
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
            result = cur.fetchone()
            
            if result and result[0] == 1:
                print("Database connection successful")
            else:
                print("Database connection failed: unexpected query result")
    except Exception as e:
        # Print a generic error message (no credentials leaked)
        print(f"Database connection failed: {type(e).__name__}: {e}")
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    test_connection()