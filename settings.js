// Settings page logic
let currentSettings = {};

console.log('[Nakung Settings] Settings page loaded');

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadDataStats();
  setupEventListeners();
});

async function loadSettings() {
  try {
    currentSettings = await storageManager.getSettings();
    
    // Settings now loaded - AI is pre-configured with Mistral-7B-Instruct
    // No API key needed from user
    console.log('[Nakung Settings] Settings loaded:', currentSettings);
    
  } catch (error) {
    console.error('[Nakung Settings] Error loading settings:', error);
  }
}

async function loadDataStats() {
  try {
    const solutions = await storageManager.getSolutions();
    const progress = await storageManager.getProgress();
    
    const storedSolutionsEl = document.getElementById('storedSolutions');
    const storedNotesEl = document.getElementById('storedNotes');
    const dataSizeEl = document.getElementById('dataSize');
    
    if (storedSolutionsEl) {
      storedSolutionsEl.textContent = Object.keys(solutions).length;
    }
    
    if (storedNotesEl) {
      storedNotesEl.textContent = Object.keys(progress).length;
    }
    
    if (dataSizeEl) {
      // Calculate approximate storage size
      const dataStr = JSON.stringify({ solutions, progress });
      const sizeKB = Math.round(dataStr.length / 1024);
      dataSizeEl.textContent = `${sizeKB} KB`;
    }
    
  } catch (error) {
    console.error('[Nakung Settings] Error loading data stats:', error);
  }
}

function setupEventListeners() {
  // Back button
  const backBtn = document.getElementById('backToMain');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'popup.html';
    });
  }
  
  // Test Connection button
  const testConnectionBtn = document.getElementById('testConnectionBtn');
  if (testConnectionBtn) {
    testConnectionBtn.addEventListener('click', async () => {
      const statusEl = document.getElementById('connectionStatus');
      const btn = testConnectionBtn;
      
      console.log('[Nakung Settings] Testing backend connection...');
      
      // Show loading state
      btn.disabled = true;
      btn.textContent = '⏳ Testing...';
      statusEl.textContent = '';
      statusEl.style.color = '#6b7280';
      
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'TEST_CONNECTION'
        });
        
        console.log('[Nakung Settings] Test result:', response);
        
        if (response.success) {
          statusEl.textContent = `✅ ${response.message}`;
          statusEl.style.color = '#10b981';
          btn.style.background = '#10b981';
          btn.textContent = '✅ Connected';
          
          setTimeout(() => {
            btn.style.background = '';
            btn.textContent = 'Test Backend Connection';
          }, 3000);
        } else {
          const errorMsg = response.error || response.message || 'Connection failed';
          statusEl.textContent = `❌ ${errorMsg}`;
          statusEl.style.color = '#ef4444';
          btn.style.background = '#ef4444';
          btn.textContent = '❌ Failed';
          
          setTimeout(() => {
            btn.style.background = '';
            btn.textContent = 'Test Backend Connection';
          }, 3000);
        }
      } catch (error) {
        console.error('[Nakung Settings] Connection test error:', error);
        statusEl.textContent = '❌ Connection failed';
        statusEl.style.color = '#ef4444';
        btn.style.background = '#ef4444';
        btn.textContent = '❌ Error';
        
        setTimeout(() => {
          btn.style.background = '';
          btn.textContent = 'Test Backend Connection';
        }, 3000);
      } finally {
        btn.disabled = false;
      }
    });
  }
  
  // AI is pre-configured - no API key needed
  // Using Mistral-7B-Instruct model via backend
  
  // Save settings
  const saveSettingsBtn = document.getElementById('saveSettings');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async () => {
      const settings = {
        theme: document.getElementById('theme')?.value || 'light',
        notifications: document.getElementById('notifications')?.checked || false,
        dailyReminder: document.getElementById('dailyReminder')?.checked || false,
        autoOpen: true
      };
    
      const result = await storageManager.saveSettings(settings);
      
      if (result.success) {
        // Show success message
        const btn = document.getElementById('saveSettings');
        const originalText = btn.textContent;
        btn.textContent = '✅ Saved!';
        btn.style.background = '#10b981';
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 2000);
      } else {
        alert('Error saving settings. Please try again.');
      }
    });
  }
  
  // Export data
  const exportDataBtn = document.getElementById('exportData');
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', async () => {
      const data = await storageManager.exportData();
      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `problem-solver-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }
  
  // Import data
  const importDataBtn = document.getElementById('importData');
  if (importDataBtn) {
    importDataBtn.addEventListener('click', () => {
      const importFileInput = document.getElementById('importFile');
      if (importFileInput) importFileInput.click();
    });
  }
  
  const importFileInput = document.getElementById('importFile');
  if (importFileInput) {
    importFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target.result);
            const result = await storageManager.importData(data);
            
            if (result.success) {
              alert('✅ Data imported successfully!');
              await loadDataStats();
            } else {
              alert('❌ Import failed: ' + result.error);
            }
          } catch (error) {
            alert('❌ Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    });
  }
  
  // Clear all data
  const clearDataBtn = document.getElementById('clearData');
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', async () => {
      if (confirm('⚠️ Are you sure? This will delete all your solutions, progress, and statistics. This cannot be undone!')) {
        if (confirm('⚠️ Last chance! Really delete everything?')) {
          const result = await storageManager.clearAllData();
          if (result.success) {
            alert('✅ All data cleared');
            await loadDataStats();
          }
        }
      }
    });
  }
  
  // About links
  const reportIssueBtn = document.getElementById('reportIssue');
  if (reportIssueBtn) {
    reportIssueBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('https://github.com/your-repo/issues', '_blank');
    });
  }
  
  const giveFeedbackBtn = document.getElementById('giveFeedback');
  if (giveFeedbackBtn) {
    giveFeedbackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('https://github.com/your-repo/discussions', '_blank');
    });
  }
}

function showMessage(text, type = 'info') {
  const messageEl = document.getElementById('message');
  if (!messageEl) return;
  
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  messageEl.classList.remove('hidden');
  
  setTimeout(() => {
    messageEl.classList.add('hidden');
  }, 4000);
}

function showStatus(element, message, type) {
  if (element) {
    element.textContent = message;
    element.className = 'status-message';
    
    if (type === 'success') {
      element.classList.add('success');
    } else if (type === 'error') {
      element.classList.add('error');
    } else if (type === 'loading') {
      element.style.display = 'block';
      element.style.background = '#dbeafe';
      element.style.color = '#1e40af';
    }
    
    if (type !== 'loading') {
      setTimeout(() => {
        element.style.display = 'none';
      }, 5000);
    }
  }
}
