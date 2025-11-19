const { TestRunner } = require('./test-runner');

async function runDemo() {
  console.log('\n🎬 AUTOMOTIVE INTELLIGENT CONTACT CENTER - LIVE DEMO\n');
  console.log('='.repeat(70));
  console.log('\nThis demo showcases the multi-agent AI system handling');
  console.log('various customer interactions in an automotive contact center.\n');
  console.log('='.repeat(70));
  
  const runner = new TestRunner();
  
  const demoMessages = [
    {
      title: '🔧 Service Appointment',
      message: 'I need to schedule an oil change for my Toyota Camry'
    },
    {
      title: '⚠️ Urgent Technical Issue',
      message: 'My check engine light is on and the car is making a strange noise - this is urgent!'
    },
    {
      title: '🚗 Sales Inquiry',
      message: 'I\'m interested in buying a new electric SUV. What do you have available?'
    },
    {
      title: '📋 Warranty Check',
      message: 'Is my transmission covered under warranty? My car has 40,000 miles.'
    },
    {
      title: '😤 Frustrated Customer',
      message: 'I\'ve been waiting 3 weeks for a part. This is unacceptable!'
    },
    {
      title: 'ℹ️ General Information',
      message: 'What are your service hours and location?'
    }
  ];
  
  for (const demo of demoMessages) {
    console.log(`\n\n${demo.title}`);
    console.log('-'.repeat(70));
    
    const response = await runner.runSingleTest(demo.message);
    
    console.log('\n💡 Agent Insights:');
    console.log(`   • Detected Intent: ${response.metadata.intent.toUpperCase()}`);
    console.log(`   • Routed To: ${response.metadata.route}`);
    console.log(`   • Sentiment Score: ${response.metadata.sentiment.toFixed(2)}`);
    console.log(`   • Processing Time: ${response.metadata.processingTime}ms`);
    
    if (response.metadata.quickActions && response.metadata.quickActions.length > 0) {
      console.log(`\n🎯 Quick Actions Available:`);
      response.metadata.quickActions.forEach(action => {
        console.log(`   • ${action.label}`);
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n\n' + '='.repeat(70));
  console.log('✅ DEMO COMPLETE');
  console.log('='.repeat(70));
  console.log('\n📊 System Capabilities Demonstrated:');
  console.log('   ✓ Multi-agent orchestration');
  console.log('   ✓ Intent classification');
  console.log('   ✓ Sentiment analysis');
  console.log('   ✓ Dynamic routing');
  console.log('   ✓ Knowledge retrieval');
  console.log('   ✓ Personalized responses');
  console.log('   ✓ Context awareness');
  console.log('   ✓ Quick action generation');
  
  console.log('\n🚀 To start the web interface:');
  console.log('   npm start');
  console.log('   Then open http://localhost:3000\n');
}

runDemo().catch(console.error);
