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

// --- Development Helper: Auto-create 'Dev' user ---
async function ensureDevUserExists() {
    try {
        const devUser = await userDB.getUserByUsername('Dev');
        if (!devUser) {
            console.log('[Dev Helper] "Dev" user not found. Creating...');
            const passwordHash = await bcrypt.hash('IAmDev$$$123', 10);
            await userDB.createUser('Dev', passwordHash, 'dev@example.com');
            console.log('[Dev Helper] "Dev" user created successfully.');
        } else {
            console.log('[Dev Helper] "Dev" user already exists.');
        }
    } catch (error) {
        console.error('[Dev Helper] Error ensuring dev user exists:', error);
    }
}
// Call this after DB initialization
initializeDatabase().then(ensureDevUserExists);
// --- End Development Helper ---

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
            console.log(`[Login Auth] Failure: User '${username}' not found in database.`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`[Login Auth] Success: User '${username}' found. Hashed password from DB: ${user.password_hash}`);

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            console.log(`[Login Auth] Failure: Password validation failed for user '${username}'.`);
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
        console.log('[Server Debug] Free roam request received');
        console.log('[Server Debug] Request body:', req.body);
        
        const { action, playerStats, storyContext } = req.body;
        
        console.log(`Free roam action: ${action}`);
        console.log(`Player stats:`, playerStats);
        
        if (!openai) {
            console.log('[Server Debug] OpenAI not configured, using fallback responses');
            // Enhanced fallback responses when OpenAI is not configured
            const actionLower = action.toLowerCase();
            
            // Specific action-based responses
            if (actionLower.includes('kill') || actionLower.includes('die') || actionLower.includes('suicide')) {
                const deathResponses = [
                    "You stand motionless, accepting your fate. A tribute from District 2 spots you and approaches cautiously. They raise their weapon, and in that final moment, you feel a strange peace. The cannon fires, and your story ends here in the arena.",
                    "You make no attempt to defend yourself as footsteps approach. A Career tribute from District 1 finds you and, seeing your surrender, hesitates briefly before delivering the final blow. The Games claim another victim.",
                    "You close your eyes and wait. The sound of rustling leaves grows closer, and you feel the cold steel of a blade against your throat. Your last thought is of home as the cannon echoes through the arena."
                ];
                const randomResponse = deathResponses[Math.floor(Math.random() * deathResponses.length)];
                return res.json({ response: randomResponse });
            }
            
            if (actionLower.includes('search') || actionLower.includes('look') || actionLower.includes('explore')) {
                const searchResponses = [
                    "You carefully scan your surroundings, your eyes darting between the dense underbrush and the towering trees. In the distance, you spot what appears to be a small stream, and closer by, you notice some edible berries growing near a fallen log.",
                    "Your exploration reveals a hidden alcove beneath a massive oak tree. The ground here is softer, suggesting it might be a good place to rest. You also find some medicinal herbs that could be useful if you get injured.",
                    "As you search the area, you discover signs of other tributes - footprints in the mud, broken branches, and the remains of a small fire. Someone was here recently, and they might still be nearby."
                ];
                const randomResponse = searchResponses[Math.floor(Math.random() * searchResponses.length)];
                return res.json({ response: randomResponse });
            }
            
            if (actionLower.includes('hide') || actionLower.includes('sneak') || actionLower.includes('stealth')) {
                const stealthResponses = [
                    "You slip behind a thick cluster of bushes, your movements silent and deliberate. From your hiding spot, you can see two tributes arguing in the distance. They haven't noticed you, and you use this opportunity to observe their weapons and fighting styles.",
                    "You find a hollow in the base of a large tree and squeeze inside. The cramped space is uncomfortable, but it provides excellent cover. You can hear footsteps passing by, and you hold your breath until they fade away.",
                    "You blend into the shadows, using your training to move without making a sound. Your patience pays off as you spot a tribute from District 3 setting up some kind of electronic device. They're completely unaware of your presence."
                ];
                const randomResponse = stealthResponses[Math.floor(Math.random() * stealthResponses.length)];
                return res.json({ response: randomResponse });
            }
            
            if (actionLower.includes('attack') || actionLower.includes('fight') || actionLower.includes('kill')) {
                const combatResponses = [
                    "You charge forward, your weapon raised. The tribute you're targeting turns just in time to see you coming. They raise their own weapon in defense, and the clash of steel echoes through the arena. This fight will be brutal and decisive.",
                    "You launch your attack with precision, aiming for a vulnerable spot. Your opponent is skilled, though, and they dodge your strike. The battle becomes a deadly dance of attack and counter-attack.",
                    "You strike first, catching your enemy off guard. They stumble backward, but quickly recover and return your aggression. The fight is intense, and both of you know only one will walk away from this encounter."
                ];
                const randomResponse = combatResponses[Math.floor(Math.random() * combatResponses.length)];
                return res.json({ response: randomResponse });
            }
            
            if (actionLower.includes('eat') || actionLower.includes('food') || actionLower.includes('drink')) {
                const sustenanceResponses = [
                    "You carefully examine the berries before eating them, remembering your training. They're safe, and the sweet taste provides much-needed energy. You also find a small stream nearby and drink deeply, feeling your strength return.",
                    "You ration your supplies carefully, eating just enough to maintain your energy without wasting precious resources. The food is basic but sustaining, and you feel more alert after your meal.",
                    "You discover some edible roots and berries in the area. After a cautious taste test, you eat what you can safely identify. The natural food provides different nutrients than your supplies, and you feel healthier."
                ];
                const randomResponse = sustenanceResponses[Math.floor(Math.random() * sustenanceResponses.length)];
                return res.json({ response: randomResponse });
            }
            
            // Generic but more descriptive responses for other actions
            const enhancedFallbackResponses = [
                `You ${action.toLowerCase()}, and the arena's harsh reality becomes immediately apparent. The wind carries the distant sound of a cannon, reminding you that death is always close in the Hunger Games.`,
                `As you ${action.toLowerCase()}, you feel the weight of the Capitol's cameras following your every move. The arena's unpredictable terrain challenges your every step, and you must stay alert to survive.`,
                `Your attempt to ${action.toLowerCase()} reveals the true nature of the Games - beautiful yet deadly. The arena's natural beauty masks its lethal purpose, and every action could attract unwanted attention.`,
                `You ${action.toLowerCase()}, and the Games remind you that survival requires more than just physical strength. Your training, your wits, and your ability to adapt will determine your fate.`,
                `The arena responds to your ${action.toLowerCase()} with its characteristic indifference. Here, every choice has consequences, and the line between life and death is razor-thin.`
            ];
            
            const randomResponse = enhancedFallbackResponses[Math.floor(Math.random() * enhancedFallbackResponses.length)];
            console.log('[Server Debug] Using enhanced fallback response (no OpenAI):', randomResponse);
            return res.json({ response: randomResponse });
        }
        
        const prompt = `You are narrating a Hunger Games interactive story. The player is in the arena and has typed: "${action}"

Player Stats:
- Name: ${playerStats.name || 'Tribute'}
- District: ${playerStats.district || 'Unknown'}
- Age: ${playerStats.age || 0}
- Health: ${playerStats.health || 100}
- Weapon: ${playerStats.weapon || 'None'}
- Inventory: ${playerStats.inventory || 'Empty'}
- Training Score: ${playerStats.trainingScore || 0}
- Sponsor Points: ${playerStats.sponsorPoints || 0} (hidden from player)

Story Context: ${storyContext || 'You are in the Hunger Games arena. The Games have begun and you must survive. Other tributes are hunting you, and you need to find food, water, and shelter while avoiding danger.'}

Write a 2-3 sentence response describing what happens when the player tries this action. Make it immersive, dramatic, and appropriate for the Hunger Games setting. The response should be engaging and move the story forward. Keep it concise but impactful.`;

        console.log('Sending request to OpenAI...');
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150,
            temperature: 0.8
        });

        const response = completion.choices[0].message.content.trim();
        console.log('OpenAI response received:', response);
        res.json({ response });

    } catch (error) {
        console.error('GPT API error:', error);
        
        // Fallback response on error
        const fallbackResponse = `You ${action.toLowerCase()}, but something unexpected happens in the arena. The Games are full of surprises, and you must adapt quickly to survive.`;
        
        res.status(500).json({ 
            error: 'Failed to generate AI response',
            response: fallbackResponse
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

// Simple Dev user reset endpoint
app.post('/api/admin/reset-dev', async (req, res) => {
    try {
        console.log('Resetting Dev user...');
        
        // Check if Dev user exists
        let devUser = await userDB.getUserByUsername('Dev');
        
        if (devUser) {
            console.log('Dev user exists, updating password...');
            // Update password
            const newPasswordHash = await bcrypt.hash('IAmDev$$$123', 10);
            await new Promise((resolve, reject) => {
                const db = require('./database').db;
                db.run(
                    'UPDATE users SET password_hash = ? WHERE username = ?',
                    [newPasswordHash, 'Dev'],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        } else {
            console.log('Dev user does not exist, creating...');
            // Create new Dev user
            const passwordHash = await bcrypt.hash('IAmDev$$$123', 10);
            await userDB.createUser('Dev', passwordHash, 'dev@example.com');
        }
        
        console.log('Dev user reset successful');
        res.json({ 
            message: 'Dev user reset successfully',
            username: 'Dev',
            password: 'IAmDev$$$123'
        });
        
    } catch (error) {
        console.error('Dev user reset error:', error);
        res.status(500).json({ error: 'Failed to reset Dev user' });
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
    try {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(path.join(__dirname, 'public', 'story.json'), (err) => {
            if (err) {
                console.error('Error serving story.json:', err);
                res.status(404).json({ error: 'Story file not found' });
            }
        });
    } catch (error) {
        console.error('Error serving story.json:', error);
        res.status(500).json({ error: 'Failed to serve story file' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
    console.log(`OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'}`);
});
