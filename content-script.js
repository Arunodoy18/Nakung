// ============================================================================
// NAKUNG CONTENT SCRIPT - Problem Detection & Extraction  
// ============================================================================

(function() {
  'use strict';

  console.log('[Nakung Content]  Script loaded on:', window.location.href);

  const platform = detectPlatform();
  console.log('[Nakung Content]  Platform:', platform);

  if (platform !== 'unknown') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => extractAndStore(platform));
    } else {
      extractAndStore(platform);
    }
  } else {
    console.warn('[Nakung Content]  Platform not supported');
    storeFallback();
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
      console.log(`[Nakung Content]  Attempt ${attempts}/${maxAttempts}`);
      
      const problemInfo = extractProblem(platform);
      
      if (problemInfo) {
        console.log('[Nakung Content]  Extracted:', problemInfo);
        storeProblem(problemInfo);
      } else if (attempts < maxAttempts) {
        console.log(`[Nakung Content]  Retrying in ${delays[attempts]}ms...`);
        setTimeout(tryExtract, delays[attempts]);
      } else {
        console.error('[Nakung Content]  Extraction failed');
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
      console.error('[Nakung Content]  LeetCode error:', error);
      return null;
    }
  }

  function extractCodeChef() {
    try {
      const title = document.querySelector('.problem-heading')?.textContent?.trim() ||
                   document.querySelector('h1')?.textContent?.trim() ||
                   document.title.split(' | ')[0]?.trim();
      
      if (!title || title.length < 3) return null;

      const descElement = document.querySelector('.problem-statement') ||
                         document.querySelector('.content');
      const description = descElement?.textContent?.trim().substring(0, 1000) || '';

      const problemId = window.location.pathname.split('/').filter(Boolean).pop() || 'unknown';

      return {
        id: problemId,
        title,
        difficulty: 'Unknown',
        description,
        platform: 'CodeChef',
        url: window.location.href
      };
    } catch (error) {
      console.error('[Nakung Content]  CodeChef error:', error);
      return null;
    }
  }

  function extractHackerRank() {
    try {
      const title = document.querySelector('.ui-icon-label')?.textContent?.trim() ||
                   document.querySelector('h1.page-label')?.textContent?.trim() ||
                   document.title.split(' | ')[0]?.trim();
      
      if (!title || title.length < 3) return null;

      const descElement = document.querySelector('.challenge-body-html') ||
                         document.querySelector('.challenge-description');
      const description = descElement?.textContent?.trim().substring(0, 1000) || '';

      const diffElement = document.querySelector('.difficulty');
      const difficulty = diffElement?.textContent?.trim() || 'Unknown';

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
      console.error('[Nakung Content]  HackerRank error:', error);
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
      console.error('[Nakung Content]  Codeforces error:', error);
      return null;
    }
  }

  function storeProblem(problemInfo) {
    chrome.storage.local.set({
      currentProblem: problemInfo,
      lastUpdated: Date.now(),
      extractionSuccessful: true
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('[Nakung Content]  Storage error:', chrome.runtime.lastError);
      } else {
        console.log('[Nakung Content]  Problem stored successfully');
        chrome.runtime.sendMessage({
          type: 'PROBLEM_DETECTED',
          data: problemInfo
        }).catch(() => {});
      }
    });
  }

  function storeFallback() {
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
      console.log('[Nakung Content]  Fallback stored');
    });
  }

})();
