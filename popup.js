// ============================================================================
// NAKUNG POPUP - Main Chat Interface  
// Backend: https://nakung-backend.vercel.app/api/chat
// ============================================================================

// Global state  
let currentProblem = null;
let currentMode = null;
let chatHistory = [];
let isWaitingForResponse = false;

// DOM elements
let initialView, chatView, loadingScreen;
let partnerBtn, reviewerBtn, backBtn, sendBtn, clearBtn;
let chatMessages, userInput;
let problemTitleDisplay, problemDifficultyDisplay, problemPlatformDisplay;

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    console.log('[Nakung Popup]  Initializing...');
    
    // Get DOM elements
    initialView = document.getElementById('initialView');
    chatView = document.getElementById('chatView');
    loadingScreen = document.getElementById('loadingScreen');
    
    partnerBtn = document.getElementById('partnerBtn');
    reviewerBtn = document.getElementById('reviewerBtn');
    backBtn = document.getElementById('backBtn');
    sendBtn = document.getElementById('sendBtn');
    clearBtn = document.getElementById('clearBtn');
    
    chatMessages = document.getElementById('chatMessages');
    userInput = document.getElementById('userInput');
    
    problemTitleDisplay = document.getElementById('problemTitleDisplay');
    problemDifficultyDisplay = document.getElementById('problemDifficultyDisplay');
    problemPlatformDisplay = document.getElementById('problemPlatformDisplay');
    
    // Set up event listeners
    if (partnerBtn) partnerBtn.addEventListener('click', () => selectMode('partner'));
    if (reviewerBtn) reviewerBtn.addEventListener('click', () => selectMode('reviewer'));
    if (backBtn) backBtn.addEventListener('click', backToModeSelection);
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (clearBtn) clearBtn.addEventListener('click', clearChat);
    
    if (userInput) {
      userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
    }
    
    // Load problem and restore state
    await loadProblem();
    await restoreState();
    
  } catch (error) {
    console.error('[Nakung Popup]  Init error:', error);
    showError('Failed to initialize extension');
  }
}

async function loadProblem() {
  try {
    console.log('[Nakung Popup]  Loading problem from storage...');
    
    const result = await Chrome.storage.local.get(['currentProblem']);
    
    if (result.currentProblem) {
      currentProblem = result.currentProblem;
      console.log('[Nakung Popup]  Problem loaded:', currentProblem);
      
      if (problemTitleDisplay) {
        problemTitleDisplay.textContent = currentProblem.title || 'Unknown Problem';
      }
      if (problemDifficultyDisplay && currentProblem.difficulty && currentProblem.difficulty !== 'Unknown') {
        problemDifficultyDisplay.textContent = currentProblem.difficulty;
        problemDifficultyDisplay.style.display = 'inline-block';
      }
      if (problemPlatformDisplay) {
        problemPlatformDisplay.textContent = currentProblem.platform || '';
      }
      
      hideLoading();
    } else {
      console.warn('[Nakung Popup]  No problem found in storage');
      showError('No problem detected. Please open a problem page.');
    }
    
  } catch (error) {
    console.error('[Nakung Popup]  Error loading problem:', error);
    showError('Failed to load problem information');
  }
}

async function restoreState() {
  try {
    const result = await chrome.storage.local.get([
      'currentMode',
      'chatHistory',
      'lastProblemId'
    ]);
    
    const lastProblemId = result.lastProblemId;
    const currentProblemId = currentProblem?.id;
    
    if (lastProblemId && currentProblemId && lastProblemId !== currentProblemId) {
      console.log('[Nakung Popup]  New problem detected, clearing old state');
      await clearState();
      return;
    }
    
    if (result.currentMode && result.chatHistory && result.chatHistory.length > 0) {
      currentMode = result.currentMode;
      chatHistory = result.chatHistory;
      
      showChatView();
      
      chatHistory.forEach(msg => {
        if (msg.role === 'user') {
          addUserMessage(msg.content, false);
        } else {
          addAIMessage(msg.content, false);
        }
      });
    }
    
  } catch (error) {
    console.error('[Nakung Popup]  Error restoring state:', error);
  }
}

async function saveState() {
  try {
    await chrome.storage.local.set({
      currentMode,
      chatHistory,
      lastProblemId: currentProblem?.id
    });
  } catch (error) {
    console.error('[Nakung Popup]  Error saving state:', error);
  }
}

async function clearState() {
  chatHistory = [];
  currentMode = null;
  await chrome.storage.local.remove(['currentMode', 'chatHistory']);
  aiService.clearHistory();
}

function selectMode(mode) {
  currentMode = mode;
  console.log('[Nakung Popup]  Mode selected:', mode);
  
  chatHistory = [];
  chatMessages.innerHTML = '';
  aiService.clearHistory();
  
  showChatView();
  showWelcomeMessage(mode);
  saveState();
}

function showWelcomeMessage(mode) {
  if (mode === 'partner') {
    addAIMessage(`Hi! I'm your coding partner. I'll guide you with hints and questions - I won't give you the direct solution, but I'll help you think through it step by step. What would you like to ask about this problem?`);
  } else if (mode === 'reviewer') {
    addAIMessage(`Hello! I'm your technical interviewer. I'll ask you questions about your approach, check your understanding, and help you think like you're in a FAANG interview. Ready to start? Tell me - how would you approach this problem?`);
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
    problemTitleDisplay.textContent = ' ' + message;
  }
  hideLoading();
}

async function sendMessage() {
  const message = userInput.value.trim();
  
  if (!message || isWaitingForResponse) return;
  
  if (!currentMode) {
    alert('Please select a mode first');
    return;
  }
  
  try {
    isWaitingForResponse = true;
    sendBtn.disabled = true;
    sendBtn.textContent = '';
    
    addUserMessage(message);
    userInput.value = '';
    
    chatHistory.push({ role: 'user', content: message });
    await saveState();
    
    const typingIndicator = showTypingIndicator();
    
    const response = await aiService.generateResponse(message, currentMode, currentProblem);
    
    typingIndicator.remove();
    
    if (response.success) {
      addAIMessage(response.text);
      chatHistory.push({ role: 'assistant', content: response.text });
      await saveState();
    } else {
      addAIMessage(` Error: ${response.error || 'Failed to get response'}. ${response.text}`);
    }
    
  } catch (error) {
    console.error('[Nakung Popup]  Send message error:', error);
    const errorMsg = document.querySelector('.typing-indicator');
    if (errorMsg) errorMsg.remove();
    addAIMessage(' Sorry, something went wrong. Please try again.');
  } finally {
    isWaitingForResponse = false;
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
    if (userInput) userInput.focus();
  }
}

function addUserMessage(text, scrollToBottom = true) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message user';
  msgDiv.innerHTML = `
    <div class="message-header"> You</div>
    <div class="message-content">${escapeHtml(text)}</div>
  `;
  chatMessages.appendChild(msgDiv);
  
  if (scrollToBottom) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function addAIMessage(text, scrollToBottom = true) {
  const icon = currentMode === 'partner' ? '' : '';
  const modeName = currentMode === 'partner' ? 'Partner' : 'Reviewer';
  
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message ai';
  msgDiv.innerHTML = `
    <div class="message-header">${icon} ${modeName}</div>
    <div class="message-content">${escapeHtml(text)}</div>
  `;
  chatMessages.appendChild(msgDiv);
  
  if (scrollToBottom) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return typingDiv;
}

function clearChat() {
  chatMessages.innerHTML = '';
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

