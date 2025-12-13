# Fitforge MERN Fitness Tracker

## Overview
- Visitor-first site with marketing homepage. Authenticated users get personal dashboard and trackers.
- Stack: MongoDB, Express.js, React (Vite), Node.js.

## Folder Structure
- `Backend/` Express API
  - `src/index.js` entry
  - `src/app.js` app setup and routes
  - `src/utils/db.js` Mongo connection
  - `src/models/` User, Workout, NutritionEntry, ProgressMetric, Notification
  - `src/middlewares/auth.js` JWT guard
  - `src/controllers/` feature controllers
  - `src/routes/` REST endpoints
- `src/` React client
  - `Home.jsx` visitor marketing page
  - `context/AuthContext.jsx` auth state
  - `api/client.js` API helper
  - `pages/` Login, Register, Dashboard, Workouts, Nutrition, Progress, Settings, Reports, Analytics

## Environment
- Client: `.env` → `VITE_API_URL=http://localhost:5000/api`
- Server: `.env` → `PORT=5000`, `MONGODB_URI=...`, `JWT_SECRET=...`

## API Routes
- `POST /api/auth/register` { username, email, password }
- `POST /api/auth/login` { email, password }
- `GET /api/auth/me` Bearer token
- `GET/POST/PUT/DELETE /api/workouts`
- `GET/POST/PUT/DELETE /api/nutrition`
- `GET/POST/PUT/DELETE /api/progress`
- `GET/PUT /api/settings`
- `GET /api/reports/summary`
- `GET /api/reports/workouts.csv`
- `GET /api/search?q=...&date=...`

## Database Schema
- User: username, email, passwordHash, avatarUrl, preferences { units, theme, notifications }
- Workout: userId, date, category, tags, exercises[{ name, sets, reps, weight, notes }]
- NutritionEntry: userId, date, mealType, items[{ name, quantity, calories, protein, carbs, fats }]
- ProgressMetric: userId, date, weight, chest, waist, hips, runTimeMin, liftPRKg
- Notification: userId, type, message, scheduleAt, read

## Frontend Pages
- Visitor: `/` Home marketing, no login required
- Auth: `/login`, `/register`
- App: `/dashboard`, `/workouts`, `/nutrition`, `/progress`, `/settings`, `/reports`, `/analytics`

## Setup
1. Install client deps: `npm install` in project root
2. Run client: `npm run dev`
3. Server deps: `cd Backend && npm install`
4. Create `Backend/.env` as above
5. Run server: `node index.js`

## Security
- Passwords hashed with bcrypt
- JWT auth with Bearer tokens
- CORS enabled for local dev

## Deployment
- Client: build with `npm run build` (Vite), serve static files
- Server: deploy Node app (PM2/Node service), set env vars and Mongo connection
- Reverse proxy: map `/api` to server and `/` to client

## Accessibility
- High contrast colors, semantic headings, form inputs labeled

## Video Script (Demo)
1. Intro: explain visitor homepage and fitness tracking purpose
2. Visitor flow: show hero, sections, CTA to Register
3. Register: create account; redirect to Dashboard
4. Dashboard: show counts (Workouts/Meals/Progress)
5. Workouts: add a workout; see it appear
6. Nutrition: log meals; calories visible
7. Progress: log weight and PR; show entries
8. Analytics: open charts to view workout frequency and macro distribution
9. Reports: download CSV
10. Settings: change units/theme/notifications
11. Logout and show visitor view again

## Notes
- Data viz uses Chart.js via react-chartjs-2
- Reports export CSV
- Routes validate input via Joi
