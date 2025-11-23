/**
 * MCP Server 1: Vehicle Design & Customization Protocol
 * 
 * Provides context and tools for:
 * - Vehicle design specifications
 * - Customization options
 * - 3D model data
 * - Color schemes and materials
 * - Feature configurations
 */

class VehicleDesignMCP {
  constructor() {
    this.name = 'Vehicle Design MCP';
    this.version = '1.0.0';
    this.protocol = 'model-context-protocol';
    
    this.capabilities = {
      resources: true,
      tools: true,
      prompts: true
    };
    
    this.vehicleModels = new Map();
    this.designTemplates = new Map();
    this.customizations = new Map();
    
    this.initializeDesignData();
  }

  initializeDesignData() {
    // Vehicle models with design specs
    this.vehicleModels.set('sedan-luxury', {
      id: 'sedan-luxury',
      name: 'Luxury Sedan',
      category: 'sedan',
      basePrice: 45000,
      dimensions: {
        length: 4950,
        width: 1850,
        height: 1450,
        wheelbase: 2900
      },
      designFeatures: {
        bodyStyle: 'sleek-aerodynamic',
        roofline: 'fastback',
        grille: 'signature-chrome',
        headlights: 'led-matrix',
        wheels: '19-inch-alloy'
      },
      colorOptions: [
        { name: 'Midnight Black', code: '#0a0a0a', premium: false },
        { name: 'Pearl White', code: '#f8f8f8', premium: true },
        { name: 'Sapphire Blue', code: '#1e3a8a', premium: true },
        { name: 'Ruby Red', code: '#dc2626', premium: true },
        { name: 'Silver Metallic', code: '#94a3b8', premium: false }
      ],
      interiorOptions: [
        { name: 'Premium Leather', material: 'nappa-leather', colors: ['black', 'tan', 'gray'] },
        { name: 'Alcantara Sport', material: 'alcantara', colors: ['black', 'red-accent'] },
        { name: 'Sustainable Fabric', material: 'recycled-fabric', colors: ['gray', 'blue'] }
      ],
      customizationPackages: [
        {
          name: 'Sport Package',
          price: 3500,
          features: ['sport-suspension', 'performance-brakes', 'sport-seats', 'paddle-shifters']
        },
        {
          name: 'Luxury Package',
          price: 5000,
          features: ['premium-audio', 'ambient-lighting', 'massage-seats', 'panoramic-roof']
        },
        {
          name: 'Tech Package',
          price: 4000,
          features: ['hud-display', 'adaptive-cruise', '360-camera', 'parking-assist']
        }
      ]
    });

    this.vehicleModels.set('suv-family', {
      id: 'suv-family',
      name: 'Family SUV',
      category: 'suv',
      basePrice: 52000,
      dimensions: {
        length: 4850,
        width: 1950,
        height: 1750,
        wheelbase: 2850
      },
      designFeatures: {
        bodyStyle: 'robust-commanding',
        roofline: 'elevated',
        grille: 'bold-chrome',
        headlights: 'led-projector',
        wheels: '20-inch-alloy'
      },
      colorOptions: [
        { name: 'Arctic White', code: '#ffffff', premium: false },
        { name: 'Forest Green', code: '#166534', premium: true },
        { name: 'Graphite Gray', code: '#374151', premium: false },
        { name: 'Desert Sand', code: '#d97706', premium: true }
      ],
      interiorOptions: [
        { name: '7-Seat Configuration', material: 'premium-cloth', colors: ['black', 'gray'] },
        { name: 'Captain Chairs', material: 'leather', colors: ['black', 'tan'] }
      ],
      customizationPackages: [
        {
          name: 'Family Package',
          price: 3000,
          features: ['rear-entertainment', 'wireless-charging', 'usb-ports', 'storage-solutions']
        },
        {
          name: 'Adventure Package',
          price: 4500,
          features: ['all-terrain-tires', 'roof-rack', 'tow-package', 'skid-plates']
        }
      ]
    });

    this.vehicleModels.set('ev-sport', {
      id: 'ev-sport',
      name: 'Electric Sport',
      category: 'electric',
      basePrice: 65000,
      dimensions: {
        length: 4700,
        width: 1900,
        height: 1400,
        wheelbase: 2800
      },
      designFeatures: {
        bodyStyle: 'aerodynamic-coupe',
        roofline: 'sloping-fastback',
        grille: 'closed-ev-design',
        headlights: 'led-signature',
        wheels: '21-inch-aero'
      },
      colorOptions: [
        { name: 'Electric Blue', code: '#3b82f6', premium: true },
        { name: 'Cyber Silver', code: '#e5e7eb', premium: true },
        { name: 'Stealth Black', code: '#111827', premium: false },
        { name: 'Neon Green', code: '#10b981', premium: true }
      ],
      interiorOptions: [
        { name: 'Vegan Leather', material: 'synthetic-leather', colors: ['white', 'black'] },
        { name: 'Carbon Fiber Trim', material: 'carbon-fiber', colors: ['black'] }
      ],
      customizationPackages: [
        {
          name: 'Performance Package',
          price: 8000,
          features: ['dual-motor', 'track-mode', 'performance-brakes', 'sport-suspension']
        },
        {
          name: 'Autopilot Package',
          price: 6000,
          features: ['full-self-driving', 'auto-park', 'summon', 'navigate-autopilot']
        }
      ],
      batteryOptions: [
        { capacity: '75kWh', range: 300, price: 0 },
        { capacity: '100kWh', range: 400, price: 10000 }
      ]
    });
  }

  // MCP Protocol Methods

  async listResources() {
    return {
      resources: [
        {
          uri: 'vehicle://models/all',
          name: 'All Vehicle Models',
          description: 'Complete catalog of available vehicle models',
          mimeType: 'application/json'
        },
        {
          uri: 'vehicle://design/templates',
          name: 'Design Templates',
          description: 'Pre-configured design templates',
          mimeType: 'application/json'
        },
        {
          uri: 'vehicle://customization/options',
          name: 'Customization Options',
          description: 'Available customization packages and options',
          mimeType: 'application/json'
        }
      ]
    };
  }

  async readResource(uri) {
    if (uri === 'vehicle://models/all') {
      return {
        contents: [{
          uri: uri,
          mimeType: 'application/json',
          text: JSON.stringify(Array.from(this.vehicleModels.values()), null, 2)
        }]
      };
    }
    
    if (uri.startsWith('vehicle://models/')) {
      const modelId = uri.split('/').pop();
      const model = this.vehicleModels.get(modelId);
      
      if (model) {
        return {
          contents: [{
            uri: uri,
            mimeType: 'application/json',
            text: JSON.stringify(model, null, 2)
          }]
        };
      }
    }
    
    throw new Error(`Resource not found: ${uri}`);
  }

  async listTools() {
    return {
      tools: [
        {
          name: 'configure_vehicle',
          description: 'Configure a vehicle with selected options and packages',
          inputSchema: {
            type: 'object',
            properties: {
              modelId: { type: 'string', description: 'Vehicle model ID' },
              color: { type: 'string', description: 'Exterior color' },
              interior: { type: 'string', description: 'Interior option' },
              packages: { type: 'array', items: { type: 'string' }, description: 'Customization packages' }
            },
            required: ['modelId']
          }
        },
        {
          name: 'calculate_price',
          description: 'Calculate total price with all selected options',
          inputSchema: {
            type: 'object',
            properties: {
              modelId: { type: 'string' },
              packages: { type: 'array', items: { type: 'string' } },
              premiumColor: { type: 'boolean' }
            },
            required: ['modelId']
          }
        },
        {
          name: 'generate_3d_preview',
          description: 'Generate 3D preview URL for configured vehicle',
          inputSchema: {
            type: 'object',
            properties: {
              configuration: { type: 'object', description: 'Vehicle configuration' }
            },
            required: ['configuration']
          }
        },
        {
          name: 'compare_models',
          description: 'Compare specifications of multiple vehicle models',
          inputSchema: {
            type: 'object',
            properties: {
              modelIds: { type: 'array', items: { type: 'string' }, description: 'Model IDs to compare' }
            },
            required: ['modelIds']
          }
        }
      ]
    };
  }

  async callTool(name, args) {
    switch (name) {
      case 'configure_vehicle':
        return await this.configureVehicle(args);
      
      case 'calculate_price':
        return await this.calculatePrice(args);
      
      case 'generate_3d_preview':
        return await this.generate3DPreview(args);
      
      case 'compare_models':
        return await this.compareModels(args);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async configureVehicle(args) {
    const model = this.vehicleModels.get(args.modelId);
    
    if (!model) {
      throw new Error(`Model not found: ${args.modelId}`);
    }
    
    const configuration = {
      model: model.name,
      modelId: args.modelId,
      basePrice: model.basePrice,
      color: args.color || model.colorOptions[0].name,
      interior: args.interior || model.interiorOptions[0].name,
      packages: args.packages || [],
      configurationId: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Calculate total price
    let totalPrice = model.basePrice;
    
    // Add package prices
    if (args.packages) {
      for (const packageName of args.packages) {
        const pkg = model.customizationPackages.find(p => p.name === packageName);
        if (pkg) {
          totalPrice += pkg.price;
        }
      }
    }
    
    // Add premium color charge
    const selectedColor = model.colorOptions.find(c => c.name === args.color);
    if (selectedColor && selectedColor.premium) {
      totalPrice += 1500;
    }
    
    configuration.totalPrice = totalPrice;
    configuration.savings = this.calculateSavings(model, args.packages);
    
    this.customizations.set(configuration.configurationId, configuration);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(configuration, null, 2)
      }]
    };
  }

  async calculatePrice(args) {
    const model = this.vehicleModels.get(args.modelId);
    
    if (!model) {
      throw new Error(`Model not found: ${args.modelId}`);
    }
    
    let breakdown = {
      basePrice: model.basePrice,
      packages: [],
      premiumColor: args.premiumColor ? 1500 : 0,
      total: model.basePrice
    };
    
    if (args.packages) {
      for (const packageName of args.packages) {
        const pkg = model.customizationPackages.find(p => p.name === packageName);
        if (pkg) {
          breakdown.packages.push({
            name: pkg.name,
            price: pkg.price
          });
          breakdown.total += pkg.price;
        }
      }
    }
    
    breakdown.total += breakdown.premiumColor;
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(breakdown, null, 2)
      }]
    };
  }

  async generate3DPreview(args) {
    const config = args.configuration;
    
    // Generate mock 3D preview URL
    const previewUrl = `https://3d-preview.automotive.com/render?config=${encodeURIComponent(JSON.stringify(config))}`;
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          previewUrl: previewUrl,
          thumbnailUrl: `${previewUrl}&size=thumbnail`,
          interactiveUrl: `${previewUrl}&interactive=true`,
          renderTime: '2.3s',
          quality: 'high'
        }, null, 2)
      }]
    };
  }

  async compareModels(args) {
    const models = args.modelIds.map(id => this.vehicleModels.get(id)).filter(Boolean);
    
    if (models.length === 0) {
      throw new Error('No valid models found');
    }
    
    const comparison = {
      models: models.map(m => ({
        name: m.name,
        category: m.category,
        basePrice: m.basePrice,
        dimensions: m.dimensions,
        colorOptions: m.colorOptions.length,
        packages: m.customizationPackages.length
      })),
      recommendation: this.getRecommendation(models)
    };
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(comparison, null, 2)
      }]
    };
  }

  calculateSavings(model, packages) {
    if (!packages || packages.length < 2) return 0;
    
    // Bundle discount
    return packages.length * 500;
  }

  getRecommendation(models) {
    // Simple recommendation logic
    const cheapest = models.reduce((min, m) => m.basePrice < min.basePrice ? m : min);
    const mostFeatures = models.reduce((max, m) => 
      m.customizationPackages.length > max.customizationPackages.length ? m : max
    );
    
    return {
      bestValue: cheapest.name,
      mostFeatures: mostFeatures.name
    };
  }

  // Public API
  getServerInfo() {
    return {
      name: this.name,
      version: this.version,
      protocol: this.protocol,
      capabilities: this.capabilities
    };
  }
}

module.exports = { VehicleDesignMCP };
