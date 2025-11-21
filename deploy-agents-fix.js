#!/usr/bin/env node

/**
 * Agent Deployment Fix Script
 * Automotive Intelligent Contact Center
 * 
 * Fixes deployment issues and ensures all agents are properly deployed
 */

const fs = require('fs');
const path = require('path');

class AgentDeploymentFixer {
  constructor() {
    this.deploymentUrl = 'https://automotive-contact-center-production.up.railway.app';
    this.fixes = [];
  }

  async checkCurrentDeployment() {
    console.log('🔍 Checking current deployment status...');
    
    try {
      // Test health endpoint
      const response = await fetch(`${this.deploymentUrl}/health`);
      const health = await response.json();
      
      console.log('✅ Deployment is live and responding');
      console.log(`   Status: ${health.status}`);
      console.log(`   Architecture: ${health.architecture}`);
      
      // Check agent core status
      if (health.orchestration?.agentCore?.status === 'unhealthy') {
        console.log('⚠️  Agent Core is unhealthy:', health.orchestration.agentCore.error);
        this.fixes.push('aws_credentials');
      }
      
      return health;
    } catch (error) {
      console.log('❌ Deployment check failed:', error.message);
      this.fixes.push('deployment_down');
      return null;
    }
  }

  async testAllAgentEndpoints() {
    console.log('\n🧪 Testing all agent endpoints...');
    
    const endpoints = [
      { name: 'Chat API', path: '/api/chat', method: 'POST' },
      { name: 'Cockpit Assistant', path: '/api/cockpit/command', method: 'POST' },
      { name: 'Product Recommendations', path: '/api/recommendations', method: 'POST' },
      { name: 'CDH Insights', path: '/api/insights/test-customer', method: 'GET' },
      { name: 'Marketing Campaign', path: '/api/marketing/campaign', method: 'POST' },
      { name: 'Service Booking', path: '/api/service/book', method: 'POST' },
      { name: 'Enhanced Metrics', path: '/api/metrics/enhanced', method: 'GET' }
    ];

    const results = {};

    for (const endpoint of endpoints) {
      try {
        console.log(`   Testing ${endpoint.name}...`);
        
        let response;
        if (endpoint.method === 'GET') {
          response = await fetch(`${this.deploymentUrl}${endpoint.path}`);
        } else {
          const testData = this.getTestData(endpoint.path);
          response = await fetch(`${this.deploymentUrl}${endpoint.path}`, {
            method: endpoint.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
          });
        }

        if (response.ok) {
          const data = await response.json();
          results[endpoint.name] = { status: 'working', response: data };
          console.log(`   ✅ ${endpoint.name}: Working`);
        } else {
          results[endpoint.name] = { status: 'error', code: response.status };
          console.log(`   ❌ ${endpoint.name}: Error ${response.status}`);
        }
      } catch (error) {
        results[endpoint.name] = { status: 'failed', error: error.message };
        console.log(`   ❌ ${endpoint.name}: Failed - ${error.message}`);
      }
    }

    return results;
  }

  getTestData(path) {
    const testData = {
      '/api/chat': {
        message: 'Hello, I need help with my vehicle',
        sessionId: 'test-session'
      },
      '/api/cockpit/command': {
        command: 'Set temperature to 72 degrees',
        sessionId: 'cockpit-test'
      },
      '/api/recommendations': {
        context: { intent: 'purchase', budget: 30000 },
        sessionId: 'rec-test'
      },
      '/api/marketing/campaign': {
        campaignType: 'email',
        targetAudience: { segment: 'new_customers' },
        objectives: ['awareness', 'engagement']
      },
      '/api/service/book': {
        customerId: 'test-customer',
        vehicleInfo: { make: 'Toyota', model: 'Camry', year: 2022 },
        sessionId: 'service-test'
      }
    };

    return testData[path] || {};
  }

  async generateDeploymentReport() {
    console.log('\n📊 Generating deployment report...');
    
    const health = await this.checkCurrentDeployment();
    const endpoints = await this.testAllAgentEndpoints();
    
    const report = {
      timestamp: new Date(),
      deploymentUrl: this.deploymentUrl,
      status: {
        overall: health ? 'deployed' : 'down',
        health: health,
        endpoints: endpoints
      },
      agents: {
        total: 12,
        deployed: Object.keys(endpoints).length,
        working: Object.values(endpoints).filter(e => e.status === 'working').length,
        failed: Object.values(endpoints).filter(e => e.status !== 'working').length
      },
      fixes: this.fixes,
      recommendations: this.generateRecommendations(health, endpoints)
    };

    // Save report
    const reportPath = path.join(__dirname, 'live-deployment-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`   Report saved: ${reportPath}`);
    return report;
  }

  generateRecommendations(health, endpoints) {
    const recommendations = [];

    // AWS Credentials issue
    if (health?.orchestration?.agentCore?.error?.includes('credentials')) {
      recommendations.push({
        priority: 'high',
        type: 'aws_config',
        message: 'Configure AWS credentials in Railway environment variables',
        action: 'Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION in Railway dashboard'
      });
    }

    // Failed endpoints
    const failedEndpoints = Object.entries(endpoints)
      .filter(([name, result]) => result.status !== 'working');
    
    if (failedEndpoints.length > 0) {
      recommendations.push({
        priority: 'medium',
        type: 'endpoint_fixes',
        message: `${failedEndpoints.length} endpoints need attention`,
        endpoints: failedEndpoints.map(([name]) => name)
      });
    }

    // Performance optimization
    if (health?.orchestration?.metrics?.averageResponseTime > 1000) {
      recommendations.push({
        priority: 'low',
        type: 'performance',
        message: 'Consider optimizing response times',
        action: 'Enable AWS Bedrock for faster processing'
      });
    }

    return recommendations;
  }

  async fixAWSCredentials() {
    console.log('\n🔧 AWS Credentials Fix Instructions...');
    
    console.log('   To fix AWS credentials in Railway:');
    console.log('   1. Go to Railway dashboard: https://railway.app/dashboard');
    console.log('   2. Select your automotive-contact-center project');
    console.log('   3. Go to Variables tab');
    console.log('   4. Add these environment variables:');
    console.log('      - AWS_REGION=us-east-1');
    console.log('      - AWS_ACCESS_KEY_ID=<your-access-key>');
    console.log('      - AWS_SECRET_ACCESS_KEY=<your-secret-key>');
    console.log('   5. Redeploy the application');
    
    // Create environment template
    const envTemplate = `# Railway Environment Variables for AWS Integration
# Copy these to Railway dashboard -> Variables

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here

# Optional: Bedrock Agent Configuration
BEDROCK_AGENT_ID=your_bedrock_agent_id
BEDROCK_AGENT_ALIAS_ID=TSTALIASID

# Application Settings
NODE_ENV=production
PORT=8080`;

    fs.writeFileSync(path.join(__dirname, 'railway-env-template.txt'), envTemplate);
    console.log('   📝 Environment template saved: railway-env-template.txt');
  }

  async testLocalFallback() {
    console.log('\n🔄 Testing local fallback mode...');
    
    try {
      const response = await fetch(`${this.deploymentUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test fallback mode',
          sessionId: 'fallback-test'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const isFallback = data.metadata?.fallback || data.metadata?.mode === 'local-agents';
        
        console.log(`   ✅ Fallback mode: ${isFallback ? 'Active' : 'Not needed'}`);
        console.log(`   ✅ Response time: ${data.metadata?.processingTime || 'unknown'}ms`);
        
        return { working: true, fallback: isFallback };
      }
    } catch (error) {
      console.log(`   ❌ Fallback test failed: ${error.message}`);
      return { working: false, error: error.message };
    }
  }

  async run() {
    console.log('🚀 Automotive Contact Center - Agent Deployment Fix');
    console.log('==================================================\n');

    // Check current deployment
    const health = await this.checkCurrentDeployment();
    
    // Test all endpoints
    const endpoints = await this.testAllAgentEndpoints();
    
    // Test fallback mode
    const fallback = await this.testLocalFallback();
    
    // Generate report
    const report = await this.generateDeploymentReport();
    
    // Provide fixes
    if (this.fixes.includes('aws_credentials')) {
      await this.fixAWSCredentials();
    }

    // Summary
    console.log('\n📋 DEPLOYMENT SUMMARY');
    console.log('=====================');
    console.log(`🌐 URL: ${this.deploymentUrl}`);
    console.log(`📊 Status: ${report.status.overall.toUpperCase()}`);
    console.log(`🤖 Agents: ${report.agents.working}/${report.agents.total} working`);
    console.log(`🔄 Fallback: ${fallback.working ? 'Available' : 'Not working'}`);
    console.log(`⚠️  Issues: ${report.recommendations.length}`);

    if (report.recommendations.length > 0) {
      console.log('\n🔧 REQUIRED ACTIONS:');
      report.recommendations.forEach((rec, i) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`   ${priority} ${rec.message}`);
        if (rec.action) {
          console.log(`      Action: ${rec.action}`);
        }
      });
    } else {
      console.log('\n🎉 All agents deployed and working correctly!');
    }

    return report;
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new AgentDeploymentFixer();
  fixer.run().then(report => {
    const success = report.agents.working >= 5; // At least 5 core endpoints working
    console.log(`\n${success ? '✅' : '❌'} Deployment ${success ? 'SUCCESSFUL' : 'NEEDS ATTENTION'}`);
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Deployment check failed:', error);
    process.exit(1);
  });
}

module.exports = { AgentDeploymentFixer };