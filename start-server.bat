@echo off
title 宠物健康问卷 - 服务器

echo ========================================
echo   宠物健康综合问卷调查 - 服务器
echo ========================================
echo.
echo 正在启动服务器...

:: Kill any existing process on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Start Node.js server
start "问卷服务器" /min cmd /c "node server.js"
echo [OK] 服务器已启动

:: Wait for server to be ready
timeout /t 2 /nobreak >nul

:loop
echo.
echo 正在建立公网隧道...
echo 隧道地址将显示在下方（每次连接稍有不同）：
echo.

:: Start SSH tunnel with auto-reconnect
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o TCPKeepAlive=yes -R 80:localhost:3000 nokey@localhost.run

echo.
echo [!] 隧道断开，5秒后自动重连...
timeout /t 5 /nobreak >nul
goto loop
