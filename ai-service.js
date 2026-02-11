// ============================================================================
// NAKUNG AI SERVICE - Groq Backend Integration
// Calls: https://nakung-backend.vercel.app/api/chat
// ============================================================================

class AIService {
  constructor() {
    this.conversationHistory = [];
    this.maxHistoryLength = 10;
    this.backendUrl = CONFIG.BACKEND.url;
    this.lastRequestTime = 0;
    this.isOffline = false;
  }

  // ── Micro delay for human-like pacing ──
  // Short replies feel instant; complex ones get a natural brief pause
  _humanDelay(responseLength) {
    if (responseLength > 400) return 300; // Complex reply — tiny pause
    if (responseLength > 200) return 150;
    return 50; // Short reply — near-instant
  }

  // ── Rate limiter ──
  async _waitForRateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    const cooldown = CONFIG.BACKEND.rateLimitCooldown || 3000;
    if (elapsed < cooldown) {
      await new Promise(r => setTimeout(r, cooldown - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  // Generate AI response by calling backend
  async generateResponse(userMessage, mode = 'partner', problemContext = null) {
    // Check offline
    if (!navigator.onLine) {
      return {
        success: false,
        error: 'offline',
        text: "You appear to be offline. I'll be ready when your connection comes back!"
      };
    }

    // Rate limit
    await this._waitForRateLimit();

    try {
      // Build messages array for backend
      const messages = this.buildMessages(userMessage, mode, problemContext);
      
      console.log('[AI Service] 📤 Messages:', messages.length, '| Backend:', this.backendUrl);

      // Call backend API with safe timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.BACKEND.timeout);

      const response = await fetch(this.backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        return {
          success: false,
          error: 'rate_limit',
          text: "We're getting a lot of requests right now. Try again in a few seconds."
        };
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('[AI Service] ❌ Backend error:', response.status, errorText);
        throw new Error(`Backend error: ${response.status}`);
      }

      // Safe JSON parse
      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error('[AI Service] ❌ JSON parse failed:', parseErr);
        throw new Error('Invalid response from backend');
      }

      if (!data.success || !data.message) {
        throw new Error('Invalid response format from backend');
      }

      // Human-like micro delay — complex replies feel natural
      const delay = this._humanDelay(data.message.length);
      if (delay > 50) {
        await new Promise(r => setTimeout(r, delay));
      }

      // Store in conversation history
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: data.message }
      );

      // Trim history — keep recent context with memory weighting
      if (this.conversationHistory.length > this.maxHistoryLength * 2) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
      }

      return {
        success: true,
        text: data.message,
        model: data.model || 'llama-3.3-70b-versatile'
      };

    } catch (error) {
      console.error('[AI Service] ❌ Error:', error.message);
      
      const isTimeout = error.name === 'AbortError';
      const isNetwork = error.message?.includes('fetch') || error.message?.includes('network');
      
      return {
        success: false,
        error: error.message,
        text: isTimeout 
          ? "The request took too long. The backend might be cold-starting — try again in a moment."
          : isNetwork
          ? "Can't reach the server. Check your internet connection and try again."
          : this.getFallbackResponse(mode)
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
        console.log('[AI Service] 📝 Adding problem context to system prompt...');
        systemPrompt += `\n\n=== CURRENT PROBLEM CONTEXT ===\nProblem Title: ${problemContext.title || 'Unknown'}\nPlatform: ${problemContext.platform || 'Unknown'}\nDifficulty: ${problemContext.difficulty || 'Unknown'}`;
        
        if (problemContext.description) {
          // Truncate description to avoid token limits
          const descPreview = problemContext.description.substring(0, 800);
          systemPrompt += `\nDescription: ${descPreview}${problemContext.description.length > 800 ? '...' : ''}`;
          console.log('[AI Service] 📄 Description length:', problemContext.description.length, 'chars (truncated to 800)');
        } else {
          console.log('[AI Service] ⚠️ No description in problem context');
        }
        systemPrompt += '\n================================';
      } else {
        console.warn('[AI Service] ⚠️ No problem context provided!');
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
  }

  // Get conversation history for display
  getHistory() {
    return this.conversationHistory;
  }
}

// Create global instance
const aiService = new AIService();
