# Backend Deployment Checklist

## 🎯 Step-by-Step Deployment

### 1. Get Hugging Face API Key (2 minutes)
- [ ] Go to https://huggingface.co/settings/tokens
- [ ] Click "New token"
- [ ] Name it "nakung-backend"
- [ ] Select "Read" permission
- [ ] Copy the token (starts with `hf_...`)

### 2. Install Vercel CLI (1 minute)
```bash
npm install -g vercel
```

### 3. Deploy Backend (3 minutes)
```bash
cd c:\dev\Nakung\backend
vercel login
# Select your account
vercel --prod
# Follow prompts, accept defaults
```

You'll get a URL like: `https://nakung-backend-abc123.vercel.app`

### 4. Add API Key to Vercel (1 minute)
```bash
vercel env add HUGGING_FACE_API_KEY
# When prompted:
# - Paste your HF token
# - Select: Production
# - Press Enter
```

### 5. Redeploy with Environment Variable (1 minute)
```bash
vercel --prod
```

### 6. Update Extension (30 seconds)
Open `c:\dev\Nakung\background.js` line 27:

**Replace:**
```javascript
const BACKEND_URL = 'https://your-project-name.vercel.app/api/chat';
```

**With your actual URL:**
```javascript
const BACKEND_URL = 'https://nakung-backend-abc123.vercel.app/api/chat';
```

### 7. Test Extension (1 minute)
- [ ] Reload extension at `chrome://extensions/`
- [ ] Visit https://leetcode.com/problems/two-sum/
- [ ] Click the 🚀 button
- [ ] Select Partner or Reviewer mode
- [ ] Send a message: "Help me understand this problem"
- [ ] ✅ You should get an AI response!

---

## ⚡ Quick Test Commands

### Test backend is live:
```bash
curl https://your-backend.vercel.app/api/chat
```

Expected: Method not allowed (that's correct!)

### Test with sample request:
```bash
curl -X POST https://your-backend.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Hello\",\"mode\":\"partner\",\"problemInfo\":{\"title\":\"Test\",\"difficulty\":\"Easy\",\"platform\":\"LeetCode\"}}"
```

Expected: JSON response with AI text

---

## 🔍 Troubleshooting

**"API key not configured"**
```bash
# Check if env var is set
vercel env ls

# If not listed, add it:
vercel env add HUGGING_FACE_API_KEY
vercel --prod
```

**"CORS error" in extension**
- Backend already has CORS headers
- Make sure URL in background.js matches your Vercel URL exactly
- Include `/api/chat` at the end

**"Model is loading" error**
- First request takes 20-30 seconds
- This is normal for free Hugging Face inference
- Wait and try again

**Extension shows fallback responses**
- Check browser console (F12) for errors
- Verify backend URL is correct
- Test backend with curl command above

---

## 📊 Monitoring

View logs in real-time:
```bash
vercel logs
```

Or visit: https://vercel.com/dashboard

---

## ✅ Success Checklist

- [ ] Backend deployed to Vercel
- [ ] Environment variable added
- [ ] Extension updated with correct URL
- [ ] Extension reloaded
- [ ] AI responds to messages on LeetCode

**Total time: ~10 minutes**

---

## 💡 Tips

1. **Save your backend URL** - You'll need it
2. **Keep API key secret** - Never commit to git
3. **Monitor usage** - Check Vercel dashboard weekly
4. **Free tier limits** - 100GB bandwidth/month (plenty!)

Need help? Check backend/README.md for detailed docs.
