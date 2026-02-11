# PRIVACY POLICY - Nakung AI Chrome Extension

**Last Updated:** February 9, 2026  
**Effective Date:** February 9, 2026  
**Version:** 2.1.0  

---

## 1. INTRODUCTION

Nakung AI ("we," "our," or "the Extension") is committed to protecting your privacy. This Privacy Policy explains how the Nakung AI Chrome Extension collects, uses, and safeguards your information.

**BY INSTALLING AND USING THIS EXTENSION, YOU AGREE TO THIS PRIVACY POLICY.**

---

## 2. INFORMATION WE COLLECT

### 2.1 Data Collection Summary

**WE DO NOT COLLECT PERSONAL INFORMATION.**

The Nakung AI Extension is designed with privacy as a core principle:

✅ **NO** user registration required  
✅ **NO** personal identifiable information collected  
✅ **NO** email addresses stored  
✅ **NO** names or profiles created  
✅ **NO** payment information (Extension is free)  
✅ **NO** tracking cookies  
✅ **NO** analytics or usage statistics  

### 2.2 What Data Is Processed

The Extension processes the following data **LOCALLY** on your device:

#### A. **Problem Information**
- **What:** Title, difficulty, description of coding problems from LeetCode, CodeChef, HackerRank
- **Purpose:** Provide context-aware AI assistance
- **Storage:** Chrome local storage (chrome.storage.local)
- **Retention:** Until you clear browser data or uninstall the extension
- **Sharing:** Never shared with third parties

#### B. **Chat Conversations**
- **What:** Your questions and AI responses during chat sessions
- **Purpose:** Maintain conversation context for better assistance
- **Storage:** Chrome local storage (chrome.storage.local)
- **Retention:** Until you navigate to a different problem or clear browser data
- **Sharing:** Never shared with third parties

#### C. **User Preferences**
- **What:** Selected mode (Partner/Reviewer), UI preferences
- **Purpose:** Remember your settings across sessions
- **Storage:** Chrome local storage (chrome.storage.local)
- **Retention:** Until you clear browser data or uninstall the extension
- **Sharing:** Never shared with third parties

---

## 3. HOW WE USE YOUR DATA

### 3.1 Local Processing

All data mentioned above is:

1. **Stored locally** in your browser using Chrome's storage API
2. **Never uploaded** to external servers except for AI communication
3. **Never sold** or shared with third parties
4. **Automatically deleted** when you clear browser data

### 3.2 AI Communication

When you send a message to the AI:

**What is sent to our backend:**
- Your chat message
- Current problem context (title, difficulty, platform)
- System prompt (based on selected mode)
- Recent conversation history (last 8 messages for context)

**What is NOT sent:**
- Your name, email, or identity
- Your browser history
- Your solutions or code
- Any personal information
- Data from other websites

**Backend processing:**
- Messages are sent to: `https://nakung-backend.vercel.app/api/chat`
- Backend forwards your query to Groq AI API (Llama 3.3 70B model)
- Response is returned to your browser
- **NO LOGGING:** We do not log or store your conversations on the backend
- **NO RETENTION:** Messages are processed in real-time and discarded immediately

---

## 4. THIRD-PARTY SERVICES

### 4.1 Groq AI API

Our backend uses Groq AI (https://groq.com) to generate intelligent responses.

**Groq's Privacy:**
- Visit: https://groq.com/privacy-policy/
- Groq processes AI requests but does not retain user data
- All requests are ephemeral (not stored)

**What Groq receives:**
- Your question text
- Problem context
- System prompts

**What Groq does NOT receive:**
- Personal information
- Browser data
- User identity

### 4.2 Vercel (Hosting)

Our backend is hosted on Vercel (https://vercel.com).

**Vercel's Role:**
- Hosts our API endpoint
- Processes requests transiently
- Does not log personal data

**Vercel's Privacy:**
- Visit: https://vercel.com/legal/privacy-policy

---

## 5. DATA STORAGE & SECURITY

### 5.1 Where Your Data Lives

| Data Type | Storage Location | Duration |
|-----------|------------------|----------|
| Chat History | Your browser (local storage) | Until problem change or browser clear |
| Problem Info | Your browser (local storage) | Until problem change or browser clear |
| User Preferences | Your browser (local storage) | Until browser clear or uninstall |
| Backend Requests | In-transit only (HTTPS) | Immediately discarded after response |

### 5.2 Security Measures

**Transport Security:**
- All communications use HTTPS (TLS encryption)
- Secure backend API endpoint
- No unencrypted data transmission

**Local Security:**
- Data stored using Chrome's secure storage API
- Isolated from other extensions
- Follows Chrome's security model

**Backend Security:**
- Serverless architecture (no persistent database)
- Environment variables secured in Vercel
- API key protection

---

## 6. YOUR RIGHTS & CONTROLS

### 6.1 Data Access

You can access your locally stored data:
1. Open Chrome DevTools (F12)
2. Go to: Application → Storage → Local Storage
3. Find: Extension storage keys

### 6.2 Data Deletion

You can delete your data at any time:

**Option 1: Clear Specific Extension Data**
1. Right-click extension icon  
2. Manage Extension  
3. Remove extension (clears all data)

**Option 2: Clear Browser Storage**
1. Chrome Settings → Privacy and Security  
2. Clear browsing data  
3. Check "Cookies and other site data"  

**Option 3: Automatic Deletion**
- Data automatically clears when you navigate to a different problem
- Chat history resets per problem

### 6.3 Opt-Out

You can stop using the extension at any time by:
1. Disabling the extension (data remains)
2. Uninstalling the extension (data deleted)

---

## 7. CHILDREN'S PRIVACY

The Extension does not knowingly collect information from children under 13. The Extension is designed for:

- College students (18+)
- Job seekers
- Professional developers

If you are under 13, please do not use this Extension.

---

## 8. COOKIES

**WE DO NOT USE COOKIES.**

The Extension does not:
- Set cookies
- Use tracking pixels
- Employ fingerprinting
- Track user behavior

---

## 9. DATA SHARING

### 9.1 What We Share: NOTHING

We do NOT share your data with:
- Advertisers
- Marketing companies
- Data brokers
- Third-party analytics
- Any other entity

### 9.2 Legal Requirements

We may disclose information if required by law, such as:
- In response to a valid subpoena
- To protect our rights
- In cases of fraud or security threats

**However:** Since we don't collect or store personal data, there is minimal data to disclose.

---

## 10. INTERNATIONAL DATA TRANSFERS

**Data processing locations:**
- Your browser: Your device (anywhere in the world)
- Backend API: Vercel's edge network (globally distributed)
- AI Processing: Groq's infrastructure (USA)

**GDPR Compliance:**
- No personal data transferred
- No user profiling
- Right to be forgotten (automatic via data deletion)
- Data minimization (we collect only what's necessary)

---

## 11. CHANGES TO THIS POLICY

We may update this Privacy Policy occasionally. Changes will be:

- Posted on our GitHub repository
- Noted in extension updates
- Effective immediately upon posting

**Current Version:** 2.1.0  
**Last Updated:** February 9, 2026  

Check for updates: https://github.com/Arunodoy18/Nakung

---

## 12. CONTACT US

If you have questions about this Privacy Policy:

**GitHub Issues:** https://github.com/Arunodoy18/Nakung/issues  
**Repository:** https://github.com/Arunodoy18/Nakung  

We'll respond to privacy inquiries within 7 business days.

---

## 13. CONSENT

By using the Nakung AI Extension, you consent to:
- This Privacy Policy
- Data processing as described above
- Communications with our backend API

You can withdraw consent at any time by uninstalling the Extension.

---

## 14. PRIVACY SUMMARY (TL;DR)

✅ **NO personal information collected**  
✅ **NO tracking or analytics**  
✅ **ALL data stored locally in your browser**  
✅ **Messages processed ephemerally (not stored on backend)**  
✅ **No login required**  
✅ **No cookies**  
✅ **Free forever - no payment data**  
✅ **You control your data (delete anytime)**  
✅ **HTTPS secure communication**  
✅ **GDPR compliant**  

---

## 15. ADDITIONAL ASSURANCES

### 15.1 No Ads

The Extension contains:
- NO advertisements
- NO sponsored content
- NO affiliate links

### 15.2 Open Source

The Extension's code is:
- Publicly available on GitHub
- Auditable by anyone
- Transparent in its operations

**Repository:** https://github.com/Arunodoy18/Nakung

### 15.3 No Monetization

We do NOT monetize:
- Your data
- Your activity
- Your usage patterns

The Extension is free and will remain free.

---

## 16. COMPLIANCE

This Extension complies with:

✅ **GDPR** (General Data Protection Regulation)  
✅ **CCPA** (California Consumer Privacy Act)  
✅ **COPPA** (Children's Online Privacy Protection Act) - N/A as not targeted at children  
✅ **Chrome Web Store Policies**  
✅ **Google's User Data Policy**  

---

## 17. DATA RETENTION POLICY

| Data Type | Retention Period | Deletion Method |
|-----------|------------------|-----------------|
| Chat History | Until problem change | Automatic |
| Problem Info | Until new problem loaded | Automatic |
| User Preferences | Until browser clear | User-initiated |
| Backend Requests | 0 seconds (ephemeral) | Automatic |
| AI Processing | 0 seconds (ephemeral) | Automatic |

**We do NOT retain any data after processing.**

---

## 18. YOUR PRIVACY RIGHTS (GDPR)

If you're in the EU, you have the right to:

✅ **Access** - View what data we have (currently: none on our servers)  
✅ **Rectification** - Correct inaccurate data (N/A - no stored data)  
✅ **Erasure** - Request deletion (automatic on uninstall)  
✅ **Portability** - Export your data (available via browser DevTools)  
✅ **Object** - Opt-out of processing (uninstall extension)  
✅ **Restrict** - Limit data processing (disable extension)  

---

## 19. CALIFORNIA RESIDENTS (CCPA)

California users have additional rights:

**We do NOT "sell" your personal information** because:
1. We don't collect personal information
2. We don't share data with third parties
3. We don't monetize user data

**Right to Know:** We've disclosed all data collection above (minimal)  
**Right to Delete:** Uninstall extension or clear browser data  
**Right to Opt-Out:** Disable or remove the extension  

---

## 20. FINAL NOTES

**Privacy is not a feature - it's a foundation.**

Nakung AI is built from the ground up with privacy as a core design principle. We collect nothing we don't absolutely need, and we don't store anything we don't have to.

Your trust is important to us.

---

**END OF PRIVACY POLICY**

---

**Document Information:**
- Published: February 9, 2026
- Version: 2.1.0
- Format: Markdown
- Language: English (US)
- Location: https://github.com/Arunodoy18/Nakung/blob/main/PRIVACY_POLICY.md

---

**Acknowledgment:**

✅ I have read and understood this Privacy Policy  
✅ I consent to the data processing described  
✅ I understand my rights and how to exercise them  
✅ I may withdraw consent by uninstalling the extension  

---

**Questions? We're here to help!**

GitHub Issues: https://github.com/Arunodoy18/Nakung/issues
