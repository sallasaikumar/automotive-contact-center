@echo off
echo ========================================
echo   Push to GitHub - Automated Script
echo ========================================
echo.

REM Configure Git
echo [1/4] Configuring Git...
git config --global credential.helper manager-core
echo Done!
echo.

REM Remove old remote
echo [2/4] Removing old remote...
git remote remove origin 2>nul
echo Done!
echo.

REM Add new remote
echo [3/4] Adding remote...
git remote add origin https://github.com/sallasaikumarAME/automotive-contact-center.git
echo Done!
echo.

REM Push to GitHub
echo [4/4] Pushing to GitHub...
echo.
echo IMPORTANT: When prompted, enter:
echo   Username: sallasaikumarAME
echo   Password: [Paste your GitHub token]
echo.
pause

git push -u origin main

echo.
echo ========================================
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Code pushed to GitHub!
    echo.
    echo Next step: Deploy to Render.com
    echo Visit: https://render.com
) else (
    echo FAILED! Check the error above.
    echo.
    echo Common issues:
    echo - Wrong username or token
    echo - Repository doesn't exist
    echo - Network connection issue
)
echo ========================================
pause
