# Changelog

All notable changes to Nakung AI will be documented in this file.

## [3.0.0] - 2026-02-28

### 🎉 Major Release - Advanced Features

#### ✨ New Features

**User Experience Enhancements:**
- ⌨️ **Keyboard Shortcuts System**: Full keyboard navigation support
  - `Ctrl+K` to focus input
  - `Ctrl+L` to clear chat
  - `Ctrl+E` to export chat
  - `Ctrl+I` to view statistics
  - `Escape` to navigate back or close modals
- 📥 **Export Chat Functionality**: Download conversations as Markdown files
- 📊 **Statistics Dashboard**: Track your learning progress
  - Problems attempted counter
  - Total messages sent
  - Hints requested tracking
  - Session time monitoring
  - Mode usage preferences
  - Difficulty distribution

**Code & Formatting:**
- 🎨 **Syntax Highlighting**: Beautiful code highlighting in chat messages
- 📋 **Copy Code Button**: One-click copy for code snippets
- ⏰ **Message Timestamps**: See when each message was sent
- ✨ **Enhanced Markdown**: Support for bold, italic, links, and code blocks

**Performance & Reliability:**
- 💾 **Response Caching**: Instant responses for repeated questions
- 📡 **Offline Message Queue**: Queue messages when offline, auto-send when reconnected
- 🔄 **Exponential Backoff Retry**: Intelligent retry logic for failed requests
- 🧠 **Memory Management**: Optimized conversation history management
- 📊 **Context Window Optimization**: Smart context management for better AI responses

**Accessibility:**
- ♿ **Full Keyboard Navigation**: Navigate entire app without mouse
- 🎯 **ARIA Labels**: Proper labels for screen readers
- 🔆 **High Contrast Mode**: Support for high contrast preferences
- 🎬 **Reduced Motion**: Respect prefers-reduced-motion settings
- 👁️ **Focus Indicators**: Clear visual focus states

#### 🔧 Improvements

**AI Service:**
- Enhanced error handling with detailed error messages
- Request/error tracking for debugging
- Optimized conversation history management
- Reduced description truncation for better context (800 → 600 chars)
- Added request counting and error rate monitoring

**UI/UX:**
- Added action buttons in chat header (Export, Stats, Clear)
- Offline indicator with queued message count
- Modal for statistics display
- Improved toast notifications
- Better visual feedback for all actions
- Enhanced message formatting

**Code Quality:**
- Added comprehensive utilities module (utils.js)
- Better separation of concerns
- Improved error recovery
- Memory leak prevention
- Better state management

#### 🐛 Bug Fixes

- Fixed potential memory leaks in long sessions
- Improved offline/online detection
- Better handling of connection timeouts
- Fixed cache invalidation issues
- Improved error message clarity

#### 📚 Documentation

- Updated README with all new features
- Added keyboard shortcuts documentation
- Created comprehensive CHANGELOG
- Improved code comments

---

## [2.4.2] - Previous Release

### Features
- Basic chat functionality
- Partner and Reviewer modes
- Problem detection for multiple platforms
- Conversation persistence
- Basic error handling

---

## Future Plans

- 🌍 Multi-language support
- 🎯 Code review mode
- 🧪 Test case generator
- 🏆 Achievement system
- 📈 Advanced analytics
- 🔗 Platform expansion (AtCoder, GeeksforGeeks, Codewars)
- 🎨 Custom themes
- 💬 Voice input support

---

**Note**: This version maintains full backward compatibility with v2.x settings and data.
