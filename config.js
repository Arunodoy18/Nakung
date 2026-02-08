// Configuration file for the extension
const CONFIG = {
  // Hugging Face API configuration
  AI_API: {
    endpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    // Users will need to add their own API key in settings
    defaultModel: 'microsoft/DialoGPT-medium',
    timeout: 30000, // 30 seconds
    maxRetries: 3
  },
  
  // Storage keys
  STORAGE_KEYS: {
    SOLUTIONS: 'problemSolutions',
    PROGRESS: 'userProgress',
    SETTINGS: 'userSettings',
    STATISTICS: 'userStatistics',
    TAGS: 'problemTags',
    API_KEY: 'hfApiKey'
  },
  
  // Platform configurations
  PLATFORMS: {
    LEETCODE: {
      name: 'LeetCode',
      patterns: ['leetcode.com/problems'],
      problemSelector: '.css-v3d350',
      titleSelector: '[data-cy="question-title"]'
    },
    CODEFORCES: {
      name: 'Codeforces',
      patterns: ['codeforces.com/problemset/problem', 'codeforces.com/contest'],
      problemSelector: '.problem-statement',
      titleSelector: '.title'
    },
    HACKERRANK: {
      name: 'HackerRank',
      patterns: ['hackerrank.com/challenges'],
      problemSelector: '.challenge-body',
      titleSelector: '.challenge-heading'
    }
  },
  
  // Timer configurations
  TIMER: {
    DEFAULT_DURATION: 3600, // 1 hour in seconds
    WARNING_TIME: 300 // 5 minutes
  },
  
  // Statistics
  DIFFICULTY_LEVELS: ['Easy', 'Medium', 'Hard'],
  
  // Version
  VERSION: '1.0.0'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
