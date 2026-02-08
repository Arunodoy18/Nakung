# Development Guide

## Setup for Development

1. Install dependencies (none required - vanilla JS!)
2. Load extension in Chrome as described in README
3. Make changes to source files
4. Click reload button in `chrome://extensions`

## Architecture

### Core Services

#### Storage Manager (`storage.js`)
- Handles all data persistence
- Methods: saveSolution, getProgress, updateStatistics, etc.
- Uses Chrome Storage API
- Includes export/import functionality

#### AI Service (`ai-service.js`)
- Manages Hugging Face API integration
- Conversation history tracking
- Fallback responses when API unavailable
- Retry logic with exponential backoff

#### Config (`config.js`)
- Central configuration
- API endpoints
- Platform configurations
- Storage keys

### UI Components

#### Popup (`popup.html/js/css`)
- Main entry point
- Problem input
- Partner/Reviewer mode selection
- Navigation to Dashboard/Settings

#### Dashboard (`dashboard.html/js/css`)
- Statistics visualization
- Activity charts
- Recent problems list
- Data export

#### Settings (`settings.html/js/css`)
- AI configuration
- Appearance settings
- Data management
- About information

### Content Script (`content-script.js/css`)
- Injected into problem pages
- Detects platform and problem details
- Floating action button
- Problem info extraction

## Adding New Features

### Add a New Platform

1. Update `config.js` - Add platform configuration:
```javascript
YOURPLATFORM: {
  name: 'Your Platform',
  patterns: ['yourplatform.com/problems'],
  problemSelector: '.problem-class',
  titleSelector: '.title-class'
}
```

2. Update `manifest.json` - Add content script match:
```json
"matches": [
  "https://yourplatform.com/problems/*"
]
```

3. Update `content-script.js` - Add detection logic in `detectPlatform()` and extraction in `extractProblemInfo()`

### Add a New AI Model

1. Update `config.js`:
```javascript
AI_API: {
  endpoint: 'https://api.provider.com/model',
  // ...
}
```

2. Update `ai-service.js` - Modify `callHuggingFaceAPI()` if different API format

### Add New Statistics

1. Update `storage.js` - Add to `updateStatistics()`:
```javascript
stats.yourNewStat = value;
```

2. Update `dashboard.html/js` - Add UI elements and rendering logic

## Testing

### Manual Testing Checklist
- [ ] Partner mode generates hints
- [ ] Reviewer mode starts chat
- [ ] Messages send and receive
- [ ] Timer counts correctly
- [ ] Dashboard loads statistics
- [ ] Settings save properly
- [ ] Export/import works
- [ ] Platform integration detects problems
- [ ] AI connection test works
- [ ] Error handling shows messages

### Testing with AI
1. Get a test API key from Hugging Face
2. Configure in Settings
3. Test both Partner and Reviewer modes
4. Verify fallback when API fails

### Testing Platform Integration
1. Open supported platform
2. Navigate to a problem
3. Verify floating button appears
4. Click button and check problem detection
5. Ensure no conflicts with site functionality

## Performance Optimization

### Storage
- Use batch operations when possible
- Implement pagination for large datasets
- Regular cleanup of old data

### AI Calls
- Implement request throttling
- Cache repeated queries
- Use smaller models for faster responses

### UI
- Lazy load dashboard charts
- Virtualize long problem lists
- Optimize CSS animations

## Security Best Practices

### Content Script
- Don't access sensitive page data
- Sanitize any extracted content
- Use `textContent` not `innerHTML`

### API Keys
- Never log API keys
- Store in secure Chrome storage
- Validate before API calls

### User Input
- Always validate and sanitize
- Escape HTML in messages
- Limit input lengths

## Debugging

### Enable Console Logs
```javascript
// In config.js
DEBUG: true
```

### Common Issues

**Storage not working:**
- Check Chrome storage quota
- Verify permissions in manifest
- Test with small datasets first

**AI not responding:**
- Check network tab for API calls
- Verify API key format
- Test endpoint separately

**Content script not injecting:**
- Check manifest match patterns
- Verify script loads in DevTools
- Test on exact URL format

## Publishing to Chrome Web Store

1. **Prepare Assets:**
   - Icon: 128x128, 48x48, 16x16
   - Screenshots: 1280x800 or 640x400
   - Promotional images

2. **Update manifest.json:**
   - Remove debug features
   - Set final version number
   - Add all required fields

3. **Create ZIP:**
   ```bash
   zip -r problem-solver-assistant.zip * -x "*.git*" "node_modules/*"
   ```

4. **Submit to Store:**
   - Register developer account ($5 one-time)
   - Upload ZIP
   - Fill in store listing
   - Submit for review

5. **Post-Launch:**
   - Monitor reviews
   - Track usage stats
   - Plan updates

## Code Style Guidelines

### JavaScript
- Use `const` and `let`, not `var`
- Async/await over promises
- Descriptive variable names
- Comments for complex logic

### CSS
- Use CSS variables for themes
- Mobile-first approach
- Avoid `!important`
- Group related styles

### HTML
- Semantic elements
- Accessibility attributes
- Consistent indentation
- Clear class names

## Version Control

### Branching Strategy
- `main` - Production ready
- `develop` - Integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical fixes

### Commit Messages
```
feat: Add new AI model support
fix: Resolve timer reset issue
docs: Update installation guide
style: Improve dashboard layout
refactor: Simplify storage manager
```

## Useful Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Hugging Face API](https://huggingface.co/docs/api-inference/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)

## Support & Community

- Report bugs via GitHub Issues
- Feature requests via Discussions
- Join our Discord community
- Follow updates on Twitter

---

Happy coding! 🚀
