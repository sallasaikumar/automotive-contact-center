class ResponseGenerationAgent {
  async generate(message, intent, sentiment, knowledge, personalizedContext, history) {
    let responseText = '';
    
    // Adjust tone based on sentiment
    if (sentiment.urgency === 'high') {
      responseText += 'I understand this is urgent. ';
    }
    
    if (sentiment.sentiment === 'negative') {
      responseText += 'I apologize for any inconvenience. ';
    }
    
    // Add personalized greeting for first message
    if (history.length <= 1) {
      responseText += `${personalizedContext.greeting}! `;
    }
    
    // Add knowledge-based response
    if (knowledge.length > 0) {
      responseText += knowledge[0].content + ' ';
    } else {
      responseText += 'I\'m here to help you with your automotive needs. ';
    }
    
    // Add personalized recommendations
    if (personalizedContext.recommendations.length > 0) {
      responseText += personalizedContext.recommendations.join(' ') + ' ';
    }
    
    // Generate quick actions based on intent
    const quickActions = this.generateQuickActions(intent.category);
    const suggestions = this.generateSuggestions(intent.category);
    
    return {
      text: responseText.trim(),
      quickActions,
      suggestions
    };
  }

  generateQuickActions(category) {
    const actions = {
      service: [
        { label: 'Schedule Service', action: 'schedule_service' },
        { label: 'View Service History', action: 'view_history' }
      ],
      sales: [
        { label: 'Browse Inventory', action: 'browse_inventory' },
        { label: 'Schedule Test Drive', action: 'schedule_test_drive' }
      ],
      warranty: [
        { label: 'Check Warranty Status', action: 'check_warranty' },
        { label: 'File Claim', action: 'file_claim' }
      ],
      technical: [
        { label: 'Schedule Diagnostic', action: 'schedule_diagnostic' },
        { label: 'View Manuals', action: 'view_manuals' }
      ],
      general: [
        { label: 'Contact Support', action: 'contact_support' },
        { label: 'View FAQ', action: 'view_faq' }
      ]
    };
    
    return actions[category] || actions.general;
  }

  generateSuggestions(category) {
    const suggestions = {
      service: ['When is my next service due?', 'What does my service include?'],
      sales: ['What models are available?', 'Can I schedule a test drive?'],
      warranty: ['What is covered under warranty?', 'How do I extend my warranty?'],
      technical: ['How do I reset my system?', 'Where can I find the manual?'],
      general: ['What are your hours?', 'How can I contact you?']
    };
    
    return suggestions[category] || suggestions.general;
  }
}

module.exports = { ResponseGenerationAgent };
