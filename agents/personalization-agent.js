const fs = require('fs');
const path = require('path');

class PersonalizationAgent {
  constructor() {
    this.customerProfiles = new Map();
    this.sampleCustomers = this.loadSampleCustomers();
  }

  loadSampleCustomers() {
    try {
      const dataPath = path.join(__dirname, '../data/sample-customers.json');
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading sample customers:', error);
      return [];
    }
  }

  getCustomerProfile(sessionId) {
    if (!this.customerProfiles.has(sessionId)) {
      // Randomly assign a sample customer or create default
      const randomCustomer = this.sampleCustomers.length > 0
        ? this.sampleCustomers[Math.floor(Math.random() * this.sampleCustomers.length)]
        : this.getDefaultProfile();
      
      this.customerProfiles.set(sessionId, randomCustomer);
    }
    
    return this.customerProfiles.get(sessionId);
  }

  getDefaultProfile() {
    return {
      id: 'GUEST',
      name: 'Customer',
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        mileage: 15000,
        lastService: '2024-10-15'
      },
      preferences: {
        language: 'en',
        contactMethod: 'chat'
      },
      serviceHistory: []
    };
  }

  async personalize(customerData, intent, knowledge) {
    const context = {
      greeting: `Hello${customerData.name !== 'Customer' && customerData.name !== 'Guest' ? ' ' + customerData.name : ''}`,
      vehicleInfo: customerData.vehicle,
      recommendations: [],
      customerInsights: {}
    };
    
    // Add personalized recommendations based on vehicle data
    if (intent.category === 'service' && customerData.vehicle) {
      const mileage = customerData.vehicle.mileage;
      
      if (mileage > 30000) {
        context.recommendations.push('Your vehicle may be due for a major service at 30k miles.');
      } else if (mileage > 15000) {
        context.recommendations.push('Consider scheduling your next maintenance check soon.');
      }
      
      // Check last service date
      if (customerData.vehicle.lastService) {
        const lastServiceDate = new Date(customerData.vehicle.lastService);
        const monthsSinceService = (Date.now() - lastServiceDate) / (1000 * 60 * 60 * 24 * 30);
        
        if (monthsSinceService > 6) {
          context.recommendations.push('It\'s been over 6 months since your last service.');
        }
      }
    }
    
    // Add warranty insights
    if (intent.category === 'warranty' && customerData.warranty) {
      context.customerInsights.warrantyStatus = customerData.warranty.status;
      context.customerInsights.warrantyExpiry = customerData.warranty.endDate;
      
      if (customerData.warranty.status === 'Expired') {
        context.recommendations.push('Your warranty has expired. Consider our extended warranty options.');
      }
    }
    
    // Add service history insights
    if (customerData.serviceHistory && customerData.serviceHistory.length > 0) {
      context.customerInsights.lastService = customerData.serviceHistory[0];
      context.customerInsights.totalServices = customerData.serviceHistory.length;
    }
    
    return context;
  }
}

module.exports = { PersonalizationAgent };
