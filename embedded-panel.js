// Nakung Embedded Panel - Main Content Script
// This script injects the AI assistant panel into coding platform pages

class NakungPanel {
  constructor() {
    this.panel = null;
    this.toggleBtn = null;
    this.isOpen = false;
    this.currentMode = null; // 'partner' or 'reviewer'
    this.messages = [];
    this.problemInfo = null;
    this.platformInfo = null;
    this.conversationStarted = false;
    
    // AI response state
    this.isWaitingForResponse = false;
    
    this.init();
  }
  
  async init() {
    // Detect platform
    this.platformInfo = PlatformDetector.detect();
    
    if (!this.platformInfo.isProblemPage) {
      console.log('Nakung: Not a problem page, skipping injection');
      return;
    }
    
    console.log('Nakung: Detected platform:', this.platformInfo.name);
    
    // Extract problem information
    this.problemInfo = await ProblemExtractor.extractProblemInfo(this.platformInfo);
    
    if (!this.problemInfo) {
      console.error('Nakung: Failed to extract problem information');
      return;
    }
    
    console.log('Nakung: Extracted problem:', this.problemInfo.title);
    
    // Inject the panel UI
    this.injectPanel();
    
    // Auto-open after a short delay
    setTimeout(() => {
      this.openPanel();
    }, 1500);
  }
  
  injectPanel() {
    // Check if already injected
    if (document.getElementById('nakung-panel')) {
      return;
    }
    
    // Create toggle button
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.id = 'nakung-toggle-btn';
    this.toggleBtn.innerHTML = '🚀 AI';
    this.toggleBtn.addEventListener('click', () => this.togglePanel());
    document.body.appendChild(this.toggleBtn);
    
    // Create panel container
    this.panel = document.createElement('div');
    this.panel.id = 'nakung-panel';
    this.panel.className = 'closed';
    
    // Build panel HTML
    this.panel.innerHTML = this.getPanelHTML();
    document.body.appendChild(this.panel);
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Load theme preference
    this.loadTheme();
  }
  
  getPanelHTML() {
    return `
      <!-- Header -->
      <div class="nakung-header">
        <div class="nakung-header-title">
          <span class="nakung-header-logo">🚀</span>
          <span>Nakung AI</span>
        </div>
        <div class="nakung-header-actions">
          <button class="nakung-header-btn" id="nakung-theme-toggle" title="Toggle Theme">
            🌙
          </button>
          <button class="nakung-header-btn" id="nakung-settings-btn" title="Settings">
            ⚙️
          </button>
        </div>
      </div>
      
      <!-- Problem Info Banner -->
      <div class="nakung-problem-banner">
        <div class="nakung-problem-title">
          ${this.problemInfo?.title || 'Loading problem...'}
          ${this.problemInfo?.difficulty ? `<span class="nakung-difficulty-badge difficulty-${this.problemInfo.difficulty.toLowerCase()}">${this.problemInfo.difficulty}</span>` : ''}
        </div>
        <div class="nakung-problem-platform">
          📍 ${this.problemInfo?.platform || 'LeetCode'}
        </div>
      </div>
      
      <!-- Mode Selector -->
      <div class="nakung-mode-selector">
        <div class="nakung-mode-label">Choose Your Mode</div>
        <div class="nakung-mode-buttons">
          <button class="nakung-mode-btn" data-mode="partner">
            🤝 Partner
          </button>
          <button class="nakung-mode-btn" data-mode="reviewer">
            🎯 Reviewer
          </button>
        </div>
      </div>
      
      <!-- Chat Container -->
      <div class="nakung-chat-container" id="nakung-chat">
        ${this.getWelcomeHTML()}
      </div>
      
      <!-- Input Area -->
      <div class="nakung-input-area">
        <div class="nakung-input-wrapper">
          <textarea 
            class="nakung-input" 
            id="nakung-input" 
            placeholder="Type your message..." 
            rows="1"
          ></textarea>
          <button class="nakung-send-btn" id="nakung-send-btn">
            ➤
          </button>
        </div>
      </div>
    `;
  }
  
  getWelcomeHTML() {
    return `
      <div class="nakung-welcome fade-in">
        <div class="nakung-welcome-icon">👋</div>
        <h2 class="nakung-welcome-title">Hey! Ready to solve this problem?</h2>
        <p class="nakung-welcome-text">
          Choose a mode to get started. I'm here to help you think through the problem step by step!
        </p>
        <div class="nakung-welcome-features">
          <div class="nakung-feature">
            <div class="nakung-feature-icon">🤝</div>
            <div class="nakung-feature-text">
              <strong>Partner Mode:</strong> Friendly mentor giving hints and guidance
            </div>
          </div>
          <div class="nakung-feature">
            <div class="nakung-feature-icon">🎯</div>
            <div class="nakung-feature-text">
              <strong>Reviewer Mode:</strong> Interview-style code review and questions
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  setupEventListeners() {
    // Mode selection
    const modeButtons = this.panel.querySelectorAll('.nakung-mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        this.selectMode(mode);
      });
    });
    
    // Send message
    const sendBtn = this.panel.querySelector('#nakung-send-btn');
    const input = this.panel.querySelector('#nakung-input');
    
    sendBtn.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Auto-resize textarea
    input.addEventListener('input', (e) => {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    });
    
    // Theme toggle
    const themeToggle = this.panel.querySelector('#nakung-theme-toggle');
    themeToggle.addEventListener('click', () => this.toggleTheme());
    
    // Settings
    const settingsBtn = this.panel.querySelector('#nakung-settings-btn');
    settingsBtn.addEventListener('click', () => this.openSettings());
  }
  
  async selectMode(mode) {
    this.currentMode = mode;
    
    // Update UI
    const modeButtons = this.panel.querySelectorAll('.nakung-mode-btn');
    modeButtons.forEach(btn => {
      if (btn.dataset.mode === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Clear chat and start conversation
    const chatContainer = this.panel.querySelector('#nakung-chat');
    chatContainer.innerHTML = '';
    this.messages = [];
    this.conversationStarted = true;
    
    // Send initial greeting
    await this.startConversation(mode);
  }
  
  async startConversation(mode) {
    if (mode === 'partner') {
      this.addMessage('assistant', `Hey! I'm your coding partner for "${this.problemInfo?.title || 'this problem'}". 👋

I've read through the problem and I'm here to help you think through it systematically. I'll guide you with hints and questions, but I won't give you the direct solution - that's for you to discover! 💪

Ready to get started? Tell me - have you read and understood the problem statement yet?`);
    } else if (mode === 'reviewer') {
      this.addMessage('assistant', `Hello! I'm your technical interviewer for "${this.problemInfo?.title || 'this problem'}". 🎯

Think of this as a real coding interview. I'll ask you questions about your approach, discuss complexity, and review your thinking process - just like a FAANG interview.

Let's begin: Can you first explain the problem back to me in your own words? What are we trying to solve here?`);
    }
  }
  
  async sendMessage() {
    const input = this.panel.querySelector('#nakung-input');
    const message = input.value.trim();
    
    if (!message || this.isWaitingForResponse) return;
    
    if (!this.currentMode) {
      this.showError('Please select a mode first (Partner or Reviewer)');
      return;
    }
    
    // Add user message
    this.addMessage('user', message);
    input.value = '';
    input.style.height = 'auto';
    
    // Show typing indicator
    this.showTypingIndicator();
    this.isWaitingForResponse = true;
    
    // Get AI response
    try {
      const response = await this.getAIResponse(message);
      this.removeTypingIndicator();
      this.addMessage('assistant', response);
    } catch (error) {
      this.removeTypingIndicator();
      const errorMsg = error.message || error.toString();
      this.showError(`Error: ${errorMsg}\n\nCheck console (F12) for details.`);
      console.error('[Nakung Panel] ❌ Full error:', error);
      console.error('[Nakung Panel] ❌ Error stack:', error.stack);
    } finally {
      this.isWaitingForResponse = false;
    }
  }
  
  async getAIResponse(userMessage) {
    console.log('[Nakung Panel] 📤 Sending AI request...');
    
    // Build conversation history
    const history = this.messages
      .filter(m => m.role !== 'typing')
      .slice(-10)
      .map(m => ({
        role: m.role,
        content: m.content
     }));
    
    // Send request to background script
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'AI_REQUEST',
        payload: {
          message: userMessage,
          context: {
            mode: this.currentMode,
            problem: {
              title: this.problemInfo?.title || 'Unknown',
              difficulty: this.problemInfo?.difficulty || 'Medium',
              description: this.problemInfo?.description || ''
            },
            history: history
          }
        }
      });
      
      console.log('[Nakung Panel] 📥 Response:', response);
      
      if (response && response.success && response.message) {
        return response.message;
      } else {
        throw new Error(response?.error || 'No response from AI');
      }
    } catch (error) {
      console.error('[Nakung Panel] ❌ AI request failed:', error);
      throw error;
    }
  }
  
  // DEPRECATED: This method is no longer used. All AI responses go through backend.
  // Kept for backwards compatibility only.
  getFallbackResponse(userMessage) {
    console.warn('[Nakung Panel] ⚠️ getFallbackResponse called - this should not happen!');
    const lowerMessage = userMessage.toLowerCase();
    
    if (this.currentMode === 'partner') {
      if (lowerMessage.includes('hint') || lowerMessage.includes('stuck')) {
        return `Let's think about this together! 🤔

Start by considering:
1. What data structure would help you track the information you need?
2. What's the brute force approach, even if it's not optimal?
3. Can you walk through a simple example manually?

Tell me what you're thinking and we'll work through it!`;
      }
      
      if (lowerMessage.includes('approach') || lowerMessage.includes('solution')) {
        return `Great question! Instead of telling you the solution, let me guide you:

🔍 **Think about:**
- What information do you need to keep track of?
- Have you seen similar problems before?
- What are the constraints telling you about time complexity?

Share your thought process with me - even half-formed ideas are good! We'll refine them together.`;
      }
      
      return `That's interesting! Let me ask you this to help you think deeper:

- Have you considered all the edge cases?
- What's the bottleneck in your current approach?
- Can we optimize this further?

Keep going - you're on the right track! 🚀`;
    }
    
    // Reviewer mode
    if (lowerMessage.includes('o(') || lowerMessage.includes('complexity')) {
      return `Good! You're thinking about complexity. Let me dig deeper:

1. Walk me through your time complexity analysis step by step
2. What's the space complexity?
3. Is this optimal given the constraints?

Also - how would your solution handle edge cases like empty input or single elements?`;
    }
    
    if (lowerMessage.includes('approach') || lowerMessage.includes('algorithm')) {
      return `Okay, I see your approach. Let me ask you some interview questions:

1. Why did you choose this particular approach?
2. What's the time and space complexity?
3.Can you think of any alternative approaches?
4. How would you handle these edge cases: empty input, duplicates, maximum constraints?

Walk me through your reasoning.`;
    }
    
    return `Interesting. Let me challenge you with a few more questions:

- What happens at the boundaries of your algorithm?
- Have you considered all edge cases?
- Can you trace through your logic with a specific example?
- Is there a more optimal solution?

Remember - in interviews, explaining your thought process is just as important as the solution itself. Keep thinking out loud! 🎯`;
  }
  
  addMessage(role, text) {
    const chatContainer = this.panel.querySelector('#nakung-chat');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `nakung-message ${role}`;
    
    const avatar = role === 'assistant' ? '🤖' : '👤';
    const name = role === 'assistant' ? 'Nakung AI' : 'You';
    
    messageDiv.innerHTML = `
      <div class="nakung-message-avatar">${avatar}</div>
      <div class="nakung-message-content">
        <div class="nakung-message-header">${name}</div>
        <div class="nakung-message-text">${this.formatMessage(text)}</div>
        <div class="nakung-message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
      </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Store message
    this.messages.push({ role, text, timestamp: Date.now() });
    
    // Save to storage
    this.saveConversation();
  }
  
  formatMessage(text) {
    // Convert markdown-like formatting to HTML
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    text = text.replace(/\n/g, '<br>');
    return text;
  }
  
  showTypingIndicator() {
    const chatContainer = this.panel.querySelector('#nakung-chat');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'nakung-message assistant';
    typingDiv.id = 'nakung-typing-indicator';
    typingDiv.innerHTML = `
      <div class="nakung-message-avatar">🤖</div>
      <div class="nakung-message-content">
        <div class="nakung-message-header">Nakung AI</div>
        <div class="nakung-message-text">
          <div class="nakung-typing">
            <div class="nakung-typing-dot"></div>
            <div class="nakung-typing-dot"></div>
            <div class="nakung-typing-dot"></div>
          </div>
        </div>
      </div>
    `;
    
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  
  removeTypingIndicator() {
    const typingIndicator = this.panel.querySelector('#nakung-typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  showError(message) {
    const chatContainer = this.panel.querySelector('#nakung-chat');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'nakung-error fade-in';
    errorDiv.textContent = message;
    chatContainer.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
  
  togglePanel() {
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }
  
  openPanel() {
    this.isOpen = true;
    this.panel.classList.remove('closed');
    this.panel.classList.add('open');
    this.toggleBtn.classList.add('panel-open');
  }
  
  closePanel() {
    this.isOpen = false;
    this.panel.classList.remove('open');
    this.panel.classList.add('closed');
    this.toggleBtn.classList.remove('panel-open');
  }
  
  toggleTheme() {
    this.panel.classList.toggle('dark-theme');
    const isDark = this.panel.classList.contains('dark-theme');
    
    const themeToggle = this.panel.querySelector('#nakung-theme-toggle');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    
    // Save preference
    chrome.storage.local.set({ 'nakung-theme': isDark ? 'dark' : 'light' });
  }
  
  loadTheme() {
    chrome.storage.local.get(['nakung-theme'], (result) => {
      if (result['nakung-theme'] === 'dark') {
        this.panel.classList.add('dark-theme');
        const themeToggle = this.panel.querySelector('#nakung-theme-toggle');
        if (themeToggle) {
          themeToggle.textContent = '☀️';
        }
      }
    });
  }
  
  openSettings() {
    // Open settings in a new tab
    chrome.runtime.sendMessage({ type: 'OPEN_SETTINGS' });
  }
  
  async saveConversation() {
    if (!this.problemInfo) return;
    
    try {
      const key = `conversation-${this.problemInfo.id}`;
      await chrome.storage.local.set({
        [key]: {
          problemInfo: this.problemInfo,
          mode: this.currentMode,
          messages: this.messages,
          lastUpdated: Date.now()
        }
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new NakungPanel();
  });
} else {
  new NakungPanel();
}
