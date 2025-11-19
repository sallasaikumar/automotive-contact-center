# Deploy to AWS with Strands & Agent Core Architecture

## Prerequisites

✅ AWS Account with full access
✅ AWS CLI configured
✅ Access to:
- Amazon Bedrock
- SageMaker Unified Studio
- AWS Lambda
- Amazon S3
- Amazon DynamoDB

## Architecture Overview

```
User → API Gateway → Agent Core (Supervisor)
                          ↓
                    AWS Strands
                    (Orchestration)
                          ↓
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
   Strand 1          Strand 2          Strand 3
   (Intent)        (Knowledge)      (Response)
        ↓                 ↓                 ↓
   Bedrock Agent    Bedrock Agent    Bedrock Agent
```

## Deployment Steps

### Step 1: Enable AWS Bedrock

1. Go to AWS Console: https://console.aws.amazon.com/bedrock
2. Click "Get Started"
3. Enable model access:
   - Anthropic Claude
   - Amazon Titan
4. Request access if needed (may take 24 hours)

### Step 2: Create SageMaker Unified Studio Workspace

1. Go to: https://console.aws.amazon.com/sagemaker
2. Click "Unified Studio" (left menu)
3. Create new workspace:
   - Name: `automotive-contact-center`
   - Region: `us-east-1`
4. Wait for workspace to be ready (5-10 minutes)

### Step 3: Deploy Using AWS SAM

```bash
# Install AWS SAM CLI
pip install aws-sam-cli

# Navigate to project
cd "C:\Users\Saikumar\Documents\Automotive Intelligent Contact Center"

# Build
sam build --template template.yaml

# Deploy
sam deploy --guided
```

When prompted:
- Stack Name: `automotive-contact-center`
- AWS Region: `us-east-1`
- Confirm changes: `Y`
- Allow SAM CLI IAM role creation: `Y`

### Step 4: Configure Bedrock Agents

1. Go to: https://console.aws.amazon.com/bedrock/agents
2. Create Agent Core (Supervisor):
   - Name: `supervisor-agent`
   - Model: `anthropic.claude-v2`
   - Instructions: "Orchestrate multi-agent system for automotive contact center"

3. Create Strand Agents:
   - Intent Analysis Agent
   - Sentiment Analysis Agent
   - Knowledge Retrieval Agent
   - Response Generation Agent

### Step 5: Set Up AWS Strands

1. In Bedrock Console, go to "Agent Orchestration"
2. Create new Strand:
   - Name: `automotive-strands`
   - Type: `Multi-agent`
3. Add agents to strand
4. Configure orchestration flow

### Step 6: Deploy Frontend

```bash
# Deploy to S3 + CloudFront
aws s3 mb s3://automotive-contact-center-frontend
aws s3 sync public/ s3://automotive-contact-center-frontend/
aws s3 website s3://automotive-contact-center-frontend/ --index-document index.html
```

### Step 7: Get Your URL

After deployment:
- API Gateway URL: Check CloudFormation outputs
- Frontend URL: Check S3 bucket website endpoint
- Or set up CloudFront for HTTPS

## Cost Estimate

- SageMaker Studio: ~$0.05/hour
- Bedrock API calls: ~$0.01-0.03 per 1K tokens
- Lambda: Free tier, then $0.20 per 1M requests
- DynamoDB: Free tier, then $0.25 per GB
- S3: $0.023 per GB
- **Estimated: $50-200/month**

## Important Notes

⚠️ **AWS Strands is an enterprise feature** - may require AWS support to enable
⚠️ **Bedrock access** - may need to request model access
⚠️ **SageMaker Studio** - requires workspace setup

## Troubleshooting

**"Bedrock not available in region"**
- Use us-east-1 or us-west-2

**"Model access denied"**
- Request access in Bedrock console
- May take 24 hours

**"SageMaker Studio not found"**
- Ensure you're using the correct region
- Check if Unified Studio is enabled

## Alternative: Simplified AWS Deployment

If AWS Strands is not available, deploy with:
- Lambda functions for agents
- API Gateway for REST API
- DynamoDB for data
- S3 for storage

This still uses AWS but without Strands/Agent Core.
