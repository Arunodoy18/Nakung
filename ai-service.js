// ============================================================================
// NAKUNG AI SERVICE - Groq Backend Integration
// Calls: https://nakung-backend.vercel.app/api/chat
// ============================================================================

class AIService {
  constructor() {
    this.conversationHistory = [];
    this.maxHistoryLength = 10;
    this.backendUrl = CONFIG.BACKEND.url;
  }

  // Generate AI response by calling backend
  async generateResponse(userMessage, mode = 'partner', problemContext = null) {
    try {
      // Build messages array for backend
      const messages = this.buildMessages(userMessage, mode, problemContext);

      console.log('[AI Service] 🚀 Calling backend:', this.backendUrl);
      console.log('[AI Service] 📤 Messages:', messages);

      // Call backend API
      const response = await fetch(this.backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages }),
        signal: AbortSignal.timeout(CONFIG.BACKEND.timeout)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AI Service] ❌ Backend error:', response.status, errorText);
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[AI Service] ✅ Response received:', data);

      if (!data.success || !data.message) {
        throw new Error('Invalid response format from backend');
      }

      // Store in conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });
      this.conversationHistory.push({
        role: 'assistant',
        content: data.message
      });

      // Trim history if too long
      if (this.conversationHistory.length > this.maxHistoryLength * 2) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
      }

      return {
        success: true,
        text: data.message,
        model: data.model || 'llama-3.3-70b-versatile'
      };

    } catch (error) {
      console.error('[AI Service] ❌ Error:', error);
      return {
        success: false,
        error: error.message,
        text: this.getFallbackResponse(mode)
      };
    }
  }

  // Build messages array for backend API
  buildMessages(userMessage, mode, problemContext) {
    const messages = [];

    // Add system prompt based on mode
    const modeConfig = CONFIG.MODES[mode.toUpperCase()];
    if (modeConfig) {
      let systemPrompt = modeConfig.systemPrompt;
      
      // Add problem context if available
      if (problemContext) {
        systemPrompt += `\n\nCurrent Problem Context:
Problem: ${problemContext.title || 'Unknown'}
Platform: ${problemContext.platform || 'Unknown'}
Difficulty: ${problemContext.difficulty || 'Unknown'}`;
        
        if (problemContext.description) {
          // Truncate description to avoid token limits
          const descPreview = problemContext.description.substring(0, 500);
          systemPrompt += `\nDescription: ${descPreview}${problemContext.description.length > 500 ? '...' : ''}`;
        }
      }
      
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // Add recent conversation history (last 4 exchanges)
    const recentHistory = this.conversationHistory.slice(-8);
    messages.push(...recentHistory);

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }

  // Get fallback response if backend fails
  getFallbackResponse(mode) {
    const fallbacks = {
      partner: "I'm here to help! Could you tell me more about your approach to this problem? What algorithms or data structures are you considering?",
      reviewer: "Interesting. Can you walk me through your thought process? What's the time complexity of your current approach?"
    };
    return fallbacks[mode.toLowerCase()] || "Could you elaborate on that?";
  }

  // Clear conversation history (when switching problems or modes)
  clearHistory() {
    this.conversationHistory = [];
    console.log('[AI Service] 🧹 Conversation history cleared');
  }

  // Get conversation history for display
  getHistory() {
    return this.conversationHistory;
  }
}

// Create global instance
const aiService = new AIService();

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
