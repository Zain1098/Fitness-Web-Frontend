# 🔧 Chatbot Troubleshooting Guide

## ❌ Current Issue: API Key Problem

### Problem:
```
models/gemini-pro is not found for API version v1
```

### Root Cause:
Provided API key (`AIzaSyCQa3FffU66qhJNx7WzupJLRODsVHuWIaM`) may be:
- Invalid or expired
- Restricted to specific APIs
- Not enabled for Gemini API

## ✅ Solution: Generate New API Key

### Step 1: Go to Google AI Studio
1. Open: https://makersuite.google.com/app/apikey
2. Sign in with your Google account

### Step 2: Create New API Key
1. Click "Create API Key"
2. Select "Create API key in new project" (recommended)
3. Copy the new API key

### Step 3: Update Backend
1. Open `Backend/.env` file
2. Replace the old key:
   ```
   GEMINI_API_KEY=your_new_api_key_here
   ```
3. Save the file

### Step 4: Restart Backend
```bash
cd Backend
npm run dev
```

### Step 5: Test
```bash
# Run test script
node test-api.js
```

## 🧪 Testing Commands

### Test 1: Check API Key
```bash
cd Backend
node test-api.js
```
Expected: ✅ Success message

### Test 2: Test Chat Endpoint
Open `test-chatbot.html` in browser and send a message.

### Test 3: Check Backend Logs
Look for `[Chat]` messages in terminal

## 🔍 Common Issues

### Issue 1: "API key not configured"
**Solution:** Add `GEMINI_API_KEY` to `.env` file

### Issue 2: "404 Not Found"
**Solution:** Generate new API key (current one is invalid)

### Issue 3: "CORS error"
**Solution:** Check `CORS_ORIGIN` in `.env` matches frontend URL

### Issue 4: Backend not responding
**Solution:** 
- Check if backend is running on port 5000
- Check for errors in terminal
- Restart backend server

## 📋 Checklist

Before asking for help, verify:
- [ ] New API key generated from Google AI Studio
- [ ] API key added to `Backend/.env`
- [ ] Backend server restarted
- [ ] `test-api.js` runs successfully
- [ ] No errors in backend terminal
- [ ] Frontend can reach `http://localhost:5000/api/chat`

## 🆘 Still Not Working?

### Check These:
1. **API Key Format**: Should start with `AIza...`
2. **No Spaces**: No spaces before/after API key in `.env`
3. **Quotes**: Don't use quotes around API key
4. **File Saved**: Make sure `.env` file is saved
5. **Server Restarted**: Must restart after changing `.env`

### Get Detailed Logs:
```bash
cd Backend
# Check if .env is loaded
node -e "require('dotenv').config(); console.log('Key:', process.env.GEMINI_API_KEY?.substring(0,10))"
```

## 💡 Alternative: Use Different AI

If Gemini continues to have issues, you can switch to:
- OpenAI GPT (requires OpenAI API key)
- Anthropic Claude (requires Anthropic API key)
- Local LLM (Ollama)

Let me know if you want to switch!

---

**Next Step:** Generate a fresh API key from https://makersuite.google.com/app/apikey
