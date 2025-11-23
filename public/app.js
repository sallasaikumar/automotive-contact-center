let ws;
let sessionId = generateSessionId();

function generateSessionId() {
  return 'session_' + Math.random().toString(36).substr(2, 9);
}

function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${window.location.host}`);
  
  ws.onopen = () => {
    updateStatus(true);
  };
  
  ws.onclose = () => {
    updateStatus(false);
    setTimeout(connectWebSocket, 3000);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    updateStatus(false);
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleResponse(data);
  };
}

function updateStatus(connected) {
  const indicator = document.getElementById('status');
  const text = document.getElementById('status-text');
  
  if (connected) {
    indicator.classList.remove('disconnected');
    text.textContent = 'Connected';
  } else {
    indicator.classList.add('disconnected');
    text.textContent = 'Disconnected';
  }
}

function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value.trim();
  
  if (!message || !ws || ws.readyState !== WebSocket.OPEN) return;
  
  addMessage(message, 'user');
  input.value = '';
  
  showTypingIndicator();
  
  ws.send(JSON.stringify({
    type: 'chat_message',
    message: message,
    sessionId: sessionId
  }));
}

function sendSuggestion(text) {
  document.getElementById('message-input').value = text;
  sendMessage();
}

function addMessage(text, sender) {
  const messagesContainer = document.getElementById('messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;
  
  // Avatar
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = sender === 'user' ? '👤' : '🤖';
  
  // Content
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  const senderLabel = document.createElement('strong');
  senderLabel.textContent = sender === 'user' ? 'You' : 'AI Assistant';
  
  const textP = document.createElement('p');
  textP.textContent = text;
  
  contentDiv.appendChild(senderLabel);
  contentDiv.appendChild(textP);
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(contentDiv);
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Highlight active agent
  highlightActiveAgent(sender === 'bot' ? 'response' : null);
}

function showTypingIndicator() {
  const messagesContainer = document.getElementById('messages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot-message';
  typingDiv.id = 'typing-indicator';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content typing-indicator';
  contentDiv.innerHTML = '<span></span><span></span><span></span>';
  
  typingDiv.appendChild(contentDiv);
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

function handleResponse(data) {
  removeTypingIndicator();
  
  if (data.type === 'chat_response') {
    addMessage(data.message, 'bot');
    
    if (data.metadata) {
      updateMetadata(data.metadata);
      updateSuggestions(data.metadata.suggestions);
      updateQuickActions(data.metadata.quickActions);
    }
  }
}

function updateMetadata(metadata) {
  // Update intent
  const intentValue = document.getElementById('intent-value');
  const intentConfidence = document.getElementById('intent-confidence');
  if (intentValue) {
    intentValue.textContent = metadata.intent.toUpperCase();
    intentConfidence.style.width = '85%';
  }
  
  // Update sentiment
  const sentimentValue = document.getElementById('sentiment-value');
  if (sentimentValue) {
    const sentiment = metadata.sentiment > 0 ? 'Positive 😊' : metadata.sentiment < 0 ? 'Negative 😟' : 'Neutral 😐';
    sentimentValue.textContent = sentiment;
  }
  
  // Update route
  const routeValue = document.getElementById('route-value');
  if (routeValue) {
    routeValue.textContent = metadata.route;
  }
  
  // Update processing time
  const processingTime = document.getElementById('processing-time');
  if (processingTime) {
    processingTime.textContent = `${metadata.processingTime}ms`;
  }
  
  // Update response time stat
  const responseTimeStat = document.getElementById('response-time');
  if (responseTimeStat) {
    responseTimeStat.textContent = `${metadata.processingTime}ms`;
  }
  
  // Add activity to timeline
  addActivityItem(metadata.intent, metadata.route);
  
  // Highlight active agents
  highlightActiveAgent('intent');
  setTimeout(() => highlightActiveAgent('sentiment'), 200);
  setTimeout(() => highlightActiveAgent('routing'), 400);
  setTimeout(() => highlightActiveAgent('knowledge'), 600);
  setTimeout(() => highlightActiveAgent('personalization'), 800);
  setTimeout(() => highlightActiveAgent('response'), 1000);
}

function highlightActiveAgent(agentType) {
  if (!agentType) return;
  
  // Remove previous highlights
  document.querySelectorAll('.agent-card').forEach(card => {
    card.classList.remove('active-agent');
  });
  
  // Add highlight to current agent
  const agentCard = document.querySelector(`[data-agent="${agentType}"]`);
  if (agentCard) {
    agentCard.classList.add('active-agent');
  }
}

function addActivityItem(intent, route) {
  const timeline = document.getElementById('activity-timeline');
  if (!timeline) return;
  
  const item = document.createElement('div');
  item.className = 'activity-item';
  item.innerHTML = `
    <div class="activity-dot"></div>
    <div>
      <strong>${intent}</strong> → ${route}
      <div style="font-size: 0.75rem; color: var(--gray); margin-top: 0.25rem;">
        ${new Date().toLocaleTimeString()}
      </div>
    </div>
  `;
  
  timeline.insertBefore(item, timeline.firstChild);
  
  // Keep only last 5 items
  while (timeline.children.length > 5) {
    timeline.removeChild(timeline.lastChild);
  }
}

function updateSuggestions(suggestions) {
  if (!suggestions || suggestions.length === 0) return;
  
  const suggestionsContainer = document.getElementById('suggestions');
  suggestionsContainer.innerHTML = '';
  
  suggestions.forEach(suggestion => {
    const btn = document.createElement('button');
    btn.className = 'suggestion-btn';
    btn.textContent = suggestion;
    btn.onclick = () => sendSuggestion(suggestion);
    suggestionsContainer.appendChild(btn);
  });
}

function updateQuickActions(actions) {
  if (!actions || actions.length === 0) return;
  
  const actionsContainer = document.getElementById('quick-actions');
  actionsContainer.innerHTML = '';
  
  actions.forEach(action => {
    const btn = document.createElement('button');
    btn.className = 'quick-action-btn';
    btn.textContent = action.label;
    btn.onclick = () => handleQuickAction(action.action);
    actionsContainer.appendChild(btn);
  });
}

function handleQuickAction(action) {
  console.log('Quick action:', action);
  addMessage(`I'd like to ${action.replace(/_/g, ' ')}`, 'user');
}

document.getElementById('message-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Toggle suggestions bar
function toggleSuggestions() {
  const suggestionsBar = document.getElementById('suggestions');
  const toggleIcon = document.getElementById('toggle-icon');
  const toggleText = document.getElementById('toggle-text');
  
  if (suggestionsBar.classList.contains('collapsed')) {
    suggestionsBar.classList.remove('collapsed');
    toggleIcon.textContent = '▼';
    toggleText.textContent = 'Hide';
  } else {
    suggestionsBar.classList.add('collapsed');
    toggleIcon.textContent = '▲';
    toggleText.textContent = 'Show';
  }
}

connectWebSocket();

// ========================================
// REAL-TIME DATA DEMO FEATURES
// ========================================

// Simulate real-time customer data updates
function startRealTimeDataDemo() {
  // Update stats periodically
  setInterval(updateLiveStats, 3000);
  
  // Simulate agent activity
  setInterval(simulateAgentActivity, 5000);
  
  // Update metrics
  setInterval(updateLiveMetrics, 2000);
}

let totalRequests = 0;
let avgResponseTime = 450;

function updateLiveStats() {
  totalRequests++;
  avgResponseTime = Math.floor(Math.random() * 200) + 300; // 300-500ms
  
  const responseTimeStat = document.getElementById('response-time');
  if (responseTimeStat) {
    responseTimeStat.textContent = `${avgResponseTime}ms`;
    responseTimeStat.style.animation = 'pulse 0.5s';
    setTimeout(() => {
      responseTimeStat.style.animation = '';
    }, 500);
  }
}

function simulateAgentActivity() {
  const agents = ['supervisor', 'intent', 'sentiment', 'routing', 'knowledge', 'personalization', 'response'];
  const randomAgent = agents[Math.floor(Math.random() * agents.length)];
  
  // Flash agent card
  const agentCard = document.querySelector(`[data-agent="${randomAgent}"]`);
  if (agentCard) {
    agentCard.style.animation = 'flash 0.5s';
    setTimeout(() => {
      agentCard.style.animation = '';
    }, 500);
  }
}

function updateLiveMetrics() {
  // Simulate confidence changes
  const intentConfidence = document.getElementById('intent-confidence');
  if (intentConfidence) {
    const confidence = Math.floor(Math.random() * 20) + 75; // 75-95%
    intentConfidence.style.width = `${confidence}%`;
  }
}

// Demo mode - Auto-send messages
let demoMode = false;
let demoMessages = [
  "I need to schedule an oil change",
  "My check engine light is on",
  "What SUVs do you have available?",
  "Is my transmission covered under warranty?",
  "What are your service hours?"
];
let demoIndex = 0;

function startDemoMode() {
  if (demoMode) return;
  demoMode = true;
  
  const demoInterval = setInterval(() => {
    if (demoIndex >= demoMessages.length) {
      demoIndex = 0;
      clearInterval(demoInterval);
      demoMode = false;
      return;
    }
    
    document.getElementById('message-input').value = demoMessages[demoIndex];
    sendMessage();
    demoIndex++;
  }, 8000); // Send message every 8 seconds
}

// Real-time customer data display
function showCustomerData() {
  const customers = [
    { name: 'John Smith', vehicle: 'Toyota Camry 2022', status: 'Active' },
    { name: 'Sarah Johnson', vehicle: 'Tesla Model 3 2023', status: 'Active' },
    { name: 'Michael Chen', vehicle: 'Ford F-150 2021', status: 'Active' }
  ];
  
  const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
  
  // Show notification
  showNotification(`📊 Customer Data: ${randomCustomer.name} - ${randomCustomer.vehicle}`);
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'live-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideInRight 0.5s, slideOutRight 0.5s 3s;
    font-weight: 600;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3500);
}

// Knowledge base query visualization
function showKnowledgeQuery(query) {
  const knowledgeCard = document.querySelector('[data-agent="knowledge"]');
  if (knowledgeCard) {
    const badge = document.createElement('div');
    badge.className = 'query-badge';
    badge.textContent = '🔍 Searching...';
    badge.style.cssText = `
      position: absolute;
      top: -10px;
      right: -10px;
      background: #f59e0b;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      animation: bounce 0.5s;
    `;
    
    knowledgeCard.style.position = 'relative';
    knowledgeCard.appendChild(badge);
    
    setTimeout(() => {
      badge.textContent = '✓ Found';
      badge.style.background = '#10b981';
    }, 1000);
    
    setTimeout(() => {
      badge.remove();
    }, 2000);
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes flash {
    0%, 100% { background: inherit; }
    50% { background: linear-gradient(135deg, #eff6ff, #dbeafe); }
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;
document.head.appendChild(style);

// Enhanced message sending with real-time visualization
const originalSendMessage = sendMessage;
sendMessage = function() {
  // Show knowledge query
  showKnowledgeQuery('Searching knowledge base...');
  
  // Show customer data
  setTimeout(() => showCustomerData(), 500);
  
  // Call original function
  originalSendMessage();
};

// Start real-time features
startRealTimeDataDemo();

// Keyboard shortcut for demo mode
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault();
    startDemoMode();
    showNotification('🎬 Demo Mode Started!');
  }
});

// Add demo button
const demoButton = document.createElement('button');
demoButton.textContent = '🎬 Start Demo';
demoButton.style.cssText = `
  position: fixed;
  bottom: 100px;
  right: 20px;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 1000;
  transition: all 0.3s;
`;
demoButton.onmouseover = () => {
  demoButton.style.transform = 'scale(1.05)';
};
demoButton.onmouseout = () => {
  demoButton.style.transform = 'scale(1)';
};
demoButton.onclick = () => {
  startDemoMode();
  showNotification('🎬 Auto-Demo Started! Watch the magic happen...');
};
document.body.appendChild(demoButton);

// Demo Helper Overlay
let demoHelperVisible = false;

function createDemoHelper() {
  const helper = document.createElement('div');
  helper.id = 'demo-helper';
  helper.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.95);
    color: white;
    padding: 2rem;
    border-radius: 16px;
    max-width: 600px;
    z-index: 10000;
    display: none;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  `;
  
  helper.innerHTML = `
    <h2 style="margin-bottom: 1rem; color: #3b82f6;">🎬 Demo Helper</h2>
    <div style="line-height: 1.8;">
      <p style="margin-bottom: 1rem;"><strong>Real-Time Data Points to Highlight:</strong></p>
      <ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
        <li>👤 Customer profile fetching</li>
        <li>🚗 Vehicle telemetry data</li>
        <li>📚 Knowledge base search</li>
        <li>😊 Sentiment analysis</li>
        <li>🎯 Intent classification</li>
        <li>🔀 Department routing</li>
        <li>⚡ Sub-500ms processing</li>
      </ul>
      <p style="margin-bottom: 1rem;"><strong>Demo Messages:</strong></p>
      <ol style="margin-left: 1.5rem; margin-bottom: 1rem;">
        <li>"My check engine light is on" - Technical</li>
        <li>"I want to buy a new SUV" - Sales</li>
        <li>"Is my transmission covered?" - Warranty</li>
      </ol>
      <p style="margin-bottom: 1rem;"><strong>Keyboard Shortcuts:</strong></p>
      <ul style="margin-left: 1.5rem;">
        <li><code style="background: #374151; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+D</code> - Start auto-demo</li>
        <li><code style="background: #374151; padding: 0.25rem 0.5rem; border-radius: 4px;">Ctrl+H</code> - Toggle this helper</li>
      </ul>
    </div>
    <button onclick="toggleDemoHelper()" style="
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    ">Close</button>
  `;
  
  document.body.appendChild(helper);
}

function toggleDemoHelper() {
  const helper = document.getElementById('demo-helper');
  if (!helper) {
    createDemoHelper();
    return;
  }
  
  demoHelperVisible = !demoHelperVisible;
  helper.style.display = demoHelperVisible ? 'block' : 'none';
}

// Keyboard shortcut for demo helper
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'h') {
    e.preventDefault();
    toggleDemoHelper();
  }
});

// Create demo helper on load
createDemoHelper();

// Add helper button
const helperButton = document.createElement('button');
helperButton.textContent = '❓ Demo Help';
helperButton.style.cssText = `
  position: fixed;
  bottom: 170px;
  right: 20px;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 1000;
  transition: all 0.3s;
`;
helperButton.onmouseover = () => {
  helperButton.style.transform = 'scale(1.05)';
};
helperButton.onmouseout = () => {
  helperButton.style.transform = 'scale(1)';
};
helperButton.onclick = toggleDemoHelper;
document.body.appendChild(helperButton);

console.log('🚀 Real-time demo features loaded!');
console.log('💡 Press Ctrl+D to start auto-demo mode');
console.log('💡 Press Ctrl+H to show demo helper');
console.log('💡 Click "Start Demo" button for automatic demonstration');


// ============================================
// ENHANCED FEATURES - REAL-TIME DATA FETCHING
// ============================================

let metricsInterval;
let activityLog = [];

// Start real-time metrics updates
function startRealTimeMetrics() {
  // Update metrics every 2 seconds
  metricsInterval = setInterval(async () => {
    try {
      const response = await fetch('/api/metrics/enhanced');
      const metrics = await response.json();
      updateMetricsDisplay(metrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  }, 2000);
}

function updateMetricsDisplay(metrics) {
  // Update agent count
  const agentCount = document.getElementById('agent-count');
  if (agentCount) {
    agentCount.textContent = metrics.totalFeatures || 12;
    animateNumber(agentCount);
  }

  // Update total requests
  const totalRequests = document.getElementById('total-requests');
  if (totalRequests && metrics.orchestrationMetrics) {
    totalRequests.textContent = metrics.orchestrationMetrics.totalRequests || 0;
    animateNumber(totalRequests);
  }

  // Update response time
  const responseTime = document.getElementById('response-time');
  if (responseTime && metrics.orchestrationMetrics) {
    const avgTime = Math.round(metrics.orchestrationMetrics.averageResponseTime || 0);
    responseTime.textContent = avgTime > 0 ? `${avgTime}ms` : '< 500ms';
  }

  // Update enhanced agent status
  if (metrics.advancedFeatures) {
    updateEnhancedAgentStatus('cockpit', metrics.advancedFeatures.cockpitCommands);
    updateEnhancedAgentStatus('recommendation', metrics.advancedFeatures.recommendations);
    updateEnhancedAgentStatus('insights', metrics.advancedFeatures.insights);
    updateEnhancedAgentStatus('marketing', metrics.advancedFeatures.campaigns);
    updateEnhancedAgentStatus('servicing', metrics.advancedFeatures.serviceBookings);
  }
}

function updateEnhancedAgentStatus(agentName, count) {
  const agentCard = document.querySelector(`.agent-card[data-agent="${agentName}"]`);
  if (agentCard) {
    const statusDot = agentCard.querySelector('.agent-status');
    if (count > 0) {
      statusDot.classList.remove('standby');
      statusDot.classList.add('active');
    }
  }
}

function animateNumber(element) {
  element.style.transform = 'scale(1.1)';
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, 200);
}

// ============================================
// COCKPIT ASSISTANT FEATURE
// ============================================

async function testCockpitFeature() {
  showFeatureLoading('cockpit');
  addActivityLog('🎙️ Cockpit Assistant', 'Processing voice command...');
  
  try {
    const response = await fetch('/api/cockpit/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command: 'Navigate to downtown',
        sessionId: sessionId
      })
    });
    
    const data = await response.json();
    displayCockpitResponse(data);
    addActivityLog('🎙️ Cockpit Assistant', 'Command executed successfully');
  } catch (error) {
    console.error('Cockpit error:', error);
    addActivityLog('🎙️ Cockpit Assistant', 'Error: ' + error.message);
  }
}

function displayCockpitResponse(data) {
  const messagesContainer = document.getElementById('messages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message assistant-message feature-message';
  messageDiv.innerHTML = `
    <div class="message-avatar">🎙️</div>
    <div class="message-content">
      <div class="feature-badge">Cockpit Assistant</div>
      <div class="message-text">${data.response}</div>
      ${data.data ? `
        <div class="feature-data">
          <div class="data-item">
            <span class="data-label">Destination:</span>
            <span class="data-value">${data.data.destination}</span>
          </div>
          <div class="data-item">
            <span class="data-label">ETA:</span>
            <span class="data-value">${data.data.eta}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Distance:</span>
            <span class="data-value">${data.data.distance}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Traffic:</span>
            <span class="data-value traffic-${data.data.traffic}">${data.data.traffic}</span>
          </div>
        </div>
      ` : ''}
      <div class="message-time">${new Date().toLocaleTimeString()}</div>
    </div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Animate agent card
  animateAgentCard('cockpit');
}

// ============================================
// PRODUCT RECOMMENDATIONS FEATURE
// ============================================

async function testRecommendations() {
  showFeatureLoading('recommendation');
  addActivityLog('🎯 Recommendations', 'Analyzing preferences...');
  
  try {
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: {
          intent: 'purchase',
          budget: 40000,
          familySize: 4,
          lifestyle: 'family'
        },
        sessionId: sessionId
      })
    });
    
    const data = await response.json();
    displayRecommendations(data);
    addActivityLog('🎯 Recommendations', `Found ${data.recommendations.vehicles.length} matches`);
  } catch (error) {
    console.error('Recommendations error:', error);
    addActivityLog('🎯 Recommendations', 'Error: ' + error.message);
  }
}

function displayRecommendations(data) {
  const messagesContainer = document.getElementById('messages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message assistant-message feature-message';
  
  let vehiclesHTML = '';
  if (data.recommendations.vehicles && data.recommendations.vehicles.length > 0) {
    vehiclesHTML = data.recommendations.vehicles.map(vehicle => `
      <div class="recommendation-card">
        <div class="rec-header">
          <span class="rec-name">${vehicle.name}</span>
          <span class="rec-match">${vehicle.matchPercentage}% Match</span>
        </div>
        <div class="rec-price">$${vehicle.price.toLocaleString()}</div>
        <div class="rec-reason">${vehicle.reason}</div>
        <div class="rec-features">
          ${vehicle.features.slice(0, 3).map(f => `<span class="feature-tag">${f}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }
  
  messageDiv.innerHTML = `
    <div class="message-avatar">🎯</div>
    <div class="message-content">
      <div class="feature-badge">AI Recommendations</div>
      <div class="message-text">Based on your preferences, here are my top recommendations:</div>
      <div class="recommendations-grid">
        ${vehiclesHTML}
      </div>
      <div class="confidence-bar">
        <span>Confidence: ${Math.round((data.confidence || 0.85) * 100)}%</span>
        <div class="bar"><div class="fill" style="width: ${(data.confidence || 0.85) * 100}%"></div></div>
      </div>
      <div class="message-time">${new Date().toLocaleTimeString()}</div>
    </div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  animateAgentCard('recommendation');
}

// ============================================
// CDH INSIGHTS FEATURE
// ============================================

async function testInsights() {
  showFeatureLoading('insights');
  addActivityLog('📊 CDH Insights', 'Generating analytics...');
  
  try {
    const response = await fetch('/api/insights/customer123');
    const data = await response.json();
    displayInsights(data);
    addActivityLog('📊 CDH Insights', 'Insights generated successfully');
  } catch (error) {
    console.error('Insights error:', error);
    addActivityLog('📊 CDH Insights', 'Error: ' + error.message);
  }
}

function displayInsights(data) {
  const messagesContainer = document.getElementById('messages');
  
  const insights = data.insights.insights;
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message assistant-message feature-message';
  
  messageDiv.innerHTML = `
    <div class="message-avatar">📊</div>
    <div class="message-content">
      <div class="feature-badge">CDH Insights</div>
      <div class="message-text">Customer Data Hub Analysis Complete</div>
      
      <div class="insights-grid">
        <div class="insight-card">
          <div class="insight-icon">📈</div>
          <div class="insight-label">Engagement Level</div>
          <div class="insight-value">${Math.round(insights.behavioral.engagementLevel * 100)}%</div>
          <div class="insight-bar">
            <div class="fill" style="width: ${insights.behavioral.engagementLevel * 100}%"></div>
          </div>
        </div>
        
        <div class="insight-card">
          <div class="insight-icon">💎</div>
          <div class="insight-label">Lifetime Value</div>
          <div class="insight-value">$${insights.lifetime.projected.toLocaleString()}</div>
          <div class="insight-sub">Projected</div>
        </div>
        
        <div class="insight-card">
          <div class="insight-icon">🎯</div>
          <div class="insight-label">Loyalty Status</div>
          <div class="insight-value">${insights.behavioral.loyaltyIndicator}</div>
          <div class="insight-sub">High Value Customer</div>
        </div>
        
        <div class="insight-card">
          <div class="insight-icon">⭐</div>
          <div class="insight-label">Satisfaction</div>
          <div class="insight-value">${insights.behavioral.satisfactionScore}/5</div>
          <div class="insight-sub">Rating</div>
        </div>
      </div>
      
      ${insights.recommendations && insights.recommendations.length > 0 ? `
        <div class="recommendations-section">
          <h4>💡 Recommended Actions:</h4>
          ${insights.recommendations.slice(0, 2).map(rec => `
            <div class="action-item priority-${rec.priority}">
              <span class="priority-badge">${rec.priority}</span>
              <span class="action-text">${rec.insight}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="message-time">${new Date().toLocaleTimeString()}</div>
    </div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  animateAgentCard('insights');
}

// ============================================
// SERVICE BOOKING FEATURE
// ============================================

async function testServiceBooking() {
  showFeatureLoading('servicing');
  addActivityLog('🔧 Service Booking', 'Checking vehicle status...');
  
  try {
    const response = await fetch('/api/service/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: sessionId,
        vehicleInfo: {
          make: 'Toyota',
          model: 'Camry',
          year: 2022,
          mileage: 15000,
          lastService: '2024-10-15'
        },
        sessionId: sessionId
      })
    });
    
    const data = await response.json();
    displayServiceBooking(data);
    addActivityLog('🔧 Service Booking', 'Service options ready');
  } catch (error) {
    console.error('Service booking error:', error);
    addActivityLog('🔧 Service Booking', 'Error: ' + error.message);
  }
}

function displayServiceBooking(data) {
  const messagesContainer = document.getElementById('messages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message assistant-message feature-message';
  
  messageDiv.innerHTML = `
    <div class="message-avatar">🔧</div>
    <div class="message-content">
      <div class="feature-badge">Interactive Servicing</div>
      <div class="message-text">${data.message}</div>
      
      ${data.options && data.options.recommendations && data.options.recommendations.length > 0 ? `
        <div class="service-recommendations">
          <h4>🔍 Recommended Services:</h4>
          ${data.options.recommendations.map(rec => `
            <div class="service-card priority-${rec.priority}">
              <div class="service-header">
                <span class="service-name">${rec.name}</span>
                <span class="service-price">$${rec.price}</span>
              </div>
              <div class="service-reason">${rec.reason}</div>
              <div class="service-meta">
                <span>⏱️ ${rec.duration} min</span>
                <span class="priority-badge">${rec.priority} priority</span>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${data.options && data.options.quickActions ? `
        <div class="quick-actions-grid">
          ${data.options.quickActions.map(action => `
            <button class="action-button">
              <span>${action.icon}</span>
              <span>${action.label}</span>
            </button>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="message-time">${new Date().toLocaleTimeString()}</div>
    </div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  animateAgentCard('servicing');
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function showFeatureLoading(featureName) {
  const agentCard = document.querySelector(`.agent-card[data-agent="${featureName}"]`);
  if (agentCard) {
    const statusDot = agentCard.querySelector('.agent-status');
    statusDot.classList.remove('standby');
    statusDot.classList.add('processing');
    
    setTimeout(() => {
      statusDot.classList.remove('processing');
      statusDot.classList.add('active');
    }, 1000);
  }
}

function animateAgentCard(agentName) {
  const agentCard = document.querySelector(`.agent-card[data-agent="${agentName}"]`);
  if (agentCard) {
    agentCard.style.transform = 'scale(1.05)';
    agentCard.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.3)';
    
    setTimeout(() => {
      agentCard.style.transform = 'scale(1)';
      agentCard.style.boxShadow = '';
    }, 500);
  }
}

function addActivityLog(agent, message) {
  const timeline = document.getElementById('activity-timeline');
  if (!timeline) return;
  
  const activity = document.createElement('div');
  activity.className = 'activity-item fade-in';
  activity.innerHTML = `
    <div class="activity-time">${new Date().toLocaleTimeString()}</div>
    <div class="activity-agent">${agent}</div>
    <div class="activity-message">${message}</div>
  `;
  
  timeline.insertBefore(activity, timeline.firstChild);
  
  // Keep only last 10 activities
  while (timeline.children.length > 10) {
    timeline.removeChild(timeline.lastChild);
  }
}

// ============================================
// AUTO-DEMO MODE
// ============================================

let demoMode = false;
let demoInterval;

function startAutoDemo() {
  if (demoMode) return;
  
  demoMode = true;
  const features = [
    { name: 'Cockpit', func: testCockpitFeature },
    { name: 'Recommendations', func: testRecommendations },
    { name: 'Insights', func: testInsights },
    { name: 'Service', func: testServiceBooking }
  ];
  
  let index = 0;
  
  demoInterval = setInterval(() => {
    const feature = features[index];
    console.log(`Auto-demo: Testing ${feature.name}...`);
    feature.func();
    
    index = (index + 1) % features.length;
  }, 8000); // Run each feature every 8 seconds
  
  console.log('🎬 Auto-demo mode started! Features will cycle automatically.');
}

function stopAutoDemo() {
  if (demoInterval) {
    clearInterval(demoInterval);
    demoMode = false;
    console.log('🛑 Auto-demo mode stopped.');
  }
}

// Add keyboard shortcut for demo mode
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault();
    if (demoMode) {
      stopAutoDemo();
    } else {
      startAutoDemo();
    }
  }
});

// ============================================
// INITIALIZATION
// ============================================

// Start real-time metrics when page loads
document.addEventListener('DOMContentLoaded', () => {
  startRealTimeMetrics();
  
  // Add demo mode button
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    const demoButton = document.createElement('button');
    demoButton.className = 'demo-mode-btn';
    demoButton.innerHTML = '🎬 Start Auto-Demo';
    demoButton.onclick = () => {
      if (demoMode) {
        stopAutoDemo();
        demoButton.innerHTML = '🎬 Start Auto-Demo';
      } else {
        startAutoDemo();
        demoButton.innerHTML = '🛑 Stop Auto-Demo';
      }
    };
    heroContent.appendChild(demoButton);
  }
  
  console.log('✨ Enhanced features loaded!');
  console.log('💡 Press Ctrl+D to toggle auto-demo mode');
  console.log('🎯 Click feature chips to test individual features');
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (metricsInterval) clearInterval(metricsInterval);
  if (demoInterval) clearInterval(demoInterval);
});


// ============================================
// CUSTOMER SELECTION FEATURE
// ============================================

let currentCustomerId = 'CUST001'; // Default customer

function selectCustomer(customerId) {
  currentCustomerId = customerId;
  sessionId = customerId; // Use customer ID as session ID for personalization
  
  // Update UI
  document.querySelectorAll('.customer-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  
  const selectedChip = document.querySelector(`[data-customer="${customerId}"]`);
  if (selectedChip) {
    selectedChip.classList.add('active');
  }
  
  // Show notification
  const customerNames = {
    'CUST001': 'John Smith (Toyota Camry 2022)',
    'CUST002': 'Sarah Johnson (Tesla Model 3 2023)',
    'CUST003': 'Michael Chen (Ford F-150 2021)'
  };
  
  showNotification(`👤 Switched to: ${customerNames[customerId]}`);
  
  // Clear chat history
  const messagesContainer = document.getElementById('messages');
  messagesContainer.innerHTML = `
    <div class="welcome-card">
      <div class="welcome-icon">👋</div>
      <h2>Welcome ${customerNames[customerId].split('(')[0]}</h2>
      <p>I'm your AI assistant. I have access to your vehicle information and service history. How can I help you today?</p>
      <div class="capabilities-grid">
        <div class="capability-item">
          <span class="capability-icon">🔧</span>
          <span>Service Scheduling</span>
        </div>
        <div class="capability-item">
          <span class="capability-icon">🚗</span>
          <span>Vehicle Sales</span>
        </div>
        <div class="capability-item">
          <span class="capability-icon">📋</span>
          <span>Warranty Info</span>
        </div>
        <div class="capability-item">
          <span class="capability-icon">⚡</span>
          <span>Technical Support</span>
        </div>
      </div>
    </div>
  `;
}

// Helper functions for enhanced features
function showFeatureLoading(featureName) {
  const agentCard = document.querySelector(`[data-agent="${featureName}"]`);
  if (agentCard) {
    const statusDot = agentCard.querySelector('.agent-status');
    statusDot.classList.remove('standby');
    statusDot.classList.add('processing');
  }
}

function animateAgentCard(agentName) {
  const agentCard = document.querySelector(`[data-agent="${agentName}"]`);
  if (agentCard) {
    agentCard.style.animation = 'flash 0.5s';
    setTimeout(() => {
      agentCard.style.animation = '';
      const statusDot = agentCard.querySelector('.agent-status');
      statusDot.classList.remove('processing');
      statusDot.classList.add('active');
    }, 500);
  }
}

function addActivityLog(agent, message) {
  activityLog.push({
    agent,
    message,
    timestamp: new Date()
  });
  
  // Keep only last 10 items
  if (activityLog.length > 10) {
    activityLog.shift();
  }
  
  updateActivityTimeline();
}

function updateActivityTimeline() {
  const timeline = document.getElementById('activity-timeline');
  if (!timeline) return;
  
  timeline.innerHTML = activityLog.slice().reverse().map(item => `
    <div class="activity-item">
      <div class="activity-time">${item.timestamp.toLocaleTimeString()}</div>
      <div class="activity-agent">${item.agent}</div>
      <div class="activity-message">${item.message}</div>
    </div>
  `).join('');
}

// Start real-time metrics on load
startRealTimeMetrics();

console.log('✅ Enhanced features loaded successfully!');
console.log('👤 Customer selector ready');
console.log('🎯 All 12 agents active');


// ============================================
// AGENTIC CORE - REASONING ENGINE
// ============================================

async function testAgenticReasoning() {
  showFeatureLoading('reasoning');
  addActivityLog('🧠 Reasoning Engine', 'Processing complex query...');
  
  const query = "My check engine light is on, should I continue driving or stop immediately?";
  const context = {
    urgency: 'high',
    complexity: 'medium',
    customerProfile: {
      vehicle: 'Toyota Camry 2022',
      mileage: 15420
    }
  };
  
  // Simulate agentic reasoning
  setTimeout(() => {
    displayAgenticReasoning({
      goal: {
        type: 'decision_making',
        priority: 'high',
        description: 'Determine safe course of action for check engine light'
      },
      reasoning: {
        chain: [
          { step: 1, type: 'context_analysis', description: 'Analyzing vehicle status and symptoms' },
          { step: 2, type: 'problem_decomposition', description: 'Breaking down potential causes' },
          { step: 3, type: 'knowledge_retrieval', description: 'Retrieving diagnostic information' },
          { step: 4, type: 'hypothesis_generation', description: 'Generating possible scenarios' },
          { step: 5, type: 'evaluation', description: 'Evaluating risk levels' },
          { step: 6, type: 'synthesis', description: 'Formulating recommendation' }
        ],
        steps: [
          {
            step: 1,
            type: 'context_analysis',
            result: { findings: ['No unusual sounds', 'Engine running normally', 'Recent service 45 days ago'] },
            confidence: 0.92
          },
          {
            step: 2,
            type: 'problem_decomposition',
            result: { subProblems: ['Identify urgency', 'Assess safety', 'Determine next steps'] },
            confidence: 0.88
          },
          {
            step: 3,
            type: 'knowledge_retrieval',
            result: { articles: 3, bestPractices: ['Check for flashing light', 'Monitor performance'] },
            confidence: 0.95
          },
          {
            step: 4,
            type: 'hypothesis_generation',
            result: { hypotheses: ['Sensor issue (70%)', 'Emissions problem (20%)', 'Serious issue (10%)'] },
            confidence: 0.85
          },
          {
            step: 5,
            type: 'evaluation',
            result: { topSolution: 'Safe to drive with caution', confidence: 0.87 },
            confidence: 0.87
          },
          {
            step: 6,
            type: 'synthesis',
            result: { recommendation: 'Drive to service center within 24 hours', reasoning: 'Light is steady, no performance issues' },
            confidence: 0.90
          }
        ],
        confidence: 0.89
      },
      decision: {
        decision: 'Safe to drive to service center - schedule diagnostic within 24 hours',
        rationale: 'Based on steady (not flashing) light and normal engine performance',
        confidence: 0.89,
        alternatives: [
          { option: 'Stop immediately and call tow truck', score: 0.30 },
          { option: 'Continue normal driving', score: 0.45 }
        ],
        risks: [
          { risk: 'Potential engine damage if ignored', severity: 'medium', mitigation: 'Schedule diagnostic ASAP' }
        ],
        benefits: ['Accurate diagnosis', 'Prevent major damage', 'Cost-effective solution']
      },
      validation: {
        validated: true,
        confidence: 0.89,
        status: 'high_confidence'
      },
      actionPlan: {
        immediateActions: [
          { action: 'Schedule diagnostic appointment', priority: 'high', timeframe: 'within 24 hours' },
          { action: 'Monitor engine performance', priority: 'high', timeframe: 'continuously' }
        ],
        followUpActions: [
          { action: 'Review diagnostic results', priority: 'high', timeframe: 'after diagnosis' }
        ]
      }
    });
    addActivityLog('🧠 Reasoning Engine', 'Complex reasoning completed');
  }, 1500);
}

function displayAgenticReasoning(data) {
  const messagesContainer = document.getElementById('messages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message assistant-message agentic-message';
  
  // Build reasoning chain HTML
  let reasoningChainHTML = data.reasoning.steps.map((step, index) => `
    <div class="reasoning-step ${index === data.reasoning.steps.length - 1 ? 'active' : ''}">
      <div class="step-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="step-number">${step.step}</span>
          <span class="step-type">${step.type.replace(/_/g, ' ')}</span>
        </div>
        <span class="step-confidence">${(step.confidence * 100).toFixed(0)}% confidence</span>
      </div>
      <div class="step-description">${JSON.stringify(step.result).substring(0, 100)}...</div>
    </div>
  `).join('');
  
  messageDiv.innerHTML = `
    <div class="message-avatar">🧠</div>
    <div class="message-content">
      <div class="agentic-badge">Agentic Core - Reasoning Engine</div>
      <div class="message-text">
        <strong>Goal:</strong> ${data.goal.description}<br>
        <strong>Priority:</strong> ${data.goal.priority.toUpperCase()}
      </div>
      
      <div class="reasoning-chain">
        <h4 style="margin: 0 0 12px 0; font-size: 14px; color: #8b008b;">
          🔗 Reasoning Chain (${data.reasoning.steps.length} steps)
        </h4>
        ${reasoningChainHTML}
      </div>
      
      <div class="decision-tree">
        <h4 style="margin: 0 0 12px 0; font-size: 14px; color: #8b008b;">
          ✅ Decision & Recommendation
        </h4>
        <div class="decision-node">
          <div class="decision-label">Recommendation</div>
          <div class="decision-value">${data.decision.decision}</div>
        </div>
        <div class="decision-node">
          <div class="decision-label">Rationale</div>
          <div class="decision-value">${data.decision.rationale}</div>
        </div>
        <div class="decision-node">
          <div class="decision-label">Confidence</div>
          <div class="decision-value">${(data.decision.confidence * 100).toFixed(1)}%</div>
        </div>
      </div>
      
      <div class="quick-actions-grid" style="margin-top: 15px;">
        ${data.actionPlan.immediateActions.map(action => `
          <button class="action-button">
            <span>⚡</span>
            <span>${action.action}</span>
          </button>
        `).join('')}
      </div>
      
      <div class="message-time">${new Date().toLocaleTimeString()}</div>
    </div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  animateAgentCard('reasoning');
}

// ============================================
// AGENTIC CORE - LEARNING SYSTEM
// ============================================

async function testAgenticLearning() {
  showFeatureLoading('learning');
  addActivityLog('📚 Learning System', 'Analyzing patterns and learning...');
  
  // Simulate agentic learning
  setTimeout(() => {
    displayAgenticLearning({
      patterns: [
        { type: 'intent_response', pattern: 'service → success', confidence: 0.92, frequency: 45 },
        { type: 'sentiment_outcome', pattern: 'urgent → high_satisfaction', confidence: 0.88, frequency: 32 },
        { type: 'context_pattern', pattern: 'warranty_active → positive_outcome', confidence: 0.85, frequency: 28 }
      ],
      knowledgeUpdate: {
        updatesApplied: 3,
        memorySize: {
          semantic: 156,
          longTerm: 89
        }
      },
      strategyAdaptation: {
        adaptations: 3,
        strategies: [
          { strategy: 'intent_response', action: 'reinforced', newWeight: 1.21 },
          { strategy: 'sentiment_outcome', action: 'reinforced', newWeight: 1.15 },
          { strategy: 'context_pattern', action: 'adjusted', newWeight: 1.08 }
        ]
      },
      consolidation: {
        consolidated: 5,
        patterns: [
          { pattern: 'service_success', frequency: 12 },
          { pattern: 'urgent_resolved', frequency: 8 }
        ]
      },
      metaLearning: {
        improvementRate: '+12.5%',
        trend: 'improving',
        bestStrategies: [
          { type: 'intent_response', weight: 1.21, uses: 45 },
          { type: 'sentiment_outcome', weight: 1.15, uses: 32 }
        ],
        learningEfficiency: '87.3%'
      },
      metrics: {
        totalInteractions: 234,
        patternsLearned: 156,
        adaptations: 89,
        successRate: 0.92,
        improvementRate: 12.5
      }
    });
    addActivityLog('📚 Learning System', 'Learning cycle completed');
  }, 1500);
}

function displayAgenticLearning(data) {
  const messagesContainer = document.getElementById('messages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message assistant-message agentic-message';
  
  messageDiv.innerHTML = `
    <div class="message-avatar">📚</div>
    <div class="message-content">
      <div class="agentic-badge">Agentic Core - Learning System</div>
      <div class="message-text">
        Continuous learning from ${data.metrics.totalInteractions} interactions with ${(data.metrics.successRate * 100).toFixed(1)}% success rate
      </div>
      
      <div class="learning-metrics">
        <div class="metric-box">
          <div class="metric-label">Patterns Learned</div>
          <div class="metric-value">${data.metrics.patternsLearned}</div>
          <div class="metric-trend">↑ Growing</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Adaptations</div>
          <div class="metric-value">${data.metrics.adaptations}</div>
          <div class="metric-trend">↑ Active</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Success Rate</div>
          <div class="metric-value">${(data.metrics.successRate * 100).toFixed(0)}%</div>
          <div class="metric-trend">↑ High</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Improvement</div>
          <div class="metric-value">${data.metaLearning.improvementRate}</div>
          <div class="metric-trend">↑ ${data.metaLearning.trend}</div>
        </div>
      </div>
      
      <div class="pattern-list">
        <h4 style="margin: 15px 0 10px 0; font-size: 14px; color: #8b008b;">
          🔍 Recognized Patterns
        </h4>
        ${data.patterns.map(pattern => `
          <div class="pattern-item">
            <span class="pattern-text">${pattern.pattern}</span>
            <span class="pattern-confidence">${(pattern.confidence * 100).toFixed(0)}%</span>
          </div>
        `).join('')}
      </div>
      
      <div class="memory-stats">
        <div class="memory-stat">
          <div class="memory-stat-label">Semantic</div>
          <div class="memory-stat-value">${data.knowledgeUpdate.memorySize.semantic}</div>
        </div>
        <div class="memory-stat">
          <div class="memory-stat-label">Long-Term</div>
          <div class="memory-stat-value">${data.knowledgeUpdate.memorySize.longTerm}</div>
        </div>
        <div class="memory-stat">
          <div class="memory-stat-label">Efficiency</div>
          <div class="memory-stat-value">${data.metaLearning.learningEfficiency}</div>
        </div>
      </div>
      
      <div class="message-time">${new Date().toLocaleTimeString()}</div>
    </div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  animateAgentCard('learning');
}

console.log('✅ Agentic Core features loaded successfully!');
console.log('🧠 Reasoning Engine ready');
console.log('📚 Learning System ready');
