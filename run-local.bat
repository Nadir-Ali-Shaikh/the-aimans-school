@echo off
title The Aiman's School Umerkot - Local Runner
color 0E

echo.
echo  =============================================================
echo    THE AIMAN'S SCHOOL UMERKOT - LOCAL RUNNER
echo  =============================================================
echo.

:: Step 1: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed on this system!
    echo Node.js is required to run this website locally.
    echo.
    echo Opening Node.js download page...
    start "" "https://nodejs.org/"
    echo.
    echo Please download and install Node.js (LTS version recommended),
    echo then close this window and double-click run-local.bat again.
    echo.
    pause
    exit /b
)

:: Step 2: Check if node_modules folder exists
if not exist node_modules (
    echo [INFO] First-time setup: node_modules folder is missing.
    echo [INFO] Installing required website packages/dependencies...
    echo [INFO] This might take a minute or two depending on your internet connection.
    echo.
    call npm.cmd install
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo [ERROR] Package installation failed!
        echo Please ensure you are connected to the internet and try again.
        echo.
        pause
        exit /b
      )
    echo.
    echo [SUCCESS] Package installation completed successfully!
    echo.
)

:: Step 3: Start the local development server
echo [INFO] Starting the local development server...
echo [INFO] Bypassing PowerShell restrictions...
echo.
echo =============================================================
echo   Please wait a few seconds...
echo   The server will start and show the local URL (e.g., http://localhost:3000).
echo   To STOP the server, press Ctrl + C in this window.
echo =============================================================
echo.

call npm.cmd run dev

pause
