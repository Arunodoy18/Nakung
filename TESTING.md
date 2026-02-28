# Nakung AI v3.0 - Testing Guide

## 🧪 How to Test All New Features

After loading the extension, follow this comprehensive testing checklist:

---

## ✅ Pre-Test Setup

1. **Load Extension**
   ```
   1. Open Chrome → chrome://extensions/
   2. Enable Developer Mode
   3. Click "Load unpacked"
   4. Select the Nakung folder
   5. Verify version shows 3.0.0
   ```

2. **Navigate to Test Problem**
   - Go to: https://leetcode.com/problems/two-sum/
   - Wait for problem detection
   - Click the Nakung AI extension icon

---

## 🎯 Feature Testing Checklist

### 1. Basic Functionality ✓
- [ ] Extension icon appears in toolbar
- [ ] Problem details load correctly
- [ ] Can select Partner mode
- [ ] Can select Reviewer mode
- [ ] Welcome message appears
- [ ] Can type and send message
- [ ] AI responds successfully

### 2. Keyboard Shortcuts ⌨️
- [ ] `Ctrl+K` focuses input field
- [ ] `Enter` sends message
- [ ] `Ctrl+L` prompts to clear chat
- [ ] `Ctrl+E` exports chat (with messages)
- [ ] `Ctrl+I` opens statistics modal
- [ ] `Escape` closes statistics modal
- [ ] `Escape` returns to mode selection from chat

### 3. Code Highlighting & Copy 📋
Test by asking: "Show me a Python solution for two sum"

- [ ] Code block appears with syntax highlighting
- [ ] Keywords are colored (blue)
- [ ] Strings are colored (orange)
- [ ] Comments are colored (green)
- [ ] Copy button (📋) appears on hover
- [ ] Click copy button → shows "✓ Copied"
- [ ] Paste works correctly

### 4. Message Timestamps ⏰
- [ ] Each user message shows timestamp
- [ ] Each AI message shows timestamp
- [ ] Time format is readable (e.g., "10:30 AM")

### 5. Export Functionality 📥
- [ ] Export button visible in chat header
- [ ] Click export button → file downloads
- [ ] Filename contains problem name
- [ ] File opens as valid Markdown
- [ ] Contains full conversation
- [ ] Includes problem metadata

### 6. Statistics Dashboard 📊
- [ ] Click stats button → modal opens
- [ ] Shows "Problems Attempted" count
- [ ] Shows "Total Messages" count
- [ ] Shows "This Session" time
- [ ] Shows mode usage counts
- [ ] Shows difficulty distribution
- [ ] Close button works
- [ ] `Escape` closes modal

### 7. Offline Support 📡
**Manual Test:**
1. Open DevTools (F12) → Network tab
2. Select "Offline" from throttling dropdown
3. Type a message and send
4. [ ] Offline indicator appears
5. [ ] Message count increases
6. [ ] Message queued successfully
7. Select "Online" from throttling dropdown
8. [ ] Messages auto-send
9. [ ] Offline indicator disappears
10. [ ] AI responds to queued messages

### 8. Response Caching 💾
- [ ] Ask a question (e.g., "What's time complexity?")
- [ ] Wait for response
- [ ] Ask the EXACT same question again
- [ ] Toast shows "From cache (instant!)"
- [ ] Response appears immediately

### 9. Error Handling 🔄
**Test Network Error:**
1. Open DevTools → Network tab  
2. Set throttling to "Slow 3G"
3. Send a message
4. [ ] Typing indicator appears
5. [ ] Request takes longer
6. [ ] Retry logic activates (check console)
7. [ ] Eventually succeeds or shows clear error

### 10. Memory Management 🧠
**Long Conversation Test:**
1. Send 20+ messages
2. [ ] Chat remains responsive
3. [ ] Scroll works smoothly
4. [ ] No lag or freezing
5. Check console for cleanup messages

### 11. Accessibility ♿
- [ ] Tab key navigates through buttons
- [ ] All buttons show focus indicator
- [ ] Can navigate entire app with keyboard
- [ ] Screen reader reads button labels
- [ ] High contrast mode works (if enabled in OS)

### 12. UI/UX Polish ✨
- [ ] Messages appear with smooth animation
- [ ] Buttons have hover effects
- [ ] Toast notifications appear/disappear smoothly
- [ ] Modal animations are smooth
- [ ] Typing indicator animates
- [ ] Code blocks are properly styled
- [ ] Timestamps are subtle but readable

---

## 🐛 Known Issues & Limitations

### Non-Critical Warnings:
- CSS scrollbar properties: Falls back gracefully on older browsers
- Inline style in HTML: Overridden by JavaScript
- Backdrop filter compatibility: Has webkit prefix for Safari

### Browser Compatibility:
- **Fully Supported**: Chrome 121+, Edge 121+
- **Mostly Supported**: Chrome 100+, Edge 100+ (minor CSS differences)
- **Not Supported**: Firefox (different extension API), Safari

---

## 📊 Performance Benchmarks

### Expected Performance:
- **Initial Load**: < 500ms
- **Problem Detection**: 1-3 seconds
- **AI Response**: 2-5 seconds (first time)
- **Cached Response**: < 100ms
- **Export Chat**: < 500ms
- **Statistics Load**: < 100ms

### Memory Usage:
- **Initial**: ~5-10 MB
- **After 50 messages**: ~15-20 MB
- **Memory Cleanup**: Automatic at 50+ messages

---

## 🔍 Console Debugging

### What to Look For:
Open DevTools (F12) → Console:

**Good Messages:**
```
[Nakung Popup] 🚀 Initializing popup...
[Nakung Popup] ✅ PROBLEM LOADED FROM STORAGE
[AI Service] 📤 Messages: 3 | Backend: https://nakung-backend.vercel.app/api/chat
[AI Service] 📨 AI response received: ✅ Success
[Cache] 🎯 Cache hit!
[Stats] Loaded statistics
```

**Warning Messages (OK):**
```
[Nakung Popup] ⚠️ No problem found in storage
[AI Service] ⚠️ No problem context provided!
[Cache] Cache miss
```

**Error Messages (Investigate):**
```
[AI Service] ❌ Error: ...
[Nakung Popup] ❌ Cannot send message: No problem loaded
Extension context invalidated
```

---

## 🚀 Advanced Testing

### Stress Testing:
1. **Rapid Messaging**: Send 10 messages quickly
   - Should queue properly
   - Rate limiting should kick in
   - No crashes or freezing

2. **Long Session**: Keep extension open for 1+ hour
   - Memory should remain stable
   - No performance degradation
   - Statistics should update correctly

3. **Multiple Tabs**: Open 3+ LeetCode problems
   - Each should have separate chat
   - No cross-contamination
   - Switching problems clears chat

### Edge Cases:
1. **Problem Without Description**: Test on problem page that fails to load
   - Should show warning
   - Should still allow chatting
   - Should use problem title only

2. **Very Long Message**: Send a 1000-word message
   - Should handle gracefully
   - AI should respond appropriately
   - No UI breaking

3. **Special Characters**: Send message with emoji, code, markdown
   - Should render correctly
   - Should not break formatting
   - Copy button should work

---

## ✅ Final Verification

After all tests pass:

- [ ] Version number is 3.0.0 in manifest
- [ ] All console errors resolved
- [ ] No memory leaks observed
- [ ] All features work as documented
- [ ] User experience is smooth
- [ ] Ready for production use!

---

## 📝 Bug Report Template

If you find issues:

```markdown
**Bug Description:**
Brief description of the issue

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. Observe...

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Extension Version: 3.0.0

**Console Errors:**
```
Paste any console errors here
```

**Screenshots:**
Attach if relevant
```

---

**Happy Testing! 🎉**

Found bugs? Report them! All working? Time to code! 🚀
