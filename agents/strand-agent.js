const { AgentCore } = require('./agent-core');

class StrandAgent {
  constructor(strandType, agentConfig) {
    this.strandType = strandType;
    this.agentCore = new AgentCore();
    this.config = agentConfig;
    this.activeStrands = new Map();
  }

  async createStrand(sessionId, context) {
    const strandId = `${this.strandType}-${sessionId}-${Date.now()}`;
    
    const strand = {
      id: strandId,
      type: this.strandType,
      sessionId: sessionId,
      context: context,
      createdAt: new Date(),
      status: 'active',
      history: []
    };

    this.activeStrands.set(strandId, strand);
    return strand;
  }

  async executeStrand(strandId, input, sessionAttributes = {}) {
    const strand = this.activeStrands.get(strandId);
    if (!strand) {
      throw new Error(`Strand ${strandId} not found`);
    }

    try {
      // Add strand-specific context to session attributes
      const enhancedAttributes = {
        ...sessionAttributes,
        strandType: this.strandType,
        strandId: strandId,
        context: JSON.stringify(strand.context)
      };

      const response = await this.agentCore.invokeAgent(
        input,
        strand.sessionId,
        enhancedAttributes
      );

      // Update strand history
      strand.history.push({
        input: input,
        output: response.response,
        timestamp: new Date(),
        trace: response.trace
      });

      return {
        strandId: strandId,
        response: response.response,
        citations: response.citations,
        trace: response.trace,
        strandType: this.strandType
      };
    } catch (error) {
      strand.status = 'error';
      throw error;
    }
  }

  async terminateStrand(strandId) {
    const strand = this.activeStrands.get(strandId);
    if (strand) {
      strand.status = 'terminated';
      strand.terminatedAt = new Date();
      this.activeStrands.delete(strandId);
    }
  }

  getActiveStrands() {
    return Array.from(this.activeStrands.values());
  }

  getStrandHistory(strandId) {
    const strand = this.activeStrands.get(strandId);
    return strand ? strand.history : null;
  }
}

// Specialized Strand Agents
class IntentStrandAgent extends StrandAgent {
  constructor() {
    super('intent-analysis', {
      capabilities: ['intent-detection', 'context-analysis', 'multi-turn-understanding']
    });
  }

  async analyzeIntent(message, sessionId, conversationHistory = []) {
    const strand = await this.createStrand(sessionId, {
      task: 'intent-analysis',
      conversationHistory: conversationHistory
    });

    const prompt = `Analyze the intent of this automotive customer message: "${message}"
    
    Previous conversation context: ${JSON.stringify(conversationHistory)}
    
    Classify into one of these categories:
    - service_appointment
    - technical_issue
    - sales_inquiry
    - warranty_question
    - general_information
    
    Provide confidence score and extracted entities.`;

    return await this.executeStrand(strand.id, prompt);
  }
}

class KnowledgeStrandAgent extends StrandAgent {
  constructor() {
    super('knowledge-retrieval', {
      capabilities: ['knowledge-search', 'context-retrieval', 'citation-generation']
    });
  }

  async retrieveKnowledge(query, intent, sessionId) {
    const strand = await this.createStrand(sessionId, {
      task: 'knowledge-retrieval',
      intent: intent,
      query: query
    });

    const prompt = `Search automotive knowledge base for: "${query}"
    
    Intent context: ${intent}
    
    Provide relevant information with citations and confidence scores.
    Focus on automotive service, sales, warranty, and technical information.`;

    return await this.executeStrand(strand.id, prompt);
  }
}

class ResponseStrandAgent extends StrandAgent {
  constructor() {
    super('response-generation', {
      capabilities: ['response-crafting', 'personalization', 'action-suggestions']
    });
  }

  async generateResponse(context, sessionId) {
    const strand = await this.createStrand(sessionId, {
      task: 'response-generation',
      context: context
    });

    const prompt = `Generate a helpful automotive customer service response based on:
    
    Customer Message: ${context.message}
    Intent: ${context.intent}
    Sentiment: ${context.sentiment}
    Knowledge: ${context.knowledge}
    Customer Profile: ${JSON.stringify(context.customerProfile)}
    
    Provide a professional, helpful response with suggested quick actions.`;

    return await this.executeStrand(strand.id, prompt);
  }
}

module.exports = { 
  StrandAgent, 
  IntentStrandAgent, 
  KnowledgeStrandAgent, 
  ResponseStrandAgent 
};