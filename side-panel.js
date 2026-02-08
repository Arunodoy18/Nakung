// Side Panel Manager - Persistent UI for Problem Solving
class SidePanelManager {
  constructor() {
    this.panelElement = null;
    this.toggleButton = null;
    this.isOpen = false;
    this.currentProblem = null;
    this.aiDifficulty = 'medium'; // easy, medium, hard
    this.sessionNotes = '';
    this.steps = [];
    this.currentStepIndex = 0;
    this.init();
  }

  init() {
    this.createPanel();
    this.createToggleButton();
    this.attachEventListeners();
    this.loadSessionData();
    this.detectProblem();
  }

  createPanel() {
    this.panelElement = document.createElement('div');
    this.panelElement.id = 'psa-side-panel';
    this.panelElement.innerHTML = `
      <div class="psa-panel-header">
        <h2>🚀 Nakung</h2>
        <button class="psa-close-btn" id="psa-close">×</button>
      </div>
      
      <div class="psa-platform-banner" id="psa-platform-banner">
        <span class="psa-platform-icon">📍</span>
        <span id="psa-platform-name">Detecting platform...</span>
      </div>
      
      <div class="psa-panel-content" id="psa-content">
        <div class="psa-loading">
          <div class="psa-spinner"></div>
          <p>Initializing...</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.panelElement);
    
    // Inject CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('side-panel.css');
    document.head.appendChild(link);
  }

  createToggleButton() {
    this.toggleButton = document.createElement('button');
    this.toggleButton.id = 'psa-toggle-btn';
    this.toggleButton.textContent = '🚀 AI ASSIST';
    document.body.appendChild(this.toggleButton);
  }

  attachEventListeners() {
    // Toggle panel
    this.toggleButton.addEventListener('click', () => this.togglePanel());
    
    // Close button
    const closeBtn = document.getElementById('psa-close');
    closeBtn.addEventListener('click', () => this.closePanel());
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closePanel();
      }
    });
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
    this.panelElement.classList.add('open');
    this.toggleButton.style.right = '450px';
  }

  closePanel() {
    this.isOpen = false;
    this.panelElement.classList.remove('open');
    this.toggleButton.style.right = '0';
  }

  detectProblem() {
    const platform = this.detectPlatform();
    const banner = document.getElementById('psa-platform-banner');
    const platformName = document.getElementById('psa-platform-name');
    
    if (platform) {
      document.body.classList.add('psa-supported-platform');
      platformName.textContent = `${platform.name} detected`;
      this.currentProblem = this.extractProblemInfo(platform);
      this.renderContent();
    } else {
      platformName.textContent = 'Supported: LeetCode, Codeforces, HackerRank, CodeChef';
      this.renderUnsupportedPlatform();
    }
  }

  detectPlatform() {
    const url = window.location.hostname;
    
    if (url.includes('leetcode.com')) {
      return { name: 'LeetCode', type: 'leetcode' };
    } else if (url.includes('codeforces.com')) {
      return { name: 'Codeforces', type: 'codeforces' };
    } else if (url.includes('hackerrank.com')) {
      return { name: 'HackerRank', type: 'hackerrank' };
    } else if (url.includes('codechef.com')) {
      return { name: 'CodeChef', type: 'codechef' };
    }
    
    return null;
  }

  extractProblemInfo(platform) {
    let problem = {
      title: 'Problem',
      difficulty: 'medium',
      tags: [],
      number: ''
    };

    try {
      if (platform.type === 'leetcode') {
        const titleElement = document.querySelector('[data-cy="question-title"]') || 
                           document.querySelector('.text-title-large');
        if (titleElement) {
          problem.title = titleElement.textContent.trim();
        }
        
        const diffElement = document.querySelector('[diff]') || 
                           document.querySelector('.text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard');
        if (diffElement) {
          problem.difficulty = diffElement.textContent.toLowerCase().trim();
        }
        
        const tagElements = document.querySelectorAll('[class*="topic-tag"]');
        problem.tags = Array.from(tagElements).map(el => el.textContent.trim()).slice(0, 5);
        
      } else if (platform.type === 'codeforces') {
        const titleElement = document.querySelector('.title');
        if (titleElement) {
          problem.title = titleElement.textContent.trim();
        }
        
        const problemCode = window.location.pathname.match(/problem\/([A-Z]\d?)/);
        if (problemCode) {
          problem.number = problemCode[1];
        }
        
        problem.tags = Array.from(document.querySelectorAll('.tag-box')).map(el => el.textContent.trim());
        
      } else if (platform.type === 'hackerrank') {
        const titleElement = document.querySelector('.challengecard-title, .page-title');
        if (titleElement) {
          problem.title = titleElement.textContent.trim();
        }
        
        const diffElement = document.querySelector('.difficulty');
        if (diffElement) {
          problem.difficulty = diffElement.textContent.toLowerCase().trim();
        }
        
      } else if (platform.type === 'codechef') {
        const titleElement = document.querySelector('.problem-heading h1, .problem-title');
        if (titleElement) {
          problem.title = titleElement.textContent.trim();
        }
        
        problem.difficulty = 'medium';
      }
    } catch (error) {
      console.error('Error extracting problem info:', error);
    }

    return problem;
  }

  renderContent() {
    const content = document.getElementById('psa-content');
    content.innerHTML = `
      ${this.renderProblemCard()}
      ${this.renderDifficultySelector()}
      ${this.renderActions()}
      ${this.renderSessionNotes()}
      ${this.renderSteps()}
    `;
    
    this.attachContentEventListeners();
  }

  renderProblemCard() {
    if (!this.currentProblem) return '';
    
    return `
      <div class="psa-problem-card psa-fade-in">
        <div class="psa-problem-title">
          <span>${this.currentProblem.title}</span>
          <span class="psa-difficulty-badge ${this.currentProblem.difficulty}">
            ${this.currentProblem.difficulty}
          </span>
        </div>
        <div class="psa-problem-meta">
          ${this.currentProblem.number ? `Problem: ${this.currentProblem.number}` : ''}
        </div>
        ${this.currentProblem.tags.length > 0 ? `
          <div class="psa-problem-tags">
            ${this.currentProblem.tags.map(tag => `<span class="psa-tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderDifficultySelector() {
    return `
      <div class="psa-difficulty-selector psa-fade-in">
        <h3>🎯 AI Assistance Level</h3>
        <div class="psa-difficulty-options">
          <div class="psa-difficulty-option ${this.aiDifficulty === 'easy' ? 'active' : ''}" data-level="easy">
            <span class="emoji">🌱</span>
            <span>Gentle</span>
          </div>
          <div class="psa-difficulty-option ${this.aiDifficulty === 'medium' ? 'active' : ''}" data-level="medium">
            <span class="emoji">⚡</span>
            <span>Balanced</span>
          </div>
          <div class="psa-difficulty-option ${this.aiDifficulty === 'hard' ? 'active' : ''}" data-level="hard">
            <span class="emoji">🔥</span>
            <span>Minimal</span>
          </div>
        </div>
      </div>
    `;
  }

  renderActions() {
    return `
      <div class="psa-action-section psa-fade-in">
        <button class="psa-btn psa-btn-primary" id="psa-get-hint">
          💡 Get Hint
        </button>
        <button class="psa-btn psa-btn-secondary" id="psa-start-interview">
          🎤 Interview Mode
        </button>
        <button class="psa-btn psa-btn-secondary" id="psa-explain-solution">
          📚 Explain Solution
        </button>
      </div>
    `;
  }

  renderSessionNotes() {
    return `
      <div class="psa-notes-section psa-fade-in">
        <h3>📝 Session Notes</h3>
        <textarea 
          class="psa-notes-textarea" 
          id="psa-notes"
          placeholder="Take notes while solving...&#10;&#10;• Key insights&#10;• Edge cases&#10;• Time complexity&#10;• Space complexity"
        >${this.sessionNotes}</textarea>
        <div class="psa-notes-actions">
          <button class="psa-btn psa-btn-primary psa-btn-small" id="psa-save-notes">
            💾 Save
          </button>
          <button class="psa-btn psa-btn-secondary psa-btn-small" id="psa-clear-notes">
            🗑️ Clear
          </button>
        </div>
      </div>
    `;
  }

  renderSteps() {
    if (this.steps.length === 0) return '';
    
    return `
      <div class="psa-steps-container psa-fade-in">
        <h3>🎯 Step-by-Step Guide</h3>
        ${this.steps.map((step, index) => this.renderStep(step, index)).join('')}
      </div>
    `;
  }

  renderStep(step, index) {
    const isCompleted = index < this.currentStepIndex;
    const isUnlocked = index <= this.currentStepIndex;
    const status = isCompleted ? 'completed' : (isUnlocked ? 'unlocked' : 'locked');
    
    return `
      <div class="psa-step ${status}" data-step="${index}">
        <div class="psa-step-header">
          <div class="psa-step-number">${index + 1}</div>
          <div class="psa-step-title">${step.title}</div>
          <div class="psa-step-status">
            ${isCompleted ? '✅' : (isUnlocked ? '🔓' : '🔒')}
          </div>
        </div>
        <div class="psa-step-content">
          <p>${step.content}</p>
          ${isUnlocked && !isCompleted ? `
            <div class="psa-step-actions">
              <button class="psa-btn psa-btn-primary psa-btn-small" data-action="complete" data-step="${index}">
                Mark Complete
              </button>
              <button class="psa-btn psa-btn-secondary psa-btn-small" data-action="hint" data-step="${index}">
                Need Help
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  attachContentEventListeners() {
    // Difficulty selector
    document.querySelectorAll('.psa-difficulty-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const level = e.currentTarget.dataset.level;
        this.aiDifficulty = level;
        this.saveSessionData();
        this.renderContent();
      });
    });

    // Action buttons
    document.getElementById('psa-get-hint')?.addEventListener('click', () => this.handleGetHint());
    document.getElementById('psa-start-interview')?.addEventListener('click', () => this.handleStartInterview());
    document.getElementById('psa-explain-solution')?.addEventListener('click', () => this.handleExplainSolution());

    // Notes
    document.getElementById('psa-notes')?.addEventListener('input', (e) => {
      this.sessionNotes = e.target.value;
    });
    document.getElementById('psa-save-notes')?.addEventListener('click', () => this.saveNotes());
    document.getElementById('psa-clear-notes')?.addEventListener('click', () => this.clearNotes());

    // Step actions
    document.querySelectorAll('[data-action="complete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const stepIndex = parseInt(e.currentTarget.dataset.step);
        this.completeStep(stepIndex);
      });
    });
    
    document.querySelectorAll('[data-action="hint"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const stepIndex = parseInt(e.currentTarget.dataset.step);
        this.getStepHint(stepIndex);
      });
    });
  }

  async handleGetHint() {
    if (!this.currentProblem) return;
    
    const response = await this.callAI('hint', {
      problem: this.currentProblem,
      difficulty: this.aiDifficulty
    });
    
    this.showNotification('Hint', response, 'info');
  }

  async handleStartInterview() {
    // Open extension popup for interview mode
    chrome.runtime.sendMessage({
      action: 'openPopup',
      mode: 'interview',
      problem: this.currentProblem
    });
  }

  async handleExplainSolution() {
    if (!this.currentProblem) return;
    
    // Initialize step-by-step mode
    this.steps = await this.generateSteps();
    this.currentStepIndex = 0;
    this.renderContent();
    
    this.showNotification('Step-by-Step Mode', 'Follow the steps below to solve this problem!', 'success');
  }

  async generateSteps() {
    // Generate problem-solving steps based on problem type
    const baseSteps = [
      {
        title: 'Understand the Problem',
        content: 'Read the problem carefully. What are the inputs? What are the expected outputs? What are the constraints?'
      },
      {
        title: 'Identify the Pattern',
        content: 'What algorithm or data structure would be best suited for this problem? Look at the tags for hints.'
      },
      {
        title: 'Plan the Approach',
        content: 'Write pseudocode or outline your solution. Consider edge cases and how to handle them.'
      },
      {
        title: 'Implement the Solution',
        content: 'Code your solution. Focus on correctness first, then optimize.'
      },
      {
        title: 'Test & Optimize',
        content: 'Test with sample inputs and edge cases. Analyze time and space complexity. Can you optimize further?'
      }
    ];

    return baseSteps;
  }

  completeStep(index) {
    if (index === this.currentStepIndex) {
      this.currentStepIndex++;
      this.saveSessionData();
      this.renderContent();
      
      if (this.currentStepIndex >= this.steps.length) {
        this.showNotification('Congratulations!', 'You completed all steps! 🎉', 'success');
      }
    }
  }

  async getStepHint(index) {
    const step = this.steps[index];
    const hint = await this.callAI('step-hint', {
      step: step,
      problem: this.currentProblem,
      difficulty: this.aiDifficulty
    });
    
    this.showNotification(`Hint for: ${step.title}`, hint, 'info');
  }

  async callAI(type, data) {
    // Call extension AI service
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'callAI',
        type: type,
        data: data
      }, (response) => {
        resolve(response?.result || 'AI response not available. Configure your API key in settings.');
      });
    });
  }

  saveNotes() {
    this.saveSessionData();
    this.showNotification('Notes Saved', 'Your session notes have been saved!', 'success');
  }

  clearNotes() {
    if (confirm('Clear all session notes?')) {
      this.sessionNotes = '';
      document.getElementById('psa-notes').value = '';
      this.saveSessionData();
      this.showNotification('Notes Cleared', 'Session notes cleared.', 'info');
    }
  }

  saveSessionData() {
    const sessionKey = `session_${window.location.href}`;
    chrome.storage.local.set({
      [sessionKey]: {
        problem: this.currentProblem,
        aiDifficulty: this.aiDifficulty,
        notes: this.sessionNotes,
        steps: this.steps,
        currentStepIndex: this.currentStepIndex,
        timestamp: Date.now()
      }
    });
  }

  loadSessionData() {
    const sessionKey = `session_${window.location.href}`;
    chrome.storage.local.get([sessionKey], (result) => {
      const data = result[sessionKey];
      if (data && (Date.now() - data.timestamp < 24 * 60 * 60 * 1000)) { // 24 hours
        this.currentProblem = data.problem || this.currentProblem;
        this.aiDifficulty = data.aiDifficulty || this.aiDifficulty;
        this.sessionNotes = data.notes || '';
        this.steps = data.steps || [];
        this.currentStepIndex = data.currentStepIndex || 0;
      }
    });
  }

  renderUnsupportedPlatform() {
    const content = document.getElementById('psa-content');
    content.innerHTML = `
      <div class="psa-fade-in" style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 64px; margin-bottom: 20px;">🌐</div>
        <h3 style="color: #1a202c; margin-bottom: 12px;">Platform Not Supported</h3>
        <p style="color: #718096; margin-bottom: 24px;">
          This extension works on:
        </p>
        <ul style="text-align: left; color: #4a5568; line-height: 1.8;">
          <li>✅ LeetCode</li>
          <li>✅ Codeforces</li>
          <li>✅ HackerRank</li>
          <li>✅ CodeChef</li>
        </ul>
      </div>
    `;
  }

  showNotification(title, message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: ${this.isOpen ? '470px' : '20px'};
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 1000000;
      max-width: 350px;
      border-left: 4px solid ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#fd8c73'};
      animation: psa-slide-in 0.4s ease;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: 700; color: #1a202c; margin-bottom: 8px; font-size: 15px;">${title}</div>
      <div style="color: #4a5568; font-size: 13px; line-height: 1.6;">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(20px)';
      notification.style.transition = 'all 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SidePanelManager();
  });
} else {
  new SidePanelManager();
}
