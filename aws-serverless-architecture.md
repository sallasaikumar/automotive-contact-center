# AWS Serverless Architecture for Automotive Intelligent Contact Center

## Architecture Overview

This solution uses AWS native services as specified in requirements:

```
User → Amazon Connect → API Gateway → Lambda Functions
                            ↓
                    Amazon Bedrock Agents
                            ↓
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
   Amazon Lex        Amazon Kendra      DynamoDB
   (NLU/Intent)      (Knowledge Base)   (Session Data)
        ↓                  ↓                  ↓
        └──────────────────┼──────────────────┘
                           ↓
                    CloudWatch Logs
                           ↓
                      S3 (Chat Logs)
```

## AWS Services Used

1. **Amazon Connect** - Contact center infrastructure
2. **Amazon Lex** - Conversational AI and NLU
3. **Amazon Bedrock Agents** - Multi-agent orchestration
4. **Amazon Kendra** - Knowledge base search
5. **Amazon DynamoDB** - Session and customer data
6. **Amazon S3** - Chat logs and media storage
7. **AWS Lambda** - Serverless compute for agents
8. **API Gateway** - REST API for web interface
9. **CloudWatch** - Monitoring and analytics
10. **IAM** - Security and permissions
11. **KMS** - Data encryption

## Deployment Architecture

### Frontend (Web Interface)
- Host on **Amazon S3 + CloudFront**
- Or **AWS Amplify Hosting**

### Backend (Agent Logic)
- **AWS Lambda Functions** for each agent
- **API Gateway** for REST endpoints
- **WebSocket API** for real-time chat

### Data Layer
- **DynamoDB** for customer profiles, sessions
- **S3** for chat logs, media files
- **Kendra** for knowledge base

### AI/ML Layer
- **Amazon Bedrock** for agent orchestration
- **Amazon Lex** for intent detection
- **Amazon Comprehend** for sentiment analysis

## Cost Estimate

### Free Tier (First 12 Months)
- Lambda: 1M requests/month free
- DynamoDB: 25GB storage free
- S3: 5GB storage free
- API Gateway: 1M requests/month free

### After Free Tier (Estimated)
- Lambda: ~$5-10/month
- DynamoDB: ~$5-10/month
- S3: ~$1-5/month
- API Gateway: ~$3-5/month
- Bedrock: Pay per use (~$10-50/month depending on usage)
- **Total: ~$25-80/month**

## Deployment Options

### Option 1: AWS SAM (Serverless Application Model)
- Infrastructure as Code
- Easy deployment
- Local testing

### Option 2: AWS CDK (Cloud Development Kit)
- TypeScript/Python infrastructure
- More control
- Better for complex apps

### Option 3: Terraform
- Multi-cloud support
- State management
- Team collaboration

### Option 4: AWS Console (Manual)
- Click-based deployment
- Good for learning
- Not recommended for production
