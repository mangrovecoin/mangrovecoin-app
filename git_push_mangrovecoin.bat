@echo off
REM MangroveCoin Git Commit & Push Shortcut
REM Usage: double-click or run in project folder, enter commit message when prompted

cd /d %~dp0

set /p COMMITMSG=Enter commit message: 

git add .
git commit -m "%COMMITMSG%"
git push origin main

echo.
echo All changes pushed to GitHub!
pause