# 🚀 Start Chatbot - Quick Guide

## Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

### ❌ Problem:
Backend server running nahi hai ya properly respond nahi kar raha.

### ✅ Solution:

## Step 1: Backend Start Karo

```bash
# Terminal 1 - Backend
cd Backend
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MongoDB connected
```

## Step 2: Frontend Start Karo

```bash
# Terminal 2 - Frontend (new terminal)
cd ..
npm run dev
```

**Expected Output:**
```
Local: http://localhost:5174
```

## Step 3: Test Backend

Open in browser: `check-backend.html`

Ya command line se:
```bash
curl http://localhost:5000/api/health
```

**Expected:** `{"ok":true}`

## Step 4: Use Chatbot

1. Go to: http://localhost:5174/dashboard
2. Click 🤖 button (bottom-right)
3. Type a message
4. Get AI response!

---

## 🐛 Troubleshooting

### Backend Not Starting?

**Check MongoDB:**
```bash
# Make sure MongoDB is running
# Windows: Check Services
# Mac/Linux: sudo systemctl status mongod
```

**Check Port 5000:**
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

### Still Getting JSON Error?

1. **Check backend logs** - Look for errors in terminal
2. **Check .env file** - Make sure GEMINI_API_KEY is set
3. **Restart both servers** - Stop and start again
4. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)

### Backend Running But Not Responding?

**Check CORS:**
```bash
# In Backend/.env
CORS_ORIGIN=http://localhost:5174,http://localhost:5173
```

**Check Route:**
```bash
# Test directly
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hello","history":[]}'
```

---

## ✅ Quick Checklist

- [ ] MongoDB running
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 5174)
- [ ] GEMINI_API_KEY in .env
- [ ] No errors in backend terminal
- [ ] `check-backend.html` shows ✅

---

## 🎯 Commands Summary

```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend
npm run dev

# Terminal 3 - Test
cd Backend
node test-api.js
```

---

**Need Help?** Open `check-backend.html` in browser to diagnose!
