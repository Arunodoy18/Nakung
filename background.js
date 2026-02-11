// ===========================================================================
// NAKUNG BACKGROUND SERVICE WORKER - Handles AI requests and backend communication
// ===========================================================================

const BACKEND_URL = 'https://nakung-backend.vercel.app/api/chat';

// ===================================================================
// MESSAGE LISTENER
// ===================================================================

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Nakung Background] 📨 Received message:', request.type);
  
  if (request.type === 'AI_REQUEST') {
    handleAIRequest(request.payload, sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (request.type === 'TEST_CONNECTION') {
    testBackendConnection(sendResponse);
    return true;
  }
  
  if (request.type === 'PROBLEM_DETECTED') {
    console.log('[Nakung Background] 📍 Problem detected:', request.data);
    // Can add additional processing here
    return false;
  }
  
  if (request.type === 'OPEN_SETTINGS') {
    console.log('[Nakung Background] ⚙️ Opening settings page...');
    chrome.runtime.openOptionsPage();
    return false;
  }
  
  if (request.type === 'OPEN_POPUP') {
    console.log('[Nakung Background] 🚀 Floating button clicked — opening popup');
    // Can't programmatically open popup, but we can open the extension page in a new tab
    // The popup itself opens from the toolbar icon
    return false;
  }
  
  console.warn('[Nakung Background] ⚠️ Unknown message type:', request.type);
  return false;
});

// ===================================================================
// AI REQUEST HANDLER
// ===================================================================

async function handleAIRequest(payload, sendResponse) {
  console.log('[Nakung Background] 🤖 Handling AI request...');
  console.log('[Nakung Background] 📦 Payload:', {
    mode: payload.context?.mode,
    messageLength: payload.message?.length,
    historyLength: payload.context?.history?.length
  });
  
  try {
    // Build system prompt based on mode
    const systemPrompt = buildSystemPrompt(payload.context);
    
    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...payload.context.history,
      { role: 'user', content: payload.message }
    ];
    
    console.log('[Nakung Background] 📤 Sending request to backend...');
    console.log('[Nakung Background] 🔗 URL:', BACKEND_URL);
    console.log('[Nakung Background] 📊 Message count:', messages.length);
    
    // Make request to backend
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages })
    });
    
    console.log('[Nakung Background] 📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Nakung Background] ❌ Backend error:', errorText);
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[Nakung Background] ✅ Response received');
    
    if (data.message) {
      console.log('[Nakung Background] 💬 AI message length:', data.message.length);
      sendResponse({
        success: true,
        message: data.message
      });
    } else {
      console.error('[Nakung Background] ❌ No message in response:', data);
      throw new Error('No message in response');
    }
    
  } catch (error) {
    console.error('[Nakung Background] ❌ AI request error:', error);
    sendResponse({
      success: false,
      error: error.message,
      message: 'Sorry, I encountered an error. Please check your backend configuration.'
    });
  }
}

// ===================================================================
// SYSTEM PROMPT BUILDER
// ===================================================================

function buildSystemPrompt(context) {
  const PARTNER_SYSTEM = `You are a friendly coding partner helping solve competitive programming problems. Your role:
- Guide users through problem-solving with hints and questions
- Encourage them to think through solutions
- Provide explanations when needed
- Help debug code and optimize solutions
- Be supportive and encouraging

Current Problem: ${context.problem.title}
Difficulty: ${context.problem.difficulty}
${context.problem.description ? 'Description: ' + context.problem.description.substring(0, 200) + '...' : ''}

Keep responses concise and helpful.`;

  const REVIEWER_SYSTEM = `You are an experienced code reviewer for competitive programming. Your role:
- Review code for correctness and edge cases
- Analyze time and space complexity
- Suggest optimizations
- Point out potential bugs
- Provide constructive feedback

Current Problem: ${context.problem.title}
Difficulty: ${context.problem.difficulty}
${context.problem.description ? 'Description: ' + context.problem.description.substring(0, 200) + '...' : ''}

Be thorough but concise in your reviews.`;

  const mode = context.mode || 'partner';
  const prompt = mode === 'partner' ? PARTNER_SYSTEM : REVIEWER_SYSTEM;
  
  console.log('[Nakung Background] 🎯 System prompt built for mode:', mode);
  return prompt;
}

// ===================================================================
// CONNECTION TESTING
// ===================================================================

async function testBackendConnection(sendResponse) {
  console.log('[Nakung Background] 🧪 Testing backend connection...');
  console.log('[Nakung Background] 🔗 URL:', BACKEND_URL);
  
  try {
    const testMessage = {
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Connection successful!" if you receive this message.' }
      ]
    };
    
    console.log('[Nakung Background] 📤 Sending test request...');
    
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });
    
    console.log('[Nakung Background] 📥 Test response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Nakung Background] ❌ Test failed:', errorText);
      throw new Error(`Backend returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[Nakung Background] ✅ Test successful');
    console.log('[Nakung Background] 💬 Response:', data.message?.substring(0, 100));
    
    sendResponse({
      success: true,
      message: 'Backend connection successful!',
      details: {
        status: response.status,
        url: BACKEND_URL,
        responsePreview: data.message?.substring(0, 100)
      }
    });
    
  } catch (error) {
    console.error('[Nakung Background] ❌ Connection test error:', error);
    sendResponse({
      success: false,
      error: error.message,
      details: {
        url: BACKEND_URL,
        errorType: error.name
      }
    });
  }
}

// ===================================================================
// STORAGE UTILITIES
// ===================================================================

function saveProblemProgress(problemId, data) {
  console.log('[Nakung Background] 💾 Saving progress for problem:', problemId);
  
  chrome.storage.local.get(['problemProgress'], (result) => {
    const progress = result.problemProgress || {};
    progress[problemId] = {
      ...data,
      lastUpdated: Date.now()
    };
    
    chrome.storage.local.set({ problemProgress: progress }, () => {
      console.log('[Nakung Background] ✅ Progress saved');
    });
  });
}

function loadProblemProgress(problemId, callback) {
  console.log('[Nakung Background] 📂 Loading progress for problem:', problemId);
  
  chrome.storage.local.get(['problemProgress'], (result) => {
    const progress = result.problemProgress || {};
    const data = progress[problemId] || null;
    
    console.log('[Nakung Background] 📊 Progress loaded:', data ? 'found' : 'not found');
    callback(data);
  });
}

// ===================================================================
// INSTALLATION & UPDATE HANDLERS
// ===================================================================

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[Nakung Background] 🎉 Extension installed!');
    
    // Set default settings
    chrome.storage.local.set({
      settings: {
        backendUrl: BACKEND_URL,
        loggingEnabled: true
      }
    });
    
  } else if (details.reason === 'update') {
    console.log('[Nakung Background] 🔄 Extension updated!');
  }
});

// ===================================================================
// TAB UPDATE LISTENER
// ===================================================================

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = tab.url.toLowerCase();
    
    // Check if it's a problem page
    const isProblemPage = 
      url.includes('leetcode.com/problems/') ||
      url.includes('codechef.com/problems/') ||
      url.includes('hackerrank.com/challenges/') ||
      url.includes('codeforces.com/problemset/') ||
      url.includes('codeforces.com/contest/');
    
    if (isProblemPage) {
      console.log('[Nakung Background] 📍 Problem page detected:', url);
      
      // Notify content script to refresh (if needed)
      chrome.tabs.sendMessage(tabId, { type: 'PAGE_LOADED' }).catch(() => {
        // Ignore errors if content script not ready
      });
    }
  }
});

console.log('[Nakung Background] ✅ Background service worker ready');

} // end chrome runtime guard
