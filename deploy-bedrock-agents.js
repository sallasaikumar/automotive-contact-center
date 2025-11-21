#!/usr/bin/env node

/**
 * AWS Bedrock Agents Deployment Script
 * Automotive Intelligent Contact Center
 * 
 * This script checks and deploys all specialized Bedrock agents
 */

const { BedrockAgentClient, CreateAgentCommand, GetAgentCommand, CreateAgentAliasCommand } = require("@aws-sdk/client-bedrock-agent");
const { BedrockAgentRuntimeClient } = require("@aws-sdk/client-bedrock-agent-runtime");
const fs = require('fs');
const path = require('path');

class BedrockAgentDeployer {
  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.bedrockClient = new BedrockAgentClient({ region: this.region });
    this.runtimeClient = new BedrockAgentRuntimeClient({ region: this.region });
    
    // Load agent configurations
    this.agentConfigs = this.loadAgentConfigurations();
    this.deploymentStatus = {
      total: 0,
      deployed: 0,
      failed: 0,
      agents: {}
    };
  }

  loadAgentConfigurations() {
    try {
      const configPath = path.join(__dirname, 'bedrock-agents-config.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error('❌ Failed to load agent configurations:', error.message);
      return this.getDefaultConfigurations();
    }
  }

  getDefaultConfigurations() {
    return {
      supervisorAgent: {
        agentName: "automotive-supervisor-agent",
        foundationModel: "anthropic.claude-3-sonnet-20240229-v1:0",
        instruction: "You are the Supervisor Agent for an automotive intelligent contact center. Orchestrate multiple specialized agents to handle customer inquiries about vehicle service, sales, warranty, and technical support.",
        agentCollaboration: "SUPERVISOR"
      },
      strandAgents: [
        {
          agentName: "intent-analysis-strand",
          foundationModel: "anthropic.claude-3-sonnet-20240229-v1:0",
          instruction: "Analyze customer messages to detect intent (service, sales, warranty, technical, general). Extract entities and classify urgency.",
          agentCollaboration: "SUPERVISOR_ROUTER"
        },
        {
          agentName: "sentiment-analysis-strand",
          foundationModel: "anthropic.claude-3-sonnet-20240229-v1:0",
          instruction: "Analyze customer sentiment and emotional tone. Detect urgency, frustration, satisfaction.",
          agentCollaboration: "SUPERVISOR_ROUTER"
        },
        {
          agentName: "knowledge-retrieval-strand",
          foundationModel: "anthropic.claude-3-sonnet-20240229-v1:0",
          instruction: "Search automotive knowledge base for relevant information about services, products, warranties, and technical issues.",
          agentCollaboration: "SUPERVISOR_ROUTER"
        },
        {
          agentName: "personalization-strand",
          foundationModel: "anthropic.claude-3-sonnet-20240229-v1:0",
          instruction: "Access customer profile, vehicle details, and service history. Provide personalized recommendations.",
          agentCollaboration: "SUPERVISOR_ROUTER"
        },
        {
          agentName: "response-generation-strand",
          foundationModel: "anthropic.claude-3-sonnet-20240229-v1:0",
          instruction: "Generate natural, empathetic responses based on intent, sentiment, knowledge, and customer context.",
          agentCollaboration: "SUPERVISOR_ROUTER"
        },
        {
          agentName: "routing-strand",
          foundationModel: "anthropic.claude-3-sonnet-20240229-v1:0",
          instruction: "Route customer inquiries to appropriate departments. Assign priority levels and handle escalations.",
          agentCollaboration: "SUPERVISOR_ROUTER"
        }
      ]
    };
  }

  async checkAWSCredentials() {
    console.log('🔐 Checking AWS credentials...');
    
    const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
    const missing = requiredEnvVars.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
      console.log('❌ Missing AWS credentials:');
      missing.forEach(env => console.log(`   - ${env}`));
      console.log('\n💡 Set these environment variables:');
      console.log('   export AWS_REGION=us-east-1');
      console.log('   export AWS_ACCESS_KEY_ID=your_access_key');
      console.log('   export AWS_SECRET_ACCESS_KEY=your_secret_key');
      return false;
    }
    
    console.log('✅ AWS credentials configured');
    return true;
  }

  async checkBedrockAccess() {
    console.log('🧠 Checking Bedrock access...');
    
    try {
      // Test Bedrock access by listing foundation models
      const { BedrockClient, ListFoundationModelsCommand } = require("@aws-sdk/client-bedrock");
      const bedrock = new BedrockClient({ region: this.region });
      
      await bedrock.send(new ListFoundationModelsCommand({}));
      console.log('✅ Bedrock access confirmed');
      return true;
    } catch (error) {
      console.log('❌ Bedrock access failed:', error.message);
      console.log('💡 Ensure your AWS account has Bedrock access and model access is enabled');
      return false;
    }
  }

  async deployAgent(agentConfig) {
    console.log(`\n🚀 Deploying agent: ${agentConfig.agentName}`);
    
    try {
      // Check if agent already exists
      let agentId;
      try {
        const existingAgent = await this.findExistingAgent(agentConfig.agentName);
        if (existingAgent) {
          console.log(`   ✅ Agent already exists: ${existingAgent.agentId}`);
          agentId = existingAgent.agentId;
        }
      } catch (error) {
        // Agent doesn't exist, create new one
      }

      if (!agentId) {
        // Create new agent
        const createCommand = new CreateAgentCommand({
          agentName: agentConfig.agentName,
          foundationModel: agentConfig.foundationModel,
          instruction: agentConfig.instruction,
          agentResourceRoleArn: this.getAgentRoleArn(),
          idleSessionTTLInSeconds: 600
        });

        const response = await this.bedrockClient.send(createCommand);
        agentId = response.agent.agentId;
        console.log(`   ✅ Agent created: ${agentId}`);
      }

      // Create agent alias
      const aliasCommand = new CreateAgentAliasCommand({
        agentId: agentId,
        agentAliasName: 'LIVE',
        description: `Live alias for ${agentConfig.agentName}`
      });

      try {
        const aliasResponse = await this.bedrockClient.send(aliasCommand);
        console.log(`   ✅ Alias created: ${aliasResponse.agentAlias.agentAliasId}`);
      } catch (error) {
        if (error.name === 'ConflictException') {
          console.log('   ✅ Alias already exists');
        } else {
          throw error;
        }
      }

      this.deploymentStatus.agents[agentConfig.agentName] = {
        status: 'deployed',
        agentId: agentId,
        timestamp: new Date()
      };
      
      this.deploymentStatus.deployed++;
      return { success: true, agentId };

    } catch (error) {
      console.log(`   ❌ Failed to deploy ${agentConfig.agentName}:`, error.message);
      
      this.deploymentStatus.agents[agentConfig.agentName] = {
        status: 'failed',
        error: error.message,
        timestamp: new Date()
      };
      
      this.deploymentStatus.failed++;
      return { success: false, error: error.message };
    }
  }

  async findExistingAgent(agentName) {
    try {
      const { ListAgentsCommand } = require("@aws-sdk/client-bedrock-agent");
      const listCommand = new ListAgentsCommand({});
      const response = await this.bedrockClient.send(listCommand);
      
      return response.agentSummaries?.find(agent => agent.agentName === agentName);
    } catch (error) {
      return null;
    }
  }

  getAgentRoleArn() {
    // This should be replaced with your actual IAM role ARN
    const accountId = process.env.AWS_ACCOUNT_ID || '123456789012';
    return `arn:aws:iam::${accountId}:role/AmazonBedrockExecutionRoleForAgents`;
  }

  async deployAllAgents() {
    console.log('🏗️  Starting Bedrock Agents Deployment');
    console.log('=====================================\n');

    // Check prerequisites
    const hasCredentials = await this.checkAWSCredentials();
    if (!hasCredentials) return false;

    const hasBedrockAccess = await this.checkBedrockAccess();
    if (!hasBedrockAccess) return false;

    // Deploy supervisor agent
    this.deploymentStatus.total++;
    await this.deployAgent(this.agentConfigs.supervisorAgent);

    // Deploy strand agents
    for (const strandAgent of this.agentConfigs.strandAgents) {
      this.deploymentStatus.total++;
      await this.deployAgent(strandAgent);
    }

    return true;
  }

  async checkExistingDeployments() {
    console.log('\n📊 Checking existing agent deployments...');
    
    try {
      const { ListAgentsCommand } = require("@aws-sdk/client-bedrock-agent");
      const listCommand = new ListAgentsCommand({});
      const response = await this.bedrockClient.send(listCommand);
      
      const automotiveAgents = response.agentSummaries?.filter(agent => 
        agent.agentName.includes('automotive') || 
        agent.agentName.includes('strand')
      ) || [];

      console.log(`   Found ${automotiveAgents.length} existing automotive agents:`);
      automotiveAgents.forEach(agent => {
        console.log(`   - ${agent.agentName} (${agent.agentId})`);
      });

      return automotiveAgents;
    } catch (error) {
      console.log('   ❌ Failed to check existing deployments:', error.message);
      return [];
    }
  }

  async generateEnvironmentConfig() {
    console.log('\n📝 Generating environment configuration...');
    
    const envConfig = [
      '# AWS Bedrock Agents Configuration',
      '# Generated by deployment script',
      `AWS_REGION=${this.region}`,
      'AWS_ACCESS_KEY_ID=your_access_key_here',
      'AWS_SECRET_ACCESS_KEY=your_secret_key_here',
      ''
    ];

    // Add agent IDs if deployed
    Object.entries(this.deploymentStatus.agents).forEach(([agentName, config]) => {
      if (config.status === 'deployed') {
        envConfig.push(`# ${agentName}`);
        envConfig.push(`${agentName.toUpperCase().replace(/-/g, '_')}_AGENT_ID=${config.agentId}`);
      }
    });

    const envPath = path.join(__dirname, '.env.bedrock');
    fs.writeFileSync(envPath, envConfig.join('\n'));
    console.log(`   ✅ Environment config saved to: ${envPath}`);
  }

  printDeploymentSummary() {
    console.log('\n📋 Deployment Summary');
    console.log('====================');
    console.log(`Total agents: ${this.deploymentStatus.total}`);
    console.log(`Successfully deployed: ${this.deploymentStatus.deployed}`);
    console.log(`Failed: ${this.deploymentStatus.failed}`);
    
    if (this.deploymentStatus.deployed > 0) {
      console.log('\n✅ Successfully deployed agents:');
      Object.entries(this.deploymentStatus.agents).forEach(([name, config]) => {
        if (config.status === 'deployed') {
          console.log(`   - ${name}: ${config.agentId}`);
        }
      });
    }

    if (this.deploymentStatus.failed > 0) {
      console.log('\n❌ Failed deployments:');
      Object.entries(this.deploymentStatus.agents).forEach(([name, config]) => {
        if (config.status === 'failed') {
          console.log(`   - ${name}: ${config.error}`);
        }
      });
    }

    console.log('\n🎯 Next Steps:');
    if (this.deploymentStatus.deployed > 0) {
      console.log('1. Update your application environment variables');
      console.log('2. Restart your application');
      console.log('3. Test the /health endpoint');
    } else {
      console.log('1. Fix the deployment issues above');
      console.log('2. Ensure AWS credentials and Bedrock access');
      console.log('3. Run the script again');
    }
  }

  async run() {
    try {
      await this.checkExistingDeployments();
      const success = await this.deployAllAgents();
      
      if (success) {
        await this.generateEnvironmentConfig();
      }
      
      this.printDeploymentSummary();
      
      return this.deploymentStatus.deployed > 0;
    } catch (error) {
      console.error('💥 Deployment failed:', error);
      return false;
    }
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployer = new BedrockAgentDeployer();
  deployer.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { BedrockAgentDeployer };