@echo off
echo Starting VibeSync Backend...
echo.
call "%~dp0my_tf_env\Scripts\activate.bat"
python "%~dp0app.py"
pause
