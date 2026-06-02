@echo off
title The Aiman's School Umerkot - Python Backend Runner
color 0D

echo.
echo  =============================================================
echo    THE AIMAN'S SCHOOL UMERKOT - PYTHON BACKEND RUNNER
echo  =============================================================
echo.

:: Step 1: Check if virtual environment exists
if not exist "backend\.venv" (
    echo [INFO] First-time setup: Creating Python virtual environment...
    echo [INFO] Creating .venv folder inside the backend directory...
    echo.
    
    py -m venv backend\.venv
    if errorlevel 1 (
        color 0C
        echo.
        echo [ERROR] Failed to create Python virtual environment!
        echo This usually means Python is not installed, or the 'py' launcher is not in your PATH.
        echo.
        echo Opening Python download page...
        start "" "https://www.python.org/downloads/"
        echo.
        echo Please download and install Python (3.10+ recommended),
        echo ensure to check "Add Python to PATH" during installation,
        echo then close this window and double-click run-backend.bat again.
        echo.
        pause
        exit /b
    )
    echo [SUCCESS] Virtual environment created successfully!
    echo.
)

:: Step 3: Install dependencies
:: We use a marker file to see if we've successfully installed dependencies before
if not exist "backend\.venv\dependencies_installed.marker" (
    echo [INFO] Installing required Python packages from backend\requirements.txt...
    echo [INFO] This might take a minute depending on your internet connection...
    echo.
    
    call backend\.venv\Scripts\pip install -r backend\requirements.txt
    if errorlevel 1 (
        color 0C
        echo.
        echo [ERROR] Python package installation failed!
        echo Please check your internet connection and try again.
        echo.
        pause
        exit /b
    )
    
    :: Create a marker file to avoid reinstalling every time
    echo installed > backend\.venv\dependencies_installed.marker
    echo.
    echo [SUCCESS] Python dependencies installed successfully!
    echo.
)

:: Step 4: Run the FastAPI server
echo [INFO] Starting the FastAPI development server...
echo =============================================================
echo   FastAPI will start on http://localhost:8000
echo   To view interactive documentation, visit: http://localhost:8000/docs
echo   To STOP the backend server, press Ctrl + C in this window.
echo =============================================================
echo.

:: Navigate to the backend folder and run uvicorn
cd backend
call .venv\Scripts\activate.bat
uvicorn main:app --reload --port 8000

pause
