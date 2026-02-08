// AI Service for Hugging Face API integration
class AIService {
  constructor() {
    this.apiKey = null;
    this.conversationHistory = [];
    this.maxHistoryLength = 10;
    this.isInitialized = false;
  }

  // Initialize with API key
  async initialize() {
    try {
      const settings = await storageManager.getSettings();
      this.apiKey = settings.apiKey;
      this.isInitialized = !!this.apiKey;
      return this.isInitialized;
    } catch (error) {
      console.error('Error initializing AI service:', error);
      return false;
    }
  }

  // Check if API key is configured
  hasApiKey() {
    return this.isInitialized && !!this.apiKey;
  }

  // Generate response using Hugging Face
  async generateResponse(userMessage, context = 'reviewer') {
    if (!this.hasApiKey()) {
      return {
        success: false,
        error: 'API key not configured. Please add your Hugging Face API key in settings.',
        useFallback: true
      };
    }

    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Build prompt with context
      const prompt = this.buildPrompt(userMessage, context);

      // Call Hugging Face API
      const response = await this.callHuggingFaceAPI(prompt);

      if (response.success) {
        // Add assistant response to history
        this.conversationHistory.push({
          role: 'assistant',
          content: response.text
        });

        // Trim history if too long
        if (this.conversationHistory.length > this.maxHistoryLength * 2) {
          this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
        }

        return {
          success: true,
          text: response.text
        };
      } else {
        return {
          success: false,
          error: response.error,
          useFallback: true
        };
      }
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        success: false,
        error: error.message,
        useFallback: true
      };
    }
  }

  // Build prompt based on context
  buildPrompt(userMessage, context) {
    let systemPrompt = '';

    if (context === 'reviewer') {
      systemPrompt = `You are a technical interviewer conducting a coding interview. 
Ask insightful follow-up questions about algorithms, time complexity, space complexity, 
and optimization. Be encouraging but thorough. Keep responses concise (2-3 sentences).

Previous conversation:
${this.getRecentHistory()}

User's response: ${userMessage}

Your question as interviewer:`;
    } else if (context === 'partner') {
      systemPrompt = `You are a helpful coding mentor providing hints for problem-solving. 
Give strategic hints without revealing the full solution. Focus on patterns, 
data structures, and problem-solving approaches. Keep it brief (1-2 sentences).

User's question: ${userMessage}

Your hint:`;
    }

    return systemPrompt;
  }

  // Get recent conversation history
  getRecentHistory() {
    return this.conversationHistory
      .slice(-6) // Last 3 exchanges
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  // Call Hugging Face API with retry logic
  async callHuggingFaceAPI(prompt, retries = 0) {
    try {
      const response = await fetch(CONFIG.AI_API.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true
          }
        })
      });

      if (!response.ok) {
        if (response.status === 503 && retries < CONFIG.AI_API.maxRetries) {
          // Model is loading, retry after delay
          await this.sleep(2000 * (retries + 1));
          return this.callHuggingFaceAPI(prompt, retries + 1);
        }
        
        const error = await response.text();
        throw new Error(`API Error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      
      // Extract generated text
      let text = '';
      if (Array.isArray(data) && data.length > 0) {
        text = data[0].generated_text || data[0].text || '';
      } else if (data.generated_text) {
        text = data.generated_text;
      }

      // Clean up the response
      text = this.cleanResponse(text, prompt);

      return {
        success: true,
        text: text || 'Could you elaborate on that?'
      };
    } catch (error) {
      console.error('Hugging Face API error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clean AI response
  cleanResponse(text, prompt) {
    // Remove the original prompt from response
    if (text.includes(prompt)) {
      text = text.replace(prompt, '').trim();
    }

    // Remove any "assistant:" or similar prefixes
    text = text.replace(/^(assistant|interviewer|mentor):\s*/i, '');

    // Limit length
    const sentences = text.split(/[.!?]+/);
    if (sentences.length > 3) {
      text = sentences.slice(0, 3).join('. ') + '.';
    }

    return text.trim();
  }

  // Helper to sleep
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Reset conversation
  resetConversation() {
    this.conversationHistory = [];
  }

  // Get fallback response (when API fails)
  getFallbackResponse(context = 'reviewer') {
    if (context === 'reviewer') {
      const fallbacks = [
        "That's interesting! Can you walk me through your thought process?",
        "Good start. What about the edge cases?",
        "How would you optimize that approach?",
        "Can you analyze the time complexity?",
        "What data structure would work best here?",
        "Excellent! Now, how would you test this?",
        "Think about the trade-offs in your solution.",
        "Could you explain with a specific example?"
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    } else {
      const fallbacks = [
        "Consider using a hash map for O(1) lookups.",
        "Think about the two-pointer technique.",
        "Have you considered dynamic programming?",
        "Draw out a few examples to find patterns.",
        "What's the brute force? Start there.",
        "Consider sorting the input first.",
        "Think about time vs space trade-offs."
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  }
}

// Create global instance
const aiService = new AIService();
