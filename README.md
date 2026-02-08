# 🚀 Problem Solver Assistant

A powerful Chrome extension for competitive programmers and interview preparation. Get AI-powered hints, conduct mock interviews, track your progress, and more!

## ✨ Features

### 🤖 AI-Powered Interview Simulation
- **Reviewer Mode**: Interactive technical interview with AI-powered follow-up questions
- **Partner Mode**: Get strategic hints without spoiling the solution
- Real-time conversation with Hugging Face AI models
- Fallback to smart predefined responses when offline

### 📊 Progress Tracking
- **Visual Dashboard**: Track problems solved, streaks, and time spent
- **Activity Chart**: See your 14-day solving history
- **Difficulty Breakdown**: Easy, Medium, Hard problem statistics
- **Recent Problems**: Quick access to your latest attempts

### 🔗 Platform Integration
- **Auto-Detection**: Works on LeetCode, Codeforces, HackerRank
- **Floating Button**: Quick access while solving problems
- **Problem Extraction**: Automatically captures problem details

### 💾 Data Management
- **Local Storage**: All data stored securely on your device
- **Export/Import**: Backup and restore your progress
- **Statistics**: Detailed analytics on your solving patterns

### ⚙️ Customization
- **AI Configuration**: Use your own Hugging Face API key
- **Theme Options**: Auto, Light, Dark themes
- **Notifications**: Optional reminders and achievements

## 🎯 Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Select the `Nakung` folder
6. Pin the extension to your toolbar

## 🔑 Getting Started

### Basic Usage (No Setup Required)
1. Click the extension icon
2. Enter a problem number (e.g., "LC-123" or "CF-456A")
3. Choose:
   - **💡 Partner**: Get a helpful hint
   - **🎯 Reviewer**: Start a mock interview

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