#!/usr/bin/env node

/**
 * Deployment Status Checker
 * Automotive Intelligent Contact Center
 * 
 * Comprehensive check of all agents and services
 */

const fs = require('fs');
const path = require('path');
const { SupervisorAgent } = require('./agents/supervisor-agent');

class DeploymentStatusChecker {
  constructor() {
    this.status = {
      infrastructure: {},
      agents: {},
      services: {},
      deployment: {},
      recommendations: []
    };
  }

  async checkInfrastructure() {
    console.log('🏗️  Checking Infrastructure...');
    
    // Check required files
    const requiredFiles = [
      'server.js',
      'package.json',
      'agents/supervisor-agent.js',
      'agents/agent-core.js',
      'agents/strand-agent.js'
    ];

    const fileStatus = {};
    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      fileStatus[file] = fs.existsSync(filePath);
    });

    // Check agent files
    const agentFiles = [
      'intent-analysis-agent.js',
      'sentiment-analysis-agent.js',
      'routing-agent.js',
      'knowledge-retrieval-agent.js',
      'personalization-agent.js',
      'response-generation-agent.js',
      'cockpit-assistant-agent.js',
      'product-recommendation-agent.js',
      'cdh-insights-agent.js',
      'generative-marketing-agent.js',
      'interactive-servicing-agent.js'
    ];

    const agentStatus = {};
    agentFiles.forEach(file => {
      const filePath = path.join(__dirname, 'agents', file);
      agentStatus[file] = fs.existsSync(filePath);
    });

    this.status.infrastructure = {
      coreFiles: fileStatus,
      agentFiles: agentStatus,
      totalAgents: Object.keys(agentStatus).length,
      deployedAgents: Object.values(agentStatus).filter(Boolean).length
    };

    console.log(`   ✅ Core files: ${Object.values(fileStatus).filter(Boolean).length}/${Object.keys(fileStatus).length}`);
    console.log(`   ✅ Agent files: ${this.status.infrastructure.deployedAgents}/${this.status.infrastructure.totalAgents}`);
  }

  async checkEnvironmentConfiguration() {
    console.log('\n🔧 Checking Environment Configuration...');
    
    const requiredEnvVars = [
      'AWS_REGION',
      'AWS_ACCESS_KEY_ID', 
      'AWS_SECRET_ACCESS_KEY'
    ];

    const optionalEnvVars = [
      'BEDROCK_AGENT_ID',
      'BEDROCK_AGENT_ALIAS_ID',
      'SAGEMAKER_DOMAIN_ID',
      'NODE_ENV',
      'PORT'
    ];

    const envStatus = {};
    
    requiredEnvVars.forEach(env => {
      envStatus[env] = {
        configured: !!process.env[env],
        required: true,
        value: process.env[env] ? '***configured***' : 'missing'
      };
    });

    optionalEnvVars.forEach(env => {
      envStatus[env] = {
        configured: !!process.env[env],
        required: false,
        value: process.env[env] ? '***configured***' : 'not set'
      };
    });

    this.status.environment = envStatus;

    const requiredConfigured = requiredEnvVars.filter(env => process.env[env]).length;
    const optionalConfigured = optionalEnvVars.filter(env => process.env[env]).length;

    console.log(`   ✅ Required variables: ${requiredConfigured}/${requiredEnvVars.length}`);
    console.log(`   ✅ Optional variables: ${optionalConfigured}/${optionalEnvVars.length}`);

    if (requiredConfigured < requiredEnvVars.length) {
      this.status.recommendations.push({
        type: 'environment',
        priority: 'high',
        message: 'Configure missing AWS credentials for Bedrock integration'
      });
    }
  }

  async checkAgentFunctionality() {
    console.log('\n🤖 Checking Agent Functionality...');
    
    try {
      const supervisor = new SupervisorAgent();
      
      // Test basic functionality
      const testMessage = "Hello, I need help with my vehicle";
      const testSessionId = "status-check-session";
      
      console.log('   Testing supervisor agent...');
      const response = await supervisor.processMessage(testMessage, testSessionId);
      
      this.status.agents.supervisor = {
        status: 'functional',
        responseTime: response.metadata?.processingTime || 'unknown',
        mode: response.metadata?.mode || 'aws-strands',
        fallback: response.metadata?.fallback || false
      };

      console.log(`   ✅ Supervisor agent: ${this.status.agents.supervisor.status}`);
      console.log(`   ✅ Response time: ${this.status.agents.supervisor.responseTime}ms`);
      console.log(`   ✅ Mode: ${this.status.agents.supervisor.mode}`);

      // Test orchestration status
      const orchestrationStatus = await supervisor.getOrchestrationStatus();
      this.status.agents.orchestration = orchestrationStatus;

      console.log(`   ✅ Architecture: ${orchestrationStatus.architecture}`);

    } catch (error) {
      this.status.agents.supervisor = {
        status: 'error',
        error: error.message
      };
      console.log(`   ❌ Supervisor agent error: ${error.message}`);
      
      this.status.recommendations.push({
        type: 'agents',
        priority: 'high',
        message: 'Fix supervisor agent initialization issues'
      });
    }
  }

  async checkAdvancedFeatures() {
    console.log('\n🚀 Checking Advanced Features...');
    
    const features = [
      { name: 'Cockpit Assistant', endpoint: '/api/cockpit/command' },
      { name: 'Product Recommendations', endpoint: '/api/recommendations' },
      { name: 'CDH Insights', endpoint: '/api/insights/:customerId' },
      { name: 'Marketing Campaigns', endpoint: '/api/marketing/campaign' },
      { name: 'Service Booking', endpoint: '/api/service/book' }
    ];

    this.status.features = {};

    try {
      const supervisor = new SupervisorAgent();
      
      // Test cockpit feature
      try {
        await supervisor.handleCockpitCommand("Set temperature to 72", "test-session");
        this.status.features.cockpit = { status: 'available', tested: true };
        console.log('   ✅ Cockpit Assistant: Available');
      } catch (error) {
        this.status.features.cockpit = { status: 'error', error: error.message };
        console.log('   ⚠️  Cockpit Assistant: Error');
      }

      // Test recommendations
      try {
        await supervisor.handleProductRecommendation({ intent: 'purchase' }, "test-session");
        this.status.features.recommendations = { status: 'available', tested: true };
        console.log('   ✅ Product Recommendations: Available');
      } catch (error) {
        this.status.features.recommendations = { status: 'error', error: error.message };
        console.log('   ⚠️  Product Recommendations: Error');
      }

      // Test insights
      try {
        await supervisor.handleCDHInsights("test-customer");
        this.status.features.insights = { status: 'available', tested: true };
        console.log('   ✅ CDH Insights: Available');
      } catch (error) {
        this.status.features.insights = { status: 'error', error: error.message };
        console.log('   ⚠️  CDH Insights: Error');
      }

    } catch (error) {
      console.log('   ❌ Advanced features check failed:', error.message);
    }
  }

  async checkDeploymentReadiness() {
    console.log('\n🎯 Checking Deployment Readiness...');
    
    const checks = {
      coreInfrastructure: this.status.infrastructure.deployedAgents >= 11,
      environmentConfig: Object.values(this.status.environment || {})
        .filter(env => env.required && env.configured).length >= 3,
      agentFunctionality: this.status.agents.supervisor?.status === 'functional',
      packageDependencies: fs.existsSync(path.join(__dirname, 'node_modules')),
      serverConfiguration: fs.existsSync(path.join(__dirname, 'server.js'))
    };

    this.status.deployment = {
      checks,
      readiness: Object.values(checks).filter(Boolean).length / Object.keys(checks).length,
      canDeploy: Object.values(checks).every(Boolean)
    };

    console.log('   Deployment Checks:');
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}: ${passed ? 'PASS' : 'FAIL'}`);
    });

    console.log(`\n   Overall Readiness: ${Math.round(this.status.deployment.readiness * 100)}%`);
    
    if (this.status.deployment.canDeploy) {
      console.log('   🎉 Ready for deployment!');
    } else {
      console.log('   ⚠️  Deployment issues need to be resolved');
    }
  }

  generateRecommendations() {
    console.log('\n💡 Recommendations...');
    
    // Infrastructure recommendations
    if (this.status.infrastructure.deployedAgents < this.status.infrastructure.totalAgents) {
      this.status.recommendations.push({
        type: 'infrastructure',
        priority: 'medium',
        message: 'Some agent files are missing - check agents/ directory'
      });
    }

    // Environment recommendations
    const awsConfigured = this.status.environment?.AWS_ACCESS_KEY_ID?.configured;
    if (!awsConfigured) {
      this.status.recommendations.push({
        type: 'environment',
        priority: 'high',
        message: 'Configure AWS credentials for Bedrock integration'
      });
    }

    // Agent recommendations
    if (this.status.agents.supervisor?.fallback) {
      this.status.recommendations.push({
        type: 'agents',
        priority: 'medium',
        message: 'Application running in fallback mode - AWS Strands not connected'
      });
    }

    // Deployment recommendations
    if (!this.status.deployment?.canDeploy) {
      this.status.recommendations.push({
        type: 'deployment',
        priority: 'high',
        message: 'Fix deployment readiness issues before going live'
      });
    }

    // Print recommendations
    if (this.status.recommendations.length === 0) {
      console.log('   🎉 No issues found - system is ready!');
    } else {
      this.status.recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`   ${priority} ${rec.type.toUpperCase()}: ${rec.message}`);
      });
    }
  }

  async generateStatusReport() {
    const reportPath = path.join(__dirname, 'deployment-status-report.json');
    const report = {
      timestamp: new Date(),
      status: this.status,
      summary: {
        infrastructure: `${this.status.infrastructure.deployedAgents}/${this.status.infrastructure.totalAgents} agents`,
        environment: `${Object.values(this.status.environment || {}).filter(env => env.configured).length} variables configured`,
        functionality: this.status.agents.supervisor?.status || 'unknown',
        readiness: `${Math.round((this.status.deployment?.readiness || 0) * 100)}%`,
        recommendations: this.status.recommendations.length
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Status report saved: ${reportPath}`);
  }

  async run() {
    console.log('🔍 Automotive Contact Center - Deployment Status Check');
    console.log('====================================================\n');

    await this.checkInfrastructure();
    await this.checkEnvironmentConfiguration();
    await this.checkAgentFunctionality();
    await this.checkAdvancedFeatures();
    await this.checkDeploymentReadiness();
    this.generateRecommendations();
    await this.generateStatusReport();

    console.log('\n✅ Status check complete!');
    
    return {
      canDeploy: this.status.deployment?.canDeploy || false,
      readiness: this.status.deployment?.readiness || 0,
      issues: this.status.recommendations.length
    };
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new DeploymentStatusChecker();
  checker.run().then(result => {
    console.log(`\n🎯 Final Status: ${result.canDeploy ? 'READY' : 'NEEDS WORK'}`);
    process.exit(result.canDeploy ? 0 : 1);
  });
}

module.exports = { DeploymentStatusChecker };