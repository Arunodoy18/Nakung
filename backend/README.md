# Nakung Backend API

Secure serverless backend for the Nakung Chrome Extension. Handles AI requests with your API key safely.

## 🚀 Quick Setup

### 1. Get Your Hugging Face API Key
1. Go to https://huggingface.co/settings/tokens
2. Create a new token (Read access is enough)
3. Copy the token (starts with `hf_...`)

### 2. Deploy to Vercel (Free Tier)

#### Install Vercel CLI
```bash
npm install -g vercel
```

#### Deploy from this directory
```bash
cd backend
vercel login
vercel --prod
```

#### Set Environment Variable
```bash
vercel env add HUGGING_FACE_API_KEY
# Paste your API key when prompted
# Select "Production" environment
```

#### Redeploy with new environment variable
```bash
vercel --prod
```

### 3. Update Extension
Your backend URL will be: `https://your-project.vercel.app`

Update `background.js` line 25:
```javascript
const BACKEND_URL = 'https://your-project.vercel.app/api/chat';
```

## 🧪 Test Your Backend

```bash
curl -X POST https://your-project.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I start?",
    "mode": "partner",
    "problemInfo": {
      "title": "Two Sum",
      "difficulty": "Easy",
      "platform": "LeetCode",
      "description": "Find two numbers that add up to target"
    }
  }'
```

## 📊 Vercel Free Tier Limits
- 100GB bandwidth/month
- 100 serverless function invocations/day (Hobby plan)
- More than enough for personal use!

## 🔒 Security
- ✅ API key stored as environment variable (never in code)
- ✅ CORS enabled for Chrome extension
- ✅ Input validation
- ✅ Error handling
- ✅ Rate limiting by Vercel

## 🌐 Alternative Deployment Options

### Railway
```bash
railway login
railway init
railway add HUGGING_FACE_API_KEY
railway up
```

### Cloudflare Workers
Use `wrangler` CLI - setup in their docs

### AWS Lambda
Use Serverless Framework or AWS Console

## 📝 Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your API key

# Run locally
npm run dev
# Backend runs at http://localhost:3000
```

## 🐛 Troubleshooting

**"API key not configured" error:**
- Run: `vercel env ls` to check if variable is set
- Make sure you redeployed after adding the env variable

**CORS errors:**
- Backend already includes CORS headers
- Make sure you're calling the correct URL

**"Model is loading" from Hugging Face:**
- Free models take 20-30s to load first time
- Add retry logic or wait a minute and try again

## 📈 Monitoring
View logs in Vercel dashboard:
https://vercel.com/dashboard

## 💰 Cost Estimates
**Vercel Hobby (Free):** $0/month
- Perfect for personal extension
- 100GB bandwidth = ~50,000 requests

**Vercel Pro:** $20/month if you exceed free tier
- Unlimited bandwidth
- Better performance

Your extension will likely stay within free tier!
