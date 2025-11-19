class IntentAnalysisAgent {
  constructor() {
    this.intentPatterns = {
      service: {
        keywords: ['service', 'maintenance', 'repair', 'appointment', 'schedule', 'oil change', 'check engine', 
                   'tire', 'brake', 'inspection', 'tune', 'fluid', 'filter', 'rotation', 'alignment',
                   'next service', 'service due', 'book', 'available', 'slot', 'time', 'when can'],
        weight: 1.0
      },
      sales: {
        keywords: ['buy', 'purchase', 'price', 'cost', 'new car', 'vehicle', 'model', 'test drive',
                   'inventory', 'stock', 'available models', 'suv', 'sedan', 'truck', 'electric',
                   'interested in', 'looking for', 'want to buy', 'trade', 'lease', 'finance'],
        weight: 1.0
      },
      warranty: {
        keywords: ['warranty', 'coverage', 'claim', 'guarantee', 'covered', 'under warranty',
                   'warranty status', 'extended warranty', 'protection plan', 'roadside'],
        weight: 1.2
      },
      technical: {
        keywords: ['problem', 'issue', 'error', 'not working', 'malfunction', 'diagnostic',
                   'broken', 'noise', 'strange', 'weird', 'light on', 'warning', 'alert',
                   'urgent', 'emergency', 'won\'t start', 'stalling', 'overheating'],
        weight: 1.1
      },
      general: {
        keywords: ['help', 'information', 'question', 'hours', 'location', 'contact',
                   'address', 'phone', 'email', 'where', 'when open', 'closed', 'directions'],
        weight: 0.8
      }
    };
  }

  async analyze(message, lastIntent = null) {
    const lowerMessage = message.toLowerCase();
    const words = lowerMessage.split(/\s+/);
    
    let scores = {};
    
    for (const [intent, config] of Object.entries(this.intentPatterns)) {
      let matchCount = 0;
      let matchedKeywords = [];
      
      for (const keyword of config.keywords) {
        if (lowerMessage.includes(keyword)) {
          matchCount++;
          matchedKeywords.push(keyword);
        }
      }
      
      // Calculate score with weight
      const rawScore = matchCount / config.keywords.length;
      scores[intent] = rawScore * config.weight;
    }
    
    // Apply context boost if last intent exists
    if (lastIntent && scores[lastIntent] !== undefined) {
      scores[lastIntent] += 0.15; // Boost previous intent
    }
    
    // Find highest scoring intent
    let category = 'general';
    let confidence = 0;
    
    for (const [intent, score] of Object.entries(scores)) {
      if (score > confidence) {
        confidence = score;
        category = intent;
      }
    }
    
    // If no clear match, use contextual rules
    if (confidence < 0.05) {
      category = this.applyContextualRules(lowerMessage, lastIntent);
    }
    
    return {
      category,
      confidence: Math.min(confidence, 1.0),
      entities: this.extractEntities(message)
    };
  }

  applyContextualRules(message, lastIntent) {
    // Contextual rules for ambiguous messages
    if (message.includes('available') || message.includes('next week') || message.includes('tuesday') || message.includes('morning')) {
      return lastIntent || 'service';
    }
    if (message.includes('miles') && (message.includes('covered') || message.includes('warranty'))) {
      return 'warranty';
    }
    if (message.includes('miles') && lastIntent === 'warranty') {
      return 'warranty';
    }
    if (message.includes('today') && (message.includes('look') || message.includes('fix'))) {
      return 'technical';
    }
    if (message.includes('cost') || message.includes('price') || message.includes('much')) {
      return lastIntent || 'general';
    }
    if (message.includes('waiting') || message.includes('part') || message.includes('fixed')) {
      return 'service';
    }
    if (message.includes('manager') || message.includes('unacceptable')) {
      return lastIntent || 'service';
    }
    if (message.includes('tax') || message.includes('incentive')) {
      return 'sales';
    }
    if (message.includes('range') && message.includes('model')) {
      return 'sales';
    }
    if (message.includes('30k') || message.includes('included')) {
      return 'service';
    }
    if (message.includes('test drive') || message.includes('schedule') && lastIntent === 'sales') {
      return 'sales';
    }
    if (message.includes('help') && lastIntent) {
      return lastIntent;
    }
    
    // If we have context, use it
    if (lastIntent) {
      return lastIntent;
    }
    
    return 'general';
  }

  extractEntities(message) {
    const entities = {};
    
    // Extract vehicle model patterns
    const modelMatch = message.match(/\b(model [a-z0-9]+|[a-z]+ \d{3,4})\b/i);
    if (modelMatch) entities.vehicle = modelMatch[0];
    
    // Extract dates
    const dateMatch = message.match(/\b(today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday)\b/i);
    if (dateMatch) entities.date = dateMatch[0];
    
    return entities;
  }
}

module.exports = { IntentAnalysisAgent };
