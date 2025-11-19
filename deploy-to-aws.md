# Deploy to AWS - Step by Step Guide

## Option 1: AWS Elastic Beanstalk (Recommended - Easiest)

### Prerequisites
1. AWS Account (create at https://aws.amazon.com)
2. AWS CLI installed
3. EB CLI installed

### Step 1: Install AWS EB CLI

```bash
# Install EB CLI
pip install awsebcli --upgrade --user
```

### Step 2: Configure AWS Credentials

```bash
# Configure AWS credentials
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format (json)
```

### Step 3: Initialize Elastic Beanstalk

```bash
# In your project directory
eb init

# Follow prompts:
# 1. Select region (e.g., us-east-1)
# 2. Create new application: automotive-contact-center
# 3. Select platform: Node.js
# 4. Select platform version: Node.js 18
# 5. Setup SSH: Yes (optional)
```

### Step 4: Create Environment and Deploy

```bash
# Create environment and deploy
eb create production --single

# This will:
# - Create EC2 instance
# - Install Node.js
# - Deploy your application
# - Provide you with a URL
```

### Step 5: Get Your URL

```bash
# Open your application in browser
eb open

# Or get the URL
eb status
```

Your app will be available at: **http://automotive-contact-center-production.us-east-1.elasticbeanstalk.com**

### Step 6: Update Application (Future Deployments)

```bash
# After making changes
eb deploy
```

### Step 7: Monitor and Manage

```bash
# View logs
eb logs

# Check health
eb health

# SSH into instance
eb ssh
```

---

## Option 2: AWS Amplify (Alternative - Very Easy)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/automotive-contact-center.git
git push -u origin main
```

### Step 2: Deploy via AWS Amplify Console

1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify
2. Click "New app" → "Host web app"
3. Connect your GitHub repository
4. Configure build settings (auto-detected)
5. Click "Save and deploy"

Your app will be available at: **https://main.xxxxx.amplifyapp.com**

---

## Option 3: AWS EC2 (Manual - More Control)

### Step 1: Launch EC2 Instance

1. Go to EC2 Console: https://console.aws.amazon.com/ec2
2. Click "Launch Instance"
3. Choose Amazon Linux 2 AMI
4. Select t2.micro (free tier)
5. Configure security group:
   - Allow HTTP (port 80)
   - Allow HTTPS (port 443)
   - Allow Custom TCP (port 3000)
6. Launch and download key pair

### Step 2: Connect to Instance

```bash
# Connect via SSH
ssh -i "your-key.pem" ec2-user@your-instance-public-ip
```

### Step 3: Install Node.js

```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 4: Upload Your Application

```bash
# On your local machine, upload files
scp -i "your-key.pem" -r . ec2-user@your-instance-public-ip:~/app
```

### Step 5: Run Application

```bash
# On EC2 instance
cd ~/app
npm install
npm start

# Or use PM2 for production
sudo npm install -g pm2
pm2 start server.js --name automotive-contact-center
pm2 startup
pm2 save
```

### Step 6: Configure Nginx (Optional - for port 80)

```bash
# Install Nginx
sudo amazon-linux-extras install nginx1 -y

# Configure reverse proxy
sudo nano /etc/nginx/conf.d/app.conf
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

Your app will be available at: **http://your-ec2-public-ip**

---

## Option 4: Docker + AWS ECS (Container-based)

### Step 1: Build Docker Image

```bash
# Build image
docker build -t automotive-contact-center .

# Test locally
docker run -p 3000:3000 automotive-contact-center
```

### Step 2: Push to Amazon ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Create repository
aws ecr create-repository --repository-name automotive-contact-center

# Tag image
docker tag automotive-contact-center:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/automotive-contact-center:latest

# Push image
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/automotive-contact-center:latest
```

### Step 3: Create ECS Cluster and Service

Use AWS Console or CLI to:
1. Create ECS Cluster
2. Create Task Definition
3. Create Service
4. Configure Load Balancer

---

## Quick Deploy Script (Elastic Beanstalk)

Save this as `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying Automotive Contact Center to AWS..."

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    echo "❌ EB CLI not found. Installing..."
    pip install awsebcli --upgrade --user
fi

# Initialize EB if not already done
if [ ! -d ".elasticbeanstalk" ]; then
    echo "📦 Initializing Elastic Beanstalk..."
    eb init -p node.js-18 automotive-contact-center --region us-east-1
fi

# Create environment if it doesn't exist
if ! eb list | grep -q "production"; then
    echo "🏗️  Creating production environment..."
    eb create production --single
else
    echo "📤 Deploying to existing environment..."
    eb deploy
fi

echo "✅ Deployment complete!"
echo "🌐 Opening application..."
eb open
```

Make it executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Cost Estimates

### Elastic Beanstalk (Recommended)
- **Free Tier**: First 12 months free (t2.micro)
- **After Free Tier**: ~$15-20/month

### Amplify
- **Free Tier**: 1000 build minutes/month, 15 GB served/month
- **After Free Tier**: Pay as you go

### EC2
- **Free Tier**: 750 hours/month (t2.micro)
- **After Free Tier**: ~$8-10/month

---

## Post-Deployment Steps

1. **Get Your URL**
   ```bash
   eb status  # For Elastic Beanstalk
   ```

2. **Test Your Application**
   - Open the URL in browser
   - Test chat functionality
   - Verify WebSocket connections

3. **Configure Custom Domain (Optional)**
   - Register domain in Route 53
   - Configure DNS records
   - Add SSL certificate

4. **Set Up Monitoring**
   - Enable CloudWatch logs
   - Set up alarms
   - Monitor performance

5. **Secure Your Application**
   - Enable HTTPS
   - Configure WAF
   - Set up authentication

---

## Troubleshooting

### Application Won't Start
```bash
# Check logs
eb logs

# Common issues:
# - Port configuration (use process.env.PORT)
# - Missing dependencies (npm install)
# - Node version mismatch
```

### WebSocket Connection Issues
- Ensure security group allows WebSocket traffic
- Check if load balancer supports WebSocket
- Verify proxy configuration

### Performance Issues
- Upgrade instance type
- Enable auto-scaling
- Add CloudFront CDN

---

## Need Help?

1. **AWS Documentation**: https://docs.aws.amazon.com/elasticbeanstalk
2. **AWS Support**: https://console.aws.amazon.com/support
3. **Community Forums**: https://forums.aws.amazon.com

---

## Your Application is Ready! 🎉

After deployment, your Automotive Intelligent Contact Center will be accessible via:
- **Elastic Beanstalk**: http://your-app.elasticbeanstalk.com
- **Custom Domain**: http://your-domain.com (after DNS setup)

Share this URL with your team to start testing!
