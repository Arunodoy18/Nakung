// ============================================================================
// NAKUNG UTILITIES - Enhanced Features
// ============================================================================

// ============================================================================
// CODE SYNTAX HIGHLIGHTING
// ============================================================================
class CodeHighlighter {
  static highlight(code, language = 'javascript') {
    // Simple syntax highlighting without external dependencies
    const keywords = /\b(function|const|let|var|if|else|for|while|return|class|import|export|async|await|try|catch|throw|new)\b/g;
    const strings = /(".*?"|'.*?'|`.*?`)/g;
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
    const numbers = /\b(\d+)\b/g;
    
    let highlighted = code
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(comments, '<span class="comment">$1</span>')
      .replace(strings, '<span class="string">$1</span>')
      .replace(keywords, '<span class="keyword">$1</span>')
      .replace(numbers, '<span class="number">$1</span>');
    
    return highlighted;
  }

  static wrapInCodeBlock(code, language = '') {
    const highlighted = this.highlight(code, language);
    return `<pre class="code-block"><code>${highlighted}</code><button class="copy-code-btn" title="Copy code">📋</button></pre>`;
  }

  static processMessage(text) {
    // Detect code blocks (```language\ncode\n```)
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    
    let processed = text;
    
    // Process code blocks
    processed = processed.replace(codeBlockRegex, (match, lang, code) => {
      return this.wrapInCodeBlock(code.trim(), lang);
    });
    
    // Process inline code
    processed = processed.replace(inlineCodeRegex, '<code class="inline-code">$1</code>');
    
    return processed;
  }
}

// ============================================================================
// RESPONSE CACHE
// ============================================================================
class ResponseCache {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  generateKey(message, problemId, mode) {
    // Simple hash function
    const str = `${message}-${problemId}-${mode}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  get(message, problemId, mode) {
    const key = this.generateKey(message, problemId, mode);
    const cached = this.cache.get(key);
    
    if (cached) {
      const age = Date.now() - cached.timestamp;
      // Cache valid for 1 hour
      if (age < 3600000) {
        console.log('[Cache] 🎯 Cache hit!');
        return cached.response;
      } else {
        this.cache.delete(key);
      }
    }
    return null;
  }

  set(message, problemId, mode, response) {
    const key = this.generateKey(message, problemId, mode);
    
    // Implement LRU - remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
    console.log('[Cache] 💾 Cached response');
  }

  clear() {
    this.cache.clear();
  }
}

// ============================================================================
// OFFLINE MESSAGE QUEUE
// ============================================================================
class OfflineQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  async add(message, metadata) {
    this.queue.push({ message, metadata, timestamp: Date.now() });
    await this.saveToStorage();
    console.log('[Queue] 📥 Message queued, total:', this.queue.length);
  }

  async process(callback) {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    console.log('[Queue] 🔄 Processing queue...', this.queue.length, 'messages');
    
    while (this.queue.length > 0 && navigator.onLine) {
      const item = this.queue.shift();
      try {
        await callback(item.message, item.metadata);
        await this.saveToStorage();
      } catch (error) {
        // Re-queue on failure
        this.queue.unshift(item);
        await this.saveToStorage();
        break;
      }
    }
    
    this.isProcessing = false;
    
    if (this.queue.length === 0) {
      console.log('[Queue] ✅ Queue processed');
    }
  }

  async saveToStorage() {
    try {
      await chrome.storage.local.set({ offlineQueue: this.queue });
    } catch (e) {
      console.error('[Queue] Failed to save:', e);
    }
  }

  async loadFromStorage() {
    try {
      const result = await chrome.storage.local.get('offlineQueue');
      if (result.offlineQueue) {
        this.queue = result.offlineQueue;
        console.log('[Queue] 📤 Loaded', this.queue.length, 'queued messages');
      }
    } catch (e) {
      console.error('[Queue] Failed to load:', e);
    }
  }

  getSize() {
    return this.queue.length;
  }

  clear() {
    this.queue = [];
    this.saveToStorage();
  }
}

// ============================================================================
// LOCAL STATISTICS TRACKER
// ============================================================================
class StatisticsTracker {
  constructor() {
    this.stats = {
      totalProblems: 0,
      totalMessages: 0,
      totalHints: 0,
      sessionTime: 0,
      modeUsage: { partner: 0, reviewer: 0 },
      platformUsage: {},
      difficultyUsage: { easy: 0, medium: 0, hard: 0 },
      lastUpdated: Date.now()
    };
  }

  async load() {
    try {
      const result = await chrome.storage.local.get('userStats');
      if (result.userStats) {
        this.stats = { ...this.stats, ...result.userStats };
      }
    } catch (e) {
      console.error('[Stats] Failed to load:', e);
    }
  }

  async save() {
    try {
      this.stats.lastUpdated = Date.now();
      await chrome.storage.local.set({ userStats: this.stats });
    } catch (e) {
      console.error('[Stats] Failed to save:', e);
    }
  }

  trackProblem(platform, difficulty) {
    this.stats.totalProblems++;
    this.stats.platformUsage[platform] = (this.stats.platformUsage[platform] || 0) + 1;
    if (difficulty) {
      const diff = difficulty.toLowerCase();
      this.stats.difficultyUsage[diff] = (this.stats.difficultyUsage[diff] || 0) + 1;
    }
    this.save();
  }

  trackMessage(isHint = false) {
    this.stats.totalMessages++;
    if (isHint) this.stats.totalHints++;
    this.save();
  }

  trackMode(mode) {
    if (mode === 'partner' || mode === 'reviewer') {
      this.stats.modeUsage[mode]++;
      this.save();
    }
  }

  trackSessionTime(seconds) {
    this.stats.sessionTime += seconds;
    this.save();
  }

  getStats() {
    return { ...this.stats };
  }

  async reset() {
    this.stats = {
      totalProblems: 0,
      totalMessages: 0,
      totalHints: 0,
      sessionTime: 0,
      modeUsage: { partner: 0, reviewer: 0 },
      platformUsage: {},
      difficultyUsage: { easy: 0, medium: 0, hard: 0 },
      lastUpdated: Date.now()
    };
    await this.save();
  }
}

// ============================================================================
// EXPONENTIAL BACKOFF RETRY
// ============================================================================
class ExponentialBackoff {
  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }

  async execute(fn, retryCount = 0) {
    try {
      return await fn();
    } catch (error) {
      if (retryCount >= this.maxRetries) {
        throw error;
      }

      const delay = this.baseDelay * Math.pow(2, retryCount);
      const jitter = Math.random() * 200; // Add jitter to prevent thundering herd
      const totalDelay = delay + jitter;

      console.log(`[Backoff] Retry ${retryCount + 1}/${this.maxRetries} in ${Math.round(totalDelay)}ms`);
      
      await new Promise(resolve => setTimeout(resolve, totalDelay));
      return this.execute(fn, retryCount + 1);
    }
  }
}

// ============================================================================
// KEYBOARD SHORTCUTS MANAGER
// ============================================================================
class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.enabled = true;
  }

  register(key, callback, options = {}) {
    const { ctrl = false, alt = false, shift = false } = options;
    const shortcutKey = `${ctrl ? 'Ctrl+' : ''}${alt ? 'Alt+' : ''}${shift ? 'Shift+' : ''}${key}`;
    this.shortcuts.set(shortcutKey, { callback, ctrl, alt, shift, key: key.toLowerCase() });
  }

  handleKeyDown(event) {
    if (!this.enabled) return;

    const key = event.key.toLowerCase();
    const shortcutKey = `${event.ctrlKey ? 'Ctrl+' : ''}${event.altKey ? 'Alt+' : ''}${event.shiftKey ? 'Shift+' : ''}${key}`;

    const shortcut = this.shortcuts.get(shortcutKey);
    if (shortcut) {
      event.preventDefault();
      shortcut.callback(event);
    }
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }
}

// ============================================================================
// CHAT EXPORT
// ============================================================================
class ChatExporter {
  static exportAsMarkdown(chatHistory, problemInfo, mode) {
    let markdown = `# Nakung AI Chat Export\n\n`;
    markdown += `**Date:** ${new Date().toLocaleString()}\n`;
    markdown += `**Problem:** ${problemInfo?.title || 'Unknown'}\n`;
    markdown += `**Platform:** ${problemInfo?.platform || 'Unknown'}\n`;
    markdown += `**Difficulty:** ${problemInfo?.difficulty || 'Unknown'}\n`;
    markdown += `**Mode:** ${mode === 'partner' ? '🤝 Partner' : '🎯 Reviewer'}\n\n`;
    markdown += `---\n\n`;

    chatHistory.forEach((msg, i) => {
      const role = msg.role === 'user' ? '**You**' : `**${mode === 'partner' ? 'Partner' : 'Reviewer'}**`;
      markdown += `### ${role}\n\n${msg.content}\n\n`;
    });

    return markdown;
  }

  static exportAsJSON(chatHistory, problemInfo, mode) {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      problem: problemInfo,
      mode,
      messages: chatHistory
    }, null, 2);
  }

  static download(content, filename, type = 'text/markdown') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// ============================================================================
// MESSAGE FORMATTER
// ============================================================================
class MessageFormatter {
  static formatWithTimestamp(content, timestamp = Date.now()) {
    const date = new Date(timestamp);
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return { content, timestamp: timeStr };
  }

  static enhanceMessage(text) {
    let enhanced = text;
    
    // Process code blocks
    enhanced = CodeHighlighter.processMessage(enhanced);
    
    // Convert URLs to links
    enhanced = enhanced.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener">$1</a>'
    );
    
    // Bold text **text**
    enhanced = enhanced.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text *text*
    enhanced = enhanced.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Preserve line breaks
    enhanced = enhanced.replace(/\n/g, '<br>');
    
    return enhanced;
  }
}

// ============================================================================
// GLOBAL INSTANCES
// ============================================================================
const codeHighlighter = new CodeHighlighter();
const responseCache = new ResponseCache();
const offlineQueue = new OfflineQueue();
const statsTracker = new StatisticsTracker();
const keyboardShortcuts = new KeyboardShortcuts();
const exponentialBackoff = new ExponentialBackoff();
