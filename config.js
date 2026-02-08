// ============================================================================
// NAKUNG AI CONFIGURATION
// Backend: https://nakung-backend.vercel.app (Groq API + Llama 3.3 70B)
// ============================================================================

const CONFIG = {
  // Backend API Configuration
  BACKEND: {
    url: 'https://nakung-backend.vercel.app/api/chat',
    timeout: 30000, // 30 seconds
    maxRetries: 2
  },
  
  // Storage keys
  STORAGE_KEYS: {
    CURRENT_PROBLEM: 'currentProblem',
    CHAT_HISTORY: 'chatHistory',
    CURRENT_MODE: 'currentMode',
    SETTINGS: 'userSettings',
    LAST_PROBLEM_ID: 'lastProblemId'
  },
  
  // Platform configurations
  PLATFORMS: {
    LEETCODE: {
      name: 'LeetCode',
      color: '#FFA116',
      icon: '💻'
    },
    CODEFORCES: {
      name: 'Codeforces',
      color: '#1F8ACB',
      icon: '🏆'
    },
    HACKERRANK: {
      name: 'HackerRank',
      color: '#00EA64',
      icon: '🎯'
    },
    CODECHEF: {
      name: 'CodeChef',
      color: '#5B4638',
      icon: '👨‍🍳'
    }
  },
  
  // AI Modes
  MODES: {
    PARTNER: {
      name: 'Partner',
      description: 'Friendly mentor who guides with hints',
      icon: '💡',
      systemPrompt: `You are a friendly coding mentor helping a student solve a programming problem. 
Your role is to:
- Guide with Socratic questions, not give direct solutions
- Provide strategic hints about algorithms, data structures, and patterns
- Encourage problem-solving thinking
- Ask clarifying questions about their approach
- Keep responses concise (2-4 sentences)
- Be encouraging and supportive`
    },
    REVIEWER: {
      name: 'Reviewer',
      description: 'FAANG-style technical interviewer',
      icon: '🎯',
      systemPrompt: `You are a senior software engineer conducting a technical coding interview.
Your role is to:
- Ask probing questions about their approach, time/space complexity
- Challenge their thinking with edge cases
- Review code quality and optimization opportunities
- Simulate a real FAANG interview experience
- Keep responses professional and concise (2-4 sentences)
- Focus on understanding their problem-solving process`
    }
  }
};
  DIFFICULTY_LEVELS: ['Easy', 'Medium', 'Hard'],
  
  // Version
  VERSION: '1.0.0'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
