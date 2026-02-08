// Storage management utilities
class StorageManager {
  constructor() {
    this.storage = chrome.storage.local;
  }

  // Save solution with metadata
  async saveSolution(problemId, data) {
    try {
      const solutions = await this.getSolutions();
      solutions[problemId] = {
        ...data,
        lastUpdated: new Date().toISOString(),
        problemId
      };
      await this.storage.set({ [CONFIG.STORAGE_KEYS.SOLUTIONS]: solutions });
      
      // Update statistics
      await this.updateStatistics('problemsSolved', problemId);
      return { success: true };
    } catch (error) {
      console.error('Error saving solution:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all solutions
  async getSolutions() {
    try {
      const result = await this.storage.get(CONFIG.STORAGE_KEYS.SOLUTIONS);
      return result[CONFIG.STORAGE_KEYS.SOLUTIONS] || {};
    } catch (error) {
      console.error('Error getting solutions:', error);
      return {};
    }
  }

  // Get specific solution
  async getSolution(problemId) {
    try {
      const solutions = await this.getSolutions();
      return solutions[problemId] || null;
    } catch (error) {
      console.error('Error getting solution:', error);
      return null;
    }
  }

  // Save user progress
  async saveProgress(problemId, status, difficulty = null) {
    try {
      const progress = await this.getProgress();
      
      if (!progress[problemId]) {
        progress[problemId] = {
          problemId,
          status,
          difficulty,
          attempts: 1,
          firstAttempt: new Date().toISOString(),
          lastAttempt: new Date().toISOString(),
          timeSpent: 0
        };
      } else {
        progress[problemId].status = status;
        progress[problemId].attempts += 1;
        progress[problemId].lastAttempt = new Date().toISOString();
      }
      
      await this.storage.set({ [CONFIG.STORAGE_KEYS.PROGRESS]: progress });
      return { success: true };
    } catch (error) {
      console.error('Error saving progress:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user progress
  async getProgress() {
    try {
      const result = await this.storage.get(CONFIG.STORAGE_KEYS.PROGRESS);
      return result[CONFIG.STORAGE_KEYS.PROGRESS] || {};
    } catch (error) {
      console.error('Error getting progress:', error);
      return {};
    }
  }

  // Update statistics
  async updateStatistics(type, data) {
    try {
      const stats = await this.getStatistics();
      const today = new Date().toISOString().split('T')[0];
      
      if (!stats.dailyActivity) {
        stats.dailyActivity = {};
      }
      
      if (!stats.dailyActivity[today]) {
        stats.dailyActivity[today] = { problems: [], timeSpent: 0 };
      }
      
      if (type === 'problemsSolved' && !stats.dailyActivity[today].problems.includes(data)) {
        stats.dailyActivity[today].problems.push(data);
        stats.totalProblems = (stats.totalProblems || 0) + 1;
        
        // Update streak
        this.updateStreak(stats);
      }
      
      await this.storage.set({ [CONFIG.STORAGE_KEYS.STATISTICS]: stats });
      return { success: true };
    } catch (error) {
      console.error('Error updating statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      const result = await this.storage.get(CONFIG.STORAGE_KEYS.STATISTICS);
      return result[CONFIG.STORAGE_KEYS.STATISTICS] || {
        totalProblems: 0,
        currentStreak: 0,
        longestStreak: 0,
        dailyActivity: {}
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { totalProblems: 0, currentStreak: 0, longestStreak: 0, dailyActivity: {} };
    }
  }

  // Update streak calculation
  updateStreak(stats) {
    const dates = Object.keys(stats.dailyActivity).sort().reverse();
    let streak = 0;
    let today = new Date();
    
    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i]);
      const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === i) {
        streak++;
      } else {
        break;
      }
    }
    
    stats.currentStreak = streak;
    stats.longestStreak = Math.max(stats.longestStreak || 0, streak);
  }

  // Save tags for a problem
  async saveTags(problemId, tags) {
    try {
      const allTags = await this.getTags();
      allTags[problemId] = tags;
      await this.storage.set({ [CONFIG.STORAGE_KEYS.TAGS]: allTags });
      return { success: true };
    } catch (error) {
      console.error('Error saving tags:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all tags
  async getTags() {
    try {
      const result = await this.storage.get(CONFIG.STORAGE_KEYS.TAGS);
      return result[CONFIG.STORAGE_KEYS.TAGS] || {};
    } catch (error) {
      console.error('Error getting tags:', error);
      return {};
    }
  }

  // Save settings
  async saveSettings(settings) {
    try {
      await this.storage.set({ [CONFIG.STORAGE_KEYS.SETTINGS]: settings });
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { success: false, error: error.message };
    }
  }

  // Get settings
  async getSettings() {
    try {
      const result = await this.storage.get(CONFIG.STORAGE_KEYS.SETTINGS);
      return result[CONFIG.STORAGE_KEYS.SETTINGS] || {
        apiKey: '',
        theme: 'dark',
        notifications: true,
        autoSync: true
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return { apiKey: '', theme: 'dark', notifications: true, autoSync: true };
    }
  }

  // Clear all data (for export/reset)
  async clearAllData() {
    try {
      await this.storage.clear();
      return { success: true };
    } catch (error) {
      console.error('Error clearing data:', error);
      return { success: false, error: error.message };
    }
  }

  // Export data
  async exportData() {
    try {
      const solutions = await this.getSolutions();
      const progress = await this.getProgress();
      const statistics = await this.getStatistics();
      const tags = await this.getTags();
      
      return {
        version: CONFIG.VERSION,
        exportDate: new Date().toISOString(),
        data: { solutions, progress, statistics, tags }
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  // Import data
  async importData(data) {
    try {
      if (data.version !== CONFIG.VERSION) {
        console.warn('Importing data from different version');
      }
      
      await this.storage.set({
        [CONFIG.STORAGE_KEYS.SOLUTIONS]: data.data.solutions || {},
        [CONFIG.STORAGE_KEYS.PROGRESS]: data.data.progress || {},
        [CONFIG.STORAGE_KEYS.STATISTICS]: data.data.statistics || {},
        [CONFIG.STORAGE_KEYS.TAGS]: data.data.tags || {}
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create global instance
const storageManager = new StorageManager();
