// Platform Detection Module
class PlatformDetector {
  static detect() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    if (hostname.includes('leetcode.com')) {
      if (pathname.includes('/problems/')) {
        return {
          platform: 'leetcode',
          name: 'LeetCode',
          isProblemPage: true
        };
      }
    }
    
    if (hostname.includes('codeforces.com')) {
      if (pathname.includes('/problemset/problem/') || pathname.includes('/contest/')) {
        return {
          platform: 'codeforces',
          name: 'Codeforces',
          isProblemPage: true
        };
      }
    }
    
    if (hostname.includes('hackerrank.com')) {
      if (pathname.includes('/challenges/')) {
        return {
          platform: 'hackerrank',
          name: 'HackerRank',
          isProblemPage: true
        };
      }
    }
    
    if (hostname.includes('codechef.com')) {
      if (pathname.includes('/problems/')) {
        return {
          platform: 'codechef',
          name: 'CodeChef',
          isProblemPage: true
        };
      }
    }
    
    return {
      platform: 'unknown',
      name: 'Unknown',
      isProblemPage: false
    };
  }
  
  static waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }
}
