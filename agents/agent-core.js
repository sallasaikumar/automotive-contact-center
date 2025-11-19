const { BedrockAgentRuntimeClient, InvokeAgentCommand } = require("@aws-sdk/client-bedrock-agent-runtime");

class AgentCore {
  constructor() {
    this.bedrockClient = new BedrockAgentRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.agentId = process.env.BEDROCK_AGENT_ID;
    this.agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID || 'TSTALIASID';
  }

  async invokeAgent(prompt, sessionId, sessionAttributes = {}) {
    try {
      const command = new InvokeAgentCommand({
        agentId: this.agentId,
        agentAliasId: this.agentAliasId,
        sessionId: sessionId,
        inputText: prompt,
        sessionState: {
          sessionAttributes: sessionAttributes
        }
      });

      const response = await this.bedrockClient.send(command);
      return this.processAgentResponse(response);
    } catch (error) {
      console.error('Agent Core Error:', error);
      throw error;
    }
  }

  processAgentResponse(response) {
    let fullResponse = '';
    let citations = [];
    let trace = [];

    if (response.completion) {
      for (const event of response.completion) {
        if (event.chunk && event.chunk.bytes) {
          const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
          if (chunk.type === 'chunk') {
            fullResponse += chunk.bytes;
          }
        }
        if (event.trace) {
          trace.push(event.trace);
        }
      }
    }

    return {
      response: fullResponse,
      citations: citations,
      trace: trace,
      sessionId: response.sessionId
    };
  }

  async healthCheck() {
    try {
      const testResponse = await this.invokeAgent("Health check", "test-session");
      return { status: 'healthy', agentId: this.agentId };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = { AgentCore };