// Simple popup script for Nakung
document.addEventListener('DOMContentLoaded', async () => {
  // Load settings
  const settings = await chrome.storage.local.get(['userSettings', 'nakung-theme']);
  
  // Check API key status
  const apiKey = settings.userSettings?.apiKey;
  const statusEl = document.getElementById('status');
  
  if (apiKey) {
    statusEl.className = 'status ready';
    statusEl.innerHTML = '<strong>✅ Ready to use!</strong><br>Open any problem page on supported platforms';
  }
  
  // Setup toggle buttons
  const autoOpenToggle = document.getElementById('toggle-autoopen');
  const themeToggle = document.getElementById('toggle-theme');
  
  if (settings.userSettings?.autoOpen !== false) {
    autoOpenToggle.classList.add('active');
  }
  
  if (settings['nakung-theme'] === 'dark') {
    themeToggle.classList.add('active');
  }
  
  // Toggle handlers
  autoOpenToggle.addEventListener('click', async () => {
    const isActive = autoOpenToggle.classList.toggle('active');
    const currentSettings = await chrome.storage.local.get(['userSettings']);
    await chrome.storage.local.set({
      userSettings: {
        ...currentSettings.userSettings,
        autoOpen: isActive
      }
    });
  });
  
  themeToggle.addEventListener('click', async () => {
    const isActive = themeToggle.classList.toggle('active');
    await chrome.storage.local.set({
      'nakung-theme': isActive ? 'dark' : 'light'
    });
  });
  
  // Settings button
  document.getElementById('btn-settings').addEventListener('click', () => {
    chrome.tabs.create({ url: 'settings.html' });
  });
  
  // Try it button
  document.getElementById('btn-try').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://leetcode.com/problems/two-sum/' });
  });
});
