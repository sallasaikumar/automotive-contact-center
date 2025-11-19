class SentimentAnalysisAgent {
  constructor() {
    this.positiveWords = ['great', 'good', 'excellent', 'happy', 'satisfied', 'thank', 'thanks', 'perfect', 'wonderful', 'amazing', 'love', 'appreciate'];
    this.negativeWords = ['bad', 'poor', 'terrible', 'angry', 'frustrated', 'disappointed', 'unacceptable', 'horrible', 'worst', 'hate', 'waiting', 'weeks'];
    this.urgentWords = ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'serious', 'now', 'today', 'right away'];
  }

  async analyze(message) {
    const lowerMessage = message.toLowerCase();
    
    let positiveCount = 0;
    let negativeCount = 0;
    let urgentCount = 0;
    
    this.positiveWords.forEach(word => {
      if (lowerMessage.includes(word)) positiveCount++;
    });
    
    this.negativeWords.forEach(word => {
      if (lowerMessage.includes(word)) negativeCount++;
    });
    
    this.urgentWords.forEach(word => {
      if (lowerMessage.includes(word)) urgentCount++;
    });
    
    const score = (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1);
    const urgency = urgentCount > 0 ? 'high' : 'normal';
    
    return {
      score,
      sentiment: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral',
      urgency,
      confidence: Math.min((positiveCount + negativeCount) / 3, 1)
    };
  }
}

module.exports = { SentimentAnalysisAgent };
