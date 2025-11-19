const { AgentCore } = require('./agent-core');
const { IntentStrandAgent, KnowledgeStrandAgent, ResponseStrandAgent } = require('./strand-agent');
const { PersonalizationAgent } = require('./personalization-agent');
const { SentimentAnalysisAgent } = require('./sentiment-analysis-agent');

class SupervisorAgent {
  constructor() {
    this.agentCore = new AgentCore();
    this.intentStrand = new IntentStrandAgent();
    this.knowledgeStrand = new KnowledgeStrandAgent();
    this.responseStrand = new ResponseStrandAgent();
    this.personalizationAgent = new PersonalizationAgent();
    this.sentimentAgent = new SentimentAnalysisAgent();
    this.sessions = new Map();
    this.orchestrationMetrics = {
      totalRequests: 0,
      averageResponseTime: 0,
      strandUtilization: {}
    };
  }

  async processMessage(message, sessionId) {
    const startTime = Date.now();
    this.orchestrationMetrics.totalRequests++;
    
    // Get or create session context
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        history: [],
        customerData: this.personalizationAgent.getCustomerProfile(sessionId),
        lastIntent: null,
        conversationContext: {},
        activeStrands: []
      });
    }
    
    const session = this.sessions.get(sessionId);
    session.history.push({ role: 'user', content: message });

    try {
      // AWS Strands Multi-Agent Orchestration
      
      // Strand 1: Intent Analysis using AWS Bedrock Agent
      const intentResult = await this.intentStrand.analyzeIntent(
        message, 
        sessionId, 
        session.history.slice(-5) // Last 5 messages for context
      );
      
      // Strand 2: Sentiment Analysis (local processing)
      const sentiment = await this.sentimentAgent.analyze(message);
      
      // Strand 3: Knowledge Retrieval using AWS Bedrock Agent
      const knowledgeResult = await this.knowledgeStrand.retrieveKnowledge(
        message,
        intentResult.response,
        sessionId
      );
      
      // Strand 4: Personalization (local processing)
      const personalizedContext = await this.personalizationAgent.personalize(
        session.customerData,
        { category: this.extractIntent(intentResult.response) },
        { articles: this.extractKnowledge(knowledgeResult.response) }
      );
      
      // Strand 5: Response Generation using AWS Bedrock Agent
      const responseContext = {
        message: message,
        intent: intentResult.response,
        sentiment: sentiment,
        knowledge: knowledgeResult.response,
        customerProfile: personalizedContext
      };
      
      const responseResult = await this.responseStrand.generateResponse(
        responseContext,
        sessionId
      );
      
      // Update session
      session.history.push({ role: 'assistant', content: responseResult.response });
      session.lastIntent = this.extractIntent(intentResult.response);
      session.activeStrands = [
        intentResult.strandId,
        knowledgeResult.strandId,
        responseResult.strandId
      ];
      
      const processingTime = Date.now() - startTime;
      this.updateMetrics(processingTime);
      
      return {
        type: 'chat_response',
        message: responseResult.response,
        metadata: {
          intent: this.extractIntent(intentResult.response),
          sentiment: sentiment.score,
          processingTime,
          strandsUsed: session.activeStrands.length,
          agentCore: 'AWS Bedrock Agents',
          orchestration: 'AWS Strands Multi-Agent',
          citations: responseResult.citations || [],
          trace: this.sanitizeTrace([
            intentResult.trace,
            knowledgeResult.trace,
            responseResult.trace
          ])
        }
      };
    } catch (error) {
      console.error('AWS Strands Supervisor Agent Error:', error);
      
      // Fallback to local processing if AWS Strands fail
      return await this.fallbackProcessing(message, session, startTime);
    }
  }

  extractIntent(intentResponse) {
    // Extract intent category from AWS Bedrock response
    try {
      const match = intentResponse.match(/Category:\s*(\w+)/i);
      return match ? match[1].toLowerCase() : 'general';
    } catch {
      return 'general';
    }
  }

  extractKnowledge(knowledgeResponse) {
    // Extract knowledge articles from AWS Bedrock response
    try {
      return [{ title: 'AWS Knowledge', content: knowledgeResponse }];
    } catch {
      return [];
    }
  }

  sanitizeTrace(traces) {
    // Sanitize trace information for client
    return traces.filter(Boolean).map(trace => ({
      timestamp: new Date(),
      type: 'strand_execution'
    }));
  }

  updateMetrics(processingTime) {
    const currentAvg = this.orchestrationMetrics.averageResponseTime;
    const totalRequests = this.orchestrationMetrics.totalRequests;
    
    this.orchestrationMetrics.averageResponseTime = 
      ((currentAvg * (totalRequests - 1)) + processingTime) / totalRequests;
  }

  async fallbackProcessing(message, session, startTime) {
    // Fallback to local agents if AWS Strands are unavailable
    const processingTime = Date.now() - startTime;
    
    return {
      type: 'chat_response',
      message: 'I understand you need assistance with your automotive needs. Let me help you with that. Could you please provide more details about what you need?',
      metadata: {
        intent: 'general',
        sentiment: { score: 0.5 },
        processingTime,
        fallback: true,
        error: 'AWS Strands temporarily unavailable'
      }
    };
  }

  async getOrchestrationStatus() {
    const agentCoreHealth = await this.agentCore.healthCheck();
    
    return {
      agentCore: agentCoreHealth,
      activeStrands: {
        intent: this.intentStrand.getActiveStrands().length,
        knowledge: this.knowledgeStrand.getActiveStrands().length,
        response: this.responseStrand.getActiveStrands().length
      },
      metrics: this.orchestrationMetrics,
      architecture: 'AWS Strands Multi-Agent Orchestration'
    };
  }
}

module.exports = { SupervisorAgent };
