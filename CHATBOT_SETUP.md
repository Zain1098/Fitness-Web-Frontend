# FitForge AI Chatbot Setup Guide

## ✅ Kya Install Ho Gaya

1. **Frontend Components**:
   - `src/components/FitnessChatbot.jsx` - Main chatbot component
   - `src/components/FitnessChatbot.css` - Chatbot styling
   - Dashboard mein integrate ho gaya

2. **Backend API**:
   - `Backend/src/controllers/chatController.js` - Gemini AI integration
   - `Backend/src/routes/chat.js` - Chat route
   - Google Generative AI package installed

## 🔧 Setup Instructions

### Step 1: Gemini API Key Lena

1. Google AI Studio pe jao: https://makersuite.google.com/app/apikey
2. "Create API Key" pe click karo
3. API key copy karo

### Step 2: Backend Configuration

1. Backend folder mein `.env` file open karo:
   ```bash
   cd Backend
   ```

2. `.env` file mein yeh line add karo:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. Apni actual API key paste karo

### Step 3: Server Restart

Backend server restart karo:
```bash
npm run dev
```

## 🎯 Features

### Chatbot Capabilities:
- 💪 Workout plans aur exercise suggestions
- 🥗 Nutrition advice aur meal planning
- 📊 Progress tracking tips
- 🎯 Goal setting strategies
- 🏃 Cardio aur strength training guidance

### UI Features:
- Floating button (bottom-right corner)
- Smooth animations
- Quick question buttons
- Chat history
- Mobile responsive

## 🧪 Testing

1. Dashboard pe jao
2. Bottom-right corner mein chatbot button (🤖) dikhega
3. Click karke chatbot open karo
4. Try karo:
   - "Suggest a workout plan"
   - "Healthy meal ideas"
   - "How to lose weight?"
   - "Best exercises for abs"

## 🎨 Customization

### Colors Change Karna:
`src/components/FitnessChatbot.css` mein:
```css
background: linear-gradient(135deg, #ff6b35, #ff8c42);
```

### System Prompt Change Karna:
`Backend/src/controllers/chatController.js` mein `FITNESS_SYSTEM_PROMPT` edit karo

## 🐛 Troubleshooting

### Error: "Gemini API key not configured"
- `.env` file mein `GEMINI_API_KEY` add karo
- Server restart karo

### Chatbot button nahi dikh raha
- Browser refresh karo (Ctrl+R)
- Console mein errors check karo

### API calls fail ho rahe hain
- Backend server running hai check karo
- CORS settings check karo
- API key valid hai verify karo

## 📝 Notes

- Free tier: 60 requests per minute
- Response time: 1-3 seconds
- Max response length: 500 tokens
- Chat history: Last 6 messages stored

## 🚀 Next Steps

Aap chatbot ko aur enhance kar sakte ho:
- User ka workout/nutrition data context mein use karo
- Voice input add karo
- Saved conversations feature
- Personalized recommendations based on user goals

---

Koi problem ho to mujhe batao! 🎉
