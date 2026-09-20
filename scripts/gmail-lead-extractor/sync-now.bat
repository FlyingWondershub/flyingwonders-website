@echo off
title Incremental Lead Sync
cd /d "%~dp0"
echo ========================================================
echo Running Fast Incremental Lead Sync...
echo ========================================================
node extract-leads.mjs --auto
echo.
echo Sync complete.
timeout /t 5
