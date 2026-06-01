# 🌿 Auracare

> AI-powered skincare platform for personalized recommendations, ingredient safety analysis, and eco-impact scoring.


---

## What it does

- 🔬 **Ingredient Safety Checker** — Analyze risk levels (Low / Medium / High) for any ingredient list
- 🌱 **Eco Score** — Environmental impact scoring based on biodegradability, aquatic toxicity, carbon footprint
- 🤧 **Allergy Detection** — Warns against 16+ allergens with severity levels and safe alternatives
- 🤖 **AI Recommendations** — Personalized routines via OpenRouter (Llama 3) → Gemini → DB fallback
- 📈 **Progress Tracker** — Daily skin logging, streak tracking, and visual trend charts
- 💬 **Community Forum** — Product reviews, ratings, likes, and comments
- 🧴 **Skincare Routine** — Morning/night routines filtered by skin type
- 🤖 **AI Chatbot** — Floating assistant for instant skincare queries

---

## Tech Stack

**Frontend** — React 18, React Router, Axios, Recharts  
**Backend** — Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs  
**AI** — OpenRouter (Llama 3), Google Gemini  

---

## Project Structure

```
auracare/
├── frontend/
│   └── src/
│       ├── pages/          # Login, Signup, Profile, Routine, etc.
│       └── components/     # PostCard, AllergyWarning, EcoScoreCard, etc.
└── backend/
    ├── models/             # User, Product, Ingredient, Post, Progress, Recommendation
    ├── routes/             # allergies, chatbot, community, progress, recommendations
    └── services/           # allergyService, ecoScoreService, recommendationService, progressService
```

---

## Getting Started

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start
```

**Environment variables** — create `backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/auracare
JWT_SECRET=your_secret_key
OPENROUTER_API_KEY=your_key
GEMINI_API_KEY=your_key
```

---

## API Overview

| Area | Endpoints |
|------|-----------|
| Auth | `POST /signup`, `POST /login` |
| Profile | `GET /profile`, `POST /profile` |
| Allergies | `GET /api/allergies/my-allergies`, `POST /api/allergies/update`, `POST /api/allergies/check` |
| Ingredients | `POST /chemical-check` |
| Eco Score | `POST /api/eco/calculate` |
| Recommendations | `POST /api/recommendations/get` |
| Progress | `POST /api/progress/log`, `GET /api/progress/stats` |
| Community | `GET /api/community/posts`, `POST /api/community/post/:id/like` |
| Chatbot | `POST /api/chatbot/skincare-query` |

---

## Key Numbers

| Metric | Value |
|--------|-------|
| Frontend components | 12 |
| API endpoints | 15+ |
| Database collections | 6 |
| Supported allergens | 16 |
| AI models | 3 |

---

## Made by
1. Muralisekar Janissha
2.  Prarthna M
3.  Priya Verma

