# Testing Guide

## Test Data Overview

### Sample Customers
The application includes 3 sample customer profiles with realistic data:

1. **John Smith** - Toyota Camry 2022
   - Regular maintenance customer
   - Active warranty
   - 15,420 miles

2. **Sarah Johnson** - Tesla Model 3 2023
   - Electric vehicle owner
   - Extended warranty
   - 8,500 miles

3. **Michael Chen** - Ford F-150 2021
   - Truck owner
   - Expired warranty
   - 32,500 miles

### Knowledge Base
Comprehensive knowledge base with 20+ articles covering:
- Service (oil change, maintenance, diagnostics, tires, brakes)
- Sales (models, financing, test drives, EVs, trade-ins)
- Warranty (coverage, extended plans, claims, roadside assistance)
- Technical (diagnostics, software updates, recalls, manuals)
- General (hours, locations, contact info)

### Test Scenarios
8 pre-configured test scenarios covering:
1. Routine service appointment
2. Urgent technical issue
3. New vehicle sales inquiry
4. Warranty questions
5. Frustrated customer (escalation)
6. General information requests
7. Electric vehicle interest
8. Maintenance due inquiry

## Running Tests

### Full Test Suite
```bash
npm test
```

This runs all 8 test scenarios and provides:
- Detailed conversation flow
- Agent metadata (intent, sentiment, routing)
- Processing times
- Pass/fail results
- Summary statistics

### Single Message Test
```bash
npm run test:single "My check engine light is on"
```

Test individual messages to see:
- Agent response
- Intent classification
- Sentiment analysis
- Routing decision
- Knowledge retrieval
- Personalization context

### Manual Testing via Web Interface
```bash
npm start
```

Then open http://localhost:3000

Try these test messages:
- "I need to schedule an oil change"
- "My check engine light is on and it's urgent"
- "What SUV models do you have?"
- "Is my transmission covered under warranty?"
- "What are your service hours?"
- "Tell me about electric vehicles"

## Expected Behavior

### Intent Classification
- **Service**: oil change, maintenance, repair, appointment
- **Sales**: buy, purchase, models, test drive
- **Warranty**: coverage, claim, warranty
- **Technical**: problem, diagnostic, check engine
- **General**: hours, location, contact

### Sentiment Analysis
- **Positive**: great, excellent, happy, satisfied
- **Negative**: bad, frustrated, angry, disappointed
- **Urgent**: urgent, emergency, asap, immediately

### Routing
- Service Department → service intent
- Sales Department → sales intent
- Warranty Department → warranty intent
- Technical Support → technical intent
- General Inquiry → general intent

### Personalization
- Customer greeting with name
- Vehicle information display
- Service history context
- Warranty status
- Maintenance recommendations

## Validation Checklist

Before deployment, verify:

- [ ] All 8 test scenarios pass
- [ ] Intent classification accuracy > 90%
- [ ] Sentiment detection working correctly
- [ ] Knowledge retrieval returns relevant articles
- [ ] Customer data loads properly
- [ ] Quick actions display correctly
- [ ] Suggestions update based on intent
- [ ] WebSocket connection stable
- [ ] Processing time < 500ms
- [ ] No console errors
- [ ] Responsive design works on mobile
- [ ] Agent insights panel updates correctly

## Performance Benchmarks

Target metrics:
- Response time: < 500ms
- Intent accuracy: > 90%
- Knowledge relevance: > 85%
- Customer satisfaction: > 4.5/5

## Troubleshooting

If tests fail:
1. Check data files exist in `/data` folder
2. Verify Node.js version (14+)
3. Ensure all dependencies installed (`npm install`)
4. Check console for error messages
5. Validate JSON syntax in data files
