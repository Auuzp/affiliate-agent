@echo off
title AffiliatePilot AI - 24/7 Autonomous Publisher
color 0A

echo ==============================================================================
echo        AFFILIATEPILOT AI - PRODUCTION AUTONOMOUS ENGINE (24/7)
echo ==============================================================================
echo.
echo [*] Starting Backend Server on port 3000...
cd /d "%~dp0"

start "" http://localhost:3000

"C:\Program Files\nodejs\node.exe" server.js

pause
