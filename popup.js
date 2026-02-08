// Initialize services
let aiInitialized = false;

// Initialize on load
(async function init() {
  try {
    aiInitialized = await aiService.initialize();
    if (!aiInitialized) {
      console.log('AI service not configured. Using fallback responses.');
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
})();

// Predefined hints for Partner mode
const hints = [
  "💡 Try breaking down the problem into smaller sub-problems. What patterns do you recognize?",
  "🔍 Have you considered using a hash map for O(1) lookups?",
  "🎯 Think about the time complexity. Can you optimize by trading space for time?",
  "📊 Draw out a few examples. Sometimes visualizing helps reveal patterns.",
  "🔄 Consider if a two-pointer approach might work here.",
  "🌳 Would a tree or graph data structure help model this problem?",
  "💭 What's the brute force solution? Start there, then optimize.",
  "⚡ Look for overlapping subproblems - this might be a dynamic programming question.",
  "🎲 Sometimes sorting the input first reveals a simpler solution.",
  "🔢 Check the constraints. They often hint at the expected time complexity."
];

// Professional Reviewer Mode - Acts as Code Reviewer and Mentor
const reviewerPhases = {
  // Phase 1: Understanding the Specification
  specification: {
    intro: "Hey! Before we dive into coding, let's make sure we understand the problem completely. This is super important - many people skip this step and jump straight to coding! 📋",
    questions: [
      "First, can you explain the problem statement in your own words? What exactly are we trying to solve?",
      "Great! Now, what are the constraints mentioned? (Think: input size limits, value ranges, time complexity expected)",
      "What does the input format look like? Can you describe it?",
      "And what should the output be? What format should we return?",
      "Excellent! Now the crucial part - what edge cases can you think of? (empty input, single element, duplicates, negative numbers, etc.)"
    ]
  },
  
  // Phase 2: Approach and Logic Review
  approach: {
    intro: "Perfect! Now that we understand the specification, let's talk about your approach. Remember - I won't write code for you, but I'll guide you! 🎯",
    questions: [
      "What's your initial approach? Walk me through your thought process - even if it's brute force, that's a great starting point!",
      "Can you identify what algorithmic pattern this might use? (Two pointers? Sliding window? Dynamic Programming? Hash map? Binary search?)",
      "Why did you choose that approach? What made you think of it?",
      "Let's analyze: What would be the time complexity of your approach?",
      "And what about space complexity? How much extra memory would you need?"
    ]
  },
  
  // Phase 3: Code Review
  codeReview: {
    intro: "Show me what you've got! Share your code or pseudocode, and I'll review it like a senior engineer would. 👨‍💻",
    questions: [
      "Can you walk me through your code line by line? Explain what each major section does.",
      "I see your logic here. But let me ask - how does your code handle this edge case: [mention specific edge case]?",
      "What happens at the boundaries? For example, when index reaches the start or end of the array?",
      "Is there any part of your code that might cause a runtime error? (null pointers, array out of bounds, division by zero?)",
      "Let me trace through your logic with a specific example. Can you walk me through what happens with this input: [example]?"
    ]
  },
  
  // Phase 4: Optimization Review
  optimization: {
    intro: "Your solution works, but let's see if we can make it better! This is what separates good solutions from great ones. ⚡",
    questions: [
      "Looking at your approach, where's the bottleneck? What operation takes the most time?",
      "Can we trade space for time here? Would using a hash map/set speed things up?",
      "Can we do this in one pass instead of multiple passes through the data?",
      "Is there a way to solve this in-place to save memory?",
      "Could sorting the input first reveal a simpler or faster solution?"
    ]
  },
  
  // Phase 5: Testing and Edge Cases
  testing: {
    intro: "Almost there! A solution isn't complete until we've thoroughly tested it. Let's think like QA engineers. 🧪",
    questions: [
      "What test cases would you write for this solution?",
      "How would your code handle an empty input?",
      "What about when the input has only one element?",
      "How does it perform with the maximum constraint values? (largest possible input)",
      "Can you think of any corner cases that might break your solution?"
    ]
  }
};

// Context-aware reviewer responses based on what user shares
const reviewerInsights = {
  codeShared: [
    "Let me review this... [reading your code]",
    "Okay, I see what you're doing here. Let me point out a few things:",
    "Interesting approach! Here's my feedback:",
    "Good start! But I noticed a few things:"
  ],
  
  approachShared: [
    "That's a solid starting point! Let me ask you this:",
    "I like your thinking. But have you considered:",
    "Hmm, that could work. But let's think about:",
    "Good observation! Now let me challenge you:"
  ],
  
  edgeCaseGood: [
    "Excellent! You're thinking like a real engineer. Edge cases are crucial.",
    "Perfect! That's exactly the kind of defensive thinking you need in interviews.",
    "Great catch! Many people forget about that edge case."
  ],
  
  needsMoreThought: [
    "Not quite - let me guide you...",
    "You're on the right track, but consider this:",
    "Think about it differently - what if...",
    "Let me help you see something you might have missed:"
  ],
  
  optimization: [
    "This works, but it's not optimal yet. Here's a hint:",
    "Good solution! But we can do better. Think about:",
    "Your complexity is [X]. Can we improve it to [Y]? Consider:",
    "The bottleneck is here [point]. What data structure could speed this up?"
  ]
};

// State management
let currentMode = null;
let timerInterval = null;
let timerSeconds = 0;
let currentReviewerPhase = 'specification'; // Track which phase we're in
let phaseQuestionIndex = 0; // Track which question in the current phase
let messageCount = 0;
let currentProblemId = null;
let sessionStartTime = null;
let isWaitingForResponse = false;
let userHasSharedCode = false; // Track if user has shared code yet

// DOM elements
const initialView = document.getElementById('initialView');
const chatView = document.getElementById('chatView');
const problemNumber = document.getElementById('problemNumber');
const partnerBtn = document.getElementById('partnerBtn');
const reviewerBtn = document.getElementById('reviewerBtn');
const hintDisplay = document.getElementById('hintDisplay');
const backBtn = document.getElementById('backBtn');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const timerDisplay = document.getElementById('timer');

// Event listeners
partnerBtn.addEventListener('click', handlePartnerMode);
reviewerBtn.addEventListener('click', handleReviewerMode);
backBtn.addEventListener('click', handleBack);
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Validation helper
function validateProblemId(id) {
  const trimmed = id.trim();
  if (!trimmed) {
    return { valid: false, error: 'Please enter a problem number first!' };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: 'Problem ID seems too short' };
  }
  return { valid: true, value: trimmed };
}

// Partner mode handler
async function handlePartnerMode() {
  const validation = validateProblemId(problemNumber.value);
  if (!validation.valid) {
    showError(validation.error);
    return;
  }

  const problem = validation.value;
  currentProblemId = problem;

  try {
    // Show loading state
    hintDisplay.innerHTML = `
      <h3>💡 Generating hint for ${problem}</h3>
      <p>⏳ Thinking...</p>
    `;
    hintDisplay.classList.remove('hidden');

    let hintText = '';
    
    // Try AI first if available
    if (aiInitialized) {
      const response = await aiService.generateResponse(
        `Give me a strategic hint for solving problem ${problem}, without revealing the solution`,
        'partner'
      );
      
      if (response.success) {
        hintText = response.text;
      } else {
        hintText = hints[Math.floor(Math.random() * hints.length)];
      }
    } else {
      hintText = hints[Math.floor(Math.random() * hints.length)];
    }

    hintDisplay.innerHTML = `
      <h3>💡 Hint for ${problem}</h3>
      <p>${hintText}</p>
    `;

    // Save to progress
    await storageManager.saveProgress(problem, 'in-progress');
    
  } catch (error) {
    console.error('Error in partner mode:', error);
    showError('Failed to generate hint. Please try again.');
    hintDisplay.classList.add('hidden');
  }
}

// Reviewer mode handler - Professional Code Review
async function handleReviewerMode() {
  const validation = validateProblemId(problemNumber.value);
  if (!validation.valid) {
    showError(validation.error);
    return;
  }

  const problem = validation.value;
  currentProblemId = problem;
  currentMode = 'reviewer';
  messageCount = 0;
  phaseQuestionIndex = 0;
  currentReviewerPhase = 'specification';
  userHasSharedCode = false;
  sessionStartTime = Date.now();
  
  // Reset AI conversation
  if (aiInitialized) {
    aiService.resetConversation();
  }
  
  try {
    // Switch to chat view
    initialView.classList.add('hidden');
    chatView.classList.remove('hidden');
    
    // Start timer
    startTimer();
    
    // Send welcoming professional message
    setTimeout(() => {
      addReviewerMessage(`👋 Hey! I'm your code reviewer for <strong>${problem}</strong>.`);
      setTimeout(() => {
        addReviewerMessage(`Think of me as your senior engineer mentor. I'm here to:<br>
          ✅ Review your logic and approach<br>
          ✅ Help you catch edge cases<br>
          ✅ Guide you to optimal solutions<br>
          ✅ Ask the questions that interviewers would ask<br><br>
          ⚠️ <strong>Important:</strong> I won't write code for you - you'll do that! I'll guide and review. Ready?`);
        
        setTimeout(() => {
          addReviewerMessage(reviewerPhases.specification.intro);
          setTimeout(() => {
            addReviewerMessage(reviewerPhases.specification.questions[0]);
            phaseQuestionIndex = 1; // Move to next question
          }, 1000);
        }, 2000);
      }, 1500);
    }, 500);

    // Save to progress
    await storageManager.saveProgress(problem, 'in-progress');
    
  } catch (error) {
    console.error('Error starting reviewer mode:', error);
    showError('Failed to start interview. Please try again.');
  }
}

// Back button handler
async function handleBack() {
  // Save session time if in reviewer mode
  if (currentMode === 'reviewer' && currentProblemId && sessionStartTime) {
    try {
      const timeSpentMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
      const progress = await storageManager.getProgress();
      if (progress[currentProblemId]) {
        progress[currentProblemId].timeSpent = (progress[currentProblemId].timeSpent || 0) + timeSpentMinutes;
        await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.PROGRESS]: progress });
      }
    } catch (error) {
      console.error('Error saving session time:', error);
    }
  }
  
  stopTimer();
  currentMode = null;
  chatMessages.innerHTML = '';
  userInput.value = '';
  chatView.classList.add('hidden');
  initialView.classList.remove('hidden');
  hintDisplay.classList.add('hidden');
  
  // Reset reviewer state
  messageCount = 0;
  currentReviewerPhase = 'specification';
  phaseQuestionIndex = 0;
  userHasSharedCode = false;
  currentProblemId = null;
  sessionStartTime = null;
  isWaitingForResponse = false;
}

// Send message handler
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message || isWaitingForResponse) return;

  try {
    isWaitingForResponse = true;
    sendBtn.disabled = true;
    sendBtn.textContent = '⏳';
    
    addUserMessage(message);
    userInput.value = '';
    messageCount++;

    // Generate AI response
    await generateReviewerResponse(message);
    
  } catch (error) {
    console.error('Error sending message:', error);
    showError('Failed to send message. Please try again.');
  } finally {
    isWaitingForResponse = false;
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
  }
}

// Generate AI-powered professional reviewer response
async function generateReviewerResponse(userMessage) {
  // Show typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message reviewer typing-indicator';
  typingDiv.innerHTML = `
    <div class="message-header">🎯 Reviewer</div>
    <div class="message-content">⏳ Analyzing...</div>
  `;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  let response = '';
  
  try {
    // Analyze user message to understand what they shared
    const messageAnalysis = analyzeUserMessage(userMessage);
    
    // Try AI service first if available for more natural responses
    if (aiInitialized) {
      const contextPrompt = buildReviewerContext(messageAnalysis, userMessage);
      const aiResponse = await aiService.generateResponse(contextPrompt, 'reviewer');
      
      if (aiResponse.success) {
        response = aiResponse.text;
        // Still progress through phases even with AI
        response += '<br><br>' + getNextGuidingQuestion(messageAnalysis);
      } else {
        response = getProfessionalReviewerResponse(messageAnalysis, userMessage);
      }
    } else {
      response = getProfessionalReviewerResponse(messageAnalysis, userMessage);
    }
    
    // Remove typing indicator
    typingDiv.remove();
    
    // Add actual response
    addReviewerMessage(response);
    
  } catch (error) {
    console.error('Error generating response:', error);
    typingDiv.remove();
    addReviewerMessage(getProfessionalReviewerResponse({ type: 'unknown' }, userMessage));
  }
}

// Analyze what the user shared (code, approach, edge cases, etc.)
function analyzeUserMessage(message) {
  const lowerMsg = message.toLowerCase();
  
  // Check if code was shared
  const hasCode = /(\{|\}|function|def |class |if\s|for\s|while\s|return\s|\[|\]|\.length|\.size|=>)/i.test(message);
  
  // Check if discussing complexity
  const hasComplexity = /(O\(|time complexity|space complexity|big o|o\(n\)|linear|logarithmic|quadratic)/i.test(message);
  
  // Check if mentioning edge cases
  const hasEdgeCases = /(edge case|corner case|empty|null|zero|negative|duplicate|boundary|single element)/i.test(message);
  
  // Check if describing approach
  const hasApproach = /(approach|algorithm|strategy|method|technique|using|would use|i think|my idea)/i.test(message);
  
  // Check if asking for help/stuck
  const needsHelp = /(stuck|confused|don't know|not sure|help|hint|what should)/i.test(message);
  
  // Check if sharing understanding of problem
  const hasUnderstanding = /(problem is|we need to|goal is|trying to|should find|should return|input is|output is)/i.test(message);
  
  return {
    hasCode,
    hasComplexity,
    hasEdgeCases,
    hasApproach,
    needsHelp,
    hasUnderstanding,
    length: message.length,
    type: hasCode ? 'code' : hasApproach ? 'approach' : hasEdgeCases ? 'edgecases' : hasUnderstanding ? 'understanding' : 'general'
  };
}

// Build context for AI to give better reviewer responses
function buildReviewerContext(analysis, userMessage) {
  let context = "You are a professional code reviewer and mentor. ";
  
  if (analysis.hasCode) {
    context += "The student shared code. Review it professionally: point out issues, ask about edge cases they didn't handle, suggest improvements. Don't rewrite their code - guide them to fix it.";
  } else if (analysis.hasApproach) {
    context += "The student described their approach. Acknowledge what's good, then ask probing questions: time/space complexity, edge cases, potential optimizations.";
  } else if (analysis.needsHelp) {
    context += "The student is stuck. Give a gentle hint pointing them in the right direction, but don't solve it for them. Ask a guiding question.";
  } else {
    context += "Respond like a senior engineer having a code review discussion. Be encouraging but professional.";
  }
  
  return context + " Student said: " + userMessage;
}

// Get professional reviewer response based on what user shared
function getProfessionalReviewerResponse(analysis, userMessage) {
  let response = '';
  
  // If user shared code
  if (analysis.hasCode) {
    userHasSharedCode = true;
    const intro = reviewerInsights.codeShared[Math.floor(Math.random() * reviewerInsights.codeShared.length)];
    response = `${intro}<br><br>`;
    
    // Give specific feedback based on current phase
    if (currentReviewerPhase === 'specification' || currentReviewerPhase === 'approach') {
      currentReviewerPhase = 'codeReview';
      phaseQuestionIndex = 0;
    }
    
    response += getCodeReviewFeedback(userMessage);
  }
  // If user described their approach
  else if (analysis.hasApproach) {
    const intro = reviewerInsights.approachShared[Math.floor(Math.random() * reviewerInsights.approachShared.length)];
    response = `${intro}<br><br>`;
    
    if (currentReviewerPhase === 'specification') {
      currentReviewerPhase = 'approach';
      phaseQuestionIndex = 0;
    }
    
    response += getApproachFeedback(userMessage);
  }
  // If user mentioned edge cases  
  else if (analysis.hasEdgeCases) {
    const praise = reviewerInsights.edgeCaseGood[Math.floor(Math.random() * reviewerInsights.edgeCaseGood.length)];
    response = `${praise}<br><br>`;
    response += getNextGuidingQuestion(analysis);
  }
  // If user needs help
  else if (analysis.needsHelp) {
    response = getHelpfulHint();
  }
  // If discussing problem understanding
  else if (analysis.hasUnderstanding) {
    response = "Good! I can see you're understanding the problem. ";
    response += getNextGuidingQuestion(analysis);
  }
  // General response - continue with current phase
  else {
    response = getNextGuidingQuestion(analysis);
  }
  
  return response;
}

// Get next guiding question based on current phase
function getNextGuidingQuestion(analysis) {
  const phase = reviewerPhases[currentReviewerPhase];
  
  // If we have more questions in current phase
  if (phaseQuestionIndex < phase.questions.length) {
    const question = phase.questions[phaseQuestionIndex];
    phaseQuestionIndex++;
    return question;
  }
  // Move to next phase
  else {
    return progressToNextPhase();
  }
}

// Progress to the next review phase
function progressToNextPhase() {
  const phaseOrder = ['specification', 'approach', 'codeReview', 'optimization', 'testing'];
  const currentIndex = phaseOrder.indexOf(currentReviewerPhase);
  
  // Move to next phase if available
  if (currentIndex < phaseOrder.length - 1) {
    const nextPhase = phaseOrder[currentIndex + 1];
    
    // Skip codeReview if user hasn't shared code yet
    if (nextPhase === 'codeReview' && !userHasSharedCode) {
      const response = "I notice you haven't shared your code yet. When you're ready, paste it here and I'll review it! Or we can continue discussing your approach.";
      return response;
    }
    
    currentReviewerPhase = nextPhase;
    phaseQuestionIndex = 0;
    
    const phase = reviewerPhases[nextPhase];
    return `<br><br>${phase.intro}<br><br>${phase.questions[0]}`;
  }
  // We've completed all phases
  else {
    return `🎉 Excellent work! We've covered:<br>
      ✅ Problem specification and constraints<br>
      ✅ Your approach and algorithm<br>
      ✅ Code review and edge cases<br>
      ✅ Optimization opportunities<br>
      ✅ Testing strategy<br><br>
      You've thought through this like a real engineer! This is exactly how you should approach problems in interviews. Keep practicing this systematic approach! 💪<br><br>
      Want to discuss anything else about this problem?`;
  }
}

// Provide code review feedback
function getCodeReviewFeedback(code) {
  const feedbacks = [
    "Looking at your code structure... I see you're using [describe pattern]. Let me ask - how does this handle the edge case when the input is empty?",
    "Your logic looks solid for the happy path. But what happens at the array boundaries? Could you get an index out of bounds error anywhere?",
    "I notice you're iterating through the data. What's the time complexity here? And could we optimize it with a different data structure like a hash map?",
    "Good start! But I see a potential issue - what if the input contains null or undefined values? Does your code handle that?",
    "Interesting approach! Walk me through a specific example: if the input is [2, 7, 11, 15] and target is 9, what does your code do step by step?"
  ];
  
  const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
  phaseQuestionIndex++;
  return feedback;
}

// Provide approach feedback
function getApproachFeedback(approach) {
  const feedbacks = [
    "That's a reasonable starting point! Now, let's analyze the complexity - what's the time complexity of your approach? Can you express it in Big O notation?",
    "I like your thinking. But let me challenge you - is there a way to solve this in one pass instead of multiple passes through the data?",
    "Good observation! Now, what data structure would be most efficient here? Think about what operations you need - lookups, insertions, ordering?",
    "That could work! But consider the constraints - if the input size is 10^5, will your approach be fast enough? What's the time complexity?",
    "Solid start! Now, before we code, let's think about edge cases. What are the smallest or most extreme inputs this needs to handle?"
  ];
  
  const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
  phaseQuestionIndex++;
  return feedback;
}

// Provide helpful hint when user is stuck
function getHelpfulHint() {
  const hints = [
    "No worries! Let's break this down. Start with the brute force approach - what's the simplest way to solve this, even if it's not optimal?",
    "When you're stuck, go back to examples. Pick a simple input and manually work through what the output should be. What pattern do you notice?",
    "Think about what information you need to track as you process the input. What data structure would help you store and retrieve that information quickly?",
    "Let's think about the problem differently. What's the bottleneck? What operation are you repeating that could be optimized?",
    "Here's a hint: look at the constraints. They often tell you what time complexity is expected. O(n)? O(n log n)? That guides your algorithm choice."
  ];
  
  return hints[Math.floor(Math.random() * hints.length)];
}

// Add reviewer message
function addReviewerMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message reviewer';
  messageDiv.innerHTML = `
    <div class="message-header">🎯 Reviewer</div>
    <div class="message-content">${text}</div>
  `;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add user message
function addUserMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message user';
  messageDiv.innerHTML = `
    <div class="message-header">You</div>
    <div class="message-content">${text}</div>
  `;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Timer functions
function startTimer() {
  timerSeconds = 0;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
    
    // Optional: Add warnings at certain times
    if (timerSeconds === 300) { // 5 minutes
      addReviewerMessage("⏰ You've been working for 5 minutes. Try to wrap up your thoughts soon.");
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Error display helper
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #fee2e2;
    color: #991b1b;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 1000;
    font-size: 14px;
    max-width: 80%;
    text-align: center;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

// Add navigation to dashboard and settings
function addNavigationButtons() {
  const header = document.querySelector('.container h1');
  if (header && !document.getElementById('navButtons')) {
    const navDiv = document.createElement('div');
    navDiv.id = 'navButtons';
    navDiv.style.cssText = `
      display: flex;
      gap: 8px;
      margin-top: 15px;
    `;
    
    navDiv.innerHTML = `
      <button id="dashboardBtn" class="btn btn-small" style="flex: 1; padding: 8px; font-size: 13px; background: rgba(255,255,255,0.9); color: #667eea; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
        📊 Dashboard
      </button>
      <button id="settingsBtn" class="btn btn-small" style="flex: 1; padding: 8px; font-size: 13px; background: rgba(255,255,255,0.9); color: #667eea; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
        ⚙️ Settings
      </button>
    `;
    
    header.parentElement.insertBefore(navDiv, header.nextSibling);
    
    document.getElementById('dashboardBtn').addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
    
    document.getElementById('settingsBtn').addEventListener('click', () => {
      window.location.href = 'settings.html';
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Focus on problem input
  problemNumber.focus();
  
  // Add navigation
  addNavigationButtons();
  
  // Check if AI is configured
  setTimeout(async () => {
    if (!aiInitialized) {
      const hint = document.createElement('div');
      hint.style.cssText = `
        background: #fef3c7;
        color: #92400e;
        padding: 10px;
        border-radius: 8px;
        font-size: 12px;
        margin-top: 10px;
        text-align: center;
      `;
      hint.innerHTML = `💡 <strong>Tip:</strong> Configure AI in Settings for smarter responses!`;
      document.querySelector('.input-group').appendChild(hint);
    }
  }, 1000);
});
