// ===========================================================================
// NAKUNG POPUP CONTROLLER - Main popup logic with retry mechanisms
// ===========================================================================

console.log('═══════════════════════════════════════════════════');
console.log('[Nakung Popup] 🎨 Popup script loaded');
console.log('═══════════════════════════════════════════════════');

let currentProblem = null;
let currentMode = null;
let chatHistory = [];
let isProcessing = false;

// ===================================================================
// INITIALIZATION
// ===================================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('[Nakung Popup] 🚀 DOM loaded, initializing...');
  
  // Show loading
  showLoading();
  
  // Load problem with retry mechanism
  loadCurrentProblem();
  
  // Setup event listeners
  setupEventListeners();
  
  console.log('[Nakung Popup] ✅ Initialization complete');
});

// ===================================================================
// PROBLEM LOADING WITH RETRY
// ===================================================================

function loadCurrentProblem() {
  console.log('[Nakung Popup] 📍 Loading current problem...');
  
  let attempts = 0;
  const maxAttempts = 3;
  
  function tryLoad() {
    attempts++;
    console.log(`[Nakung Popup] 🔄 Load attempt ${attempts}/${maxAttempts}`);
    
    // Try storage first
    chrome.storage.local.get(['currentProblem', 'extractionSuccessful'], (result) => {
      console.log('[Nakung Popup] 📦 Storage result:', result);
      
      if (result.currentProblem && result.extractionSuccessful) {
        console.log('[Nakung Popup] ✅ Problem found in storage');
        currentProblem = result.currentProblem;
        displayProblemInfo(currentProblem);
        hideLoading();
      } else if (attempts < maxAttempts) {
        console.log('[Nakung Popup] ⏳ Storage empty, trying content script...');
        
        // Try direct content script query
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_CURRENT_PROBLEM' }, (response) => {
              if (chrome.runtime.lastError) {
                console.warn('[Nakung Popup] ⚠️ Content script not ready:', chrome.runtime.lastError.message);
                
                if (attempts < maxAttempts) {
                  console.log('[Nakung Popup] ⏳ Retrying in 1 second...');
                  setTimeout(tryLoad, 1000);
                } else {
                  console.error('[Nakung Popup] ❌ All retry attempts failed');
                  displayUnsupportedPlatform();
                  hideLoading();
                }
              } else if (response && response.problem) {
                console.log('[Nakung Popup] ✅ Problem received from content script');
                currentProblem = response.problem;
                displayProblemInfo(currentProblem);
                hideLoading();
              } else {
                console.warn('[Nakung Popup] ⚠️ Content script returned no problem');
                
                if (attempts < maxAttempts) {
                  setTimeout(tryLoad, 1000);
                } else {
                  displayUnsupportedPlatform();
                  hideLoading();
                }
              }
            });
          } else {
            console.error('[Nakung Popup] ❌ No active tab found');
            displayUnsupportedPlatform();
            hideLoading();
          }
        });
      } else {
        console.error('[Nakung Popup] ❌ All load attempts exhausted');
        displayUnsupportedPlatform();
        hideLoading();
      }
    });
  }
  
  tryLoad();
}

// ===================================================================
// DISPLAY FUNCTIONS
// ===================================================================

function displayProblemInfo(problem) {
  console.log('[Nakung Popup] 🎨 Displaying problem:', problem.title);
  
  const problemTitle = document.getElementById('problemTitleDisplay');
  const problemDifficultyBadge = document.getElementById('problemDifficultyDisplay');
  const platformBadge = document.getElementById('problemPlatformDisplay');
  
  if (problemTitle) {
    problemTitle.textContent = problem.title;
  }
  
  if (problemDifficultyBadge) {
    problemDifficultyBadge.textContent = problem.difficulty || 'Medium';
    problemDifficultyBadge.className = 'difficulty-badge';
    problemDifficultyBadge.style.display = 'inline-block';
    
    const diff = (problem.difficulty || '').toLowerCase();
    if (diff.includes('easy')) {
      problemDifficultyBadge.classList.add('easy');
    } else if (diff.includes('medium')) {
      problemDifficultyBadge.classList.add('medium');
    } else if (diff.includes('hard')) {
      problemDifficultyBadge.classList.add('hard');
    }
  }
  
  if (platformBadge) {
    platformBadge.textContent = problem.platformName || problem.platform;
    platformBadge.style.backgroundColor = getPlatformColor(problem.platform);
  }
  
  console.log('[Nakung Popup] ✅ Problem displayed successfully');
}

function displayUnsupportedPlatform() {
  console.log('[Nakung Popup] ⚠️ Displaying unsupported platform message');
  
  const problemTitle = document.getElementById('problemTitleDisplay');
  const problemDifficultyBadge = document.getElementById('problemDifficultyDisplay');
  const platformBadge = document.getElementById('problemPlatformDisplay');
  
  if (problemTitle) {
    problemTitle.textContent = 'Platform Not Supported Yet';
    problemTitle.style.color = '#999';
  }
  
  if (problemDifficultyBadge) {
    problemDifficultyBadge.style.display = 'none';
  }
  
  if (platformBadge) {
    platformBadge.textContent = 'Unknown';
    platformBadge.style.backgroundColor = '#666';
  }
}

function getPlatformColor(platform) {
  const colors = {
    'leetcode': '#FFA116',
    'codechef': '#5B4638',
    'hackerrank': '#00EA64',
    'codeforces': '#1F8ACB',
    'unknown': '#666'
  };
  return colors[platform] || colors.unknown;
}

// ===================================================================
// MODE ACTIVATION
// ===================================================================

function activateMode(mode) {
  console.log('[Nakung Popup] 🎯 Activating mode:', mode);
  
  if (!currentProblem || !currentProblem.supported) {
    showNotification('Please open a supported problem page first', 'error');
    return;
  }
  
  currentMode = mode;
  chatHistory = [];
  
  // Update UI
  document.getElementById('initialView').classList.add('hidden');
  document.getElementById('chatView').classList.remove('hidden');
  
  // Update mode indicator
  const modeIndicator = document.getElementById('modeDisplay');
  if (modeIndicator) {
    modeIndicator.textContent = mode === 'partner' ? '🤝 Partner Mode' : '🔍 Reviewer Mode';
  }
  
  // Show welcome message
  const welcomeMsg = mode === 'partner' 
    ? "Hi! I'm your coding partner. Let's solve this problem together! What's your initial approach?"
    : "Hi! I'm here to review your solution. Share your code and I'll provide detailed feedback!";
    
  addMessageToChat('assistant', welcomeMsg);
  
  console.log('[Nakung Popup] ✅ Mode activated:', mode);
}

// ===================================================================
// CHAT FUNCTIONS
// ===================================================================

async function sendMessage() {
  const inputField = document.getElementById('chatInput');
  
  if (!inputField) {
    console.error('[Nakung Popup] ❌ Chat input not found');
    return;
  }
  
  const messageText = inputField.value.trim();
  
  if (!messageText || isProcessing) {
    console.log('[Nakung Popup] ⚠️ Empty message or already processing');
    return;
  }
  
  console.log('[Nakung Popup] 📤 Sending message:', messageText);
  
  // Add user message
  addMessageToChat('user', messageText);
  inputField.value = '';
  
  // Show typing indicator
  const typingId = showTypingIndicator();
  isProcessing = true;
  
  try {
    // Build context
    const context = {
      mode: currentMode,
      problem: {
        title: currentProblem.title,
        difficulty: currentProblem.difficulty,
        description: currentProblem.description || ''
      },
      history: chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    };
    
    console.log('[Nakung Popup] 📦 Request context:', context);
    
    // Send to background script
    const response = await chrome.runtime.sendMessage({
      type: 'AI_REQUEST',
      payload: {
        message: messageText,
        context: context
      }
    });
    
    console.log('[Nakung Popup] 📥 Response received:', response);
    
    // Remove typing indicator
    removeTypingIndicator(typingId);
    
    if (response && response.success) {
      addMessageToChat('assistant', response.message);
    } else {
      addMessageToChat('assistant', '❌ Sorry, I encountered an error. Please try again.');
      console.error('[Nakung Popup] ❌ AI request failed:', response?.error);
    }
    
  } catch (error) {
    console.error('[Nakung Popup] ❌ Message send error:', error);
    removeTypingIndicator(typingId);
    addMessageToChat('assistant', '❌ Connection error. Please check your backend settings.');
  } finally {
    isProcessing = false;
  }
}

function addMessageToChat(role, content) {
  console.log(`[Nakung Popup] 💬 Adding ${role} message:`, content.substring(0, 50) + '...');
  
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.textContent = content;
  
  messageDiv.appendChild(contentDiv);
  chatMessages.appendChild(messageDiv);
  
  // Auto-scroll
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Save to history
  chatHistory.push({ role: role === 'user' ? 'user' : 'assistant', content });
  
  // Save to storage
  chrome.storage.local.set({ 
    chatHistory: chatHistory,
    lastMode: currentMode 
  });
}

function showTypingIndicator() {
  const chatMessages = document.getElementById('chatMessages');
  const typingDiv = document.createElement('div');
  const typingId = 'typing-' + Date.now();
  
  typingDiv.id = typingId;
  typingDiv.className = 'message assistant typing';
  typingDiv.innerHTML = '<div class="message-content">Thinking...</div>';
  
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return typingId;
}

function removeTypingIndicator(typingId) {
  const typingDiv = document.getElementById(typingId);
  if (typingDiv) {
    typingDiv.remove();
  }
}

// ===================================================================
// EVENT LISTENERS
// ===================================================================

function setupEventListeners() {
  console.log('[Nakung Popup] 🔗 Setting up event listeners...');
  
  // Mode buttons
  const partnerBtn = document.getElementById('partnerBtn');
  const reviewerBtn = document.getElementById('reviewerBtn');
  
  if (partnerBtn) {
    partnerBtn.addEventListener('click', () => activateMode('partner'));
  }
  
  if (reviewerBtn) {
    reviewerBtn.addEventListener('click', () => activateMode('reviewer'));
  }
  
  // Chat input
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
  
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }
  
  // Back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      document.getElementById('chatView').classList.add('hidden');
      document.getElementById('initialView').classList.remove('hidden');
      currentMode = null;
      console.log('[Nakung Popup] ⬅️ Returned to mode selection');
    });
  }
  
  // Settings button
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }
  
  // Test connection button
  const testBtn = document.getElementById('testConnectionBtn');
  if (testBtn) {
    testBtn.addEventListener('click', testConnection);
  }
  
  console.log('[Nakung Popup] ✅ Event listeners set up');
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

function showLoading() {
  const loading = document.getElementById('loadingScreen');
  const initial = document.getElementById('initialView');
  const chat = document.getElementById('chatView');
  
  if (loading) loading.style.display = 'flex';
  if (initial) initial.classList.add('hidden');
  if (chat) chat.classList.add('hidden');
  
  console.log('[Nakung Popup] ⏳ Loading screen shown');
}

function hideLoading() {
  const loading = document.getElementById('loadingScreen');
  const initial = document.getElementById('initialView');
  
  if (loading) {
    loading.style.display = 'none';
  }
  
  if (initial) {
    initial.classList.remove('hidden');
  }
  
  console.log('[Nakung Popup] ✅ Loading screen hidden');
}

async function testConnection() {
  console.log('[Nakung Popup] 🧪 Testing backend connection...');
  
  const testBtn = document.getElementById('testConnectionBtn');
  if (testBtn) {
    testBtn.textContent = 'Testing...';
    testBtn.disabled = true;
  }
  
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'TEST_CONNECTION'
    });
    
    if (response && response.success) {
      showNotification('✅ Backend connected successfully!', 'success');
      console.log('[Nakung Popup] ✅ Connection test passed');
    } else {
      showNotification('❌ Backend connection failed', 'error');
      console.error('[Nakung Popup] ❌ Connection test failed:', response?.error);
    }
  } catch (error) {
    showNotification('❌ Connection error', 'error');
    console.error('[Nakung Popup] ❌ Connection test error:', error);
  } finally {
    if (testBtn) {
      testBtn.textContent = 'Test Connection';
      testBtn.disabled = false;
    }
  }
}

function showNotification(message, type = 'info') {
  console.log(`[Nakung Popup] 📢 Notification (${type}):`, message);
  
  // Simple alert for now - can be enhanced with better UI
  alert(message);
}

console.log('[Nakung Popup] ✅ Popup controller loaded successfully');
