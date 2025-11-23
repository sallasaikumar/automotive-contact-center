const { AgentCore } = require('./agent-core');
const { IntentStrandAgent, KnowledgeStrandAgent, ResponseStrandAgent } = require('./strand-agent');
const { PersonalizationAgent } = require('./personalization-agent');
const { SentimentAnalysisAgent } = require('./sentiment-analysis-agent');
const { CockpitAssistantAgent } = require('./cockpit-assistant-agent');
const { ProductRecommendationAgent } = require('./product-recommendation-agent');
const { CDHInsightsAgent } = require('./cdh-insights-agent');
const { GenerativeMarketingAgent } = require('./generative-marketing-agent');
const { InteractiveServicingAgent } = require('./interactive-servicing-agent');
const { AgenticCoreReasoning } = require('./agentic-core-reasoning');
const { AgenticCoreLearning } = require('./agentic-core-learning');
const { VehicleDesignMCP } = require('../mcp/vehicle-design-mcp');
const { CustomerJourneyMCP } = require('../mcp/customer-journey-mcp');
const { MarketIntelligenceMCP } = require('../mcp/market-intelligence-mcp');

class SupervisorAgent {
  constructor() {
    this.agentCore = new AgentCore();
    this.intentStrand = new IntentStrandAgent();
    this.knowledgeStrand = new KnowledgeStrandAgent();
    this.responseStrand = new ResponseStrandAgent();
    this.personalizationAgent = new PersonalizationAgent();
    this.sentimentAgent = new SentimentAnalysisAgent();
    
    // New advanced agents
    this.cockpitAgent = new CockpitAssistantAgent();
    this.productRecommendationAgent = new ProductRecommendationAgent();
    this.cdhInsightsAgent = new CDHInsightsAgent();
    this.marketingAgent = new GenerativeMarketingAgent();
    this.servicingAgent = new InteractiveServicingAgent();
    
    // Agentic Core agents
    this.agenticReasoning = new AgenticCoreReasoning();
    this.agenticLearning = new AgenticCoreLearning();
    
    // MCP Servers
    this.vehicleDesignMCP = new VehicleDesignMCP();
    this.customerJourneyMCP = new CustomerJourneyMCP();
    this.marketIntelligenceMCP = new MarketIntelligenceMCP();
    
    this.sessions = new Map();
    this.orchestrationMetrics = {
      totalRequests: 0,
      averageResponseTime: 0,
      strandUtilization: {},
      advancedFeatures: {
        cockpitCommands: 0,
        recommendations: 0,
        insights: 0,
        campaigns: 0,
        serviceBookings: 0,
        agenticReasoning: 0,
        agenticLearning: 0,
        mcpVehicleDesign: 0,
        mcpCustomerJourney: 0,
        mcpMarketIntelligence: 0
      }
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
      console.log('AWS Strands not available, using local agents:', error.message);
      
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
    const { IntentAnalysisAgent } = require('./intent-analysis-agent');
    const { KnowledgeRetrievalAgent } = require('./knowledge-retrieval-agent');
    const { ResponseGenerationAgent } = require('./response-generation-agent');
    const { RoutingAgent } = require('./routing-agent');
    
    const intentAgent = new IntentAnalysisAgent();
    const knowledgeAgent = new KnowledgeRetrievalAgent();
    const responseAgent = new ResponseGenerationAgent();
    const routingAgent = new RoutingAgent();
    
    // Get last intent from history for context
    const lastIntent = session.lastIntent;
    
    // Analyze intent with context
    const intent = await intentAgent.analyze(message, lastIntent);
    
    console.log('Intent Analysis Result:', intent);
    
    // Analyze sentiment
    const sentiment = await this.sentimentAgent.analyze(message);
    
    console.log('Sentiment Analysis Result:', sentiment);
    
    // Route to appropriate department
    const routing = await routingAgent.route(intent, sentiment, session.customerData);
    
    console.log('Routing Result:', routing);
    
    // Retrieve knowledge
    const knowledge = await knowledgeAgent.retrieve(message, intent);
    
    console.log('Knowledge Retrieved:', knowledge.articles ? knowledge.articles.length : 0, 'articles');
    
    // Personalize
    const personalizedContext = await this.personalizationAgent.personalize(
      session.customerData,
      intent,
      knowledge
    );
    
    console.log('Personalization Context:', personalizedContext);
    
    // Generate response
    const response = await responseAgent.generate(
      message,
      intent,
      sentiment,
      knowledge,
      personalizedContext,
      session.history
    );
    
    console.log('Generated Response:', response.text.substring(0, 100));
    
    // Update session with current intent
    session.lastIntent = intent.category;
    
    const processingTime = Date.now() - startTime;
    
    return {
      type: 'chat_response',
      message: response.text,
      metadata: {
        intent: intent.category,
        sentiment: sentiment,
        processingTime,
        routing: routing,
        quickActions: response.quickActions,
        suggestions: response.suggestions,
        fallback: true,
        mode: 'local-agents'
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

  // Enhanced feature handlers
  async handleCockpitCommand(command, sessionId) {
    const session = this.sessions.get(sessionId);
    const vehicleContext = session?.customerData?.vehicle || {};
    const driverProfile = session?.customerData || {};

    this.orchestrationMetrics.advancedFeatures.cockpitCommands++;

    const result = await this.cockpitAgent.processCommand(command, vehicleContext, driverProfile);

    return {
      type: 'cockpit_response',
      ...result,
      metadata: {
        feature: 'intelligent_cockpit',
        processingTime: Date.now()
      }
    };
  }

  async handleProductRecommendation(context, sessionId) {
    const session = this.sessions.get(sessionId);
    const customerProfile = session?.customerData || {};

    this.orchestrationMetrics.advancedFeatures.recommendations++;

    const recommendations = await this.productRecommendationAgent.recommend(customerProfile, context);

    return {
      type: 'product_recommendations',
      ...recommendations,
      metadata: {
        feature: 'ai_recommendations',
        personalized: true
      }
    };
  }

  async handleCDHInsights(customerId) {
    this.orchestrationMetrics.advancedFeatures.insights++;

    const insights = await this.cdhInsightsAgent.generateInsights(customerId);
    const dashboard = await this.cdhInsightsAgent.generateDashboard(customerId);

    return {
      type: 'cdh_insights',
      insights,
      dashboard,
      metadata: {
        feature: 'cdh_insights',
        dataPoints: insights.insights.behavioral.engagementLevel
      }
    };
  }

  async handleMarketingCampaign(campaignType, targetAudience, objectives) {
    this.orchestrationMetrics.advancedFeatures.campaigns++;

    const campaign = await this.marketingAgent.generateCampaign(campaignType, targetAudience, objectives);

    return {
      type: 'marketing_campaign',
      campaign,
      metadata: {
        feature: 'generative_marketing',
        channels: campaign.channels.length,
        estimatedReach: targetAudience.size
      }
    };
  }

  async handleServiceBooking(customerId, vehicleInfo, sessionId) {
    this.orchestrationMetrics.advancedFeatures.serviceBookings++;

    const serviceSession = await this.servicingAgent.startInteractiveSession(customerId, vehicleInfo);

    // Store service session in main session
    const session = this.sessions.get(sessionId);
    if (session) {
      session.serviceSession = serviceSession.session;
    }

    return {
      type: 'service_booking',
      ...serviceSession,
      metadata: {
        feature: 'interactive_servicing',
        vehicleType: vehicleInfo.make
      }
    };
  }

  // Enhanced message processing with feature detection
  async processEnhancedMessage(message, sessionId, featureHint = null) {
    const startTime = Date.now();

    // Detect which enhanced feature to use
    const feature = featureHint || this.detectFeature(message);

    switch (feature) {
      case 'cockpit':
        return await this.handleCockpitCommand(message, sessionId);
      
      case 'recommendation':
        return await this.handleProductRecommendation({ intent: 'purchase', message }, sessionId);
      
      case 'insights':
        const session = this.sessions.get(sessionId);
        return await this.handleCDHInsights(session?.customerData?.id || sessionId);
      
      case 'service':
        const serviceSession = this.sessions.get(sessionId);
        return await this.handleServiceBooking(
          sessionId,
          serviceSession?.customerData?.vehicle || {},
          sessionId
        );
      
      default:
        // Fall back to standard message processing
        return await this.processMessage(message, sessionId);
    }
  }

  detectFeature(message) {
    const lower = message.toLowerCase();

    // Cockpit commands
    if (lower.match(/navigate|play music|temperature|climate|vehicle status/)) {
      return 'cockpit';
    }

    // Product recommendations
    if (lower.match(/recommend|suggest|looking for|interested in|buy|purchase/)) {
      return 'recommendation';
    }

    // Service booking
    if (lower.match(/service|appointment|schedule|book|maintenance|repair/)) {
      return 'service';
    }

    // Insights (admin/internal)
    if (lower.match(/insights|analytics|dashboard|metrics/)) {
      return 'insights';
    }

    return 'standard';
  }

  // Get enhanced metrics
  async getEnhancedMetrics() {
    const baseMetrics = await this.getOrchestrationStatus();

    return {
      ...baseMetrics,
      advancedFeatures: this.orchestrationMetrics.advancedFeatures,
      featureUtilization: {
        cockpit: `${this.orchestrationMetrics.advancedFeatures.cockpitCommands} commands`,
        recommendations: `${this.orchestrationMetrics.advancedFeatures.recommendations} generated`,
        insights: `${this.orchestrationMetrics.advancedFeatures.insights} reports`,
        campaigns: `${this.orchestrationMetrics.advancedFeatures.campaigns} created`,
        serviceBookings: `${this.orchestrationMetrics.advancedFeatures.serviceBookings} sessions`
      },
      totalFeatures: 12 // 7 original + 5 new
    };
  }
  // Agentic Core - Reasoning Engine
  async handleAgenticReasoning(query, context, sessionId) {
    this.orchestrationMetrics.advancedFeatures.agenticReasoning++;

    const result = await this.agenticReasoning.processWithReasoning(query, context, sessionId);

    return {
      type: 'agentic_reasoning',
      ...result,
      metadata: {
        ...result.metadata,
        feature: 'agentic_core_reasoning'
      }
    };
  }

  // Agentic Core - Learning Engine
  async handleAgenticLearning(interaction, outcome, sessionId) {
    this.orchestrationMetrics.advancedFeatures.agenticLearning++;

    const result = await this.agenticLearning.learnFromInteraction(interaction, outcome, sessionId);

    return {
      type: 'agentic_learning',
      ...result,
      metadata: {
        ...result.metadata,
        feature: 'agentic_core_learning'
      }
    };
  }

  // Get Agentic Core prediction
  async getAgenticPrediction(context, sessionId) {
    const result = await this.agenticLearning.predictOptimalResponse(context, sessionId);

    return {
      type: 'agentic_prediction',
      ...result,
      metadata: {
        ...result.metadata,
        feature: 'agentic_core_prediction'
      }
    };
  }

  // Get Agentic Core status
  async getAgenticCoreStatus() {
    return {
      reasoning: {
        active: true,
        decisionHistory: this.agenticReasoning.getDecisionHistory(),
        capabilities: this.agenticReasoning.capabilities
      },
      learning: {
        active: true,
        memoryStats: this.agenticLearning.getMemoryStats(),
        learningMetrics: this.agenticLearning.getLearningMetrics(),
        adaptiveStrategies: this.agenticLearning.getAdaptiveStrategies()
      }
    };
  }

  // MCP - Vehicle Design
  async handleVehicleDesignMCP(toolName, args) {
    this.orchestrationMetrics.advancedFeatures.mcpVehicleDesign++;
    
    const result = await this.vehicleDesignMCP.callTool(toolName, args);
    
    return {
      type: 'mcp_vehicle_design',
      tool: toolName,
      result: result,
      metadata: {
        feature: 'mcp_vehicle_design',
        protocol: 'model-context-protocol'
      }
    };
  }

  // MCP - Customer Journey
  async handleCustomerJourneyMCP(toolName, args) {
    this.orchestrationMetrics.advancedFeatures.mcpCustomerJourney++;
    
    const result = await this.customerJourneyMCP.callTool(toolName, args);
    
    return {
      type: 'mcp_customer_journey',
      tool: toolName,
      result: result,
      metadata: {
        feature: 'mcp_customer_journey',
        protocol: 'model-context-protocol'
      }
    };
  }

  // MCP - Market Intelligence
  async handleMarketIntelligenceMCP(toolName, args) {
    this.orchestrationMetrics.advancedFeatures.mcpMarketIntelligence++;
    
    const result = await this.marketIntelligenceMCP.callTool(toolName, args);
    
    return {
      type: 'mcp_market_intelligence',
      tool: toolName,
      result: result,
      metadata: {
        feature: 'mcp_market_intelligence',
        protocol: 'model-context-protocol'
      }
    };
  }

  // Get MCP Status
  async getMCPStatus() {
    return {
      vehicleDesign: this.vehicleDesignMCP.getServerInfo(),
      customerJourney: this.customerJourneyMCP.getServerInfo(),
      marketIntelligence: this.marketIntelligenceMCP.getServerInfo(),
      totalServers: 3,
      protocol: 'model-context-protocol',
      status: 'active'
    };
  }
}

module.exports = { SupervisorAgent };
