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

connectWebSocket();
