const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { SupervisorAgent } = require('./agents/supervisor-agent');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));
app.use(express.json());

const supervisorAgent = new SupervisorAgent();

// Health check endpoint for AWS deployment
app.get('/health', async (req, res) => {
  try {
    const status = await supervisorAgent.getOrchestrationStatus();
    res.json({ 
      status: 'healthy', 
      timestamp: new Date(),
      architecture: 'AWS Strands Multi-Agent Orchestration',
      orchestration: status
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date()
    });
  }
});

// API endpoint for testing
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const response = await supervisorAgent.processMessage(message, sessionId || 'api-session');
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

wss.on('connection', (ws) => {
  console.log('Client connected to AWS Strands Multi-Agent System');
  
  // Send welcome message with architecture info
  ws.send(JSON.stringify({
    type: 'system_info',
    message: 'Connected to AWS Strands Multi-Agent Orchestration System',
    architecture: {
      agentCore: 'AWS Bedrock Agents',
      orchestration: 'AWS Strands',
      foundation: 'SageMaker Unified Studio'
    }
  }));
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'chat_message') {
        const response = await supervisorAgent.processMessage(data.message, data.sessionId);
        ws.send(JSON.stringify(response));
      } else if (data.type === 'health_check') {
        const status = await supervisorAgent.getOrchestrationStatus();
        ws.send(JSON.stringify({
          type: 'health_status',
          status: status
        }));
      }
    } catch (error) {
      console.error('AWS Strands Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'AWS Strands system temporarily unavailable',
        fallback: true
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from AWS Strands system');
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AWS Strands Multi-Agent System running on port ${PORT}`);
  console.log(`🏗️  Architecture: Agent Core + Supervisor + Strand Agents`);
  console.log(`🤖 Foundation: SageMaker Unified Studio`);
  console.log(`🔗 Orchestration: AWS Strands`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Access URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});
