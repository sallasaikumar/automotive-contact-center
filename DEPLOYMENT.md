# Deployment Guide

## Pre-Deployment Checklist

✅ All tests passing (100% success rate)
✅ Sample data loaded and validated
✅ Multi-agent orchestration working
✅ WebSocket communication stable
✅ Chat interface responsive

## Local Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```

Expected output: 8/8 tests passing (100% success rate)

### 3. Start Development Server
```bash
npm start
```

Server will start on http://localhost:3000

### 4. Test Web Interface

Open http://localhost:3000 in your browser and test these scenarios:

**Service Appointment:**
- "I need to schedule an oil change"
- "What's available next week?"

**Urgent Technical:**
- "My check engine light is on"
- "This is urgent, I need help immediately"

**Sales Inquiry:**
- "I'm interested in buying a new SUV"
- "Can I schedule a test drive?"

**Warranty Question:**
- "Is my transmission covered under warranty?"
- "My car has 40,000 miles"

## Production Deployment

### Environment Variables

Create a `.env` file:
```
PORT=3000
NODE_ENV=production
```

### AWS Deployment Options

#### Option 1: AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB
eb init -p node.js automotive-contact-center

# Create environment
eb create production

# Deploy
eb deploy
```

#### Option 2: AWS ECS with Fargate
```bash
# Build Docker image
docker build -t automotive-contact-center .

# Tag for ECR
docker tag automotive-contact-center:latest <account-id>.dkr.ecr.<region>.amazonaws.com/automotive-contact-center:latest

# Push to ECR
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/automotive-contact-center:latest

# Deploy to ECS
aws ecs update-service --cluster production --service automotive-contact-center --force-new-deployment
```

#### Option 3: AWS Lambda + API Gateway
Use AWS SAM or Serverless Framework for serverless deployment.

### Database Integration (Optional)

For production, replace JSON files with:
- **Amazon DynamoDB** for customer profiles and session data
- **Amazon Kendra** for knowledge base search
- **Amazon S3** for chat logs and analytics

### AWS Services Integration

#### Amazon Bedrock
Replace mock agents with Amazon Bedrock Agents:
```javascript
const { BedrockAgentRuntimeClient } = require("@aws-sdk/client-bedrock-agent-runtime");
```

#### Amazon Lex
Integrate for advanced NLU:
```javascript
const { LexRuntimeV2Client } = require("@aws-sdk/client-lex-runtime-v2");
```

#### Amazon Connect
For voice integration:
```javascript
const { ConnectClient } = require("@aws-sdk/client-connect");
```

### Monitoring & Logging

#### CloudWatch Integration
```javascript
const { CloudWatchClient, PutMetricDataCommand } = require("@aws-sdk/client-cloudwatch");
```

#### X-Ray Tracing
```javascript
const AWSXRay = require('aws-xray-sdk');
```

### Security Considerations

1. **Enable HTTPS** - Use AWS Certificate Manager
2. **API Authentication** - Implement JWT or AWS Cognito
3. **Rate Limiting** - Use AWS WAF
4. **Data Encryption** - Enable KMS encryption
5. **IAM Roles** - Least privilege access

### Scaling Configuration

```javascript
// server.js - Add clustering
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Start server
}
```

### Health Check Endpoint

Add to server.js:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});
```

### Performance Targets

- Response time: < 500ms
- Concurrent users: 1000+
- Uptime: 99.9%
- Intent accuracy: > 90%

## Post-Deployment Validation

1. Run smoke tests on production URL
2. Monitor CloudWatch metrics
3. Check error logs
4. Validate WebSocket connections
5. Test from multiple devices/browsers
6. Verify agent orchestration
7. Check database connections
8. Test failover scenarios

## Rollback Plan

```bash
# Elastic Beanstalk
eb deploy --version <previous-version>

# ECS
aws ecs update-service --cluster production --service automotive-contact-center --task-definition <previous-task-def>
```

## Support & Maintenance

- Monitor CloudWatch dashboards daily
- Review agent performance metrics weekly
- Update knowledge base monthly
- Retrain intent models quarterly
- Security patches as needed
