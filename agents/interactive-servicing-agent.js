// Interactive Vehicle Servicing Agent
class InteractiveServicingAgent {
  constructor() {
    this.serviceTypes = this.loadServiceTypes();
    this.technicianSchedule = new Map();
    this.serviceQueue = [];
  }

  loadServiceTypes() {
    return {
      routine: [
        { id: 'oil_change', name: 'Oil Change', duration: 30, price: 75, interval: 5000 },
        { id: 'tire_rotation', name: 'Tire Rotation', duration: 45, price: 50, interval: 7500 },
        { id: 'inspection', name: 'Multi-Point Inspection', duration: 60, price: 0, interval: 10000 }
      ],
      maintenance: [
        { id: 'brake_service', name: 'Brake Service', duration: 90, price: 350, interval: 30000 },
        { id: 'transmission', name: 'Transmission Service', duration: 120, price: 250, interval: 60000 },
        { id: 'coolant_flush', name: 'Coolant Flush', duration: 60, price: 150, interval: 30000 }
      ],
      repair: [
        { id: 'diagnostic', name: 'Diagnostic Service', duration: 60, price: 125, interval: null },
        { id: 'engine_repair', name: 'Engine Repair', duration: 240, price: 800, interval: null },
        { id: 'electrical', name: 'Electrical Repair', duration: 120, price: 400, interval: null }
      ]
    };
  }

  async startInteractiveSession(customerId, vehicleInfo) {
    const session = {
      id: `service_${Date.now()}`,
      customerId,
      vehicleInfo,
      startTime: new Date(),
      stage: 'welcome',
      selectedServices: [],
      estimatedCost: 0,
      estimatedDuration: 0
    };

    return {
      session,
      message: await this.getWelcomeMessage(vehicleInfo),
      options: await this.getInitialOptions(vehicleInfo)
    };
  }

  async getWelcomeMessage(vehicleInfo) {
    return `Welcome! I'll help you schedule service for your ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}. 
    
Current mileage: ${vehicleInfo.mileage} miles
Last service: ${vehicleInfo.lastService || 'Not recorded'}

Let's find the right service for your vehicle.`;
  }

  async getInitialOptions(vehicleInfo) {
    const recommendations = await this.recommendServices(vehicleInfo);
    
    return {
      quickActions: [
        { id: 'routine', label: 'Routine Maintenance', icon: '🔧' },
        { id: 'repair', label: 'Repair Service', icon: '🛠️' },
        { id: 'diagnostic', label: 'Diagnostic Check', icon: '🔍' },
        { id: 'custom', label: 'Custom Service', icon: '⚙️' }
      ],
      recommendations: recommendations,
      urgentAlerts: this.checkUrgentNeeds(vehicleInfo)
    };
  }

  async recommendServices(vehicleInfo) {
    const recommendations = [];
    const mileage = vehicleInfo.mileage;

    // Check each service type
    Object.values(this.serviceTypes).flat().forEach(service => {
      if (service.interval && mileage % service.interval < 1000) {
        recommendations.push({
          ...service,
          reason: `Due at ${service.interval} miles`,
          priority: 'high',
          dueIn: `${service.interval - (mileage % service.interval)} miles`
        });
      }
    });

    return recommendations.slice(0, 3);
  }

  checkUrgentNeeds(vehicleInfo) {
    const alerts = [];
    
    if (vehicleInfo.checkEngine) {
      alerts.push({
        level: 'urgent',
        message: 'Check Engine Light is on',
        action: 'Schedule diagnostic immediately',
        icon: '⚠️'
      });
    }

    if (vehicleInfo.mileage - vehicleInfo.lastServiceMileage > 7500) {
      alerts.push({
        level: 'warning',
        message: 'Service overdue',
        action: 'Schedule maintenance soon',
        icon: '🔔'
      });
    }

    return alerts;
  }

  async selectService(sessionId, serviceId) {
    const service = this.findService(serviceId);
    
    return {
      service: service,
      details: await this.getServiceDetails(service),
      addOns: await this.suggestAddOns(service),
      nextStep: 'schedule'
    };
  }

  findService(serviceId) {
    for (const category of Object.values(this.serviceTypes)) {
      const service = category.find(s => s.id === serviceId);
      if (service) return service;
    }
    return null;
  }

  async getServiceDetails(service) {
    return {
      ...service,
      description: this.getServiceDescription(service.id),
      includes: this.getServiceIncludes(service.id),
      warranty: '12 months / 12,000 miles',
      genuineParts: true
    };
  }

  getServiceDescription(serviceId) {
    const descriptions = {
      oil_change: 'Complete oil change with filter replacement using premium synthetic oil',
      tire_rotation: 'Rotate all four tires and check tire pressure and tread depth',
      brake_service: 'Comprehensive brake inspection, pad replacement, and rotor resurfacing',
      diagnostic: 'Advanced computer diagnostic to identify vehicle issues'
    };
    return descriptions[serviceId] || 'Professional service by certified technicians';
  }

  getServiceIncludes(serviceId) {
    const includes = {
      oil_change: ['Premium synthetic oil', 'Oil filter', 'Multi-point inspection', 'Fluid top-off'],
      tire_rotation: ['Tire rotation', 'Pressure check', 'Tread inspection', 'Alignment check'],
      brake_service: ['Brake pads', 'Rotor service', 'Brake fluid check', 'Test drive']
    };
    return includes[serviceId] || ['Professional service', 'Quality parts', 'Warranty included'];
  }

  async suggestAddOns(service) {
    const addOns = [];

    if (service.id === 'oil_change') {
      addOns.push(
        { id: 'tire_rotation', name: 'Add Tire Rotation', price: 35, savings: 15 },
        { id: 'air_filter', name: 'Engine Air Filter', price: 45, savings: 10 }
      );
    }

    if (service.id === 'brake_service') {
      addOns.push(
        { id: 'brake_fluid', name: 'Brake Fluid Flush', price: 80, savings: 20 }
      );
    }

    return addOns;
  }

  async scheduleAppointment(sessionId, preferences) {
    const availableSlots = await this.getAvailableSlots(preferences.date);
    
    return {
      availableSlots: availableSlots,
      recommended: this.recommendSlot(availableSlots, preferences),
      options: {
        dropOff: true,
        waitingArea: true,
        loaner: availableSlots.some(s => s.duration > 120),
        shuttle: true
      }
    };
  }

  async getAvailableSlots(date) {
    // Simulate available time slots
    const slots = [];
    const hours = [8, 9, 10, 11, 13, 14, 15, 16];
    
    hours.forEach(hour => {
      slots.push({
        time: `${hour}:00`,
        available: Math.random() > 0.3,
        technician: 'Certified Tech',
        bay: Math.floor(Math.random() * 5) + 1
      });
    });

    return slots.filter(s => s.available);
  }

  recommendSlot(slots, preferences) {
    // Recommend based on preferences
    if (preferences.timePreference === 'morning') {
      return slots.find(s => parseInt(s.time) < 12);
    }
    return slots[0];
  }

  async confirmAppointment(sessionId, slotId, services) {
    const appointment = {
      id: `appt_${Date.now()}`,
      sessionId,
      services,
      slot: slotId,
      status: 'confirmed',
      totalCost: this.calculateTotal(services),
      estimatedDuration: this.calculateDuration(services),
      confirmationNumber: this.generateConfirmation()
    };

    return {
      appointment,
      confirmation: await this.generateConfirmationMessage(appointment),
      reminders: this.scheduleReminders(appointment),
      nextSteps: this.getNextSteps(appointment)
    };
  }

  calculateTotal(services) {
    return services.reduce((total, service) => total + service.price, 0);
  }

  calculateDuration(services) {
    return services.reduce((total, service) => total + service.duration, 0);
  }

  generateConfirmation() {
    return `SVC${Date.now().toString().slice(-8)}`;
  }

  async generateConfirmationMessage(appointment) {
    return {
      title: 'Appointment Confirmed! ✅',
      message: `Your service appointment is confirmed.
      
Confirmation #: ${appointment.confirmationNumber}
Date: ${appointment.slot.date}
Time: ${appointment.slot.time}
Estimated Duration: ${appointment.estimatedDuration} minutes
Total Cost: $${appointment.totalCost}

Services:
${appointment.services.map(s => `• ${s.name}`).join('\n')}

We'll send you a reminder 24 hours before your appointment.`,
      actions: [
        { label: 'Add to Calendar', action: 'calendar' },
        { label: 'Get Directions', action: 'directions' },
        { label: 'Modify Appointment', action: 'modify' }
      ]
    };
  }

  scheduleReminders(appointment) {
    return [
      { type: 'email', timing: '24 hours before', sent: false },
      { type: 'sms', timing: '2 hours before', sent: false },
      { type: 'push', timing: '30 minutes before', sent: false }
    ];
  }

  getNextSteps(appointment) {
    return [
      'Bring your vehicle to our service center at the scheduled time',
      'Check in at the service desk with your confirmation number',
      'Relax in our comfortable waiting area or use our shuttle service',
      'Receive real-time updates on your service progress',
      'Review completed work with your service advisor'
    ];
  }

  // Real-time service tracking
  async trackService(appointmentId) {
    return {
      status: 'in_progress',
      currentStep: 'diagnostic',
      progress: 45,
      steps: [
        { name: 'Check-in', status: 'completed', time: '8:00 AM' },
        { name: 'Initial Inspection', status: 'completed', time: '8:15 AM' },
        { name: 'Service Work', status: 'in_progress', time: '8:30 AM' },
        { name: 'Quality Check', status: 'pending', time: null },
        { name: 'Final Inspection', status: 'pending', time: null },
        { name: 'Ready for Pickup', status: 'pending', time: null }
      ],
      estimatedCompletion: '10:30 AM',
      technician: {
        name: 'Mike Johnson',
        certification: 'Master Technician',
        photo: 'tech_photo.jpg'
      },
      updates: [
        { time: '8:15 AM', message: 'Vehicle checked in and initial inspection started' },
        { time: '8:30 AM', message: 'Oil change in progress' }
      ]
    };
  }

  // Interactive service advisor
  async askQuestion(appointmentId, question) {
    const responses = {
      'how long': 'Your service should be completed by 10:30 AM. We\'ll notify you when it\'s ready.',
      'cost': 'The total cost is $75 as quoted. No additional work needed.',
      'wait': 'You\'re welcome to wait in our comfortable lounge with complimentary WiFi and refreshments.',
      'shuttle': 'Yes, our shuttle service is available. Where would you like to go?'
    };

    const lowerQuestion = question.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerQuestion.includes(key)) {
        return {
          answer: response,
          helpful: true,
          additionalInfo: this.getAdditionalInfo(key)
        };
      }
    }

    return {
      answer: 'Let me connect you with a service advisor who can help with that specific question.',
      escalate: true
    };
  }

  getAdditionalInfo(topic) {
    const info = {
      'how long': 'You can track real-time progress in the app',
      'cost': 'We accept all major credit cards and offer financing options',
      'wait': 'Our lounge features comfortable seating, TV, and a business center',
      'shuttle': 'Shuttle runs every 30 minutes within a 10-mile radius'
    };
    return info[topic] || null;
  }

  // Post-service follow-up
  async generateFollowUp(appointmentId) {
    return {
      survey: {
        questions: [
          'How satisfied were you with your service experience?',
          'Was your vehicle ready on time?',
          'How would you rate your service advisor?',
          'Would you recommend us to others?'
        ],
        incentive: '$10 off next service'
      },
      maintenance: {
        nextService: 'Oil change due in 5,000 miles or 6 months',
        recommendations: ['Tire rotation at next service', 'Brake inspection recommended']
      },
      offers: [
        { title: '10% off next service', code: 'THANKS10', expiry: '30 days' },
        { title: 'Free tire rotation', code: 'FREETIRE', expiry: '60 days' }
      ]
    };
  }
}

module.exports = { InteractiveServicingAgent };
