@echo off
title Gmail Lead Extractor
cd /d "%~dp0"
echo ========================================================
echo Starting Enhanced Gmail Lead Extractor...
echo ========================================================
node extract-leads.mjs
pause
