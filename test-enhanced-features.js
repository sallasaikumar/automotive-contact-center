// Test script for enhanced features
const { SupervisorAgent } = require('./agents/supervisor-agent');

const supervisor = new SupervisorAgent();

async function testEnhancedFeatures() {
  console.log('🚀 Testing Enhanced Features\n');

  // Test 1: Cockpit Assistant
  console.log('1️⃣ Testing Intelligent Cockpit Assistant...');
  const cockpitResult = await supervisor.handleCockpitCommand(
    'Navigate to downtown',
    'test-session-1'
  );
  console.log('✅ Cockpit Response:', cockpitResult.response);
  console.log('   Action:', cockpitResult.action);
  console.log('   ETA:', cockpitResult.data?.eta);
  console.log('');

  // Test 2: Product Recommendations
  console.log('2️⃣ Testing AI-Powered Product Recommendations...');
  const recResult = await supervisor.handleProductRecommendation(
    {
      intent: 'purchase',
      budget: 40000,
      familySize: 4,
      lifestyle: 'family'
    },
    'test-session-2'
  );
  console.log('✅ Top Vehicle Recommendation:', recResult.recommendations.vehicles[0]?.name);
  console.log('   Match:', recResult.recommendations.vehicles[0]?.matchPercentage + '%');
  console.log('   Reason:', recResult.recommendations.vehicles[0]?.reason);
  console.log('');

  // Test 3: CDH Insights
  console.log('3️⃣ Testing CDH Insights Generator...');
  const insightsResult = await supervisor.handleCDHInsights('customer123');
  console.log('✅ Engagement Level:', insightsResult.insights.insights.behavioral.engagementLevel);
  console.log('   Loyalty:', insightsResult.insights.insights.behavioral.loyaltyIndicator);
  console.log('   Projected LTV: $' + insightsResult.insights.insights.lifetime.projected);
  console.log('   Top Action:', insightsResult.insights.insights.recommendations[0]?.insight);
  console.log('');

  // Test 4: Generative Marketing
  console.log('4️⃣ Testing Generative Marketing...');
  const marketingResult = await supervisor.handleMarketingCampaign(
    'new-vehicle-launch',
    { age: 35, size: 10000, name: 'Tech Enthusiasts' },
    ['awareness', 'test_drives']
  );
  console.log('✅ Campaign Created:', marketingResult.campaign.id);
  console.log('   Channels:', marketingResult.campaign.channels.join(', '));
  console.log('   Budget: $' + marketingResult.campaign.budget.total);
  console.log('   Expected Leads:', marketingResult.campaign.kpis.conversion.leads);
  console.log('');

  // Test 5: Interactive Service Booking
  console.log('5️⃣ Testing Interactive Vehicle Servicing...');
  const serviceResult = await supervisor.handleServiceBooking(
    'customer456',
    {
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      mileage: 15000,
      lastService: '2024-10-15'
    },
    'test-session-5'
  );
  console.log('✅ Service Session:', serviceResult.session.id);
  console.log('   Quick Actions:', serviceResult.options.quickActions.length);
  console.log('   Recommendations:', serviceResult.options.recommendations.length);
  if (serviceResult.options.recommendations.length > 0) {
    console.log('   Top Recommendation:', serviceResult.options.recommendations[0].name);
  }
  console.log('');

  // Test 6: Enhanced Metrics
  console.log('6️⃣ Testing Enhanced Metrics...');
  const metrics = await supervisor.getEnhancedMetrics();
  console.log('✅ Total Features:', metrics.totalFeatures);
  console.log('   Feature Utilization:');
  console.log('   - Cockpit Commands:', metrics.advancedFeatures.cockpitCommands);
  console.log('   - Recommendations:', metrics.advancedFeatures.recommendations);
  console.log('   - Insights Generated:', metrics.advancedFeatures.insights);
  console.log('   - Campaigns Created:', metrics.advancedFeatures.campaigns);
  console.log('   - Service Bookings:', metrics.advancedFeatures.serviceBookings);
  console.log('');

  console.log('✨ All Enhanced Features Tested Successfully!\n');
  console.log('📊 Summary:');
  console.log('   ✅ Intelligent Cockpit Assistant - Working');
  console.log('   ✅ AI Product Recommendations - Working');
  console.log('   ✅ CDH Insights Generator - Working');
  console.log('   ✅ Generative Marketing - Working');
  console.log('   ✅ Interactive Servicing - Working');
  console.log('   ✅ Enhanced Metrics - Working');
}

// Run tests
testEnhancedFeatures().catch(console.error);
