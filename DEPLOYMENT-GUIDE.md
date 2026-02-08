# 🚀 NAKUNG EXTENSION - COMPLETE DEPLOYMENT GUIDE

## ✅ WHAT'S BEEN FIXED

This package contains **completely rewritten versions** of all critical files with:

1. **Comprehensive Logging** - Every function logs its execution with `[Nakung...]` prefixes
2. **Retry Mechanisms** - Content script retries extraction 5 times, popup retries loading 3 times
3. **Multiple Selectors** - LeetCode extractor tries 4 different selector patterns
4. **Direct Communication** - Popup can query content script directly via messaging
5. **Error Handling** - Try-catch blocks everywhere with detailed error messages
6. **Storage Fallbacks** - Multiple ways to get problem data (storage → content script → fallback)

---

## 📦 FILES TO REPLACE

Replace these files in your extension directory (`c:\dev\Nakung`):

### 🔴 CRITICAL FILES (MUST REPLACE)
```
manifest.json         → manifest-fixed.json
content-script.js     → content-script-fixed.js
popup-new.js          → popup-fixed.js
background.js         → background-fixed.js
```

### 🟡 EXISTING FILES (KEEP AS-IS)
```
popup.html
popup.css
settings.html
settings.js
```

---

## 🔧 STEP-BY-STEP INSTALLATION

### **Step 1: Backup Current Files**
```powershell
# Create backup folder
mkdir c:\dev\Nakung\backup

# Copy current files
copy c:\dev\Nakung\manifest.json c:\dev\Nakung\backup\
copy c:\dev\Nakung\content-script.js c:\dev\Nakung\backup\
copy c:\dev\Nakung\popup-new.js c:\dev\Nakung\backup\
copy c:\dev\Nakung\background.js c:\dev\Nakung\backup\
```

### **Step 2: Replace with Fixed Files**
```powershell
# Replace manifest.json
copy c:\dev\Nakung\manifest-fixed.json c:\dev\Nakung\manifest.json

# Replace content script
copy c:\dev\Nakung\content-script-fixed.js c:\dev\Nakung\content-script.js

# Replace popup script
copy c:\dev\Nakung\popup-fixed.js c:\dev\Nakung\popup-new.js

# Replace background script
copy c:\dev\Nakung\background-fixed.js c:\dev\Nakung\background.js
```

### **Step 3: Reload Extension**
1. Open Chrome → `chrome://extensions/`
2. Find "Nakung - Competitive Programming Assistant"
3. Click **🔄 Reload** button
4. Check for errors (should be **none**)

---

## 🧪 TESTING & VERIFICATION

### **Test 1: Backend Connection**
```powershell
# Test backend is alive
curl https://nakung-backend.vercel.app/api/chat
```
**Expected Output:** Response from Vercel (may be error without body, but server responds)

### **Test 2: Extension Load**
1. Go to `chrome://extensions/`
2. Look for **"Nakung"** extension
3. Check: ✅ No errors shown in red
4. Check: ✅ "Inspect views: service worker" shows

### **Test 3: Content Script Injection**
1. Go to: https://leetcode.com/problems/two-sum/
2. Press **F12** → Console
3. Wait 5 seconds
4. Look for logs like:
   ```
   [Nakung Content] 🚀 Script loaded on: https://leetcode.com/problems/two-sum/
   [Nakung Content] 📍 Platform detected: {platform: 'leetcode', ...}
   [Nakung Content] ⏳ DOM loaded, starting extraction...
   [Nakung Content] ✅ LeetCode extraction complete
   [Nakung Content] 💾 Problem stored successfully
   ```

**If you DON'T see these logs:**
- Content script not injecting
- Check `manifest.json` has correct `content_scripts` section
- Try hard refresh: **Ctrl + Shift + R**
- Try different problem: https://leetcode.com/problems/add-two-numbers/

### **Test 4: Storage Verification**
1. On LeetCode problem page, open Console (F12)
2. Run:
   ```javascript
   chrome.storage.local.get(['currentProblem'], console.log)
   ```
3. **Expected Output:**
   ```javascript
   {
     currentProblem: {
       platform: "leetcode",
       title: "Two Sum",
       difficulty: "Easy",
       ...
     }
   }
   ```

**If output is `{}`:**
- Content script failed to extract
- Check Console for `[Nakung Content]` error messages
- Try refreshing page (F5)
- Check "Test 3" logs

### **Test 5: Popup Display**
1. On LeetCode problem page: https://leetcode.com/problems/two-sum/
2. Click **Nakung extension icon** in toolbar
3. Popup should show:
   - ✅ "Two Sum" as title
   - ✅ "Easy" badge in green
   - ✅ "LeetCode" platform badge in orange
   - ✅ Two buttons: "Partner Mode" and "Reviewer Mode"

**If you see "Platform Not Supported Yet":**
- Popup loaded before content script finished
- Right-click popup → **Inspect** → Console
- Look for logs:
   ```
   [Nakung Popup] 🔄 Load attempt 1/3
   [Nakung Popup] 📦 Storage result: {...}
   ```
- Close and reopen popup (should retry)

### **Test 6: Mode Activation**
1. Open popup on LeetCode problem
2. Click **"🤝 Partner Mode"**
3. Should see:
   - Chat interface appears
   - Welcome message: "Hi! I'm your coding partner..."
   - Text input at bottom
   - "Partner Mode" indicator at top

### **Test 7: AI Chat**
1. Activate Partner Mode (from Test 6)
2. Type: "What approach should I use?"
3. Press **Enter**
4. Should see:
   - Your message appears
   - "Thinking..." indicator
   - AI response appears within 3-5 seconds

**If AI doesn't respond:**
- Right-click popup → **Inspect** → Console
- Look for errors:
   ```
   [Nakung Popup] ❌ Connection error...
   [Nakung Background] ❌ Backend error...
   ```
- Click **Test Connection** button (if available)
- Check backend is deployed: https://nakung-backend.vercel.app/

---

## 🐛 TROUBLESHOOTING GUIDE

### Problem: "Platform Not Supported Yet" on LeetCode

**Diagnosis Checklist:**
```
□ Content script loaded? (Check F12 Console for [Nakung Content] logs)
□ Problem extracted? (Run chrome.storage.local.get(['currentProblem'], console.log))
□ Correct URL pattern? (Must be /problems/ not just /problemset/)
□ Page fully loaded? (Wait 5 seconds after page load)
```

**Solutions:**
1. **Refresh the page** (F5)
2. **Check URL** - Must be like: `/problems/two-sum/` (not `/problemset/`)
3. **Check Console** - Look for extraction errors
4. **Reload extension** - chrome://extensions/ → Reload
5. **Try different problem** - Some problems load differently

### Problem: No console logs from content script

**Possible Causes:**
- Content script not injecting
- Wrong URL pattern in manifest
- Extension permission issue

**Solutions:**
1. Check `manifest.json` has:
   ```json
   "content_scripts": [{
     "matches": [
       "https://leetcode.com/problems/*",
       ...
     ],
     "js": ["content-script.js"]
   }]
   ```
2. Reload extension: chrome://extensions/ → Reload
3. Hard refresh page: **Ctrl + Shift + R**
4. Check `content-script.js` is in extension folder

### Problem: AI not responding

**Diagnosis:**
1. Open popup → Right-click → Inspect → Console
2. Look for errors:
   - `CORS error` → Backend CORS not configured
   - `404` → Wrong backend URL
   - `500` → Backend error
   - `Network error` → Backend down

**Solutions:**
1. **Test backend URL:**
   ```powershell
   curl -X POST https://nakung-backend.vercel.app/api/chat -H "Content-Type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"content\":\"test\"}]}"
   ```

2. **Check Vercel deployment:**
   - Go to: https://vercel.com/dashboard
   - Find: `nakung-backend` project
   - Check deployment status (should be green)
   - Check environment variable: `HF_API_KEY` is set

3. **Check CORS headers in backend:**
   - File: `backend/api/chat.js`
   - Should have:
     ```javascript
     res.setHeader('Access-Control-Allow-Origin', '*');
     ```

### Problem: Popup blank/white screen

**Solutions:**
1. **Check popup.html loads popup-new.js:**
   ```html
   <script src="popup-new.js"></script>
   ```
2. **Check Console for errors:**
   - Right-click popup → Inspect → Console
   - Look for syntax errors or missing files
3. **Verify all files exist:**
   ```
   ✓ popup.html
   ✓ popup-new.js (not popup-fixed.js)
   ✓ popup.css
   ```

---

## 📊 DEBUGGING COMMANDS

### Check Storage Contents
```javascript
// In console (F12) on any page
chrome.storage.local.get(null, console.log)
```

### Clear Storage (Reset Extension)
```javascript
chrome.storage.local.clear(() => console.log('Storage cleared'))
```

### Force Problem Refresh
```javascript
// On LeetCode problem page
chrome.storage.local.set({
  currentProblem: null,
  extractionSuccessful: false
}, () => {
  location.reload();
})
```

### Check Background Service Worker Logs
1. Go to: `chrome://extensions/`
2. Find "Nakung" extension
3. Click: **"Inspect views: service worker"**
4. Console shows background.js logs

---

## 🔍 LOG OUTPUT REFERENCE

### ✅ GOOD LOGS (Everything Working)

**Content Script (F12 on problem page):**
```
[Nakung Content] 🚀 Script loaded on: https://leetcode.com/problems/two-sum/
[Nakung Content] 📍 Platform detected: {platform: 'leetcode', ...}
[Nakung Content] ⏳ Page already loaded, starting extraction...
[Nakung Content] 🔄 Extraction attempt 1/5
[Nakung Content] 🟠 Extracting LeetCode problem...
[Nakung Content] ✓ Found title with selector: [data-cy="question-title"]
[Nakung Content] 📝 Full title: 1. Two Sum
[Nakung Content] 🔢 Parsed - ID: 1 | Title: Two Sum
[Nakung Content] 📊 Difficulty: Easy
[Nakung Content] ✅ LeetCode extraction complete
[Nakung Content] 💾 Problem stored successfully
```

**Popup (Right-click popup → Inspect):**
```
[Nakung Popup] 🎨 Popup script loaded
[Nakung Popup] 🚀 DOM loaded, initializing...
[Nakung Popup] 📍 Loading current problem...
[Nakung Popup] 🔄 Load attempt 1/3
[Nakung Popup] 📦 Storage result: {currentProblem: {...}, extractionSuccessful: true}
[Nakung Popup] ✅ Problem found in storage
[Nakung Popup] 🎨 Displaying problem: Two Sum
[Nakung Popup] ✅ Problem displayed successfully
[Nakung Popup] ✅ Loading screen hidden
```

**Background (chrome://extensions → Inspect service worker):**
```
[Nakung Background] 🚀 Service worker initialized
[Nakung Background] 📨 Received message: AI_REQUEST
[Nakung Background] 🤖 Handling AI request...
[Nakung Background] 📤 Sending request to backend...
[Nakung Background] 📥 Response status: 200
[Nakung Background] ✅ Response received
```

### ❌ BAD LOGS (Problems)

**Content Script Errors:**
```
[Nakung Content] ❌ Title element not found
→ Solution: Page not fully loaded, will retry

[Nakung Content] ❌ Storage error: ReferenceError
→ Solution: Reload extension

[Nakung Content] ❌ All extraction attempts failed
→ Solution: Check selectors or try different problem
```

**Popup Errors:**
```
[Nakung Popup] ⚠️ Content script not ready: Could not establish connection
→ Solution: Content script not injected, reload page

[Nakung Popup] ❌ All retry attempts failed
→ Solution: Content script failed, check console logs

[Nakung Popup] ❌ Connection error
→ Solution: Backend down or CORS issue
```

**Background Errors:**
```
[Nakung Background] ❌ Backend error: 500
→ Solution: Check Vercel backend logs

[Nakung Background] ❌ Backend returned 404
→ Solution: Wrong BACKEND_URL in background.js

[Nakung Background] ❌ Network request failed
→ Solution: Backend offline or network issue
```

---

## 🎯 FINAL VERIFICATION CHECKLIST

Before marking as complete, verify ALL of these:

### Extension Installation
- [ ] Extension loads in `chrome://extensions/` with no errors
- [ ] Extension icon visible in Chrome toolbar
- [ ] "Inspect views: service worker" link appears

### Content Script
- [ ] Opens https://leetcode.com/problems/two-sum/
- [ ] F12 Console shows `[Nakung Content]` logs
- [ ] Logs show "✅ Problem stored successfully"
- [ ] Storage has data: `chrome.storage.local.get(['currentProblem'], console.log)`

### Popup UI
- [ ] Click extension icon → popup opens
- [ ] Shows "Two Sum" title (not "Platform Not Supported Yet")
- [ ] Shows "Easy" difficulty badge in green
- [ ] Shows "LeetCode" platform badge in orange
- [ ] Shows two mode buttons

### Chat Functionality
- [ ] Click "Partner Mode" → chat interface appears
- [ ] Type message → message appears in chat
- [ ] Send message → "Thinking..." indicator shows
- [ ] AI response appears within 5 seconds
- [ ] Chat history persists

### Backend Connection
- [ ] Test connection button works (if present)
- [ ] Backend responds to: https://nakung-backend.vercel.app/api/chat
- [ ] Vercel deployment shows green status
- [ ] Environment variable HF_API_KEY is set

---

## 📝 QUICK REFERENCE

### File Locations
```
Extension directory: c:\dev\Nakung\
Fixed files:         c:\dev\Nakung\*-fixed.js
Backup:              c:\dev\Nakung\backup\
```

### Important URLs
```
Backend:              https://nakung-backend.vercel.app/api/chat
Test problem:         https://leetcode.com/problems/two-sum/
Extensions page:      chrome://extensions/
```

### Key Shortcuts
```
Reload extension:     chrome://extensions/ → Click reload
Open DevTools:        F12
Inspect popup:        Right-click icon → Inspect
Hard refresh:         Ctrl + Shift + R
```

---

## 🆘 STILL NOT WORKING?

If you've followed all steps and it's still not working:

1. **Share Console Logs:**
   - Open F12 on LeetCode problem page
   - Copy ALL `[Nakung Content]` logs
   - Right-click popup → Inspect → Copy ALL `[Nakung Popup]` logs
   - Share both

2. **Share Storage Contents:**
   ```javascript
   chrome.storage.local.get(null, (data) => console.log(JSON.stringify(data, null, 2)))
   ```

3. **Share Error Messages:**
   - Any red errors in Console
   - Any errors in `chrome://extensions/`

4. **Check File Versions:**
   - Open `content-script.js` → First line should have: `[Nakung Content] 🚀 Script loaded`
   - Open `popup-new.js` → Should have: `[Nakung Popup] 🎨 Popup script loaded`
   - Open `background.js` → Should have: `[Nakung Background] 🚀 Service worker initialized`

---

**Last Updated:** 2024
**Version:** 2.0 (Complete Rewrite with Retry Mechanisms)
**Status:** Production Ready ✅
