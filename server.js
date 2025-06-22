const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { initializeDatabase, userDB, saveDB, feedbackDB, statsDB, leaderboardDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// JWT secret (in production, use a strong secret from environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Initialize database
initializeDatabase().then(() => {
    console.log('Database initialized successfully');
}).catch(err => {
    console.error('Database initialization failed:', err);
});

// OpenAI configuration
let openai = null;
if (process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai');
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    console.log('OpenAI API configured successfully');
} else {
    console.log('OpenAI API key not found - free roam AI features will be disabled');
}

// Authentication routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        const existingUser = await userDB.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await userDB.createUser(username, passwordHash, email);

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'User registered successfully',
            token,
            user: { id: user.id, username: user.username }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        console.log(`Login attempt for username: ${username}`);

        // Get user
        const user = await userDB.getUserByUsername(username);
        if (!user) {
            console.log(`User '${username}' not found in database`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`User '${username}' found, ID: ${user.id}`);

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        console.log(`Password validation for '${username}': ${validPassword ? 'PASS' : 'FAIL'}`);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await userDB.updateLastLogin(user.id);

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        console.log(`Login successful for '${username}'`);

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// User profile route
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await userDB.getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Save game routes
app.post('/api/saves', authenticateToken, async (req, res) => {
    try {
        const { saveName, storyState, characterData } = req.body;

        if (!saveName || !storyState || !characterData) {
            return res.status(400).json({ error: 'Save name, story state, and character data are required' });
        }

        const save = await saveDB.createSave(req.user.userId, saveName, storyState, characterData);
        res.json({ message: 'Save created successfully', save });
    } catch (error) {
        console.error('Create save error:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Save name already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create save' });
        }
    }
});

app.get('/api/saves', authenticateToken, async (req, res) => {
    try {
        const saves = await saveDB.getUserSaves(req.user.userId);
        res.json({ saves });
    } catch (error) {
        console.error('Get saves error:', error);
        res.status(500).json({ error: 'Failed to get saves' });
    }
});

app.get('/api/saves/:saveId', authenticateToken, async (req, res) => {
    try {
        const save = await saveDB.getSaveById(req.params.saveId, req.user.userId);
        if (!save) {
            return res.status(404).json({ error: 'Save not found' });
        }
        res.json({ save });
    } catch (error) {
        console.error('Get save error:', error);
        res.status(500).json({ error: 'Failed to get save' });
    }
});

app.put('/api/saves/:saveId', authenticateToken, async (req, res) => {
    try {
        const { storyState, characterData } = req.body;

        if (!storyState || !characterData) {
            return res.status(400).json({ error: 'Story state and character data are required' });
        }

        await saveDB.updateSave(req.params.saveId, storyState, characterData);
        res.json({ message: 'Save updated successfully' });
    } catch (error) {
        console.error('Update save error:', error);
        res.status(500).json({ error: 'Failed to update save' });
    }
});

app.delete('/api/saves/:saveId', authenticateToken, async (req, res) => {
    try {
        await saveDB.deleteSave(req.params.saveId, req.user.userId);
        res.json({ message: 'Save deleted successfully' });
    } catch (error) {
        console.error('Delete save error:', error);
        res.status(500).json({ error: 'Failed to delete save' });
    }
});

// Feedback routes
app.post('/api/feedback', async (req, res) => {
    try {
        const { subject, message, rating, username } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ error: 'Subject and message are required' });
        }

        let userId = null;
        if (req.headers['authorization']) {
            try {
                const token = req.headers['authorization'].split(' ')[1];
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded.userId;
            } catch (err) {
                // Token invalid, continue as anonymous
            }
        }

        const feedback = await feedbackDB.submitFeedback(userId, username, subject, message, rating);
        res.json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

app.get('/api/feedback', async (req, res) => {
    try {
        const feedback = await feedbackDB.getFeedback();
        res.json({ feedback });
    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({ error: 'Failed to get feedback' });
    }
});

// Game statistics routes
app.post('/api/stats', authenticateToken, async (req, res) => {
    try {
        const { saveId, stats } = req.body;

        if (!saveId || !stats) {
            return res.status(400).json({ error: 'Save ID and stats are required' });
        }

        await statsDB.updateGameStats(req.user.userId, saveId, stats);
        res.json({ message: 'Stats updated successfully' });
    } catch (error) {
        console.error('Update stats error:', error);
        res.status(500).json({ error: 'Failed to update stats' });
    }
});

app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await statsDB.getUserStats(req.user.userId);
        res.json({ stats });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// GPT-powered free roam endpoint
app.post('/api/free-roam', async (req, res) => {
    try {
        const { action, playerStats, storyContext } = req.body;
        
        if (!openai) {
            // Fallback response when OpenAI is not configured
            const fallbackResponses = [
                `You ${action.toLowerCase()}, and the arena responds with unexpected intensity. The Games are unpredictable, and every action carries weight.`,
                `As you ${action.toLowerCase()}, you feel the eyes of the Capitol watching. The arena's harsh environment tests your resolve.`,
                `Your attempt to ${action.toLowerCase()} meets with mixed results. In the Hunger Games, nothing is guaranteed, and survival requires constant adaptation.`,
                `The arena's unforgiving nature makes ${action.toLowerCase()} a challenge. You must stay alert and resourceful to survive.`,
                `You ${action.toLowerCase()}, and the Games remind you that every decision could be your last. The arena is both your battlefield and your prison.`,
                `As you ${action.toLowerCase()}, you sense the presence of other tributes nearby. The Hunger Games demand both courage and caution.`,
                `Your ${action.toLowerCase()} action reveals the true nature of the arena - beautiful yet deadly, promising yet perilous.`,
                `The arena responds to your ${action.toLowerCase()} with the cold indifference of the Games themselves. Survival here requires more than just skill.`,
                `You ${action.toLowerCase()}, and the Capitol's cameras capture every moment. In the Hunger Games, every action is a performance.`,
                `Your attempt to ${action.toLowerCase()} shows the harsh reality of the arena. Here, every choice could mean the difference between life and death.`
            ];
            
            const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            return res.json({ response: randomResponse });
        }
        
        const prompt = `You are narrating a Hunger Games interactive story. The player is in the arena and has typed: "${action}"

Player Stats:
- Name: ${playerStats.name}
- District: ${playerStats.district}
- Age: ${playerStats.age}
- Health: ${playerStats.health}
- Weapon: ${playerStats.weapon}
- Inventory: ${playerStats.inventory}
- Training Score: ${playerStats.trainingScore}
- Sponsor Points: ${playerStats.sponsorPoints} (hidden from player)

Story Context: ${storyContext}

Write a 2-3 sentence response describing what happens when the player tries this action. Make it immersive, dramatic, and appropriate for the Hunger Games setting. The response should be engaging and move the story forward.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150,
            temperature: 0.8
        });

        const response = completion.choices[0].message.content.trim();
        res.json({ response });

    } catch (error) {
        console.error('GPT API error:', error);
        res.status(500).json({ 
            error: 'Failed to generate response',
            fallback: "You attempt the action, but something unexpected happens in the arena."
        });
    }
});

// Leaderboard routes
app.post('/api/leaderboard', async (req, res) => {
    try {
        const { username, district, winType } = req.body;
        if (!username || !winType) {
            return res.status(400).json({ error: 'Username and win type are required' });
        }
        await leaderboardDB.submitWin(username, district, winType);
        res.json({ message: 'Win submitted to leaderboard' });
    } catch (error) {
        console.error('Submit leaderboard error:', error);
        res.status(500).json({ error: 'Failed to submit win' });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const top = await leaderboardDB.getTop(limit);
        res.json({ leaderboard: top });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
});

// Password reset endpoint (for debugging)
app.post('/api/admin/reset-password', async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        
        if (!username || !newPassword) {
            return res.status(400).json({ error: 'Username and new password are required' });
        }
        
        // Get user
        const user = await userDB.getUserByUsername(username);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        
        // Update password in database
        await new Promise((resolve, reject) => {
            const db = require('./database').db;
            db.run(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                [newPasswordHash, user.id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
        
        console.log(`Password reset for user '${username}'`);
        
        res.json({ 
            message: 'Password reset successfully',
            username: username
        });
        
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Admin route to check if user exists (for debugging)
app.get('/api/admin/check-user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await userDB.getUserByUsername(username);
        
        if (user) {
            res.json({ 
                exists: true, 
                id: user.id, 
                username: user.username,
                created_at: user.created_at 
            });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Check user error:', error);
        res.status(500).json({ error: 'Failed to check user' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the authentication page
app.get('/auth.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

// Serve story.json explicitly
app.get('/story.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'story.json'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
    console.log(`OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'}`);
});
