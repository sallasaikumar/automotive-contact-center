class RoutingAgent {
  constructor() {
    this.routes = {
      service: 'Service Department',
      sales: 'Sales Department',
      warranty: 'Warranty Department',
      technical: 'Technical Support',
      general: 'General Inquiry'
    };
  }

  async route(intent, sentiment) {
    const category = intent.category;
    const urgency = sentiment.urgency;
    
    let department = this.routes[category] || this.routes.general;
    let priority = urgency === 'high' ? 'urgent' : 'normal';
    
    return {
      department,
      priority,
      escalate: urgency === 'high' && sentiment.score < -0.5
    };
  }
}

module.exports = { RoutingAgent };
