const fs = require('fs');
const path = require('path');

class KnowledgeRetrievalAgent {
  constructor() {
    this.knowledgeBase = this.loadKnowledgeBase();
  }

  loadKnowledgeBase() {
    try {
      const dataPath = path.join(__dirname, '../data/knowledge-base.json');
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      return this.getDefaultKnowledgeBase();
    }
  }

  getDefaultKnowledgeBase() {
    return {
      service: [
        { topic: 'oil change', content: 'Oil changes are recommended every 5,000-7,500 miles depending on your vehicle model.' }
      ],
      sales: [
        { topic: 'models', content: 'We offer a wide range of models including sedans, SUVs, trucks, and electric vehicles.' }
      ],
      warranty: [
        { topic: 'coverage', content: 'Our standard warranty covers 3 years/36,000 miles bumper-to-bumper and 5 years/60,000 miles powertrain.' }
      ],
      technical: [
        { topic: 'diagnostics', content: 'Our certified technicians use advanced diagnostic tools to identify and resolve technical issues.' }
      ],
      general: [
        { topic: 'help', content: 'I\'m here to help you with service, sales, warranty, and technical questions.' }
      ]
    };
  }

  async retrieve(category, query) {
    const categoryKnowledge = this.knowledgeBase[category] || [];
    const lowerQuery = query.toLowerCase();
    
    // Score each knowledge item based on relevance
    const scoredKnowledge = categoryKnowledge.map(item => {
      let score = 0;
      const queryWords = lowerQuery.split(' ');
      
      // Check topic match
      if (lowerQuery.includes(item.topic.toLowerCase())) {
        score += 10;
      }
      
      // Check content match
      queryWords.forEach(word => {
        if (word.length > 3 && item.content.toLowerCase().includes(word)) {
          score += 2;
        }
      });
      
      // Check title match if exists
      if (item.title && lowerQuery.includes(item.title.toLowerCase())) {
        score += 5;
      }
      
      return { ...item, score };
    });
    
    // Sort by score and return top results
    const sortedKnowledge = scoredKnowledge
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    
    return sortedKnowledge.length > 0 ? sortedKnowledge.slice(0, 3) : categoryKnowledge.slice(0, 2);
  }
}

module.exports = { KnowledgeRetrievalAgent };
