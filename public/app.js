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

console.log('🚀 Real-time demo features loaded!');
console.log('💡 Press Ctrl+D to start auto-demo mode');
console.log('💡 Click "Start Demo" button for automatic demonstration');
