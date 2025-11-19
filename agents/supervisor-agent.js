const { RoutingAgent } = require('./routing-agent');
const { IntentAnalysisAgent } = require('./intent-analysis-agent');
const { SentimentAnalysisAgent } = require('./sentiment-analysis-agent');
const { KnowledgeRetrievalAgent } = require('./knowledge-retrieval-agent');
const { PersonalizationAgent } = require('./personalization-agent');
const { ResponseGenerationAgent } = require('./response-generation-agent');

class SupervisorAgent {
  constructor() {
    this.routingAgent = new RoutingAgent();
    this.intentAgent = new IntentAnalysisAgent();
    this.sentimentAgent = new SentimentAnalysisAgent();
    this.knowledgeAgent = new KnowledgeRetrievalAgent();
    this.personalizationAgent = new PersonalizationAgent();
    this.responseAgent = new ResponseGenerationAgent();
    this.sessions = new Map();
  }

  async processMessage(message, sessionId) {
    const startTime = Date.now();
    
    // Get or create session context
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        history: [],
        customerData: this.personalizationAgent.getCustomerProfile(sessionId),
        lastIntent: null,
        conversationContext: {}
      });
    }
    
    const session = this.sessions.get(sessionId);
    session.history.push({ role: 'user', content: message });

    try {
      // Step 1: Analyze intent with context
      const intent = await this.intentAgent.analyze(message, session.lastIntent);
      
      // Step 2: Analyze sentiment
      const sentiment = await this.sentimentAgent.analyze(message);
      
      // Step 3: Route to appropriate handler
      const route = await this.routingAgent.route(intent, sentiment);
      
      // Step 4: Retrieve knowledge
      const knowledge = await this.knowledgeAgent.retrieve(intent.category, message);
      
      // Step 5: Personalize response
      const personalizedContext = await this.personalizationAgent.personalize(
        session.customerData,
        intent,
        knowledge
      );
      
      // Step 6: Generate response
      const response = await this.responseAgent.generate(
        message,
        intent,
        sentiment,
        knowledge,
        personalizedContext,
        session.history
      );
      
      session.history.push({ role: 'assistant', content: response.text });
      session.lastIntent = intent.category;
      
      const processingTime = Date.now() - startTime;
      
      return {
        type: 'chat_response',
        message: response.text,
        metadata: {
          intent: intent.category,
          sentiment: sentiment.score,
          route: route.department,
          processingTime,
          suggestions: response.suggestions,
          quickActions: response.quickActions
        }
      };
    } catch (error) {
      console.error('Supervisor Agent Error:', error);
      return {
        type: 'chat_response',
        message: 'I apologize, but I encountered an issue processing your request. Please try again.',
        metadata: { error: true }
      };
    }
  }
}

module.exports = { SupervisorAgent };
