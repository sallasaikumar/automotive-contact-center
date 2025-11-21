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
    if (history.length <= 1 && personalizedContext.greeting) {
      responseText += `${personalizedContext.greeting}! `;
    }
    
    // Generate intent-specific response
    responseText += this.generateIntentResponse(intent, message, knowledge, personalizedContext);
    
    // Add personalized recommendations
    if (personalizedContext.recommendations && personalizedContext.recommendations.length > 0) {
      responseText += ' ' + personalizedContext.recommendations.join(' ');
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

  generateIntentResponse(intent, message, knowledge, personalizedContext) {
    const category = intent.category;
    
    console.log('Generating response for category:', category);
    console.log('Knowledge available:', knowledge.articles ? knowledge.articles.length : 0);
    
    // Use knowledge if available and relevant
    if (knowledge.articles && knowledge.articles.length > 0) {
      const article = knowledge.articles[0];
      console.log('Using knowledge article:', article.topic);
      
      // Create a contextual response using the knowledge
      let response = article.content;
      
      // Add personalization if available
      if (personalizedContext.vehicleInfo) {
        const vehicle = personalizedContext.vehicleInfo;
        const vehicleStr = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
        response = `For your ${vehicleStr}, ${response.charAt(0).toLowerCase()}${response.slice(1)}`;
      }
      
      // Add additional details if available
      if (article.estimatedCost) {
        response += ` The estimated cost is ${article.estimatedCost}.`;
      }
      if (article.duration) {
        response += ` This typically takes ${article.duration}.`;
      }
      if (article.availability) {
        response += ` We're available ${article.availability}.`;
      }
      
      return response;
    }
    
    // Generate category-specific responses if no knowledge found
    const responses = {
      service: this.generateServiceResponse(intent, personalizedContext),
      sales: this.generateSalesResponse(intent, personalizedContext),
      warranty: this.generateWarrantyResponse(intent, personalizedContext),
      technical: this.generateTechnicalResponse(intent, personalizedContext),
      general: this.generateGeneralResponse(intent, personalizedContext)
    };
    
    const response = responses[category] || responses.general;
    console.log('Generated response:', response.substring(0, 50) + '...');
    
    return response;
  }

  generateServiceResponse(intent, context) {
    const vehicleStr = context.vehicleInfo ? `${context.vehicleInfo.year} ${context.vehicleInfo.make} ${context.vehicleInfo.model}` : 'vehicle';
    const responses = [
      `I can help you schedule a service appointment for your ${vehicleStr}. What type of service do you need?`,
      `Let me assist you with your service needs. When would you like to schedule your appointment?`,
      `I'd be happy to help with your vehicle service. What specific service are you looking for?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  generateSalesResponse(intent, context) {
    const responses = [
      `I can help you explore our vehicle inventory. What type of vehicle are you interested in?`,
      `Great! Let me help you find the perfect vehicle. Are you looking for a new or used vehicle?`,
      `I'd be happy to assist with your vehicle purchase. What features are most important to you?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  generateWarrantyResponse(intent, context) {
    const vehicleStr = context.vehicleInfo ? `${context.vehicleInfo.year} ${context.vehicleInfo.make} ${context.vehicleInfo.model}` : 'vehicle';
    const responses = [
      `I can help you with warranty information for your ${vehicleStr}. What specific warranty question do you have?`,
      `Let me assist you with your warranty inquiry. What would you like to know?`,
      `I'd be happy to help with warranty details. Are you asking about coverage or filing a claim?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  generateTechnicalResponse(intent, context) {
    const responses = [
      `I can help you with technical support. What issue are you experiencing?`,
      `Let me assist you with that technical question. Can you describe the problem in more detail?`,
      `I'd be happy to help troubleshoot. What specific technical issue are you facing?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  generateGeneralResponse(intent, context) {
    const responses = [
      `I understand you need assistance with your automotive needs. Let me help you with that. Could you please provide more details about what you need?`,
      `How can I help you today? I can assist with service, sales, warranty, or technical questions.`,
      `I'd be happy to help. What information are you looking for?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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
