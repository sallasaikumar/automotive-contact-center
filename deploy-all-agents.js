#!/usr/bin/env node

/**
 * Complete Bedrock Agents Deployment Script
 * Automotive Intelligent Contact Center
 * 
 * Deploys all Bedrock agents and specialized agents
 */

const { BedrockAgentClient, CreateAgentCommand, GetAgentCommand, CreateAgentAliasCommand, ListAgentsCommand } = require("@aws-sdk/client-bedrock-agent");
const { BedrockClient, ListFoundationModelsCommand } = require("@aws-sdk/client-bedrock");
const fs = require('fs');
const path = require('path');

class CompleteBedrocAgentDeployer {
  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.bedrockClient = new BedrockAgentClient({ region: this.region });
    this.bedrock = new BedrockClient({ region: this.region });
    
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
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking deployment prerequisites...\n');

    // Check AWS credentials
    const requiredEnvVars = ['AWS_REGION'];
    const missing = requiredEnvVars.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
      console.log('❌ Missing environment variables:');
      missing.forEach(env => console.log(`   - ${env}`));
      console.log('\n💡 Set AWS_REGION environment variable');
      return false;
    }

    // Check Bedrock access
    try {
      await this.bedrock.send(new ListFoundationModelsCommand({}));
      console.log('✅ Bedrock access confirmed');
    } catch (error) {
      console.log('❌ Bedrock access failed:', error.message);
      return false;
    }

    return true;
  }

  async findExistingAgent(agentName) {
    try {
      const response = await this.bedrockClient.send(new ListAgentsCommand({}));
      return response.agentSummaries?.find(agent => agent.agentName === agentName);
    } catch (error) {
      return null;
    }
  }

  getAgentRoleArn() {
    const accountId = process.env.AWS_ACCOUNT_ID || '123456789012';
    return `arn:aws:iam::${accountId}:role/AmazonBedrockExecutionRoleForAgents`;
  }

  async deployAgent(agentConfig) {
    console.log(`🚀 Deploying: ${agentConfig.agentName}`);
    
    try {
      // Check if agent exists
      const existingAgent = await this.findExistingAgent(agentConfig.agentName);
      let agentId;

      if (existingAgent) {
        console.log(`   ✅ Agent exists: ${existingAgent.agentId}`);
        agentId = existingAgent.agentId;
      } else {
        // Create new agent
        const createCommand = new CreateAgentCommand({
          agentName: agentConfig.agentName,
          foundationModel: agentConfig.foundationModel,
          instruction: agentConfig.instruction,
          agentResourceRoleArn: this.getAgentRoleArn(),
          idleSessionTTLInSeconds: agentConfig.idleSessionTTLInSeconds || 600
        });

        const response = await this.bedrockClient.send(createCommand);
        agentId = response.agent.agentId;
        console.log(`   ✅ Created: ${agentId}`);
      }

      // Create alias
      try {
        const aliasCommand = new CreateAgentAliasCommand({
          agentId: agentId,
          agentAliasName: 'LIVE',
          description: `Live alias for ${agentConfig.agentName}`
        });

        await this.bedrockClient.send(aliasCommand);
        console.log(`   ✅ Alias created`);
      } catch (error) {
        if (error.name === 'ConflictException') {
          console.log('   ✅ Alias exists');
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
      console.log(`   ❌ Failed: ${error.message}`);
      
      this.deploymentStatus.agents[agentConfig.agentName] = {
        status: 'failed',
        error: error.message,
        timestamp: new Date()
      };
      
      this.deploymentStatus.failed++;
      return { success: false, error: error.message };
    }
  }

  async deployAllAgents() {
    console.log('🏗️  Deploying All Bedrock Agents');
    console.log('==================================\n');

    // Deploy supervisor agent
    this.deploymentStatus.total++;
    await this.deployAgent(this.agentConfigs.supervisorAgent);

    // Deploy all strand agents
    for (const strandAgent of this.agentConfigs.strandAgents) {
      this.deploymentStatus.total++;
      await this.deployAgent(strandAgent);
    }

    return true;
  }

  async generateEnvironmentConfig() {
    console.log('\n📝 Generating environment configuration...');
    
    const envConfig = [
      '# AWS Bedrock Agents Configuration',
      '# Generated by deployment script',
      `AWS_REGION=${this.region}`,
      'AWS_ACCESS_KEY_ID=your_access_key_here',
      'AWS_SECRET_ACCESS_KEY=your_secret_key_here',
      'AWS_ACCOUNT_ID=your_account_id_here',
      ''
    ];

    // Add agent IDs
    Object.entries(this.deploymentStatus.agents).forEach(([agentName, config]) => {
      if (config.status === 'deployed') {
        const envVarName = agentName.toUpperCase().replace(/-/g, '_') + '_AGENT_ID';
        envConfig.push(`${envVarName}=${config.agentId}`);
      }
    });

    const envPath = path.join(__dirname, '.env.bedrock');
    fs.writeFileSync(envPath, envConfig.join('\n'));
    console.log(`   ✅ Config saved: ${envPath}`);
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
    console.log('1. Update your .env file with the generated agent IDs');
    console.log('2. Restart your application');
    console.log('3. Test the agents using the demo interface');
  }

  async run() {
    try {
      const prereqsOk = await this.checkPrerequisites();
      if (!prereqsOk) {
        process.exit(1);
      }

      await this.deployAllAgents();
      await this.generateEnvironmentConfig();
      this.printDeploymentSummary();
      
      return this.deploymentStatus.deployed > 0;
    } catch (error) {
      console.error('💥 Deployment failed:', error);
      return false;
    }
  }
}

// Run deployment
if (require.main === module) {
  const deployer = new CompleteBedrocAgentDeployer();
  deployer.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { CompleteBedrocAgentDeployer };