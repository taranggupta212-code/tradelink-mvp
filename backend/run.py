"""
TradeLink Backend - Server Runner
===================================
Starts the FastAPI server using uvicorn.
Run this from the backend/ directory:
    python run.py

Or from the project root:
    backend\\venv\\Scripts\\python.exe backend\\run.py
"""
import os
import sys

# Change working directory to backend/ so uvicorn can find the api module.
# This is needed when running from the project root.
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import uvicorn

if __name__ == "__main__":
    uvicorn.run("api.index:app", host="127.0.0.1", port=8000, reload=True)