"""
TradeLink Backend - Database Setup Script
===========================================
Reads and executes the SQL setup script (backend/sql/setup.sql)
against the Supabase PostgreSQL database.

This creates all required tables, sets up the auto-profile trigger,
and seeds the demo job data.

Usage:
    python setup_database.py
"""

import os
from database import get_connection


def setup_database() -> None:
    """
    Read the SQL setup file and execute it against the database.
    
    This function:
    1. Reads backend/sql/setup.sql
    2. Opens a database connection
    3. Executes the entire SQL script
    4. Commits the transaction
    5. Prints a success message
    
    The SQL script uses CREATE TABLE IF NOT EXISTS and 
    INSERT ... WHERE NOT EXISTS, so it's safe to run multiple times.
    """
    conn = None
    try:
        # Build the path to the SQL file (relative to this script's location)
        # __file__ = backend/setup_database.py
        # parent = backend/
        # sql_file = backend/sql/setup.sql
        script_dir = os.path.dirname(os.path.abspath(__file__))
        sql_file_path = os.path.join(script_dir, "sql", "setup.sql")

        # Read the SQL file contents
        with open(sql_file_path, "r", encoding="utf-8") as f:
            sql_content = f.read()

        # Connect to the database and execute the SQL
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute(sql_content)
        conn.commit()

        print("Database initialization completed successfully")
    except FileNotFoundError:
        print(f"Error: SQL file not found at {sql_file_path}")
        print("Make sure backend/sql/setup.sql exists.")
    except Exception as e:
        print(f"Database setup failed: {type(e).__name__}: {e}")
        # Roll back the transaction on error
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    setup_database()