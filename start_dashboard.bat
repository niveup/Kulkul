@echo off
cd /d "d:\formula ap\personal-dashboard"
start "Dashboard Server" cmd /k "npm run dev"
timeout /t 5
start http://localhost:5173
