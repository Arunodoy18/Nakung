// ============================================================================
// NAKUNG CONTENT SCRIPT - Problem Detection & Extraction  
// ============================================================================

(function() {
  'use strict';
  
  console.log('[Nakung] Loaded on:', window.location.hostname);

  let lastUrl = location.href;
  let lastProblemId = null;
  let extractionTimeout = null;

  // Initial extraction
  initializeExtraction();

  // Monitor URL changes for SPA navigation (LeetCode uses React Router)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function() {
    originalPushState.apply(this, arguments);
    handleUrlChange();
  };

  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    handleUrlChange();
  };

  window.addEventListener('popstate', handleUrlChange);

  // Monitor DOM changes (for dynamic content loading) — throttled for performance
  let mutationThrottle = null;
  const observer = new MutationObserver(() => {
    if (mutationThrottle) return;
    mutationThrottle = setTimeout(() => {
      mutationThrottle = null;
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        handleUrlChange();
      }
    }, 300);
  });

  observer.observe(document.body, { 
    subtree: true, 
    childList: true 
  });

  function handleUrlChange() {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      console.log('[Nakung Content] ═══════════════════════════════════════');
      console.log('[Nakung Content] 🔄 URL changed:', lastUrl, '→', currentUrl);
      console.log('[Nakung Content] ═══════════════════════════════════════');
      
      lastUrl = currentUrl;
      lastProblemId = null; // ← CRITICAL FIX: Reset tracking variable
      
      console.log('[Nakung Content] 🗑️ Clearing old data...');
      chrome.storage.local.remove(['currentProblem', 'chatHistory', 'currentMode', 'lastProblemId'], () => {});
      
      // Debounce extraction to avoid multiple triggers
      if (extractionTimeout) {
        clearTimeout(extractionTimeout);
      }
      
      extractionTimeout = setTimeout(() => {
        console.log('[Nakung Content] 🔄 Starting fresh extraction after URL change...');
        initializeExtraction();
      }, 500);
    }
  }

  function initializeExtraction() {
    const platform = detectPlatform();
    console.log('[Nakung Content] 🌐 Platform detected:', platform);

    if (platform !== 'unknown') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => extractAndStore(platform));
      } else {
        extractAndStore(platform);
      }
    } else {
      console.warn('[Nakung Content] ⚠️ Platform not supported:', window.location.href);
      storeFallback();
    }
  }

  function detectPlatform() {
    const url = window.location.href.toLowerCase();
    if (url.includes('leetcode.com/problems/')) return 'leetcode';
    if (url.includes('codechef.com') && (url.includes('/problems/') || url.match(/\/[A-Z]+\d+\/problems/))) return 'codechef';
    if (url.includes('hackerrank.com/challenges/')) return 'hackerrank';
    if (url.includes('codeforces.com/problemset/problem') || url.includes('codeforces.com/contest/')) return 'codeforces';
    return 'unknown';
  }

  function extractAndStore(platform) {
    let attempts = 0;
    const maxAttempts = 5;
    const delays = [1000, 2000, 3000, 4000, 5000];
    
    function tryExtract() {
      attempts++;
      console.log(`[Nakung Content] 🔄 Extraction attempt ${attempts}/${maxAttempts}...`);
      
      const problemInfo = extractProblem(platform);
      
      if (problemInfo) {
        console.log('[Nakung Content] ✅ Problem extracted successfully:', problemInfo.title);
        storeProblem(problemInfo);
      } else if (attempts < maxAttempts) {
        console.log(`[Nakung Content] ⏳ Retrying in ${delays[attempts]}ms...`);
        setTimeout(tryExtract, delays[attempts]);
      } else {
        console.error('[Nakung Content] ❌ Failed to extract problem after', maxAttempts, 'attempts');
        storeFallback();
      }
    }
    
    tryExtract();
  }

  function extractProblem(platform) {
    switch (platform) {
      case 'leetcode': return extractLeetCode();
      case 'codechef': return extractCodeChef();
      case 'hackerrank': return extractHackerRank();
      case 'codeforces': return extractCodeforces();
      default: return null;
    }
  }

  function extractLeetCode() {
    try {
      const title = document.querySelector('[data-cy="question-title"]')?.textContent?.trim() ||
                   document.querySelector('div[class*="title"]')?.textContent?.trim() ||
                   document.title.split(' - ')[0]?.trim();
      
      if (!title || title.length < 3) return null;

      const diffElement = document.querySelector('[diff]') ||
                         document.querySelector('.text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard') ||
                         document.querySelector('div[class*="difficulty"]');
      const difficulty = diffElement?.textContent?.trim() || 'Medium';

      const descElement = document.querySelector('[data-track-load="description_content"]') ||
                         document.querySelector('.elfjS') ||
                         document.querySelector('div[class*="content__"]');
      const description = descElement?.textContent?.trim().substring(0, 1000) || '';

      const problemId = window.location.pathname.split('/problems/')[1]?.split('/')[0] || 'unknown';

      return {
        id: problemId,
        title,
        difficulty,
        description,
        platform: 'LeetCode',
        url: window.location.href
      };
    } catch (error) {
      console.error('[Nakung Content] ❌ LeetCode extraction error:', error);
      return null;
    }
  }

  function extractCodeChef() {
    try {
      // Enhanced CodeChef selectors
      const title = document.querySelector('h1[class*="title"]')?.textContent?.trim() ||
                   document.querySelector('.problem-heading')?.textContent?.trim() ||
                   document.querySelector('h1')?.textContent?.trim() ||
                   document.querySelector('[class*="problemname"]')?.textContent?.trim() ||
                   document.title.split(' | ')[0]?.trim();
      
      if (!title || title.length < 3) return null;

      // Better description extraction
      const descElement = document.querySelector('.problem-statement') ||
                         document.querySelector('[class*="problem-body"]') ||
                         document.querySelector('[class*="statementcontent"]') ||
                         document.querySelector('.content');
      const description = descElement?.textContent?.trim().substring(0, 1000) || '';
      
      // Extract difficulty if available
      const diffElement = document.querySelector('[class*="difficulty"]') ||
                         document.querySelector('.problem-difficulty');
      const difficulty = diffElement?.textContent?.trim() || 'Unknown';

      const problemId = window.location.pathname.split('/').filter(Boolean).pop() || 'unknown';

      return {
        id: problemId,
        title,
        difficulty,
        description,
        platform: 'CodeChef',
        url: window.location.href
      };
    } catch (error) {
      console.error('[Nakung Content] ❌ CodeChef extraction error:', error);
      return null;
    }
  }

  function extractHackerRank() {
    try {
      // Enhanced HackerRank selectors
      const title = document.querySelector('.challengecard-title')?.textContent?.trim() ||
                   document.querySelector('.ui-icon-label')?.textContent?.trim() ||
                   document.querySelector('h1.page-label')?.textContent?.trim() ||
                   document.querySelector('[class*="challenge-name"]')?.textContent?.trim() ||
                   document.querySelector('h1')?.textContent?.trim() ||
                   document.title.split(' | ')[0]?.trim();
      
      if (!title || title.length < 3) return null;

      // Better description extraction
      const descElement = document.querySelector('.challenge-body-html') ||
                         document.querySelector('.challenge-text') ||
                         document.querySelector('.problem-statement') ||
                         document.querySelector('[class*="challenge-body"]') ||
                         document.querySelector('.challenge-description');
      const description = descElement?.textContent?.trim().substring(0, 1000) || '';

      // Better difficulty extraction
      const diffElement = document.querySelector('.difficulty-block') ||
                         document.querySelector('.difficulty') ||
                         document.querySelector('[class*="difficulty"]');
      const difficulty = diffElement?.textContent?.trim().replace(/[^a-zA-Z]/g, '') || 'Unknown';

      const problemId = window.location.pathname.split('/challenges/')[1]?.split('/')[0] || 'unknown';

      return {
        id: problemId,
        title,
        difficulty,
        description,
        platform: 'HackerRank',
        url: window.location.href
      };
    } catch (error) {
      console.error('[Nakung Content] ❌ HackerRank extraction error:', error);
      return null;
    }
  }

  function extractCodeforces() {
    try {
      const titleElement = document.querySelector('.title');
      const title = titleElement?.textContent?.trim() ||
                   document.title.split(' - ')[0]?.trim();
      
      if (!title || title.length < 3) return null;

      const descElement = document.querySelector('.problem-statement');
      const description = descElement?.textContent?.trim().substring(0, 1000) || '';

      const urlParts = window.location.pathname.split('/').filter(Boolean);
      const problemId = urlParts[urlParts.length - 1] || 'unknown';

      return {
        id: problemId,
        title,
        difficulty: 'Unknown',
        description,
        platform: 'Codeforces',
        url: window.location.href
      };
    } catch (error) {
      console.error('[Nakung Content] ❌ Codeforces extraction error:', error);
      return null;
    }
  }

  function storeProblem(problemInfo) {
    console.log('[Nakung Content] 💾 Storing:', problemInfo.title, '|', problemInfo.platform);
    
    // ALWAYS store - no duplicate checking
    // This ensures fresh data ALWAYS overwrites any cached data
    chrome.storage.local.set({
      currentProblem: problemInfo,
      lastProblemId: problemInfo.id,
      lastUpdated: Date.now(),
      extractionSuccessful: true
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('[Nakung Content] ❌ Storage error:', chrome.runtime.lastError);
      } else {
        console.log('[Nakung Content] ✅ Problem stored successfully in chrome.storage.local');
        
        // Update local tracking variable
        lastProblemId = problemInfo.id;
        
        // Notify popup about new problem (if popup is open)
        chrome.runtime.sendMessage({
          type: 'PROBLEM_DETECTED',
          data: problemInfo
        }).catch(() => {
          // Popup not open - this is normal, ignore error
          console.log('[Nakung Content] ℹ️ Popup not open (this is normal)');
        });
      }
    });
  }

  function storeFallback() {
    console.log('[Nakung Content] 💾 Storing fallback problem data...');
    chrome.storage.local.set({
      currentProblem: {
        id: 'unknown',
        title: 'Unknown Problem',
        difficulty: 'Unknown',
        description: 'Could not extract problem information from this page.',
        platform: detectPlatform() || 'Unknown',
        url: window.location.href
      },
      lastUpdated: Date.now(),
      extractionSuccessful: false
    }, () => {
      console.log('[Nakung Content] ⚠️ Fallback stored (problem data unavailable)');
    });
  }

  // ==========================================================================
  // FLOATING BUTTON — Control Menu, Idle Opacity & Ready Ring
  // ==========================================================================

  const IDLE_TIMEOUT = 30000; // 30 seconds
  let idleTimer = null;
  let controlMenuEl = null;
  let floatingBtn = null;

  function createFloatingButton() {
    // Don't create if already exists
    if (document.getElementById('problem-solver-assistant-btn')) return;

    const btn = document.createElement('div');
    btn.id = 'problem-solver-assistant-btn';
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-label', 'Open Nakung AI Assistant');
    btn.classList.add('entering');
    btn.innerHTML = `
      <span style="pointer-events:none;line-height:1;">🚀</span>
      <div class="psa-tooltip">Nakung AI</div>
    `;
    document.body.appendChild(btn);

    // Remove entrance animation class after it plays
    setTimeout(() => btn.classList.remove('entering'), 600);

    // Left-click opens the extension popup
    btn.addEventListener('click', e => {
      if (e.button !== 0) return;
      chrome.runtime.sendMessage({ type: 'OPEN_POPUP' }).catch(() => {});
    });

    // Keyboard: Enter/Space activates, Escape closes menu
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        chrome.runtime.sendMessage({ type: 'OPEN_POPUP' }).catch(() => {});
      }
    });

    return btn;
  }

  function initFloatingButton() {
    // Create the button first
    createFloatingButton();
    floatingBtn = document.getElementById('problem-solver-assistant-btn');
    if (!floatingBtn) return;

    // Check if button should be hidden (disabled state)
    checkDisabledState().then(hidden => {
      if (hidden) return; // Button stays hidden
      setupIdleOpacity();
      setupControlMenu();
      setupReadyRing();
    });
  }

  // ── Disabled State Check ──
  async function checkDisabledState() {
    return new Promise(resolve => {
      chrome.storage.local.get(['nakungDisabledUntil', 'nakungDisabledSites'], result => {
        const now = Date.now();
        const domain = window.location.hostname;

        // Check 24h timer
        if (result.nakungDisabledUntil && now < result.nakungDisabledUntil) {
          hideButton();
          // Auto-re-enable after expiration
          const remaining = result.nakungDisabledUntil - now;
          setTimeout(() => {
            chrome.storage.local.remove('nakungDisabledUntil', () => {
              showButton();
            });
          }, remaining);
          return resolve(true);
        } else if (result.nakungDisabledUntil) {
          // Timer expired, clean up
          chrome.storage.local.remove('nakungDisabledUntil');
        }

        // Check site-level disable
        const disabledSites = result.nakungDisabledSites || [];
        if (disabledSites.includes(domain)) {
          hideButton();
          return resolve(true);
        }

        resolve(false);
      });
    });
  }

  function hideButton() {
    if (floatingBtn) floatingBtn.style.display = 'none';
  }

  function showButton() {
    if (floatingBtn) {
      floatingBtn.style.display = 'flex';
      floatingBtn.classList.add('entering');
      setTimeout(() => floatingBtn.classList.remove('entering'), 600);
    }
  }

  // ── Idle Opacity ──
  function setupIdleOpacity() {
    function resetIdle() {
      if (floatingBtn) floatingBtn.classList.remove('idle');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (floatingBtn) floatingBtn.classList.add('idle');
      }, IDLE_TIMEOUT);
    }

    floatingBtn.addEventListener('mouseenter', () => {
      floatingBtn.classList.remove('idle');
      clearTimeout(idleTimer);
    });
    floatingBtn.addEventListener('mouseleave', resetIdle);

    // Start idle timer on load
    resetIdle();
  }

  // ── Ready Ring ──
  function setupReadyRing() {
    chrome.storage.local.get('extractionSuccessful', result => {
      if (result.extractionSuccessful && floatingBtn) {
        // Create ready ring element
        let ring = floatingBtn.querySelector('.nakung-ready-ring');
        if (!ring) {
          ring = document.createElement('span');
          ring.className = 'nakung-ready-ring';
          floatingBtn.appendChild(ring);
        }
        // Auto-remove after 4 seconds
        setTimeout(() => ring.remove(), 4000);
      }
    });
  }

  // ── Control Menu ──
  function setupControlMenu() {
    // Right-click to open control menu
    floatingBtn.addEventListener('contextmenu', e => {
      e.preventDefault();
      e.stopPropagation();
      toggleControlMenu();
    });

    // Long-press support (mobile / trackpad)
    let longPressTimer = null;
    floatingBtn.addEventListener('pointerdown', e => {
      if (e.button === 2) return; // Right-click handled above
      longPressTimer = setTimeout(() => {
        toggleControlMenu();
        longPressTimer = null;
      }, 600);
    });
    floatingBtn.addEventListener('pointerup', () => clearTimeout(longPressTimer));
    floatingBtn.addEventListener('pointerleave', () => clearTimeout(longPressTimer));

    // Close menu on click outside
    document.addEventListener('click', e => {
      if (controlMenuEl && !controlMenuEl.contains(e.target) && e.target !== floatingBtn) {
        closeControlMenu();
      }
    });

    // Close menu on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeControlMenu();
    });
  }

  function toggleControlMenu() {
    if (controlMenuEl && controlMenuEl.classList.contains('visible')) {
      closeControlMenu();
    } else {
      openControlMenu();
    }
  }

  function openControlMenu() {
    closeControlMenu(); // Remove existing if any

    controlMenuEl = document.createElement('div');
    controlMenuEl.className = 'nakung-control-menu';
    controlMenuEl.innerHTML = `
      <button class="nakung-control-menu-item" data-action="disable-24h">
        <span class="menu-icon">🕒</span>
        <div>
          <div class="menu-label">Disable for 24 Hours</div>
          <div class="menu-sublabel">Auto re-enables tomorrow</div>
        </div>
      </button>
      <button class="nakung-control-menu-item" data-action="disable-site">
        <span class="menu-icon">🌐</span>
        <div>
          <div class="menu-label">Disable on This Site</div>
          <div class="menu-sublabel">${window.location.hostname}</div>
        </div>
      </button>
      <div class="nakung-control-menu-divider"></div>
      <button class="nakung-control-menu-item" data-action="close-session">
        <span class="menu-icon">✕</span>
        <div>
          <div class="menu-label">Close for This Session</div>
          <div class="menu-sublabel">Returns on page refresh</div>
        </div>
      </button>
    `;

    document.body.appendChild(controlMenuEl);

    // Show with animation (next frame)
    requestAnimationFrame(() => {
      controlMenuEl.classList.add('visible');
    });

    // Bind menu actions
    controlMenuEl.querySelectorAll('.nakung-control-menu-item').forEach(item => {
      item.addEventListener('click', e => {
        e.stopPropagation();
        handleMenuAction(item.dataset.action);
      });
    });
  }

  function closeControlMenu() {
    if (controlMenuEl) {
      controlMenuEl.classList.remove('visible');
      setTimeout(() => {
        controlMenuEl?.remove();
        controlMenuEl = null;
      }, 250);
    }
  }

  function handleMenuAction(action) {
    closeControlMenu();

    switch (action) {
      case 'disable-24h':
        chrome.storage.local.set({ nakungDisabledUntil: Date.now() + 86400000 }, () => {
          hideButton();
          showNotification('Nakung disabled for 24 hours');
        });
        break;

      case 'disable-site':
        chrome.storage.local.get('nakungDisabledSites', result => {
          const sites = result.nakungDisabledSites || [];
          const domain = window.location.hostname;
          if (!sites.includes(domain)) {
            sites.push(domain);
            chrome.storage.local.set({ nakungDisabledSites: sites }, () => {
              hideButton();
              showNotification(`Nakung disabled on ${domain}`);
            });
          }
        });
        break;

      case 'close-session':
        hideButton();
        showNotification('Nakung hidden for this session');
        break;
    }
  }

  function showNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'psa-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // Initialize floating button features once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initFloatingButton, 800));
  } else {
    setTimeout(initFloatingButton, 800);
  }

})();
