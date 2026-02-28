// ============================================================================
// NAKUNG POPUP - Main Chat Interface  
// Backend: https://nakung-backend.vercel.app/api/chat
// ============================================================================

// Helper: check if extension context is still valid
function isContextValid() {
  try {
    return !!(chrome && chrome.runtime && chrome.runtime.id);
  } catch (e) {
    return false;
  }
}

// Global state  
let currentProblem = null;
let currentMode = null;
let chatHistory = [];
let isWaitingForResponse = false;
let messageCount = 0; // Track for reward feedback
let _isRestoringState = false; // Prevents flash during restore
let sessionStartTime = Date.now();

// DOM elements
let initialView, chatView, loadingScreen;
let partnerBtn, reviewerBtn, backBtn, sendBtn, clearBtn, exportBtn, statsBtn;
let chatMessages, userInput;
let problemTitleDisplay, problemDifficultyDisplay, problemPlatformDisplay;
let offlineIndicator, queueCount, statsModal, closeStatsBtn;

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    console.log('[Nakung Popup] 🚀 Initializing popup...');
    
    // Get DOM elements
    initialView = document.getElementById('initialView');
    chatView = document.getElementById('chatView');
    loadingScreen = document.getElementById('loadingScreen');
    
    partnerBtn = document.getElementById('partnerBtn');
    reviewerBtn = document.getElementById('reviewerBtn');
    backBtn = document.getElementById('backBtn');
    sendBtn = document.getElementById('sendBtn');
    clearBtn = document.getElementById('clearBtn');
    exportBtn = document.getElementById('exportBtn');
    statsBtn = document.getElementById('statsBtn');
    
    chatMessages = document.getElementById('chatMessages');
    userInput = document.getElementById('userInput');
    
    problemTitleDisplay = document.getElementById('problemTitleDisplay');
    problemDifficultyDisplay = document.getElementById('problemDifficultyDisplay');
    problemPlatformDisplay = document.getElementById('problemPlatformDisplay');
    
    offlineIndicator = document.getElementById('offlineIndicator');
    queueCount = document.getElementById('queueCount');
    statsModal = document.getElementById('statsModal');
    closeStatsBtn = document.getElementById('closeStatsBtn');
    
    // Set up event listeners
    if (partnerBtn) partnerBtn.addEventListener('click', () => selectMode('partner'));
    if (reviewerBtn) reviewerBtn.addEventListener('click', () => selectMode('reviewer'));
    if (backBtn) backBtn.addEventListener('click', backToModeSelection);
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (clearBtn) clearBtn.addEventListener('click', confirmClearChat);
    if (exportBtn) exportBtn.addEventListener('click', exportChat);
    if (statsBtn) statsBtn.addEventListener('click', showStatistics);
    if (closeStatsBtn) closeStatsBtn.addEventListener('click', hideStatistics);
    
    if (userInput) {
      userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
      // Auto-grow textarea as user types
      userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 80) + 'px';
      });
    }
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Set up code copy functionality
    document.addEventListener('click', handleCopyCode);

    // Offline/online detection
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    // Initialize utilities
    await statsTracker.load();
    await offlineQueue.loadFromStorage();
    
    // Process any queued messages
    if (navigator.onLine && offlineQueue.getSize() > 0) {
      processOfflineQueue();
    }
    
    // Pre-check: if state exists, skip loading flash entirely
    if (!isContextValid()) return;
    const preCheck = await chrome.storage.local.get(['currentMode', 'chatHistory', 'currentProblem']);
    if (preCheck.currentMode && preCheck.currentProblem) {
      _isRestoringState = true;
      if (loadingScreen) loadingScreen.style.display = 'none';
    }
    
    // Load problem and restore state (with storage recovery)
    await loadProblem();
    await restoreState();
    _isRestoringState = false;
    
    // Listen for storage changes from other surfaces (popup ↔ iframe sync)
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      
      // Problem changed externally
      if (changes.currentProblem?.newValue) {
        const newProblem = changes.currentProblem.newValue;
        const oldId = currentProblem?.id;
        if (newProblem.id !== oldId) {
          currentProblem = newProblem;
          updateProblemUI();
          if (oldId) {
            clearChat();
            showInitialView();
          }
        }
      }
      
      // Chat history changed externally (other surface sent a message)
      if (changes.chatHistory?.newValue && !isWaitingForResponse) {
        const externalHistory = changes.chatHistory.newValue;
        if (externalHistory.length !== chatHistory.length) {
          chatHistory = externalHistory;
          messageCount = chatHistory.filter(m => m.role === 'user').length;
          rebuildChatUI();
        }
      }
      
      // Mode changed externally
      if (changes.currentMode?.newValue && changes.currentMode.newValue !== currentMode) {
        currentMode = changes.currentMode.newValue;
        restoreModeDisplay(currentMode);
        if (chatView?.classList.contains('hidden')) {
          showChatView();
        }
      }
    });
    
    // Listen for real-time problem updates from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'PROBLEM_DETECTED') {
        console.log('[Nakung Popup] ═══════════════════════════════════════');
        console.log('[Nakung Popup] 📨 PROBLEM UPDATE RECEIVED');
        console.log('[Nakung Popup] 📋 New problem:', message.data.title);
        console.log('[Nakung Popup] 🆔 Problem ID:', message.data.id);
        console.log('[Nakung Popup] ═══════════════════════════════════════');
        
        // Check if this is a different problem
        const oldProblemId = currentProblem?.id;
        const newProblemId = message.data.id;
        
        // Force reload problem data from storage
        loadProblem().then(() => {
          if (oldProblemId && newProblemId && oldProblemId !== newProblemId) {
            console.log('[Nakung Popup] 🔄 Problem changed! Clearing chat...');
            clearChat();
            showInitialView();
            showToast(`Problem changed: ${message.data.title}`, 'info');
          } else {
            showToast(`Problem loaded: ${message.data.title}`, 'success');
          }
        });
      }
    });
    
  } catch (error) {
    showError('Failed to initialize extension');
  }
}

async function loadProblem() {
  try {
    console.log('[Nakung Popup] 🔍 Loading problem from storage...');
    
    // CRITICAL: Clear any cached problem data first
    currentProblem = null;
    
    // Fetch FRESH data from chrome.storage
    if (!isContextValid()) return;
    const result = await chrome.storage.local.get(['currentProblem', 'lastUpdated']);
    
    if (result.currentProblem) {
      currentProblem = result.currentProblem;
      
      console.log('[Nakung Popup] ═══════════════════════════════════════');
      console.log('[Nakung Popup] ✅ PROBLEM LOADED FROM STORAGE');
      updateProblemUI();
      
      hideLoading();
      
    } else {
      console.warn('[Nakung Popup] ⚠️ No problem found in storage');
      console.log('[Nakung Popup] 💡 Supported platforms:');
      console.log('[Nakung Popup]    ✓ LeetCode (leetcode.com/problems/...)');
      console.log('[Nakung Popup]    ✓ CodeChef (codechef.com/problems/...)');
      console.log('[Nakung Popup]    ✓ HackerRank (hackerrank.com/challenges/...)');
      console.log('[Nakung Popup]    ✓ Codeforces (codeforces.com/problemset/...)');
      
      showError('No problem detected. Please navigate to a supported problem page.');
      hideLoading();
    }
    
  } catch (error) {
    console.error('[Nakung Popup] ❌ Error loading problem:', error);
    showError('Failed to load problem information');
  }
}

async function restoreState() {
  try {
    if (!isContextValid()) return;
    const result = await chrome.storage.local.get([
      'currentMode',
      'chatHistory',
      'lastProblemId'
    ]);
    
    const lastProblemId = result.lastProblemId;
    const currentProblemId = currentProblem?.id;
    
    if (lastProblemId && currentProblemId && lastProblemId !== currentProblemId) {
      await clearState();
      return;
    }
    
    // Storage corruption recovery — validate data before using
    const storedHistory = result.chatHistory;
    if (result.currentMode && Array.isArray(storedHistory) && storedHistory.length > 0) {
      // Validate each message has role and content
      const validHistory = storedHistory.filter(m => 
        m && typeof m.role === 'string' && typeof m.content === 'string'
      );
      
      if (validHistory.length > 0) {
        currentMode = result.currentMode;
        chatHistory = validHistory;
        messageCount = validHistory.filter(m => m.role === 'user').length;
        
        // Restore mode display WITHOUT re-intro welcome message
        restoreModeDisplay(currentMode);
        showChatView();
        rebuildChatUI();
      } else {
        // Corrupted history — clear it
        await clearState();
      }
    } else if (result.currentMode && !storedHistory?.length) {
      // Mode was set but no messages yet — resume the mode
      currentMode = result.currentMode;
      restoreModeDisplay(currentMode);
      showChatView();
      showWelcomeMessage(currentMode);
    }
    
  } catch (error) {
    console.error('[Nakung Popup] ❌ State restore failed, clearing:', error);
    await clearState();
  }
}

let _saveDebounce = null;
async function saveState() {
  // Debounce to prevent storage race conditions on rapid messages
  clearTimeout(_saveDebounce);
  _saveDebounce = setTimeout(async () => {
    if (!isContextValid()) return;
    try {
      await chrome.storage.local.set({
        currentMode,
        chatHistory: chatHistory.slice(-20), // Cap stored history
        lastProblemId: currentProblem?.id
      });
    } catch (error) {
      console.error('[Nakung Popup] ❌ Save failed:', error);
    }
  }, 200);
}

async function clearState() {
  console.log('[Nakung Popup] 🧹 Clearing chat state...');
  chatHistory = [];
  currentMode = null;
  if (chatMessages) {
    chatMessages.innerHTML = '';
  }
  if (isContextValid()) await chrome.storage.local.remove(['currentMode', 'chatHistory', 'lastProblemId']);
  aiService.clearHistory();
}

function selectMode(mode) {
  currentMode = mode;
  console.log('[Nakung Popup] 🎯 Mode selected:', mode);
  
  chatHistory = [];
  if (chatMessages) chatMessages.innerHTML = '';
  aiService.clearHistory();
  
  showChatView();
  showWelcomeMessage(mode);
  
  // Track mode selection in statistics
  statsTracker.trackMode(mode);
  
  // Track problem if available
  if (currentProblem) {
    statsTracker.trackProblem(currentProblem.platform, currentProblem.difficulty);
  }
  
  // Save mode + remember as preferred for future sessions
  saveState();
  if (isContextValid()) chrome.storage.local.set({ preferredMode: mode });
}

function showWelcomeMessage(mode) {
  const modeDisplay = document.getElementById('modeDisplay');
  if (mode === 'partner') {
    if (modeDisplay) {
      modeDisplay.textContent = '💡 Partner Mode';
      modeDisplay.style.background = 'linear-gradient(135deg, var(--primary-from) 0%, var(--primary-to) 100%)';
    }
    addAIMessage(`Hey! I'm your coding partner. I'll help you think through this step by step — no spoilers, just good nudges. What's your first thought on this problem?`);
  } else if (mode === 'reviewer') {
    if (modeDisplay) {
      modeDisplay.textContent = '🎯 Reviewer Mode';
      modeDisplay.style.background = 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)';
    }
    addAIMessage(`Let's begin. Walk me through your initial approach to this problem — what data structures or algorithms come to mind?`);
  }
}

function backToModeSelection() {
  clearChat();
  showInitialView();
}

function showInitialView() {
  if (chatView) chatView.classList.add('hidden');
  if (initialView) initialView.classList.remove('hidden');
}

function showChatView() {
  if (initialView) initialView.classList.add('hidden');
  if (chatView) chatView.classList.remove('hidden');
  if (userInput) userInput.focus();
}

function showLoading() {
  if (loadingScreen) loadingScreen.classList.add('show');
  if (initialView) initialView.classList.add('hidden');
}

function hideLoading() {
  if (loadingScreen) loadingScreen.classList.remove('show');
  if (initialView) initialView.classList.remove('hidden');
}

function showError(message) {
  if (problemTitleDisplay) {
    problemTitleDisplay.textContent = '⚠️ ' + message;
    problemTitleDisplay.style.color = 'var(--error-light)';
  }
  hideLoading();
}

// Toast notification function
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-message">${message}</div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

async function sendMessage() {
  if (!userInput) return;
  const message = userInput.value.trim();
  
  if (!message || isWaitingForResponse) return;
  
  if (!currentMode) {
    alert('Please select a mode first');
    return;
  }
  
  // Check if problem is loaded
  if (!currentProblem) {
    console.error('[Nakung Popup] ❌ Cannot send message: No problem loaded');
    showToast('No problem detected. Please open a supported problem page.', 'warning');
    addAIMessage('⚠️ No problem context available. Please navigate to a supported problem page:\n\n• LeetCode (leetcode.com/problems/...)\n• CodeChef (codechef.com/problems/...)\n• HackerRank (hackerrank.com/challenges/...)\n• Codeforces (codeforces.com/problemset/...)');
    return;
  }
  
  console.log('[Nakung Popup] 📤 Sending message with problem context...');
  console.log('[Nakung Popup] 💬 User message:', message);
  console.log('[Nakung Popup] 📋 Problem context:', {
    title: currentProblem.title,
    difficulty: currentProblem.difficulty,
    platform: currentProblem.platform,
    hasDescription: !!currentProblem.description
  });
  
  // Handle offline mode
  if (!navigator.onLine) {
    await offlineQueue.add(message, { mode: currentMode, problem: currentProblem });
    updateQueueCount();
    addUserMessage(message);
    userInput.value = '';
    userInput.style.height = 'auto';
    showToast('Queued (offline)', 'warning');
    if (offlineIndicator) offlineIndicator.classList.remove('hidden');
    return;
  }
  
  try {
    isWaitingForResponse = true;
    if (sendBtn) { sendBtn.disabled = true; sendBtn.style.opacity = '0.4'; }
    
    addUserMessage(message);
    userInput.value = '';
    userInput.style.height = 'auto';
    
    chatHistory.push({ role: 'user', content: message });
    await saveState();
    
    const typingIndicator = showTypingIndicator();
    
    console.log('[Nakung Popup] 🚀 Calling AI service with problem context...');
    
    // Check for cached response first
    const cached = responseCache.get(message, currentProblem.id, currentMode);
    if (cached) {
      typingIndicator.remove();
      responseCache.set(message, currentProblem.id, currentMode, cached);
      addAIMessage(cached);
      chatHistory.push({ role: 'assistant', content: cached });
      await saveState();
      showToast('From cache (instant!)', 'info');
      
      isWaitingForResponse = false;
      if (sendBtn) { sendBtn.disabled = false; sendBtn.style.opacity = '1'; }
      if (userInput) userInput.focus();
      return;
    }
    
    // Use exponential backoff for retries
    const response = await exponentialBackoff.execute(async () => {
      return await aiService.generateResponse(message, currentMode, currentProblem);
    });
    
    console.log('[Nakung Popup] 📨 AI response received:', response.success ? '✅ Success' : '❌ Failed');
    
    typingIndicator.remove();
    
    if (response.success) {
      // Cache the successful response
      responseCache.set(message, currentProblem.id, currentMode, response.text);
      
      addAIMessage(response.text);
      chatHistory.push({ role: 'assistant', content: response.text });
      await saveState();
      
      // Reward micro-feedback — subtle positive reinforcement
      messageCount++;
      if (messageCount === 3) {
        showToast('Great conversation flow!', 'success');
      } else if (messageCount === 8) {
        showToast('Deep dive session — keep going!', 'success');
      }
    } else {
      // Contextual error messages based on error type
      const errorType = response.error || '';
      if (errorType === 'offline') {
        showToast('You\'re offline', 'warning');
      } else if (errorType === 'rate_limit') {
        showToast('Slow down — try again in a moment', 'warning');
      } else {
        showToast('Failed to get AI response', 'error');
      }
      addAIMessage(response.text);
    }
    
  } catch (error) {
    const errorMsg = document.querySelector('.typing-indicator');
    if (errorMsg) errorMsg.remove();
    showToast('Connection error', 'error');
    addAIMessage('❌ Connection error. Please check:\n\n• Internet connection\n• Backend status\n• Try refreshing the page\n\nError: ' + error.message);
  } finally {
    isWaitingForResponse = false;
    if (sendBtn) { sendBtn.disabled = false; sendBtn.style.opacity = '1'; }
    if (userInput) userInput.focus();
  }
}

function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message ai typing-indicator';
  typingDiv.innerHTML = `
    <div class="message-header"> AI</div>
    <div class="message-content">
      <span class="typing-dots">
        <span></span><span></span><span></span>
      </span>
      Thinking...
    </div>
  `;
  if (chatMessages) {
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  return typingDiv;
}

function clearChat() {
  if (chatMessages) chatMessages.innerHTML = '';
  chatHistory = [];
  aiService.clearHistory();
  saveState();
  
  if (currentMode) {
    showWelcomeMessage(currentMode);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── Cross-surface helpers ──

function updateProblemUI() {
  if (!currentProblem) return;
  if (problemTitleDisplay) {
    problemTitleDisplay.textContent = currentProblem.title || 'Unknown Problem';
    problemTitleDisplay.style.color = '';
  }
  if (problemDifficultyDisplay && currentProblem.difficulty && currentProblem.difficulty !== 'Unknown') {
    problemDifficultyDisplay.textContent = currentProblem.difficulty;
    problemDifficultyDisplay.className = 'difficulty-badge ' + currentProblem.difficulty.toLowerCase();
    problemDifficultyDisplay.style.display = 'inline-block';
  } else if (problemDifficultyDisplay) {
    problemDifficultyDisplay.style.display = 'none';
  }
  if (problemPlatformDisplay) {
    problemPlatformDisplay.textContent = currentProblem.platform || '';
  }
}

function restoreModeDisplay(mode) {
  const modeDisplay = document.getElementById('modeDisplay');
  if (!modeDisplay) return;
  if (mode === 'partner') {
    modeDisplay.textContent = '💡 Partner Mode';
    modeDisplay.style.background = 'linear-gradient(135deg, var(--primary-from) 0%, var(--primary-to) 100%)';
  } else if (mode === 'reviewer') {
    modeDisplay.textContent = '🎯 Reviewer Mode';
    modeDisplay.style.background = 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)';
  }
}

function rebuildChatUI() {
  if (!chatMessages) return;
  chatMessages.innerHTML = '';
  chatHistory.forEach(msg => {
    if (msg.role === 'user') {
      addUserMessage(msg.content, false);
    } else {
      addAIMessage(msg.content, false);
    }
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ============================================================================
// NEW ENHANCED FEATURES
// ============================================================================

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
  keyboardShortcuts.register('k', () => {
    if (userInput && chatView && !chatView.classList.contains('hidden')) {
      userInput.focus();
    }
  }, { ctrl: true });

  keyboardShortcuts.register('l', () => {
    if (chatView && !chatView.classList.contains('hidden')) {
      confirmClearChat();
    }
  }, { ctrl: true });

  keyboardShortcuts.register('e', () => {
    if (chatView && !chatView.classList.contains('hidden')) {
      exportChat();
    }
  }, { ctrl: true });

  keyboardShortcuts.register('i', () => {
    if (chatView && !chatView.classList.contains('hidden')) {
      showStatistics();
    }
  }, { ctrl: true });

  keyboardShortcuts.register('escape', () => {
    if (!statsModal?.classList.contains('hidden')) {
      hideStatistics();
    } else if (chatView && !chatView.classList.contains('hidden')) {
      backToModeSelection();
    }
  });

  document.addEventListener('keydown', (e) => keyboardShortcuts.handleKeyDown(e));
}

// Smart scroll — only auto-scroll if user is near the bottom (not reading old messages)
function smartScroll() {
  if (!chatMessages) return;
  const threshold = 80; // px from bottom
  const isNearBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < threshold;
  if (isNearBottom) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// Enhanced message functions with code highlighting
function addUserMessage(text, scrollToBottom = true) {
  if (!chatMessages) return;
  const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message user';
  msgDiv.innerHTML = `
    <div class="message-header">You</div>
    <div class="message-content">${escapeHtml(text)}</div>
    <div class="message-timestamp">${timestamp}</div>
  `;
  chatMessages.appendChild(msgDiv);
  
  if (scrollToBottom) smartScroll();
}

function addAIMessage(text, scrollToBottom = true) {
  if (!chatMessages) return;
  const modeName = currentMode === 'partner' ? 'Partner' : 'Reviewer';
  const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  // Process message with code highlighting
  const processedContent = MessageFormatter.enhanceMessage(text);
  
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message ai';
  msgDiv.innerHTML = `
    <div class="message-header">${modeName}</div>
    <div class="message-content">${processedContent}</div>
    <div class="message-timestamp">${timestamp}</div>
  `;
  chatMessages.appendChild(msgDiv);
  
  if (scrollToBottom) smartScroll();
  
  // Track statistics
  statsTracker.trackMessage();
}

// Copy code button handler
function handleCopyCode(e) {
  if (e.target.classList.contains('copy-code-btn')) {
    const codeBlock = e.target.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
      e.target.textContent = '✓ Copied';
      e.target.classList.add('copied');
      setTimeout(() => {
        e.target.textContent = '📋';
        e.target.classList.remove('copied');
      }, 2000);
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  }
}

// Export chat functionality
function exportChat() {
  if (!currentProblem || chatHistory.length === 0) {
    showToast('No chat to export', 'warning');
    return;
  }

  const markdown = ChatExporter.exportAsMarkdown(chatHistory, currentProblem, currentMode);
  const filename = `nakung-chat-${currentProblem.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.md`;
  
  ChatExporter.download(markdown, filename);
  showToast('Chat exported!', 'success');
  
  // Track export
  statsTracker.trackMessage();
}

// Statistics functionality
function showStatistics() {
  if (!statsModal) return;
  
  const stats = statsTracker.getStats();
  const statsContent = document.getElementById('statsContent');
  
  if (statsContent) {
    const sessionMinutes = Math.round((Date.now() - sessionStartTime) / 60000);
    const totalMinutes = Math.round(stats.sessionTime / 60);
    
    statsContent.innerHTML = `
      <div class="stat-card">
        <span class="stat-icon">📝</span>
        <div class="stat-label">Problems Attempted</div>
        <div class="stat-value">${stats.totalProblems}</div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">💬</span>
        <div class="stat-label">Total Messages</div>
        <div class="stat-value">${stats.totalMessages}</div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">💡</span>
        <div class="stat-label">Hints Requested</div>
        <div class="stat-value">${stats.totalHints}</div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">⏱️</span>
        <div class="stat-label">This Session</div>
        <div class="stat-value">${sessionMinutes}m</div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🤝</span>
        <div class="stat-label">Partner Mode</div>
        <div class="stat-value">${stats.modeUsage.partner}</div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🎯</span>
        <div class="stat-label">Reviewer Mode</div>
        <div class="stat-value">${stats.modeUsage.reviewer}</div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🟢</span>
        <div class="stat-label">Easy Problems</div>
        <div class="stat-value">${stats.difficultyUsage.easy || 0}</div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🟡</span>
        <div class="stat-label">Medium Problems</div>
        <div class="stat-value">${stats.difficultyUsage.medium || 0}</div>
      </div>
    `;
  }
  
  statsModal.classList.remove('hidden');
}

function hideStatistics() {
  if (statsModal) {
    statsModal.classList.add('hidden');
  }
}

// Confirm before clearing
function confirmClearChat() {
  if (chatHistory.length === 0) {
    showToast('Chat is already empty', 'info');
    return;
  }
  
  if (confirm('Clear entire chat history? This cannot be undone.')) {
    clearChat();
    showToast('Chat cleared', 'success');
  }
}

// Offline handling
function handleOffline() {
  showToast('You\'re offline', 'warning');
  if (offlineIndicator) {
    offlineIndicator.classList.remove('hidden');
  }
}

function handleOnline() {
  showToast('Back online!', 'success');
  if (offlineIndicator) {
    offlineIndicator.classList.add('hidden');
  }
  
  // Process queued messages
  if (offlineQueue.getSize() > 0) {
    processOfflineQueue();
  }
}

function updateQueueCount() {
  if (queueCount) {
    queueCount.textContent = offlineQueue.getSize();
  }
}

async function processOfflineQueue() {
  await offlineQueue.process(async (message, metadata) => {
    // Re-send the message
    await aiService.generateResponse(message, metadata.mode, metadata.problem);
  });
  
  updateQueueCount();
  
  if (offlineQueue.getSize() === 0 && offlineIndicator) {
    offlineIndicator.classList.add('hidden');
  }
}

// Track session time on unload
window.addEventListener('beforeunload', () => {
  const sessionSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
  statsTracker.trackSessionTime(sessionSeconds);
});

