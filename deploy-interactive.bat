@echo off
REM Interactive AWS Deployment Script for Windows
REM This script will guide you through deploying to AWS Elastic Beanstalk

echo ================================================================
echo    Automotive Intelligent Contact Center - AWS Deployment
echo ================================================================
echo.

REM Check if EB CLI is installed
echo [1/6] Checking prerequisites...
where eb >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo EB CLI not found. Installing...
    pip install awsebcli --upgrade --user
    echo EB CLI installed successfully
) else (
    echo EB CLI already installed
)

REM Check if AWS CLI is configured
echo.
echo [2/6] Checking AWS configuration...
aws sts get-caller-identity >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo AWS credentials not configured.
    echo.
    echo Please configure AWS credentials:
    echo 1. Go to AWS Console - IAM - Users - Your User - Security Credentials
    echo 2. Create Access Key if you don't have one
    echo 3. Copy Access Key ID and Secret Access Key
    echo.
    pause
    echo.
    aws configure
    echo AWS credentials configured
) else (
    echo AWS credentials already configured
    aws sts get-caller-identity
)

REM Initialize Elastic Beanstalk
echo.
echo [3/6] Initializing Elastic Beanstalk...
if not exist ".elasticbeanstalk" (
    eb init -p node.js-18 automotive-contact-center --region us-east-1
    echo Elastic Beanstalk initialized
) else (
    echo Elastic Beanstalk already initialized
)

REM Create environment
echo.
echo [4/6] Creating production environment...
echo This will take 5-10 minutes. Please wait...
eb list | findstr "production" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    eb create production --single --instance-type t2.micro
    echo Environment created
) else (
    echo Environment already exists. Deploying update...
    eb deploy production
    echo Application deployed
)

REM Get environment status
echo.
echo [5/6] Checking deployment status...
eb status

REM Get URL
echo.
echo [6/6] Getting your application URL...
echo.
echo ================================================================
echo                  DEPLOYMENT SUCCESSFUL!
echo ================================================================
echo.
echo Your application is now live!
echo.
echo Opening in browser...
eb open

echo.
echo Useful commands:
echo   eb status    - Check application status
echo   eb logs      - View application logs
echo   eb deploy    - Deploy updates
echo   eb terminate - Delete environment (stop charges)
echo.
echo Deployment complete!
pause
