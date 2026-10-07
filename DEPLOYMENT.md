# 🚀 Deploy Hunger Games AI to Render

## Quick Deploy to Render

### Option 1: One-Click Deploy (Recommended)

1. **Click the "Deploy to Render" button below:**
   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy/schema-new?template=https://github.com/yourusername/hunger-games-ai)

2. **Or manually deploy:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select this repository
   - Render will auto-detect the settings

### Option 2: Manual Setup

1. **Fork/Clone this repository to your GitHub account**

2. **Go to Render Dashboard:**
   - Visit [render.com](https://render.com)
   - Sign up/Login with GitHub

3. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select this repository

4. **Configure the service:**
   - **Name:** `hunger-games-ai` (or your preferred name)
   - **Environment:** `Node`
   - **Build Command:** `npm ci --include=dev && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid if you prefer)

5. **Environment Variables (Optional):**
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-here
   OPENAI_API_KEY=your-openai-api-key (optional)
   ```

6. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app

## 🎮 After Deployment

1. **Your game will be available at:** `https://your-app-name.onrender.com`

2. **Default login credentials:**

3. **Features available:**
   - ✅ Dynamic AI responses
   - ✅ User authentication
   - ✅ Save/load games
   - ✅ Leaderboard
   - ✅ Feedback system
   - ✅ Mobile-friendly UI

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment | No | development |
| `JWT_SECRET` | JWT signing secret | No | auto-generated |
| `OPENAI_API_KEY` | OpenAI API key | No | disabled |

### Database

- Uses SQLite (included in deployment)
- Database file: `game.db`
- Automatically created on first run

## 🐛 Troubleshooting

### Common Issues

1. **Build fails:**
   - Check that `package.json` has correct dependencies
   - Ensure Node.js version is 16+ (specified in engines)

2. **App doesn't start:**
   - Check logs in Render dashboard
   - Verify `npm start` command works locally

3. **Database errors:**
   - SQLite database is automatically created
   - Check file permissions in Render logs

### Getting Help

- Check Render logs in the dashboard
- Verify all files are committed to GitHub
- Test locally first: `npm ci --include=dev && npm run build && npm start`

## 🎯 Features

Your deployed Hunger Games AI will include:

- **Dynamic AI Responses** - Every action generates unique responses based on variables
- **Variable-Driven Story** - Player stats, personality, and world events affect outcomes
- **Progressive Character Development** - Actions change your personality over time
- **Random World Events** - Storm, supply drops, cannon fire affect gameplay
- **Multi-tier Success System** - 5+ different quality levels for every action
- **User Authentication** - Register, login, save games
- **Leaderboard** - Track winners and achievements
- **Mobile-Friendly** - Works on all devices

## 📱 Mobile Support

The game is fully responsive and works great on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ All modern browsers

## 🎮 Game Instructions

1. **Register/Login** with your account
2. **Choose your character** (name, age, district)
3. **Complete training** to build your stats
4. **Enter the arena** and survive!
5. **Type actions** like "search for water", "rest", "build shelter"
6. **Watch your stats** and personality evolve
7. **Try to be the last tribute standing!**

---

**Happy Gaming! May the odds be ever in your favor! 🏆**

## Recovering the arena-entry choice error

The old client assigned `current_action` without declaring it in the Ink story. That exception left stale choice buttons visible, causing later clicks to fail with “choice out of range.” The story now declares the compatibility variable, and the current client validates that a clicked choice still belongs to the current story scene.

Deploy the latest `main` commit using `npm ci --include=dev && npm run build` so the Ink compiler is available even when `NODE_ENV=production`. The blueprint uses that command. HTML, JavaScript, and story JSON are served without caching; the game scripts also use a new asset version. If the Render service has an older manually configured build command, update it in Render and deploy the latest commit. A browser tab already running the old client needs to be reloaded.

## AI director configuration

Set `OPENAI_API_KEY` in the Render service's secure environment settings to enable hosted narration and natural-language interpretation. Optionally set `OPENAI_MODEL` to a model supporting strict JSON-schema Chat Completions; the default is `gpt-4.1-mini`. Users must sign in before enabling paid AI calls. Local narration and the survival coach work without a provider key. Do not place provider credentials in public files.

Check `/api/version` for `arena-ai-4` and the deployed commit. Check `/api/ai/status` for `available: true` when a key is present; this reports configuration presence, not a successful provider connectivity check. The game falls back to local narration if the provider is unavailable. Existing manually configured Render services may need a manual deployment of `main`; changing the blueprint file alone does not update their service settings.
