#!/bin/bash

# Interactive AWS Deployment Script
# This script will guide you through deploying to AWS Elastic Beanstalk

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Automotive Intelligent Contact Center - AWS Deployment      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if EB CLI is installed
echo -e "${BLUE}[1/6] Checking prerequisites...${NC}"
if ! command -v eb &> /dev/null; then
    echo -e "${YELLOW}EB CLI not found. Installing...${NC}"
    pip install awsebcli --upgrade --user
    echo -e "${GREEN}✓ EB CLI installed${NC}"
else
    echo -e "${GREEN}✓ EB CLI already installed${NC}"
fi

# Check if AWS CLI is configured
echo ""
echo -e "${BLUE}[2/6] Checking AWS configuration...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${YELLOW}AWS credentials not configured.${NC}"
    echo ""
    echo "Please configure AWS credentials:"
    echo "1. Go to AWS Console → IAM → Users → Your User → Security Credentials"
    echo "2. Create Access Key if you don't have one"
    echo "3. Copy Access Key ID and Secret Access Key"
    echo ""
    read -p "Press Enter when you have your credentials ready..."
    echo ""
    aws configure
    echo -e "${GREEN}✓ AWS credentials configured${NC}"
else
    echo -e "${GREEN}✓ AWS credentials already configured${NC}"
    aws sts get-caller-identity
fi

# Initialize Elastic Beanstalk
echo ""
echo -e "${BLUE}[3/6] Initializing Elastic Beanstalk...${NC}"
if [ ! -d ".elasticbeanstalk" ]; then
    eb init -p node.js-18 automotive-contact-center --region us-east-1
    echo -e "${GREEN}✓ Elastic Beanstalk initialized${NC}"
else
    echo -e "${GREEN}✓ Elastic Beanstalk already initialized${NC}"
fi

# Create environment
echo ""
echo -e "${BLUE}[4/6] Creating production environment...${NC}"
echo -e "${YELLOW}This will take 5-10 minutes. Please wait...${NC}"
if ! eb list | grep -q "production"; then
    eb create production --single --instance-type t2.micro
    echo -e "${GREEN}✓ Environment created${NC}"
else
    echo -e "${YELLOW}Environment already exists. Deploying update...${NC}"
    eb deploy production
    echo -e "${GREEN}✓ Application deployed${NC}"
fi

# Get environment status
echo ""
echo -e "${BLUE}[5/6] Checking deployment status...${NC}"
eb status

# Get URL
echo ""
echo -e "${BLUE}[6/6] Getting your application URL...${NC}"
URL=$(eb status | grep "CNAME" | awk '{print $2}')
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    DEPLOYMENT SUCCESSFUL! 🎉                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Your application is now live at:${NC}"
echo -e "${BLUE}http://${URL}${NC}"
echo ""
echo -e "${YELLOW}Opening in browser...${NC}"
eb open

echo ""
echo "Useful commands:"
echo "  eb status    - Check application status"
echo "  eb logs      - View application logs"
echo "  eb deploy    - Deploy updates"
echo "  eb terminate - Delete environment (stop charges)"
echo ""
echo -e "${GREEN}Deployment complete!${NC}"
