# 🚀 NAKUNG - How It Works

## ✨ What You Get (Like Leeco.ai)

### 1. **Floating Button on LeetCode** 🎯
When you open any problem on LeetCode:
- A **floating purple button** appears on the RIGHT side of the page
- Says "🚀 AI" 
- Positioned in the middle-right (like YouTube's miniplayer button)

### 2. **Click to Open AI Panel** 💬
Click the floating button:
- Side panel slides in from the right
- Shows your current problem
- Choose **Partner Mode** or **Reviewer Mode**
- Start chatting instantly!

### 3. **Real-Time AI Help** 🤖
- Type your question → Get instant AI response
- **Partner Mode**: Friendly mentor with hints
- **Reviewer Mode**: FAANG interviewer style questions
- All conversations use YOUR HuggingFace API key (already configured in backend)

---

## 🎨 Visual Layout

```
┌─────────────────────────────────────────────────┐
│  LEETCODE PAGE                                  │   ┌──────────────┐
│  ┌──────────────────────────────┐              │   │              │
│  │  1. Two Sum                  │              │   │   🚀 AI      │ ← Floating
│  │  Difficulty: Easy             │              │   │              │   Button
│  ├──────────────────────────────┤              │   └──────────────┘
│  │  Description:                 │              │
│  │  Given an array of integers.. │              │   [Click opens panel]
│  │                              │              │
│  │  Examples:                    │              │   ┌─────────────────┐
│  │  Input: [2,7,11,15]          │              │──▶│ 🚀 Nakung AI    │
│  │  Output: [0,1]               │              │   ├─────────────────┤
│  │                              │              │   │ Problem:        │
│  │  Your code:                  │              │   │ Two Sum (Easy)  │
│  │  ┌────────────────────┐      │              │   ├─────────────────┤
│  │  │ def twoSum(self):  │      │              │   │ Choose Mode:    │
│  │  │     ...            │      │              │   │ 💡 Partner      │
│  │  │                    │      │              │   │ 🎯 Reviewer     │
│  │  └────────────────────┘      │              │   ├─────────────────┤
│  └──────────────────────────────┘              │   │ Chat:           │
│                                                 │   │ 💬 Hi! Let's... │
│                                                 │   │ ┌─────────────┐ │
│                                                 │   │ │ Type here...│ │
│                                                 │   │ └─────────────┘ │
└─────────────────────────────────────────────────┘   └─────────────────┘
```

---

## 🔑 API Key Setup (Already Done!)

✅ **Your HuggingFace API key** is already configured in the backend  
✅ **Deployed to Vercel**: `https://nakung-backend.vercel.app`  
✅ **Users don't need to do anything** - just start chatting!

### Backend Configuration:
```javascript
// backend/api/chat.js
const HF_API_KEY = process.env.HF_API_KEY;  // Your key: hf_bBftnlkL...
Model: "mistralai/Mistral-7B-Instruct-v0.2"
```

---

## 🚀 How to Use (For End Users)

### Step 1: Install Extension
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `c:\dev\Nakung` folder
5. Extension installed! ✅

### Step 2: Open LeetCode Problem
1. Go to: https://leetcode.com/problems/two-sum/
2. Wait 2 seconds
3. **Floating button appears** on the right side! 🚀

### Step 3: Start Chatting
1. Click the **🚀 AI** button
2. Panel slides in from right
3. Choose mode:
   - **Partner Mode**: Get hints, guidance, never direct answers
   - **Reviewer Mode**: Get interviewed like FAANG style
4. Type your question → Press Enter
5. Get instant AI response!

---

## 💡 Two Ways to Use

### Option 1: **Embedded Panel** (Recommended - Like Leeco.ai)
- Floating button on LeetCode page
- Side panel slides in
- Chat while viewing problem
- NO POPUP NEEDED!

### Option 2: **Extension Popup**
- Click extension icon in Chrome toolbar
- Smaller popup appears
- Choose mode → Chat
- Less space, but works anywhere

---

## 🎯 Benefits

### For Problem Solvers:
✅ **No context switching** - AI help right on the problem page  
✅ **Real-time guidance** - Ask questions anytime  
✅ **Two learning modes** - Partner or Reviewer style  
✅ **Zero configuration** - No API keys to enter  
✅ **Multi-platform** - Works on LeetCode, Codeforces, HackerRank, CodeChef  

### For You (Developer):
✅ **Centralized API key** - Manage from Vercel dashboard  
✅ **Cost tracking** - Monitor API usage  
✅ **Easy updates** - Update prompts in backend  
✅ **Analytics ready** - Can add logging/tracking  

---

## 🔧 File Structure

```
c:\dev\Nakung\
├── manifest.json              # Extension config
├── background.js              # AI request handler
├── platform-detector.js       # Detects LeetCode/Codeforces/etc
├── problem-extractor.js       # Extracts problem details
├── content-script.js          # Problem storage
├── embedded-panel.js          # ⭐ FLOATING BUTTON + PANEL
├── embedded-panel.css         # Panel styling
├── popup.html                 # Popup interface (optional)
├── popup-new.js              # Popup logic
└── backend/
    └── api/
        └── chat.js            # Vercel serverless function
```

---

## 🎨 Customization

### Change Floating Button Position:
Edit `embedded-panel.css`:
```css
#nakung-toggle-btn {
  top: 50%;        /* Move up/down */
  right: 0;        /* Always on right */
}
```

### Change Panel Width:
Edit `embedded-panel.css`:
```css
#nakung-panel {
  width: 500px;    /* Make wider/narrower */
}
```

### Auto-Open Panel:
Edit `embedded-panel.js` line 48:
```javascript
setTimeout(() => {
  this.openPanel();  // Auto-opens after 1.5s
}, 1500);
```

---

## 🐛 Troubleshooting

### Button Not Appearing?
1. Check Console (F12) for errors
2. Reload extension: `chrome://extensions/` → Reload
3. Refresh LeetCode page
4. Check URL is `/problems/` not `/problemset/`

### Panel Not Opening?
1. Click the **🚀 AI** button again
2. Check browser console for errors
3. Try different problem page

### AI Not Responding?
1. Check backend is deployed: https://nakung-backend.vercel.app
2. Test connection in Settings
3. Check Vercel logs for errors
4. Verify HF_API_KEY is set in Vercel

---

## 📊 Next Steps

After reloading the extension, you should see:

1. ✅ Floating button on LeetCode problem pages
2. ✅ Click → Side panel slides in
3. ✅ Choose mode → Start chatting
4. ✅ Real-time AI responses

**Ready to test? Reload the extension and visit LeetCode!** 🚀
