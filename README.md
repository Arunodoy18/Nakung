# 🚀 Nakung AI - Your Coding Partner

<div align="center">

**A revolutionary Chrome extension that transforms LeetCode into an AI-powered learning platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/Arunodoy18/Nakung)
[![Chrome Extension](https://img.shields.io/badge/chrome-extension-brightgreen.svg)](https://chrome.google.com/webstore)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Backend](#-backend-deployment) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### 🤖 **Embedded AI Assistant**
- **Floating Button**: Beautiful 🚀 AI button that slides in from the right on any LeetCode problem page
- **Side Panel Chat**: Sleek embedded chat interface - no popup needed!
- **Real-time AI**: Powered by **Mistral-7B-Instruct** via HuggingFace API
- **Two Interaction Modes**:
  - **🤝 Partner Mode**: Friendly coding mentor who guides you with Socratic questions
  - **🎯 Reviewer Mode**: FAANG-level technical interviewer who challenges your thinking

### 🎨 **Modern UI/UX**
- **Leeco.ai Inspired Design**: Purple gradient theme with smooth animations
- **Dark Mode Optimized**: Perfectly styled for LeetCode's dark theme
- **Auto Problem Detection**: Instantly recognizes the problem you're solving
- **Conversation History**: Maintains context throughout your coding session
- **Theme Toggle**: Switch between light/dark modes

### 🔗 **Multi-Platform Support**
- ✅ LeetCode (leetcode.com)
- ✅ Codeforces (codeforces.com)
- ✅ HackerRank (hackerrank.com)
- 🚧 More platforms coming soon!

### 💾 **Smart Features**
- **Auto Problem Extraction**: Reads problem title, difficulty, description automatically
- **Context-Aware Responses**: AI knows exactly what problem you're working on
- **Conversation Persistence**: Save and restore chat history
- **Settings Panel**: Configure API keys, themes, and preferences

---

## 🎯 Installation

### Quick Install (Developer Mode)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arunodoy18/Nakung.git
   cd Nakung
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right)
   - Click **Load unpacked**
   - Select the `Nakung` folder

3. **Ready!** 🎉
   - Go to any LeetCode problem
   - See the 🚀 AI button appear on the right side

---

## 🚀 Usage

### Getting Started
### Getting Started

1. **Navigate to a LeetCode problem**
   - Example: https://leetcode.com/problems/two-sum/

2. **Click the 🚀 AI button** (appears on right side)

3. **Choose your mode**:
   - **🤝 Partner**: "Let's solve this together!"
   - **🎯 Reviewer**: "Let's do a mock interview"

4. **Start chatting**:
   - Ask questions, discuss approaches
   - AI adapts to your chosen mode
   - Get hints without spoilers

### Example Conversations

**Partner Mode:**
```
You: How should I approach this?
AI: Great question! Let's break it down. What's the first thing 
     you notice about the input arrays? Are they sorted? 🤔

You: Yes, they're sorted!
AI: Exactly! Now, how could we use that property to our advantage? 
    Think about how you'd merge two decks of cards...
```

**Reviewer Mode:**
```
You: I'm thinking of using two pointers
AI: Good start. Can you walk me through your approach step by step? 
    What would be the first step in your algorithm?

You: First, I'd compare elements at both pointers
AI: And what would be your time complexity with this approach? 
    How does it compare to a naive solution?
```

---

## 🏗️ Backend Deployment

The extension uses a **Vercel serverless backend** to handle AI requests securely.

### Backend Architecture
- **Platform**: Vercel (Node.js serverless)
- **AI Model**: Mistral-7B-Instruct-v0.2 via HuggingFace Inference API
- **Endpoint**: `https://nakung-backend.vercel.app/api/chat`
- **Environment Variables**: `HUGGING_FACE_API_KEY` (stored securely in Vercel)

### Deploy Your Own Backend

1. **Navigate to backend folder**
   ```bash
   cd Nakung/backend
   ```

2. **Install Vercel CLI** (if not installed)
   ```bash
   npm install -g vercel
   ```

3. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

4. **Set environment variable in Vercel dashboard**
   - Go to your Vercel project settings
   - Add: `HUGGING_FACE_API_KEY` = `your_huggingface_api_key`
   - Get your key from: https://huggingface.co/settings/tokens

5. **Update extension**
   - Copy your Vercel URL
   - Edit `background.js` line 9:
     ```javascript
     const BACKEND_URL = 'https://your-backend.vercel.app/api/chat';
     ```

---

## 📁 Project Structure

```
Nakung/
├── manifest.json              # Extension configuration
├── background.js              # Service worker (handles AI requests)
├── embedded-panel.js          # Floating button & chat panel
├── embedded-panel.css         # Panel styling
├── platform-detector.js       # Auto-detect coding platforms
├── problem-extractor.js       # Extract problem details
├── popup.html/js/css          # Extension popup UI
├── settings.html/js/css       # Settings page
├── icons/                     # Extension icons
└── backend/
    ├── api/chat.js           # Vercel serverless function
    ├── vercel.json           # Vercel configuration
    └── package.json          # Backend dependencies
```

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)** - Full deployment instructions
- **[HOW-IT-WORKS.md](HOW-IT-WORKS.md)** - Technical architecture explained
- **[API_EXAMPLES.md](API_EXAMPLES.md)** - Backend API documentation
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Contributing guidelines

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Vanilla JavaScript, Chrome Extension API (Manifest V3) |
| **Backend** | Node.js, Vercel Serverless Functions |
| **AI Model** | Mistral-7B-Instruct-v0.2 (HuggingFace) |
| **Styling** | CSS3 with CSS Variables, Flexbox/Grid |
| **Storage** | Chrome Storage API (Local Storage) |
| **Version Control** | Git, GitHub |

---

## 🔐 Security & Privacy

- ✅ **No data collection**: All conversations stored locally
- ✅ **Secure API**: HuggingFace API key stored in Vercel environment (never exposed)
- ✅ **CORS protected**: Backend only accepts requests from extension
- ✅ **Open source**: Fully transparent codebase

---

## 🚧 Roadmap

- [ ] Chrome Web Store publication
- [ ] Support for more coding platforms (CodeChef, AtCoder)
- [ ] Code snippet analysis and review
- [ ] Voice interaction mode
- [ ] Multi-language support
- [ ] Progress analytics dashboard
- [ ] Team collaboration features

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **HuggingFace** for providing the AI inference API
- **Mistral AI** for the powerful Mistral-7B-Instruct model
- **Vercel** for seamless serverless deployment
- **LeetCode** for the amazing platform
- **Leeco.ai** for UI/UX inspiration

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Arunodoy18/Nakung/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Arunodoy18/Nakung/discussions)
- **Email**: arunodoybanerjee@gmail.com

---

<div align="center">

**Made with ❤️ by [Arunodoy Banerjee](https://github.com/Arunodoy18)**

⭐ Star this repo if you find it helpful!

</div>

### Advanced Usage (With AI)
1. Get a free Hugging Face API key at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Click the extension icon → **⚙️ Settings**
3. Paste your API key
4. Click "🧪 Test AI Connection"
5. Save settings
6. Enjoy intelligent AI responses!

## 📱 Interface Overview

### Main Popup
- **Problem Input**: Enter problem ID
- **Partner Button**: Get hints
- **Reviewer Button**: Start interview
- **Dashboard Link**: View your statistics
- **Settings Link**: Configure extension

### Dashboard
- **Statistics Cards**: Problems solved, streak, time spent
- **Activity Chart**: Visual representation of your solving pattern
- **Difficulty Breakdown**: Progress by problem difficulty
- **Recent Problems**: Your latest attempts

### Settings
- **AI Configuration**: Connect Hugging Face API
- **Appearance**: Theme selection
- **Notifications**: Enable/disable alerts
- **Data Management**: Export, import, or clear data

## 🌐 Supported Platforms

- ✅ **LeetCode** (leetcode.com)
- ✅ **Codeforces** (codeforces.com)
- ✅ **HackerRank** (hackerrank.com)
- More platforms coming soon!

## 🛡️ Privacy & Security

- ✅ All data stored locally (Chrome Storage API)
- ✅ No data sent to external servers (except Hugging Face AI when configured)
- ✅ API keys stored securely in local storage
- ✅ Open source - inspect the code yourself

## 🔧 Technical Details

### Technologies Used
- **Manifest V3**: Latest Chrome extension standard
- **Hugging Face API**: AI-powered responses
- **Chrome Storage API**: Local data persistence
- **Content Scripts**: Platform integration
- **Vanilla JavaScript**: No frameworks, lightweight

### File Structure
```
Nakung/
├── manifest.json          # Extension configuration
├── popup.html/js/css      # Main interface
├── dashboard.html/js/css  # Statistics dashboard
├── settings.html/js/css   # Settings page
├── config.js             # Configuration constants
├── storage.js            # Data management
├── ai-service.js         # AI integration
├── content-script.js/css # Platform integration
└── README.md            # This file
```

## 🎨 UI/UX Highlights

- **Beautiful Gradients**: Purple-themed modern design
- **Smooth Animations**: Engaging user experience
- **Responsive Design**: Works perfectly in popup window
- **Error Handling**: Clear feedback for all actions
- **Loading States**: Never wonder what's happening
- **Accessibility**: Keyboard navigation support

## 📈 Roadmap

- [ ] More AI models (GPT-4, Claude)
- [ ] Solution code storage
- [ ] Problem tagging system
- [ ] Multiple theme options
- [ ] Browser sync across devices
- [ ] Mobile companion app
- [ ] Community features
- [ ] Chrome Web Store publication

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - See LICENSE file for details

## 💡 Tips for 100,000+ Users

### Performance
- Lightweight design (< 500KB total)
- Efficient storage management
- Lazy loading of resources
- Optimized API calls with retry logic

### Security
- Minimal permissions required
- API keys never transmitted except to configured endpoints
- Input validation on all user inputs
- XSS protection with sanitized content

### Scalability
- Modular architecture
- Easy to add new platforms
- Configurable AI endpoints
- Export/import for data portability

## 🆘 Troubleshooting

### AI Not Working?
1. Check your API key in Settings
2. Test connection with "🧪 Test AI Connection"
3. Verify you have internet connection
4. Check Hugging Face API status

### Data Not Saving?
1. Check Chrome storage permissions
2. Clear browser cache
3. Reimport your exported data

### Platform Integration Not Showing?
1. Refresh the problem page
2. Check if URL matches supported platforms
3. Disable conflicting extensions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@example.com

---

**Made with ❤️ for competitive programmers and interview prep enthusiasts**

*Happy Solving! 🎯*