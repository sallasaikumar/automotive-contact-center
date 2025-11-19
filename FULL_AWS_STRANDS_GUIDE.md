# Full AWS Strands Deployment Guide

## 🎯 Architecture Overview

```
User Request
    ↓
API Gateway / Amazon Connect
    ↓
Supervisor Agent (Agent Core)
    ↓
AWS Strands Orchestration
    ↓
┌────────┬────────┬────────┬────────┬────────┬────────┐
│Strand 1│Strand 2│Strand 3│Strand 4│Strand 5│Strand 6│
│Intent  │Sentim. │Knowl.  │Person. │Response│Routing │
└────────┴────────┴────────┴────────┴────────┴────────┘
    ↓
Amazon Bedrock (Claude v2)
    ↓
DynamoDB + S3 + Kendra
```

## 📋 Prerequisites

✅ AWS Account with Administrator access
✅ AWS CLI installed and configured
✅ Access to Amazon Bedrock (request if needed)
✅ Budget: $50-200/month

## 🚀 Step-by-Step Deployment

### Step 1: Enable Amazon Bedrock

1. **Go to Bedrock Console:**
   https://console.aws.amazon.com/bedrock

2. **Request Model Access:**
   - Click "Model access" (left menu)
   - Click "Manage model access"
   - Enable: **Anthropic Claude** (all versions)
   - Enable: **Amazon Titan**
   - Click "Request model access"
   - Wait for approval (usually instant, sometimes 24 hours)

3. **Verify Access:**
   ```bash
   aws bedrock list-foundation-models --region us-east-1
   ```

### Step 2: Create IAM Role for Bedrock

1. **Go to IAM Console:**
   https://console.aws.amazon.com/iam/roles

2. **Create Role:**
   - Click "Create role"
   - Trusted entity: **AWS service**
   - Use case: **Bedrock**
   - Click "Next"

3. **Attach Policies:**
   - AmazonBedrockFullAccess
   - AmazonDynamoDBFullAccess
   - AmazonS3FullAccess
   - CloudWatchLogsFullAccess

4. **Name Role:**
   - Role name: `AmazonBedrockExecutionRoleForAgents`
   - Click "Create role"

5. **Copy Role ARN** (you'll need this)

### Step 3: Create DynamoDB Table

```bash
aws dynamodb create-table \
    --table-name automotive-customer-data \
    --attribute-definitions \
        AttributeName=customerId,AttributeType=S \
        AttributeName=sessionId,AttributeType=S \
    --key-schema \
        AttributeName=customerId,KeyType=HASH \
        AttributeName=sessionId,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

### Step 4: Create S3 Bucket

```bash
# Replace ACCOUNT_ID with your AWS account ID
aws s3 mb s3://automotive-chat-logs-ACCOUNT_ID --region us-east-1
```

### Step 5: Create Bedrock Knowledge Base

1. **Go to Bedrock Console:**
   https://console.aws.amazon.com/bedrock/knowledge-bases

2. **Create Knowledge Base:**
   - Click "Create knowledge base"
   - Name: `automotive-knowledge-base`
   - IAM role: Use existing role (from Step 2)
   - Click "Next"

3. **Configure Data Source:**
   - Data source name: `automotive-kb-data`
   - S3 URI: `s3://automotive-chat-logs-ACCOUNT_ID/knowledge/`
   - Click "Next"

4. **Configure Embeddings:**
   - Embeddings model: **Titan Embeddings G1 - Text**
   - Vector database: **Quick create new vector store**
   - Click "Next"

5. **Review and Create**
   - Click "Create knowledge base"
   - Wait for creation (5-10 minutes)
   - **Copy Knowledge Base ID**

### Step 6: Upload Knowledge Base Data

```bash
# Upload your knowledge base files
aws s3 cp data/knowledge-base.json s3://automotive-chat-logs-ACCOUNT_ID/knowledge/

# Sync knowledge base
# Go to Bedrock Console → Knowledge bases → Your KB → Click "Sync"
```

### Step 7: Create Supervisor Agent (Agent Core)

1. **Go to Bedrock Agents:**
   https://console.aws.amazon.com/bedrock/agents

2. **Create Agent:**
   - Click "Create Agent"
   - Agent name: `automotive-supervisor-agent`
   - Agent description: "Supervisor agent for automotive contact center"
   - Click "Create"

3. **Configure Agent:**
   - **Model:** Anthropic Claude v2
   - **Instructions:** 
     ```
     You are the Supervisor Agent for an automotive intelligent contact center. 
     Orchestrate multiple specialized agents to handle customer inquiries about 
     vehicle service, sales, warranty, and technical support. Ensure SLA compliance 
     and route requests appropriately. Coordinate with strand agents for intent 
     analysis, sentiment detection, knowledge retrieval, personalization, response 
     generation, and routing.
     ```

4. **Agent Collaboration:**
   - Enable "Multi-agent collaboration"
   - Role: **SUPERVISOR**

5. **Save and Build:**
   - Click "Save and exit"
   - Click "Prepare" (builds the agent)
   - Wait for preparation to complete

6. **Copy Agent ID and Alias ID**

### Step 8: Create Strand Agents

Create 6 strand agents. For each:

#### **Strand 1: Intent Analysis**
- Name: `intent-analysis-strand`
- Model: Anthropic Claude v2
- Instructions:
  ```
  Analyze customer messages to detect intent (service, sales, warranty, technical, general). 
  Extract entities like vehicle model, service type, dates. Classify urgency level. 
  Return structured intent data with confidence scores.
  ```
- Collaboration: **SUPERVISOR_ROUTER**

#### **Strand 2: Sentiment Analysis**
- Name: `sentiment-analysis-strand`
- Model: Anthropic Claude v2
- Instructions:
  ```
  Analyze customer sentiment and emotional tone. Detect urgency, frustration, satisfaction, 
  or neutral states. Return sentiment score (-1 to 1) and urgency level (low/medium/high).
  ```
- Collaboration: **SUPERVISOR_ROUTER**

#### **Strand 3: Knowledge Retrieval**
- Name: `knowledge-retrieval-strand`
- Model: Anthropic Claude v2
- Instructions:
  ```
  Search automotive knowledge base for relevant information about services, products, 
  warranties, and technical issues. Return accurate, contextual information with sources.
  ```
- Collaboration: **SUPERVISOR_ROUTER**
- **Knowledge Base:** Link to the KB created in Step 5

#### **Strand 4: Personalization**
- Name: `personalization-strand`
- Model: Anthropic Claude v2
- Instructions:
  ```
  Access customer profile, vehicle details, and service history from DynamoDB. 
  Provide personalized recommendations and context-aware responses based on 
  customer data and vehicle telemetry.
  ```
- Collaboration: **SUPERVISOR_ROUTER**
- **Action Group:** Create action to query DynamoDB

#### **Strand 5: Response Generation**
- Name: `response-generation-strand`
- Model: Anthropic Claude v2
- Instructions:
  ```
  Generate natural, empathetic responses based on intent, sentiment, knowledge, 
  and customer context. Adapt tone appropriately (urgent, apologetic, helpful). 
  Provide actionable next steps and quick action buttons.
  ```
- Collaboration: **SUPERVISOR_ROUTER**

#### **Strand 6: Routing**
- Name: `routing-strand`
- Model: Anthropic Claude v2
- Instructions:
  ```
  Route customer inquiries to appropriate departments (Service, Sales, Warranty, 
  Technical Support). Assign priority levels (low/medium/high). Handle escalations 
  for urgent or negative sentiment cases.
  ```
- Collaboration: **SUPERVISOR_ROUTER**

### Step 9: Configure Agent Orchestration

1. **Go to Supervisor Agent**
2. **Add Collaborator Agents:**
   - Click "Add collaborator"
   - Select each strand agent
   - Define collaboration instructions
   - Save

3. **Test Orchestration:**
   - Use "Test" tab in console
   - Send sample messages
   - Verify all agents respond

### Step 10: Deploy API Gateway + Lambda

```bash
# Build and deploy
sam build --template template.yaml
sam deploy --guided --region us-east-1
```

When prompted:
- Stack Name: `automotive-contact-center`
- AWS Region: `us-east-1`
- Confirm changes: `Y`
- Allow SAM CLI IAM role creation: `Y`

### Step 11: Deploy Frontend

```bash
# Deploy to S3
aws s3 sync public/ s3://automotive-chat-logs-ACCOUNT_ID/frontend/

# Enable website hosting
aws s3 website s3://automotive-chat-logs-ACCOUNT_ID/frontend/ \
    --index-document index.html
```

### Step 12: Get Your URLs

```bash
# API Gateway URL
aws cloudformation describe-stacks \
    --stack-name automotive-contact-center \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
    --output text

# Frontend URL
echo "http://automotive-chat-logs-ACCOUNT_ID.s3-website-us-east-1.amazonaws.com/frontend/"
```

## ✅ Verification

Test your deployment:

1. **Test Bedrock Agents:**
   - Go to each agent in console
   - Use "Test" tab
   - Send sample messages

2. **Test API:**
   ```bash
   curl -X POST https://YOUR_API_URL/supervisor \
     -H "Content-Type: application/json" \
     -d '{"message": "I need an oil change"}'
   ```

3. **Test Frontend:**
   - Open frontend URL in browser
   - Send test messages
   - Verify responses

## 💰 Cost Breakdown

- **Bedrock API calls:** ~$0.01-0.03 per 1K tokens
- **Lambda:** $0.20 per 1M requests (free tier: 1M/month)
- **DynamoDB:** $0.25 per GB (free tier: 25GB)
- **S3:** $0.023 per GB (free tier: 5GB)
- **API Gateway:** $3.50 per million requests
- **Knowledge Base:** ~$0.10 per query

**Estimated: $50-200/month** (depending on usage)

## 🆘 Troubleshooting

**"Bedrock not available"**
- Check region (use us-east-1 or us-west-2)
- Request model access

**"Agent creation failed"**
- Verify IAM role has correct permissions
- Check model access is approved

**"Knowledge base sync failed"**
- Verify S3 bucket permissions
- Check file format (JSON, PDF, TXT supported)

**"Orchestration not working"**
- Verify all agents are in "Prepared" state
- Check collaboration settings
- Review CloudWatch logs

## 📞 Support

If you encounter issues:
1. Check CloudWatch Logs
2. Review Bedrock agent test results
3. Verify IAM permissions
4. Check AWS Service Health Dashboard

---

**Your AWS Strands architecture is now deployed!** 🎉
