"""
TradeLink Backend - Table Verification Script
===============================================
Checks that all required tables exist in the Supabase database.
Run this after setup_database.py to confirm everything was created.

Usage:
    python check_tables.py
"""

from database import execute_query


def check_tables() -> None:
    """
    Query the database's information_schema to verify that all
    four required tables exist in the 'public' schema.
    
    Prints "Table found" for each table that exists,
    or "Table NOT found" if it's missing.
    """
    # The four tables our app needs
    required_tables = ["profiles", "jobs", "quotes", "saved_jobs"]

    # SQL to check which public tables exist
    # information_schema.tables is a standard PostgreSQL metadata view
    sql = """
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = ANY(%s)
    """

    try:
        rows = execute_query(sql, (required_tables,))
        # Get the list of table names that were found
        found_tables = [row["table_name"] for row in rows]

        # Print results for each required table
        for table_name in required_tables:
            if table_name in found_tables:
                print(f"Table found: {table_name}")
            else:
                print(f"Table NOT found: {table_name}")

    except Exception as e:
        print(f"Error checking tables: {type(e).__name__}: {e}")


if __name__ == "__main__":
    check_tables()