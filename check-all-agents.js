#!/usr/bin/env node

/**
 * Agent Status Checker
 * Automotive Intelligent Contact Center
 */

const { BedrockAgentClient, ListAgentsCommand, GetAgentCommand } = require("@aws-sdk/client-bedrock-agent");

class AgentStatusChecker {
  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.bedrockClient = new BedrockAgentClient({ region: this.region });
  }

  async checkAllAgents() {
    console.log('🔍 Checking Bedrock Agent Status');
    console.log('=================================\n');

    try {
      const response = await this.bedrockClient.send(new ListAgentsCommand({}));
      const agents = response.agentSummaries || [];
      
      const automotiveAgents = agents.filter(agent => 
        agent.agentName.includes('automotive') || 
        agent.agentName.includes('strand')
      );

      if (automotiveAgents.length === 0) {
        console.log('❌ No automotive agents found');
        console.log('💡 Run: node deploy-all-agents.js');
        return false;
      }

      console.log(`✅ Found ${automotiveAgents.length} automotive agents:\n`);
      
      for (const agent of automotiveAgents) {
        console.log(`📋 ${agent.agentName}`);
        console.log(`   ID: ${agent.agentId}`);
        console.log(`   Status: ${agent.agentStatus}`);
        console.log(`   Updated: ${agent.updatedAt}\n`);
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to check agents:', error.message);
      return false;
    }
  }

  async run() {
    return await this.checkAllAgents();
  }
}

if (require.main === module) {
  const checker = new AgentStatusChecker();
  checker.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { AgentStatusChecker };