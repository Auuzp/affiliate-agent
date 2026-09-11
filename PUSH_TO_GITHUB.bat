@echo off
title Push AffiliatePilot AI to GitHub
color 0B

echo ==============================================================================
echo                 PUSH AFFILIATEPILOT AI TO GITHUB
echo ==============================================================================
echo.
echo Author: Auuzp ^<auualoneeve@gmail.com^>
echo.
echo Make sure you have created an empty repository on GitHub first:
echo https://github.com/new (Name: affiliate-agent)
echo.
set /p REPO_URL="Enter your GitHub Repo URL [Default: https://github.com/Auuzp/affiliate-agent.git]: "
if "%REPO_URL%"=="" set REPO_URL=https://github.com/Auuzp/affiliate-agent.git

echo.
echo [*] Adding remote origin: %REPO_URL%...
"C:\Users\servi\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe" remote remove origin 2>nul
"C:\Users\servi\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe" remote add origin %REPO_URL%

echo [*] Pushing branch main to GitHub...
"C:\Users\servi\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe" branch -M main
"C:\Users\servi\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe" push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ==============================================================================
    echo [SUCCESS] Your code is now live on GitHub!
    echo ==============================================================================
) else (
    echo [NOTICE] If prompt asks for login, please authenticate in the popup window.
)

pause
