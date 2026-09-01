@echo off
echo ========================================
echo JanConnect AI Backend - Quick Start
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo [WARNING] .env file not found!
    echo Please copy .env.example to .env and configure it.
    echo.
    echo Running: copy .env.example .env
    copy .env.example .env
    echo.
    echo Please edit .env with your database configuration.
    echo Then run this script again.
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
echo.

REM Run migrations
echo Running database migrations...
alembic upgrade head
echo.

REM Start server
echo Starting JanConnect AI Backend...
echo.
echo API Documentation: http://localhost:8000/docs
echo Health Check: http://localhost:8000/
echo.
uvicorn app.main:app --reload
