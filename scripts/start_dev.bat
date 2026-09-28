@echo off
echo Starting AI Quantum Computing Learning Platform...

echo Starting FastAPI Backend on http://localhost:8000 ...
start cmd /k "cd /d %~dp0..\backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo Starting Vite React Frontend on http://localhost:5173 ...
start cmd /k "cd /d %~dp0..\frontend && npm run dev"

echo Both services launched successfully!
