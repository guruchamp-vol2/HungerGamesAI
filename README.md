# Hunger Games AI - Interactive Story Game

A true free-roam interactive story game set in the Hunger Games universe, powered by Ink storytelling engine and dynamic AI responses.

## 🚀 Quick Deploy to Render

**Deploy your own Hunger Games AI game in minutes:**

1. **Fork this repository** to your GitHub account
2. **Go to [render.com](https://render.com)** and sign up
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Deploy!** Your game will be live at `https://your-app-name.onrender.com`

**Default login:** Username: `Dev`, Password: `IAmDev$$$123`

📖 **Full deployment guide:** [DEPLOYMENT.md](DEPLOYMENT.md)

## Features

### 🎯 **Dynamic AI Responses**
- **On-the-spot response generation** - No pre-written responses
- **Variable-driven storytelling** - Based on player stats, personality, world events
- **Multi-factor decision making** - Knowledge, agility, strength, stealth all matter
- **Progressive outcome tiers** - 5+ different success levels for every action
- **Random unpredictability** - No two identical actions have identical results

### 🏆 **Character Development**
- **Progressive personality evolution** - Actions change your personality over time
- **Stat progression** - Successful actions improve relevant abilities
- **Dynamic world events** - Storm, supply drops, cannon fire affect gameplay
- **Discovery system** - Chance-based discoveries that add to the story

### 🎮 **True Free Roam**
- Type ANY action you want to perform
- Dynamic storytelling based on your character's stats
- Real-time variable interaction affecting outcomes

### 💎 **Advanced Systems**
- **User authentication** - Register, login, save games
- **Save/load system** - Continue your games anytime
- **Leaderboard** - Track winners and achievements
- **Feedback system** - Share your thoughts
- **Mobile-friendly** - Works on all devices

## How to Play

1. **Register/Login** with your account
2. **Choose your character** (name, age, district)
3. **Complete training** to build your skills
4. **Enter the arena** and survive!
5. **Type actions** like "search for water", "rest", "build shelter"
6. **Watch your stats** and personality evolve
7. **Try to be the last tribute standing!**

## Dynamic AI Examples

**Same action, different results based on variables:**

**Player A (High Knowledge, Survivalist, Storm Approaching):**
> "You use your extensive knowledge to locate a natural spring that's been revealed by the approaching storm. The water is crystal clear and pure, flowing from deep underground sources."

**Player B (Low Knowledge, Aggressive, Quiet Period):**
> "You search for water and find a small pool. The water is murky but flowing, which reduces the risk of contamination. You drink cautiously, hoping it won't make you sick."

**Player C (High Agility, Cautious, Supply Drop):**
> "Your agility allows you to climb down a steep embankment to reach a hidden pool of water. Other tributes would never find this spot. The water is fresh and clean, protected from contamination."

## Local Setup

1. Install dependencies: `npm install`
2. Create a `.env` file with your configuration:
   ```
   # JWT Secret (change this in production)
   JWT_SECRET=your-secret-key-change-in-production
   
   # OpenAI API Key (optional - for AI features)
   OPENAI_API_KEY=your-openai-api-key-here
   
   # Email Configuration (for feedback notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Admin Email (where feedback notifications will be sent)
   ADMIN_EMAIL=admin@yourdomain.com
   ```
3. Run the server: `npm start`
4. Open `http://localhost:3000` in your browser

## Strategic Tips

- **Knowledge matters** - Higher knowledge improves water quality, food safety, observations
- **Agility helps** - Better movement, hidden access, food gathering
- **Strength affects** - Combat effectiveness, building construction
- **Stealth is crucial** - Hiding, rest safety, observation stealth
- **Personality evolves** - Actions change your approach over time
- **World events matter** - Storm, supply drops, cannon fire affect all outcomes

## Technology Stack

- **Backend:** Node.js, Express, SQLite
- **Frontend:** HTML5, CSS3, JavaScript
- **Story Engine:** Ink scripting language
- **AI:** Dynamic variable-driven response generation
- **Authentication:** JWT tokens
- **Database:** SQLite with automatic setup

## Mobile Support

The game is fully responsive and works great on:
- 📱 Mobile phones
- 📱 Tablets  
- 💻 Desktop computers
- 🖥️ All modern browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own games!

---

**Happy Gaming! May the odds be ever in your favor! 🏆** 