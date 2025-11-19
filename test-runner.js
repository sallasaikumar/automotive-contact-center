const fs = require('fs');
const path = require('path');
const { SupervisorAgent } = require('./agents/supervisor-agent');

class TestRunner {
  constructor() {
    this.supervisorAgent = new SupervisorAgent();
    this.testScenarios = this.loadTestScenarios();
    this.results = [];
  }

  loadTestScenarios() {
    try {
      const dataPath = path.join(__dirname, 'data/test-scenarios.json');
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading test scenarios:', error);
      return [];
    }
  }

  async runTests() {
    console.log('🚀 Starting Automotive Contact Center Test Suite\n');
    console.log('='.repeat(70));
    
    for (let i = 0; i < this.testScenarios.length; i++) {
      const scenario = this.testScenarios[i];
      console.log(`\n📋 Test ${i + 1}/${this.testScenarios.length}: ${scenario.scenario}`);
      console.log('-'.repeat(70));
      
      const sessionId = `test_session_${i}`;
      const scenarioResults = {
        scenario: scenario.scenario,
        passed: true,
        messages: []
      };
      
      for (const message of scenario.messages) {
        console.log(`\n👤 User: ${message}`);
        
        try {
          const response = await this.supervisorAgent.processMessage(message, sessionId);
          
          console.log(`🤖 Assistant: ${response.message}`);
          console.log(`\n📊 Metadata:`);
          console.log(`   Intent: ${response.metadata.intent}`);
          console.log(`   Sentiment: ${response.metadata.sentiment.toFixed(2)}`);
          console.log(`   Route: ${response.metadata.route}`);
          console.log(`   Processing Time: ${response.metadata.processingTime}ms`);
          
          scenarioResults.messages.push({
            userMessage: message,
            response: response.message,
            metadata: response.metadata
          });
          
          // Validate expectations
          if (scenario.expectedIntent && response.metadata.intent !== scenario.expectedIntent) {
            console.log(`   ⚠️  Expected intent: ${scenario.expectedIntent}, got: ${response.metadata.intent}`);
            scenarioResults.passed = false;
          }
          
          if (scenario.expectedRoute && response.metadata.route !== scenario.expectedRoute) {
            console.log(`   ⚠️  Expected route: ${scenario.expectedRoute}, got: ${response.metadata.route}`);
            scenarioResults.passed = false;
          }
          
        } catch (error) {
          console.error(`   ❌ Error: ${error.message}`);
          scenarioResults.passed = false;
        }
      }
      
      this.results.push(scenarioResults);
      console.log(`\n${scenarioResults.passed ? '✅ PASSED' : '❌ FAILED'}`);
    }
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('📈 TEST SUMMARY');
    console.log('='.repeat(70));
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    
    console.log(`\nTotal Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`   - ${r.scenario}`);
      });
    }
    
    console.log('\n' + '='.repeat(70));
  }

  async runSingleTest(message) {
    console.log('\n🧪 Single Message Test');
    console.log('='.repeat(70));
    console.log(`\n👤 User: ${message}`);
    
    const sessionId = 'single_test_session';
    const response = await this.supervisorAgent.processMessage(message, sessionId);
    
    console.log(`\n🤖 Assistant: ${response.message}`);
    console.log(`\n📊 Metadata:`);
    console.log(JSON.stringify(response.metadata, null, 2));
    
    return response;
  }
}

// Run tests if executed directly
if (require.main === module) {
  const runner = new TestRunner();
  
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Single test mode
    const message = args.join(' ');
    runner.runSingleTest(message).catch(console.error);
  } else {
    // Full test suite
    runner.runTests().catch(console.error);
  }
}

module.exports = { TestRunner };
