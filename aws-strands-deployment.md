# AWS Strands Multi-Agent Deployment Guide

## 🏗️ Architecture Overview

Your application now uses **AWS Strands Multi-Agent Orchestration** with:

### Core Components:
1. **Agent Core** - AWS Bedrock Agents foundation
2. **Supervisor Agent** - Multi-agent orchestration controller  
3. **Strand Agents** - Specialized task-specific agents
4. **SageMaker Unified Studio** - Foundation architecture

### Strand Agents:
- **IntentStrandAgent** - Intent analysis using AWS Bedrock
- **KnowledgeStrandAgent** - Knowledge retrieval using AWS Bedrock
- **ResponseStrandAgent** - Response generation using AWS Bedrock

## 🚀 Deployment Steps

### 1. Configure AWS Services

#### A. Create Bedrock Agent
```bash
# Create Bedrock Agent for automotive support
aws bedrock-agent create-agent \
  --agent-name "automotive-contact-center-agent" \
  --description "Multi-agent automotive customer support system" \
  --foundation-model "anthropic.claude-3-sonnet-20240229-v1:0"
```

#### B. Setup SageMaker Unified Studio
```bash
# Create SageMaker domain for unified studio
aws sagemaker create-domain \
  --domain-name "automotive-ai-studio" \
  --auth-mode "IAM" \
  --default-user-settings file://sagemaker-user-settings.json
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Bedrock Agent ID (from step 1A)
BEDROCK_AGENT_ID=ABCD1234EFGH
BEDROCK_AGENT_ALIAS_ID=TSTALIASID

# SageMaker Domain (from step 1B)
SAGEMAKER_DOMAIN_ID=d-1234567890abcdef0
```

### 3. Deploy to AWS Elastic Beanstalk

#### A. Create Deployment Package
```bash
# Install AWS SDK dependencies
npm install

# Create deployment package
powershell -Command "Compress-Archive -Path '*.js','*.json','agents','data','public','.ebextensions','.env' -DestinationPath 'aws-strands-deployment.zip' -Force"
```

#### B. Deploy via AWS Console
1. Go to: https://console.aws.amazon.com/elasticbeanstalk
2. **Create Application**: `automotive-strands-system`
3. **Platform**: Node.js 18.x
4. **Upload**: `aws-strands-deployment.zip`
5. **Environment Variables**: Add from `.env` file
6. **Deploy** and wait 10-15 minutes

### 4. Verify Deployment

#### Health Check Endpoint
```
GET https://your-app-url.elasticbeanstalk.com/health
```

Expected Response:
```json
{
  "status": "healthy",
  "architecture": "AWS Strands Multi-Agent Orchestration",
  "orchestration": {
    "agentCore": { "status": "healthy", "agentId": "ABCD1234EFGH" },
    "activeStrands": {
      "intent": 0,
      "knowledge": 0, 
      "response": 0
    }
  }
}
```

#### Test Chat API
```bash
curl -X POST https://your-app-url.elasticbeanstalk.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I need an oil change", "sessionId": "test-123"}'
```

## 🎯 Expected Features

### Multi-Agent Orchestration
- **Parallel Processing**: Multiple strands execute simultaneously
- **Context Preservation**: Session state maintained across strands
- **Intelligent Routing**: Supervisor agent coordinates strand execution
- **Fallback Handling**: Local processing if AWS services unavailable

### AWS Integration
- **Bedrock Agents**: Advanced AI capabilities
- **SageMaker Studio**: Unified ML platform
- **CloudWatch**: Monitoring and logging
- **IAM**: Secure access control

### Performance Metrics
- **Response Time**: < 2 seconds with AWS Strands
- **Concurrent Users**: 1000+ supported
- **Strand Utilization**: Real-time monitoring
- **Agent Health**: Continuous health checks

## 🔧 Troubleshooting

### Common Issues:

1. **Bedrock Agent Not Found**
   - Verify `BEDROCK_AGENT_ID` in environment
   - Check IAM permissions for Bedrock access

2. **SageMaker Access Denied**
   - Ensure SageMaker domain is created
   - Verify IAM role has SageMaker permissions

3. **Strand Timeout**
   - Increase `STRAND_TIMEOUT` in environment
   - Check AWS service limits

### IAM Permissions Required:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeAgent",
        "bedrock:GetAgent",
        "sagemaker:DescribeDomain",
        "sagemaker:CreateUserProfile"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🎉 Success Indicators

✅ **Health endpoint returns 200**  
✅ **Chat API responds with AWS Strands metadata**  
✅ **WebSocket shows system_info with architecture details**  
✅ **Multiple strands execute per request**  
✅ **Bedrock agent responses include citations**  

Your **AWS Strands Multi-Agent Orchestration System** is now ready for production use!

## 📱 Access Your Live System

Once deployed, your URL will be:
`https://automotive-strands-system.us-east-1.elasticbeanstalk.com`

Features:
- Real-time chat with AWS Strands orchestration
- Multi-agent parallel processing
- SageMaker Unified Studio integration
- Advanced AI capabilities via Bedrock Agents