@echo off
REM =====================================================
REM 一键部署脚本 - FakaShop 发卡商城 (Windows版本)
REM 用途: 快速启动本地演示站
REM =====================================================

echo.
echo ========================================
echo   FakaShop 发卡商城 - 快速启动
echo ========================================
echo.

echo [启动] 正在安装依赖...
call npm install

echo.
echo [启动] 正在启动本地服务器...
echo.
echo ========================================
echo   演示站已启动！
echo ========================================
echo.
echo   前台商城: http://localhost:3000/index.html?demo=true
echo   管理后台: http://localhost:3000/admin/index.html?demo=true
echo.
echo   提示: 按 Ctrl+C 停止服务器
echo.
echo ========================================
echo.

npx serve web -p 3000

pause
