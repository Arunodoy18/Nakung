# API Request/Response Examples

## Backend URL
```
https://nakung-backend.vercel.app/api/chat
```

## Request Payload Structure

### Example 1: Partner Mode - First Message
```json
{
  "message": "How should I approach this problem?",
  "mode": "partner",
  "problemInfo": {
    "title": "Two Sum",
    "platform": "LeetCode",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target...",
    "difficulty": "Easy"
  },
  "conversationHistory": []
}
```

### Example 2: Reviewer Mode - Follow-up Message
```json
{
  "message": "I would use a hash map to store the values I've seen so far",
  "mode": "reviewer",
  "problemInfo": {
    "title": "Two Sum",
    "platform": "LeetCode",
    "description": "Given an array of integers nums and an integer target...",
    "difficulty": "Easy"
  },
  "conversationHistory": [
    {
      "role": "user",
      "content": "Can you explain the problem?"
    },
    {
      "role": "assistant",
      "content": "Sure! In your own words, what are we trying to solve here?"
    }
  ]
}
```

## Response Structure

### Success Response
```json
{
  "success": true,
  "text": "Great thinking! Using a hash map is the right approach. Can you walk me through your algorithm step by step?",
  "timestamp": 1707398400000
}
```

### Error Response
```json
{
  "success": false,
  "error": "Backend error: 500"
}
```

## Console Logs Example

### When User Sends Message "How should I start?"

**In background.js:**
```
[Nakung Background] ============ AI REQUEST START ============
[Nakung Background] Message: How should I start?
[Nakung Background] Mode: partner
[Nakung Background] Problem Info: {
  title: "Two Sum",
  platform: "LeetCode",
  description: "Given an array...",
  difficulty: "Easy"
}
[Nakung Background] Conversation History Length: 0
[Nakung Background] Calling backend: https://nakung-backend.vercel.app/api/chat
[Nakung Background] Request payload: {
  "message": "How should I start?",
  "mode": "partner",
  "problemInfo": {
    "title": "Two Sum",
    "platform": "LeetCode",
    "description": "Given an array...",
    "difficulty": "Easy"
  },
  "conversationHistory": []
}
[Nakung Background] Backend responded in 1523 ms
[Nakung Background] Response status: 200
[Nakung Background] Backend response data: {
  "success": true,
  "text": "Great question! Let's think about this step by step...",
  "timestamp": 1707398400000
}
[Nakung Background] AI response successful, text length: 187
[Nakung Background] ============ AI REQUEST END ============
```

**In popup-new.js:**
```
[Nakung Popup] Sending message: How should I start?
[Nakung Popup] AI response received: {
  success: true,
  text: "Great question! Let's think about this step by step..."
}
[Nakung Popup] Session saved
[Nakung Popup] Chat history updated, size: 1
```

## Chrome Storage Structure

### currentProblem
```json
{
  "platform": "leetcode",
  "platformName": "LeetCode",
  "id": "1",
  "title": "Two Sum",
  "difficulty": "Easy",
  "description": "Given an array of integers nums...",
  "url": "https://leetcode.com/problems/two-sum/",
  "supported": true
}
```

### lastSession
```json
{
  "mode": "partner",
  "problem": {
    "platform": "leetcode",
    "platformName": "LeetCode",
    "id": "1",
    "title": "Two Sum",
    "difficulty": "Easy",
    "description": "Given an array...",
    "url": "https://leetcode.com/problems/two-sum/",
    "supported": true
  },
  "conversationHistory": [
    {
      "role": "user",
      "content": "How should I start?"
    },
    {
      "role": "assistant",
      "content": "Great question! Let's think..."
    }
  ],
  "timestamp": 1707398400000
}
```

### chatHistory (Last 10 Sessions)
```json
[
  {
    "problemId": "1",
    "problemTitle": "Two Sum",
    "platform": "LeetCode",
    "mode": "partner",
    "messageCount": 6,
    "timestamp": 1707398400000
  },
  {
    "problemId": "15",
    "problemTitle": "3Sum",
    "platform": "LeetCode",
    "mode": "reviewer",
    "messageCount": 12,
    "timestamp": 1707394800000
  }
]
```

## Testing Commands

### Check if problem is stored:
```javascript
chrome.storage.local.get(['currentProblem'], (result) => {
  console.log('Current Problem:', result.currentProblem);
});
```

### Check if session is cached:
```javascript
chrome.storage.local.get(['lastSession'], (result) => {
  console.log('Last Session:', result.lastSession);
});
```

### View chat history:
```javascript
chrome.storage.local.get(['chatHistory'], (result) => {
  console.log('Chat History:', result.chatHistory);
});
```

### Clear all cached data:
```javascript
chrome.storage.local.clear(() => {
  console.log('All data cleared');
});
```

## API Endpoint Details

### Health Check (Test Connection)
```javascript
fetch('https://nakung-backend.vercel.app/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Test connection',
    mode: 'partner',
    problemInfo: {
      title: 'Test Problem',
      platform: 'test',
      description: 'This is a test'
    },
    conversationHistory: []
  })
})
.then(res => res.json())
.then(data => console.log('Backend Response:', data))
.catch(err => console.error('Connection Error:', err));
```

Expected Response (< 3 seconds):
```json
{
  "success": true,
  "text": "<AI response>",
  "timestamp": 1707398400000
}
```

## Error Scenarios

### 1. Platform Not Supported
**Stored in chrome.storage.local:**
```json
{
  "platform": "unknown",
  "platformName": "Unknown",
  "supported": false,
  "title": "Platform Not Supported Yet",
  "description": "Unknown support is coming soon!"
}
```

**UI Behavior:**
- Problem title shows: "Platform Not Supported Yet"
- Mode buttons are disabled
- Gray text color

### 2. Backend Timeout
**Console Log:**
```
[Nakung Background] ❌ AI request error: Failed to fetch
[Nakung Background] ============ AI REQUEST FAILED ============
```

**UI Behavior:**
- Error toast appears at bottom
- AI message: "Sorry, I couldn't connect to the server. Please try again."

### 3. Invalid API Response
**Console Log:**
```
[Nakung Background] ❌ Invalid response format: { success: false }
```

**UI Behavior:**
- Error toast: "Failed to get AI response"
- AI message: "Sorry, I encountered an error. Please try again."

## Message Flow Diagram

```
User clicks Partner button
         ↓
popup-new.js: activateMode('partner')
         ↓
Shows welcome message
         ↓
User types: "How should I start?"
         ↓
popup-new.js: sendMessage()
         ↓
chrome.runtime.sendMessage({ type: 'GET_AI_RESPONSE', ... })
         ↓
background.js: handleAIRequest()
         ↓
fetch('https://nakung-backend.vercel.app/api/chat', {...})
         ↓
Backend processes with Mistral-7B-Instruct
         ↓
Returns: { success: true, text: "..." }
         ↓
background.js: sendResponse({ success: true, text: "..." })
         ↓
popup-new.js: receives response
         ↓
Adds AI message to chat
         ↓
Saves session to chrome.storage.local
         ↓
Adds to conversation history
         ↓
Ready for next message
```

## Performance Metrics

**Typical Response Times:**
- Problem extraction: 100-500ms
- Backend API call: 1000-3000ms
- Session save: 10-50ms
- UI update: 10-20ms

**Total Time (Send Message → See Response):**
- **Fast:** 1-2 seconds
- **Average:** 2-4 seconds
- **Slow:** 4-6 seconds

**When to worry:**
- Response time > 10 seconds → Check backend status
- Response time > 30 seconds → Network issue or backend down
