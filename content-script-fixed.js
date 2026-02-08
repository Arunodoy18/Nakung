// ===================================================================
// NAKUNG CONTENT SCRIPT - Problem Detection & Extraction
// ===================================================================

(function() {
  'use strict';

  console.log('═══════════════════════════════════════════════════');
  console.log('[Nakung Content] 🚀 Script loaded on:', window.location.href);
  console.log('═══════════════════════════════════════════════════');

  // Detect platform immediately
  const platformInfo = detectPlatform();
  console.log('[Nakung Content] 📍 Platform detected:', platformInfo);

  if (platformInfo.supported) {
    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('[Nakung Content] ⏳ DOM loaded, starting extraction...');
        initializeExtraction(platformInfo);
      });
    } else {
      console.log('[Nakung Content] ⏳ Page already loaded, starting extraction...');
      initializeExtraction(platformInfo);
    }
  } else {
    console.warn('[Nakung Content] ⚠️ Platform not supported:', window.location.hostname);
    storePlatformNotSupported(platformInfo);
  }

  // ===================================================================
  // PLATFORM DETECTION
  // ===================================================================
  
  function detectPlatform() {
    const url = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();
    
    console.log('[Nakung Content] 🔍 Checking URL:', url);
    
    if (url.includes('leetcode.com/problems/')) {
      return { 
        platform: 'leetcode', 
        name: 'LeetCode', 
        supported: true,
        color: '#FFA116'
      };
    }
    
    if (url.includes('codechef.com/problems/') || url.includes('codechef.com/') && url.includes('/problems/')) {
      return { 
        platform: 'codechef', 
        name: 'CodeChef', 
        supported: true,
        color: '#5B4638'
      };
    }
    
    if (url.includes('hackerrank.com/challenges/')) {
      return { 
        platform: 'hackerrank', 
        name: 'HackerRank', 
        supported: true,
        color: '#00EA64'
      };
    }
    
    if (url.includes('codeforces.com/problemset/problem') || url.includes('codeforces.com/contest/')) {
      return { 
        platform: 'codeforces', 
        name: 'Codeforces', 
        supported: true,
        color: '#1F8ACB'
      };
    }
    
    return { 
      platform: 'unknown', 
      name: hostname, 
      supported: false 
    };
  }

  // ===================================================================
  // INITIALIZATION
  // ===================================================================
  
  function initializeExtraction(platformInfo) {
    // Use multiple retry attempts with increasing delays
    let attempts = 0;
    const maxAttempts = 5;
    const delays = [1000, 2000, 3000, 4000, 5000];
    
    function tryExtract() {
      attempts++;
      console.log(`[Nakung Content] 🔄 Extraction attempt ${attempts}/${maxAttempts}`);
      
      extractAndStoreProblem(platformInfo).then(success => {
        if (success) {
          console.log('[Nakung Content] ✅ Problem extraction successful!');
        } else if (attempts < maxAttempts) {
          console.log(`[Nakung Content] ⏳ Retrying in ${delays[attempts]}ms...`);
          setTimeout(tryExtract, delays[attempts]);
        } else {
          console.error('[Nakung Content] ❌ All extraction attempts failed');
          storePlatformNotSupported(platformInfo);
        }
      });
    }
    
    tryExtract();
  }

  // ===================================================================
  // EXTRACTION & STORAGE
  // ===================================================================
  
  async function extractAndStoreProblem(platformInfo) {
    try {
      console.log('[Nakung Content] 📤 Starting extraction for:', platformInfo.platform);
      
      const problemInfo = await extractProblemInfo(platformInfo);
      
      if (!problemInfo) {
        console.warn('[Nakung Content] ⚠️ Extraction returned null');
        return false;
      }
      
      console.log('[Nakung Content] 📊 Extracted data:', problemInfo);
      
      // Store in chrome.storage.local
      return new Promise((resolve) => {
        chrome.storage.local.set({
          currentProblem: problemInfo,
          lastUpdated: Date.now(),
          extractionSuccessful: true
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('[Nakung Content] ❌ Storage error:', chrome.runtime.lastError);
            resolve(false);
          } else {
            console.log('[Nakung Content] 💾 Problem stored successfully');
            
            // Notify background script
            chrome.runtime.sendMessage({
              type: 'PROBLEM_DETECTED',
              data: problemInfo
            }).catch(err => {
              console.log('[Nakung Content] ℹ️ Background message failed (expected if popup not open)');
            });
            
            resolve(true);
          }
        });
      });
      
    } catch (error) {
      console.error('[Nakung Content] ❌ Extraction error:', error);
      return false;
    }
  }

  function storePlatformNotSupported(platformInfo) {
    chrome.storage.local.set({
      currentProblem: {
        platform: platformInfo.platform,
        platformName: platformInfo.name,
        supported: false,
        title: 'Platform Not Supported Yet',
        description: `${platformInfo.name} support is coming soon!`
      },
      lastUpdated: Date.now(),
      extractionSuccessful: false
    }, () => {
      console.log('[Nakung Content] 💾 Stored unsupported platform info');
    });
  }

  // ===================================================================
  // PROBLEM EXTRACTORS
  // ===================================================================
  
  async function extractProblemInfo(platformInfo) {
    console.log('[Nakung Content] 🎯 Calling extractor for:', platformInfo.platform);
    
    switch(platformInfo.platform) {
      case 'leetcode':
        return await extractLeetCode(platformInfo);
      case 'codechef':
        return await extractCodeChef(platformInfo);
      case 'hackerrank':
        return await extractHackerRank(platformInfo);
      case 'codeforces':
        return await extractCodeforces(platformInfo);
      default:
        console.warn('[Nakung Content] ⚠️ No extractor for platform:', platformInfo.platform);
        return null;
    }
  }

  // --- LEETCODE EXTRACTOR ---
  async function extractLeetCode(platformInfo) {
    try {
      console.log('[Nakung Content] 🟠 Extracting LeetCode problem...');
      
      // Try multiple selectors
      const titleSelectors = [
        '[data-cy="question-title"]',
        'div[class*="text-title"]',
        '.text-title-large',
        'a[class*="text-title"]'
      ];
      
      let titleElement = null;
      for (const selector of titleSelectors) {
        titleElement = document.querySelector(selector);
        if (titleElement) {
          console.log('[Nakung Content] ✓ Found title with selector:', selector);
          break;
        }
      }
      
      if (!titleElement) {
        console.error('[Nakung Content] ❌ Title element not found');
        return null;
      }
      
      const fullTitle = titleElement.textContent.trim();
      console.log('[Nakung Content] 📝 Full title:', fullTitle);
      
      let id = 'unknown';
      let title = fullTitle;
      
      // Extract ID from title like "1. Two Sum"
      const match = fullTitle.match(/^(\d+)\.\s+(.+)$/);
      if (match) {
        id = match[1];
        title = match[2];
        console.log('[Nakung Content] 🔢 Parsed - ID:', id, '| Title:', title);
      }
      
      // Extract difficulty
      const difficultySelectors = [
        '[diff]',
        'div[class*="text-difficulty"]',
        'div[class*="text-easy"]',
        'div[class*="text-medium"]',
        'div[class*="text-hard"]'
      ];
      
      let difficulty = 'Medium';
      for (const selector of difficultySelectors) {
        const elem = document.querySelector(selector);
        if (elem) {
          difficulty = elem.textContent.trim();
          console.log('[Nakung Content] 📊 Difficulty:', difficulty);
          break;
        }
      }
      
      // Extract description
      const descSelectors = [
        '[data-track-load="description_content"]',
        'div[class*="elfjS"]',
        'div[class*="content__"]',
        '.xFUwe'
      ];
      
      let description = '';
      for (const selector of descSelectors) {
        const elem = document.querySelector(selector);
        if (elem) {
          description = elem.textContent.trim().substring(0, 500);
          console.log('[Nakung Content] 📄 Description length:', description.length);
          break;
        }
      }
      
      const problemData = {
        platform: 'leetcode',
        platformName: 'LeetCode',
        id: id,
        title: title,
        difficulty: difficulty,
        description: description || 'No description found',
        url: window.location.href,
        supported: true,
        extractedAt: Date.now()
      };
      
      console.log('[Nakung Content] ✅ LeetCode extraction complete:', problemData);
      return problemData;
      
    } catch (error) {
      console.error('[Nakung Content] ❌ LeetCode extraction error:', error);
      return null;
    }
  }

  // --- CODECHEF EXTRACTOR ---
  async function extractCodeChef(platformInfo) {
    try {
      console.log('[Nakung Content] 🟤 Extracting CodeChef problem...');
      
      const titleElement = document.querySelector('.problem-heading, h1, .title');
      const title = titleElement ? titleElement.textContent.trim() : 'Unknown Problem';
      
      const urlParts = window.location.pathname.split('/problems/');
      const id = urlParts[1] ? urlParts[1].split('/')[0] : 'unknown';
      
      const difficultyElement = document.querySelector('.difficulty, .diff');
      const difficulty = difficultyElement ? difficultyElement.textContent.trim() : 'Medium';
      
      const descriptionElement = document.querySelector('.problem-statement, .content');
      const description = descriptionElement ? descriptionElement.textContent.trim().substring(0, 500) : '';
      
      const problemData = {
        platform: 'codechef',
        platformName: 'CodeChef',
        id,
        title,
        difficulty,
        description,
        url: window.location.href,
        supported: true,
        extractedAt: Date.now()
      };
      
      console.log('[Nakung Content] ✅ CodeChef extraction complete:', problemData);
      return problemData;
      
    } catch (error) {
      console.error('[Nakung Content] ❌ CodeChef extraction error:', error);
      return null;
    }
  }

  // --- HACKERRANK EXTRACTOR ---
  async function extractHackerRank(platformInfo) {
    try {
      console.log('[Nakung Content] 🟢 Extracting HackerRank problem...');
      
      const titleElement = document.querySelector('.challenge-heading h1, .page-header h1, h1');
      const title = titleElement ? titleElement.textContent.trim() : 'Unknown Problem';
      
      const urlParts = window.location.pathname.split('/challenges/');
      const id = urlParts[1] ? urlParts[1].split('/')[0] : 'unknown';
      
      const difficultyElement = document.querySelector('.difficulty, .diff-tag');
      const difficulty = difficultyElement ? difficultyElement.textContent.trim() : 'Medium';
      
      const descriptionElement = document.querySelector('.challenge-body-html, .problem-statement');
      const description = descriptionElement ? descriptionElement.textContent.trim().substring(0, 500) : '';
      
      const problemData = {
        platform: 'hackerrank',
        platformName: 'HackerRank',
        id,
        title,
        difficulty,
        description,
        url: window.location.href,
        supported: true,
        extractedAt: Date.now()
      };
      
      console.log('[Nakung Content] ✅ HackerRank extraction complete:', problemData);
      return problemData;
      
    } catch (error) {
      console.error('[Nakung Content] ❌ HackerRank extraction error:', error);
      return null;
    }
  }

  // --- CODEFORCES EXTRACTOR ---
  async function extractCodeforces(platformInfo) {
    try {
      console.log('[Nakung Content] 🔵 Extracting Codeforces problem...');
      
      const titleElement = document.querySelector('.problem-statement .title, .title');
      const title = titleElement ? titleElement.textContent.trim() : 'Unknown Problem';
      
      const urlMatch = window.location.href.match(/problem\/(\d+)\/([A-Z])/);
      const id = urlMatch ? `${urlMatch[1]}${urlMatch[2]}` : 'unknown';
      
      const descriptionElement = document.querySelector('.problem-statement');
      const description = descriptionElement ? descriptionElement.textContent.trim().substring(0, 500) : '';
      
      const problemData = {
        platform: 'codeforces',
        platformName: 'Codeforces',
        id,
        title,
        difficulty: 'Medium',
        description,
        url: window.location.href,
        supported: true,
        extractedAt: Date.now()
      };
      
      console.log('[Nakung Content] ✅ Codeforces extraction complete:', problemData);
      return problemData;
      
    } catch (error) {
      console.error('[Nakung Content] ❌ Codeforces extraction error:', error);
      return null;
    }
  }

  // ===================================================================
  // MESSAGE LISTENER
  // ===================================================================
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Nakung Content] 📨 Received message:', request.type);
    
    if (request.type === 'GET_CURRENT_PROBLEM') {
      chrome.storage.local.get(['currentProblem'], (result) => {
        console.log('[Nakung Content] 📤 Sending problem:', result.currentProblem);
        sendResponse({ problem: result.currentProblem || null });
      });
      return true; // Keep channel open for async response
    }
    
    if (request.type === 'REFRESH_PROBLEM') {
      console.log('[Nakung Content] 🔄 Refreshing problem extraction...');
      extractAndStoreProblem(platformInfo).then(success => {
        sendResponse({ success });
      });
      return true;
    }
  });

  console.log('[Nakung Content] ✅ Content script initialization complete');

})();
