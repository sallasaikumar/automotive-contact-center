#!/bin/bash

# AWS Strands Deployment Script for Automotive Contact Center
# This script deploys the full AWS Strands architecture

set -e

echo "========================================="
echo "  AWS Strands Deployment"
echo "  Automotive Contact Center"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check AWS CLI
echo -e "${YELLOW}[1/10] Checking AWS CLI...${NC}"
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI not found. Please install it first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS CLI found${NC}"

# Get AWS Account ID
echo ""
echo -e "${YELLOW}[2/10] Getting AWS Account ID...${NC}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ Account ID: $ACCOUNT_ID${NC}"

# Set region
REGION="us-east-1"
echo -e "${GREEN}✓ Region: $REGION${NC}"

# Check Bedrock access
echo ""
echo -e "${YELLOW}[3/10] Checking Amazon Bedrock access...${NC}"
if aws bedrock list-foundation-models --region $REGION &> /dev/null; then
    echo -e "${GREEN}✓ Bedrock access confirmed${NC}"
else
    echo -e "${RED}✗ Bedrock not accessible. Please enable Bedrock in your account.${NC}"
    echo "Go to: https://console.aws.amazon.com/bedrock"
    exit 1
fi

# Create IAM role for Bedrock agents
echo ""
echo -e "${YELLOW}[4/10] Creating IAM role for Bedrock agents...${NC}"
ROLE_NAME="AmazonBedrockExecutionRoleForAgents"

# Check if role exists
if aws iam get-role --role-name $ROLE_NAME &> /dev/null; then
    echo -e "${GREEN}✓ IAM role already exists${NC}"
else
    # Create role
    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {"Service": "bedrock.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }]
        }' \
        --description "Execution role for Bedrock agents"
    
    # Attach policies
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess
    
    echo -e "${GREEN}✓ IAM role created${NC}"
fi

ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME"

# Create DynamoDB table
echo ""
echo -e "${YELLOW}[5/10] Creating DynamoDB table...${NC}"
aws dynamodb create-table \
    --table-name automotive-customer-data \
    --attribute-definitions \
        AttributeName=customerId,AttributeType=S \
        AttributeName=sessionId,AttributeType=S \
    --key-schema \
        AttributeName=customerId,KeyType=HASH \
        AttributeName=sessionId,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION \
    2>/dev/null || echo -e "${YELLOW}Table already exists${NC}"

echo -e "${GREEN}✓ DynamoDB table ready${NC}"

# Create S3 bucket
echo ""
echo -e "${YELLOW}[6/10] Creating S3 bucket...${NC}"
BUCKET_NAME="automotive-chat-logs-$ACCOUNT_ID"
aws s3 mb s3://$BUCKET_NAME --region $REGION 2>/dev/null || echo -e "${YELLOW}Bucket already exists${NC}"
echo -e "${GREEN}✓ S3 bucket ready${NC}"

# Create Bedrock Knowledge Base
echo ""
echo -e "${YELLOW}[7/10] Creating Bedrock Knowledge Base...${NC}"
echo -e "${YELLOW}Note: This requires manual setup in AWS Console${NC}"
echo "Go to: https://console.aws.amazon.com/bedrock/knowledge-bases"
echo "Press Enter when ready to continue..."
read

# Create Supervisor Agent
echo ""
echo -e "${YELLOW}[8/10] Creating Supervisor Agent...${NC}"
echo -e "${YELLOW}Creating agent via AWS Console is recommended${NC}"
echo ""
echo "Manual steps:"
echo "1. Go to: https://console.aws.amazon.com/bedrock/agents"
echo "2. Click 'Create Agent'"
echo "3. Name: automotive-supervisor-agent"
echo "4. Model: Anthropic Claude v2"
echo "5. Instructions: Copy from bedrock-agents-config.json"
echo "6. Enable agent collaboration: SUPERVISOR"
echo ""
echo "Press Enter when Supervisor Agent is created..."
read

# Create Strand Agents
echo ""
echo -e "${YELLOW}[9/10] Creating Strand Agents...${NC}"
echo "Create these agents in Bedrock Console:"
echo "  1. intent-analysis-strand"
echo "  2. sentiment-analysis-strand"
echo "  3. knowledge-retrieval-strand"
echo "  4. personalization-strand"
echo "  5. response-generation-strand"
echo "  6. routing-strand"
echo ""
echo "For each agent:"
echo "  - Use Anthropic Claude v2"
echo "  - Set collaboration mode: SUPERVISOR_ROUTER"
echo "  - Copy instructions from bedrock-agents-config.json"
echo ""
echo "Press Enter when all Strand Agents are created..."
read

# Deploy Lambda functions
echo ""
echo -e "${YELLOW}[10/10] Deploying Lambda functions...${NC}"
sam build --template template.yaml
sam deploy --guided --region $REGION

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Configure agent orchestration in Bedrock Console"
echo "2. Test agents individually"
echo "3. Test full workflow"
echo "4. Deploy frontend to S3/CloudFront"
echo ""
echo "Resources created:"
echo "  - DynamoDB: automotive-customer-data"
echo "  - S3: $BUCKET_NAME"
echo "  - IAM Role: $ROLE_ARN"
echo "  - Bedrock Agents: Check console"
echo ""
