// Intelligent Cockpit Assistant and Concierge Agent
class CockpitAssistantAgent {
  constructor() {
    this.capabilities = {
      voiceCommands: true,
      navigation: true,
      climateControl: true,
      entertainment: true,
      vehicleStatus: true,
      proactiveAssistance: true
    };
  }

  async processCommand(command, vehicleContext, driverProfile) {
    const intent = this.classifyCommand(command);
    
    switch (intent.type) {
      case 'navigation':
        return await this.handleNavigation(command, vehicleContext);
      case 'climate':
        return await this.handleClimate(command, driverProfile);
      case 'entertainment':
        return await this.handleEntertainment(command, driverProfile);
      case 'vehicle_status':
        return await this.handleVehicleStatus(vehicleContext);
      case 'concierge':
        return await this.handleConcierge(command, vehicleContext);
      default:
        return await this.handleGeneral(command);
    }
  }

  classifyCommand(command) {
    const lower = command.toLowerCase();
    
    if (lower.match(/navigate|directions|route|take me|go to|find|location/)) {
      return { type: 'navigation', confidence: 0.9 };
    }
    if (lower.match(/temperature|climate|heat|cool|ac|air|warm|cold/)) {
      return { type: 'climate', confidence: 0.9 };
    }
    if (lower.match(/play|music|radio|podcast|volume|song|artist/)) {
      return { type: 'entertainment', confidence: 0.9 };
    }
    if (lower.match(/status|fuel|battery|tire|pressure|oil|check/)) {
      return { type: 'vehicle_status', confidence: 0.9 };
    }
    if (lower.match(/book|reserve|restaurant|hotel|parking|recommend/)) {
      return { type: 'concierge', confidence: 0.85 };
    }
    
    return { type: 'general', confidence: 0.5 };
  }

  async handleNavigation(command, vehicleContext) {
    const destination = this.extractDestination(command);
    
    return {
      action: 'navigation',
      response: `Navigating to ${destination}. ETA: 15 minutes. Current traffic is light.`,
      data: {
        destination: destination,
        eta: '15 minutes',
        distance: '8.5 miles',
        traffic: 'light',
        route: 'fastest',
        alternativeRoutes: 2
      },
      voiceResponse: `Sure, navigating to ${destination}. You'll arrive in about 15 minutes.`
    };
  }

  async handleClimate(command, driverProfile) {
    const settings = this.extractClimateSettings(command);
    const preferredTemp = driverProfile.preferences?.temperature || 72;
    
    return {
      action: 'climate_control',
      response: `Setting temperature to ${settings.temperature}°F. Climate control adjusted.`,
      data: {
        temperature: settings.temperature,
        fanSpeed: settings.fanSpeed || 'auto',
        mode: settings.mode || 'auto',
        seatHeating: settings.seatHeating || false
      },
      voiceResponse: `Temperature set to ${settings.temperature} degrees.`
    };
  }

  async handleEntertainment(command, driverProfile) {
    const media = this.extractMediaRequest(command);
    
    return {
      action: 'entertainment',
      response: `Playing ${media.content} on ${media.source}.`,
      data: {
        content: media.content,
        source: media.source,
        volume: media.volume || 50,
        favorites: driverProfile.favorites || []
      },
      voiceResponse: `Now playing ${media.content}.`
    };
  }

  async handleVehicleStatus(vehicleContext) {
    const status = {
      fuel: vehicleContext.fuelLevel || 75,
      battery: vehicleContext.batteryLevel || 100,
      tirePressure: vehicleContext.tirePressure || 'normal',
      oilLife: vehicleContext.oilLife || 85,
      nextService: vehicleContext.nextService || '2,500 miles'
    };
    
    const alerts = this.checkAlerts(status);
    
    return {
      action: 'vehicle_status',
      response: this.generateStatusReport(status, alerts),
      data: status,
      alerts: alerts,
      voiceResponse: alerts.length > 0 
        ? `Vehicle status: ${alerts[0].message}` 
        : 'All systems normal.'
    };
  }

  async handleConcierge(command, vehicleContext) {
    const request = this.extractConciergeRequest(command);
    
    return {
      action: 'concierge',
      response: `I found 3 ${request.type} near your destination. Would you like me to book one?`,
      data: {
        type: request.type,
        recommendations: this.getRecommendations(request, vehicleContext),
        bookingAvailable: true
      },
      voiceResponse: `I found several options for ${request.type}. Shall I show you the top recommendations?`
    };
  }

  async handleGeneral(command) {
    return {
      action: 'general',
      response: 'I can help you with navigation, climate control, entertainment, vehicle status, or concierge services. What would you like?',
      voiceResponse: 'How can I assist you today?'
    };
  }

  extractDestination(command) {
    // Simple extraction - in production, use NLP
    const match = command.match(/to\s+(.+?)(?:\.|$)/i);
    return match ? match[1] : 'destination';
  }

  extractClimateSettings(command) {
    const tempMatch = command.match(/(\d+)\s*(?:degrees?|°)/i);
    return {
      temperature: tempMatch ? parseInt(tempMatch[1]) : 72,
      fanSpeed: 'auto',
      mode: 'auto'
    };
  }

  extractMediaRequest(command) {
    return {
      content: 'your favorite playlist',
      source: 'Spotify',
      volume: 50
    };
  }

  extractConciergeRequest(command) {
    const lower = command.toLowerCase();
    if (lower.includes('restaurant')) return { type: 'restaurant' };
    if (lower.includes('parking')) return { type: 'parking' };
    if (lower.includes('hotel')) return { type: 'hotel' };
    return { type: 'service' };
  }

  getRecommendations(request, vehicleContext) {
    return [
      { name: 'Top Rated Option', distance: '0.5 miles', rating: 4.8 },
      { name: 'Popular Choice', distance: '1.2 miles', rating: 4.6 },
      { name: 'Budget Friendly', distance: '0.8 miles', rating: 4.4 }
    ];
  }

  checkAlerts(status) {
    const alerts = [];
    if (status.fuel < 20) alerts.push({ level: 'warning', message: 'Fuel level low' });
    if (status.oilLife < 15) alerts.push({ level: 'warning', message: 'Oil change needed soon' });
    if (status.tirePressure === 'low') alerts.push({ level: 'caution', message: 'Check tire pressure' });
    return alerts;
  }

  generateStatusReport(status, alerts) {
    if (alerts.length > 0) {
      return `Vehicle Status: ${alerts.map(a => a.message).join(', ')}. Fuel: ${status.fuel}%, Oil Life: ${status.oilLife}%`;
    }
    return `All systems normal. Fuel: ${status.fuel}%, Battery: ${status.battery}%, Next service in ${status.nextService}.`;
  }

  // Proactive assistance
  async provideProactiveAssistance(vehicleContext, driverProfile, timeContext) {
    const suggestions = [];
    
    // Morning commute
    if (timeContext.hour >= 7 && timeContext.hour <= 9) {
      suggestions.push({
        type: 'navigation',
        message: 'Good morning! Traffic on your usual route is heavy. Would you like an alternate route?',
        action: 'suggest_route'
      });
    }
    
    // Low fuel
    if (vehicleContext.fuelLevel < 25) {
      suggestions.push({
        type: 'fuel',
        message: 'Fuel is running low. There\'s a gas station 2 miles ahead.',
        action: 'show_gas_stations'
      });
    }
    
    // Service reminder
    if (vehicleContext.mileageUntilService < 500) {
      suggestions.push({
        type: 'service',
        message: 'Your vehicle is due for service soon. Would you like to schedule an appointment?',
        action: 'schedule_service'
      });
    }
    
    return suggestions;
  }
}

module.exports = { CockpitAssistantAgent };
