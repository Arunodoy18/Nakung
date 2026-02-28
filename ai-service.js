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
    this.requestCount = 0;
    this.errorCount = 0;
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
  
  // ── Context window management ──
  // Intelligently trim conversation history to fit context window
  _optimizeHistory() {
    if (this.conversationHistory.length <= this.maxHistoryLength * 2) {
      return this.conversationHistory;
    }
    
    // Keep first message (often contains important context)
    // Keep recent messages (most relevant)
    // Summarize or skip middle messages
    const recentMessages = this.conversationHistory.slice(-this.maxHistoryLength);
    const firstFew = this.conversationHistory.slice(0, 2);
    
    return [...firstFew, ...recentMessages];
  }
  
  // ── Memory management ──
  // Periodically clear old history to prevent memory issues
  _cleanupHistory() {
    if (this.conversationHistory.length > 50) {
      console.log('[AI Service] 🧹 Cleaning up old history...');
      this.conversationHistory = this.conversationHistory.slice(-30);
    }
  }

  // Generate AI response by calling backend
  async generateResponse(userMessage, mode = 'partner', problemContext = null) {
    // Check offline
    if (!navigator.onLine) {
      this.isOffline = true;
      return {
        success: false,
        error: 'offline',
        text: "You appear to be offline. I'll be ready when your connection comes back!"
      };
    }

    this.isOffline = false;

    // Rate limit
    await this._waitForRateLimit();
    
    // Cleanup old history
    this._cleanupHistory();

    try {
      this.requestCount++;
      
      // Build messages array for backend
      const messages = this.buildMessages(userMessage, mode, problemContext);
      
      console.log('[AI Service] 📤 Messages:', messages.length, '| Backend:', this.backendUrl);
      console.log('[AI Service] 📊 Request #', this.requestCount, '| Errors:', this.errorCount);

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
        this.errorCount++;
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('[AI Service] ❌ Backend error:', response.status, errorText);
        throw new Error(`Backend error: ${response.status}`);
      }

      // Safe JSON parse
      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        this.errorCount++;
        console.error('[AI Service] ❌ JSON parse failed:', parseErr);
        throw new Error('Invalid response from backend');
      }

      if (!data.success || !data.message) {
        this.errorCount++;
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
        this.conversationHistory = this._optimizeHistory();
      }

      return {
        success: true,
        text: data.message,
        model: data.model || 'llama-3.3-70b-versatile'
      };

    } catch (error) {
      this.errorCount++;
      console.error('[AI Service] ❌ Error:', error.message);
      
      const isTimeout = error.name === 'AbortError';
      const isNetwork = error.message?.includes('fetch') || error.message?.includes('network');
      
      // Provide contextual error messages
      let errorText;
      if (isTimeout) {
        errorText = "The request took too long. The backend might be cold-starting — try again in a moment.";
      } else if (isNetwork) {
        errorText = "Can't reach the server. Check your internet connection and try again.";
      } else if (this.errorCount > 3) {
        errorText = "Multiple errors detected. Please check your connection and try reloading the extension.";
      } else {
        errorText = this.getFallbackResponse(mode);
      }
      
      return {
        success: false,
        error: error.message,
        text: errorText
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
          // Truncate description to avoid token limits (optimized)
          const descPreview = problemContext.description.substring(0, 600);
          systemPrompt += `\nDescription: ${descPreview}${problemContext.description.length > 600 ? '...' : ''}`;
          console.log('[AI Service] 📄 Description length:', problemContext.description.length, 'chars (truncated to 600)');
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

    // Add optimized conversation history (last 6 exchanges max)
    const optimizedHistory = this._optimizeHistory();
    const recentHistory = optimizedHistory.slice(-12); // Last 6 exchanges
    messages.push(...recentHistory);

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    console.log('[AI Service] 📊 Total messages in context:', messages.length);
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
