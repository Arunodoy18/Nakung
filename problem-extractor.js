// Problem Information Extractor
class ProblemExtractor {
  static async extractProblemInfo(platformInfo) {
    const extractors = {
      'leetcode': this.extractLeetCode,
      'codeforces': this.extractCodeforces,
      'hackerrank': this.extractHackerRank,
      'codechef': this.extractCodeChef
    };
    
    const extractor = extractors[platformInfo.platform];
    if (!extractor) {
      return null;
    }
    
    try {
      return await extractor.call(this);
    } catch (error) {
      console.error('Error extracting problem:', error);
      return null;
    }
  }
  
  static async extractLeetCode() {
    try {
      // Wait for problem content to load
      await PlatformDetector.waitForElement('[data-track-load="description_content"]', 10000);
      
      // Extract title
      const title = document.querySelector('[data-cy="question-title"]')?.textContent?.trim() ||
                   document.querySelector('.css-v3d350')?.textContent?.trim() ||
                   document.querySelector('div[class*="question-title"]')?.textContent?.trim() ||
                   'Unknown Problem';
      
      // Extract main description
      const descriptionElement = document.querySelector('[data-track-load="description_content"]') ||
                                document.querySelector('.elfjS') ||
                                document.querySelector('div[class*="content__"]');
      const fullHTML = descriptionElement?.innerHTML || descriptionElement?.textContent || '';
      
      // Extract examples
      const examples = [];
      const exampleElements = descriptionElement?.querySelectorAll('pre, .example') || [];
      exampleElements.forEach((el, idx) => {
        const text = el.textContent?.trim();
        if (text && text.length > 0) {
          examples.push({
            number: idx + 1,
            content: text
          });
        }
      });
      
      // Extract constraints
      let constraints = '';
      const constraintsHeading = Array.from(descriptionElement?.querySelectorAll('p strong') || [])
        .find(el => el.textContent?.toLowerCase().includes('constraint'));
      
      if (constraintsHeading) {
        let nextElement = constraintsHeading.parentElement?.nextElementSibling;
        while (nextElement && nextElement.tagName === 'UL') {
          constraints += nextElement.textContent + '\n';
          nextElement = nextElement.nextElementSibling;
        }
      }
      
      // Extract difficulty
      const difficultyElement = document.querySelector('[diff]') ||
                               document.querySelector('.text-difficulty-easy') ||
                               document.querySelector('.text-difficulty-medium') ||
                               document.querySelector('.text-difficulty-hard') ||
                               document.querySelector('div[class*="difficulty"]');
      const difficulty = difficultyElement?.textContent?.trim() || 'Medium';
      
      // Extract tags/topics
      const tags = [];
      const tagElements = document.querySelectorAll('a[class*="topic-tag"]') ||
                         document.querySelectorAll('.tag');
      tagElements.forEach(tag => {
        const tagText = tag.textContent?.trim();
        if (tagText) tags.push(tagText);
      });
      
      // Extract problem number from URL
      const url = window.location.href;
      const problemId = url.split('/problems/')[1]?.split('/')[0] || 'unknown';
      
      return {
        id: problemId,
        title: title,
        description: this.cleanHTML(fullHTML),
        examples: examples,
        constraints: constraints.trim(),
        difficulty: difficulty,
        tags: tags,
        url: url,
        platform: 'LeetCode'
      };
    } catch (error) {
      console.error('LeetCode extraction error:', error);
      return null;
    }
  }
  
  static async extractCodeforces() {
    try {
      await PlatformDetector.waitForElement('.problem-statement', 5000);
      
      const titleElement = document.querySelector('.title');
      const title = titleElement?.textContent?.trim() || 'Unknown Problem';
      
      const problemStatement = document.querySelector('.problem-statement');
      const description = problemStatement?.innerHTML || '';
      
      // Extract time and memory limits
      const timeLimit = document.querySelector('.time-limit')?.textContent?.trim() || '';
      const memoryLimit = document.querySelector('.memory-limit')?.textContent?.trim() || '';
      
      const url = window.location.href;
      const problemId = url.split('/').filter(Boolean).pop() || 'unknown';
      
      return {
        id: problemId,
        title: title,
        description: this.cleanHTML(description),
        timeLimit: timeLimit,
        memoryLimit: memoryLimit,
        difficulty: 'Unknown',
        url: url,
        platform: 'Codeforces'
      };
    } catch (error) {
      console.error('Codeforces extraction error:', error);
      return null;
    }
  }
  
  static async extractHackerRank() {
    try {
      await PlatformDetector.waitForElement('.challenge-body-html', 5000);
      
      const title = document.querySelector('.ui-icon-label')?.textContent?.trim() ||
                   document.querySelector('h1.page-label')?.textContent?.trim() ||
                   'Unknown Problem';
      
      const descriptionElement = document.querySelector('.challenge-body-html');
      const description = descriptionElement?.innerHTML || '';
      
      const url = window.location.href;
      const problemId = url.split('/challenges/')[1]?.split('/')[0] || 'unknown';
      
      return {
        id: problemId,
        title: title,
        description: this.cleanHTML(description),
        difficulty: 'Unknown',
        url: url,
        platform: 'HackerRank'
      };
    } catch (error) {
      console.error('HackerRank extraction error:', error);
      return null;
    }
  }
  
  static async extractCodeChef() {
    try {
      await PlatformDetector.waitForElement('.problem-statement', 5000);
      
      const title = document.querySelector('h1')?.textContent?.trim() ||
                   document.querySelector('.title')?.textContent?.trim() ||
                   'Unknown Problem';
      
      const descriptionElement = document.querySelector('.problem-statement') ||
                                 document.querySelector('.problemBody');
      const description = descriptionElement?.innerHTML || '';
      
      const url = window.location.href;
      const problemId = url.split('/problems/')[1]?.split('/')[0] || 'unknown';
      
      return {
        id: problemId,
        title: title,
        description: this.cleanHTML(description),
        difficulty: 'Unknown',
        url: url,
        platform: 'CodeChef'
      };
    } catch (error) {
      console.error('CodeChef extraction error:', error);
      return null;
    }
  }
  
  static cleanHTML(html) {
    // Remove HTML tags but keep structure
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove script tags
    temp.querySelectorAll('script, style').forEach(el => el.remove());
    
    // Get text content with basic formatting
    let text = temp.textContent || temp.innerText || '';
    
    // Clean up excessive whitespace
    text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
    text = text.trim();
    
    return text;
  }
}
