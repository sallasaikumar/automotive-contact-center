// AI-Powered Product Recommendation Assistant
class ProductRecommendationAgent {
  constructor() {
    this.productCatalog = this.loadProductCatalog();
    this.recommendationEngine = {
      collaborative: true,
      contentBased: true,
      hybrid: true
    };
  }

  loadProductCatalog() {
    return {
      vehicles: [
        { id: 'v1', name: 'EcoSedan 2024', type: 'sedan', price: 28000, features: ['hybrid', 'tech-package', 'safety'], mpg: 52 },
        { id: 'v2', name: 'FamilySUV Pro', type: 'suv', price: 42000, features: ['3rd-row', 'awd', 'premium-audio'], mpg: 28 },
        { id: 'v3', name: 'SportCoupe GT', type: 'coupe', price: 38000, features: ['performance', 'luxury', 'tech'], mpg: 25 },
        { id: 'v4', name: 'ElectricCrossover', type: 'electric', price: 45000, features: ['electric', 'autopilot', 'premium'], range: 320 },
        { id: 'v5', name: 'WorkTruck 4x4', type: 'truck', price: 35000, features: ['4wd', 'towing', 'durability'], towing: 8000 }
      ],
      accessories: [
        { id: 'a1', name: 'All-Weather Floor Mats', price: 150, category: 'interior', compatibility: 'all' },
        { id: 'a2', name: 'Roof Rack System', price: 450, category: 'exterior', compatibility: ['suv', 'truck'] },
        { id: 'a3', name: 'Premium Sound System', price: 1200, category: 'entertainment', compatibility: 'all' }
      ],
      services: [
        { id: 's1', name: 'Extended Warranty', price: 2500, duration: '5 years', coverage: 'comprehensive' },
        { id: 's2', name: 'Maintenance Package', price: 800, duration: '3 years', coverage: 'routine' }
      ]
    };
  }

  async recommend(customerProfile, context) {
    const recommendations = {
      vehicles: await this.recommendVehicles(customerProfile, context),
      accessories: await this.recommendAccessories(customerProfile, context),
      services: await this.recommendServices(customerProfile, context),
      financing: await this.recommendFinancing(customerProfile, context)
    };

    return {
      recommendations,
      reasoning: this.explainRecommendations(recommendations, customerProfile),
      confidence: this.calculateConfidence(recommendations, customerProfile)
    };
  }

  async recommendVehicles(customerProfile, context) {
    const preferences = this.analyzePreferences(customerProfile);
    const scored = this.productCatalog.vehicles.map(vehicle => ({
      ...vehicle,
      score: this.scoreVehicle(vehicle, preferences, context)
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(v => ({
        ...v,
        reason: this.generateReason(v, preferences),
        matchPercentage: Math.round(v.score * 100)
      }));
  }

  async recommendAccessories(customerProfile, context) {
    const vehicle = customerProfile.vehicle || context.interestedVehicle;
    if (!vehicle) return [];

    return this.productCatalog.accessories
      .filter(acc => acc.compatibility === 'all' || acc.compatibility.includes(vehicle.type))
      .slice(0, 3)
      .map(acc => ({
        ...acc,
        reason: `Perfect fit for your ${vehicle.name || vehicle.type}`,
        savings: this.calculateBundleSavings(acc)
      }));
  }

  async recommendServices(customerProfile, context) {
    const recommendations = [];
    
    if (context.intent === 'purchase' || context.intent === 'sales') {
      recommendations.push({
        ...this.productCatalog.services[0],
        reason: 'Protect your investment with comprehensive coverage',
        priority: 'high'
      });
    }

    if (customerProfile.vehicle?.mileage > 30000) {
      recommendations.push({
        ...this.productCatalog.services[1],
        reason: 'Save on routine maintenance costs',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  async recommendFinancing(customerProfile, context) {
    const vehiclePrice = context.interestedVehicle?.price || 35000;
    
    return [
      {
        type: 'loan',
        apr: 3.9,
        term: 60,
        monthlyPayment: Math.round(vehiclePrice * 0.0184),
        totalCost: Math.round(vehiclePrice * 1.104),
        reason: 'Best rate for your credit profile'
      },
      {
        type: 'lease',
        monthlyPayment: Math.round(vehiclePrice * 0.012),
        term: 36,
        mileageLimit: 12000,
        reason: 'Lower monthly payments with flexibility'
      }
    ];
  }

  analyzePreferences(customerProfile) {
    return {
      budget: customerProfile.budget || 40000,
      familySize: customerProfile.familySize || 2,
      lifestyle: customerProfile.lifestyle || 'commuter',
      priorities: customerProfile.priorities || ['reliability', 'fuel-efficiency'],
      currentVehicle: customerProfile.vehicle
    };
  }

  scoreVehicle(vehicle, preferences, context) {
    let score = 0.5;

    // Budget match
    if (vehicle.price <= preferences.budget) score += 0.2;
    if (vehicle.price <= preferences.budget * 0.9) score += 0.1;

    // Family size match
    if (preferences.familySize > 4 && vehicle.type === 'suv') score += 0.2;
    if (preferences.familySize <= 2 && vehicle.type === 'sedan') score += 0.15;

    // Lifestyle match
    if (preferences.lifestyle === 'eco-conscious' && vehicle.features.includes('hybrid')) score += 0.2;
    if (preferences.lifestyle === 'adventure' && vehicle.type === 'suv') score += 0.15;

    // Priority match
    if (preferences.priorities.includes('fuel-efficiency') && vehicle.mpg > 40) score += 0.15;
    if (preferences.priorities.includes('safety') && vehicle.features.includes('safety')) score += 0.1;

    return Math.min(score, 1.0);
  }

  generateReason(vehicle, preferences) {
    const reasons = [];
    
    if (vehicle.price <= preferences.budget) reasons.push('within budget');
    if (vehicle.mpg > 40) reasons.push('excellent fuel economy');
    if (vehicle.features.includes('safety')) reasons.push('top safety ratings');
    if (vehicle.type === 'suv' && preferences.familySize > 4) reasons.push('spacious for family');
    
    return reasons.length > 0 ? reasons.join(', ') : 'great all-around choice';
  }

  calculateBundleSavings(accessory) {
    return Math.round(accessory.price * 0.1);
  }

  explainRecommendations(recommendations, customerProfile) {
    return {
      summary: `Based on your preferences and ${customerProfile.name ? customerProfile.name + "'s" : 'your'} profile`,
      factors: ['budget', 'lifestyle', 'family needs', 'priorities'],
      personalization: 'high'
    };
  }

  calculateConfidence(recommendations, customerProfile) {
    const hasProfile = customerProfile.budget && customerProfile.lifestyle;
    return hasProfile ? 0.85 : 0.65;
  }
}

module.exports = { ProductRecommendationAgent };
