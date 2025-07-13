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
            const actionLower = action.toLowerCase();
            // Helper: random int
            function randInt(max) { return Math.floor(Math.random() * max); }
            // Helper: lose health
            function loseHealth(amount) {
                if (playerStats && typeof playerStats.health === 'number') {
                    playerStats.health = Math.max(0, playerStats.health - amount);
                }
            }
            // Helper: enemy encounter
            function enemyAttack() {
                loseHealth(20 + randInt(20));
                return `Suddenly, a tribute leaps from the shadows and attacks! You fight desperately, taking some hits before you manage to escape. Your health is now ${playerStats.health}. The Games just got more dangerous.`;
            }
            // Water actions
            if (actionLower.includes('water') || actionLower.includes('river') || actionLower.includes('stream') || actionLower.includes('lake')) {
                if (randInt(4) === 0) {
                    loseHealth(10);
                    return res.json({ response: `You drink from the water, but something tastes off. You feel sick and lose some health. Your health is now ${playerStats.health}.` });
                }
                if (randInt(4) === 0) {
                    return res.json({ response: enemyAttack() });
                }
                const waterResponses = [
                    `Running to the water is a smart choice - hydration is crucial for survival. You sprint toward the sound of flowing water, your heart pounding with urgency. As you reach the stream, you quickly scan the area for other tributes before kneeling down to drink. The cool water refreshes you, but you know you can't stay here long - water sources are prime hunting grounds.`,
                    `The water calls to you like a siren's song in this deadly arena. You make your way toward the river, moving carefully to avoid detection. The water is clear and inviting, and you drink deeply, feeling your strength return. However, you spot footprints in the mud nearby - someone else has been here recently.`,
                    `Heading toward water is always a good strategic move. You navigate through the underbrush toward the sound of running water. The stream you find is small but clean, and you drink your fill while keeping watch. The water source could be valuable, but it also makes you a target - you'll need to move on soon.`
                ];
                const randomResponse = waterResponses[randInt(waterResponses.length)];
                return res.json({ response: randomResponse });
            }
            // Run actions
            if (actionLower.includes('run') || actionLower.includes('sprint') || actionLower.includes('dash')) {
                if (randInt(4) === 0) {
                    return res.json({ response: enemyAttack() });
                }
                if (randInt(4) === 0) {
                    loseHealth(10);
                    return res.json({ response: `You run too fast and trip over a root, scraping your knee. You lose some health. Your health is now ${playerStats.health}.` });
                }
                const runResponses = [
                    `Running is a good way to cover ground quickly, but it also makes you a target. You sprint through the arena, your feet pounding against the earth. The movement feels good, but you know the sound could attract other tributes. You'll need to find cover soon.`,
                    `You break into a run, putting distance between yourself and potential threats. The wind rushes past your face as you move, and you feel a surge of adrenaline. Running gives you speed, but it also burns energy you might need later. You'll have to be strategic about when to use this advantage.`,
                    `Running through the arena is both exhilarating and dangerous. You pick up speed, your training helping you navigate the terrain efficiently. The movement helps you scout the area quickly, but you're also making noise that could draw attention. You'll need to balance speed with stealth.`
                ];
                const randomResponse = runResponses[randInt(runResponses.length)];
                return res.json({ response: randomResponse });
            }
            // Jump/Climb actions
            if (actionLower.includes('jump') || actionLower.includes('leap') || actionLower.includes('climb')) {
                if (randInt(4) === 0) {
                    loseHealth(15);
                    return res.json({ response: `You misjudge your jump and fall, injuring yourself. You lose some health. Your health is now ${playerStats.health}.` });
                }
                if (randInt(4) === 0) {
                    return res.json({ response: enemyAttack() });
                }
                const jumpResponses = [
                    `Jumping can help you overcome obstacles and reach higher ground - a smart tactical choice. You leap over a fallen log, your muscles working efficiently. The movement gives you a better view of the surrounding area, and you spot a potential shelter in the distance. Height advantage could be crucial in the arena.`,
                    `You jump to clear an obstacle, your training paying off as you land gracefully. The movement helps you assess your surroundings from a different angle, and you notice some useful terrain features. Jumping burns energy, but the tactical advantage might be worth it.`,
                    `A well-timed jump can mean the difference between life and death in the arena. You leap over a small stream, using the momentum to carry you forward. The movement helps you avoid getting wet, which could slow you down. You'll need to conserve your energy for more critical moments.`
                ];
                const randomResponse = jumpResponses[randInt(jumpResponses.length)];
                return res.json({ response: randomResponse });
            }
            // Walk/Move actions
            if (actionLower.includes('walk') || actionLower.includes('move') || actionLower.includes('go')) {
                if (randInt(5) === 0) {
                    return res.json({ response: enemyAttack() });
                }
                const walkResponses = [
                    `Moving carefully through the arena is always a good strategy. You walk with purpose, your senses alert for any signs of danger. The steady pace conserves your energy while allowing you to observe your surroundings. Every step could lead to opportunity or threat.`,
                    `You move forward cautiously, your training helping you navigate the terrain efficiently. Walking allows you to scout the area without drawing too much attention. You notice subtle signs of other tributes - broken branches, disturbed earth - and adjust your path accordingly.`,
                    `Walking through the arena gives you time to think and plan. You move deliberately, using the opportunity to assess your situation. The slower pace helps you spot resources and avoid hazards, but it also makes you vulnerable to faster-moving threats.`
                ];
                const randomResponse = walkResponses[randInt(walkResponses.length)];
                return res.json({ response: randomResponse });
            }
            // Rest actions
            if (actionLower.includes('rest') || actionLower.includes('sleep') || actionLower.includes('sit')) {
                if (randInt(3) === 0) {
                    return res.json({ response: enemyAttack() });
                }
                if (randInt(4) === 0) {
                    loseHealth(10);
                    return res.json({ response: `You try to rest, but are startled awake by a noise. You scramble to your feet, heart pounding, and realize you scraped yourself on a sharp rock. Your health is now ${playerStats.health}.` });
                }
                const restResponses = [
                    `Rest is essential for survival, but choosing when and where is critical. You find a relatively safe spot and settle in, keeping your weapon close at hand. The brief rest helps restore your energy, but you remain alert for any approaching threats. You can't afford to let your guard down completely.`,
                    `Taking a moment to rest is smart - exhaustion can be as deadly as any weapon. You sit down carefully, choosing a position that gives you a good view of your surroundings. The rest helps clear your mind and restore some strength, but you know you can't stay here long.`,
                    `Resting in the arena is a calculated risk. You find a sheltered spot and take a moment to recover, your senses still sharp. The brief pause helps you assess your situation and plan your next move. Rest is necessary, but so is staying vigilant.`
                ];
                const randomResponse = restResponses[randInt(restResponses.length)];
                return res.json({ response: randomResponse });
            }
            // Build/Craft actions
            if (actionLower.includes('build') || actionLower.includes('make') || actionLower.includes('create')) {
                if (randInt(4) === 0) {
                    return res.json({ response: enemyAttack() });
                }
                const buildResponses = [
                    `Using your skills to create something useful is excellent strategy. You work quickly, using available materials to construct a simple shelter or tool. The effort pays off as you create something that could help you survive longer. Crafting shows resourcefulness that sponsors might notice.`,
                    `Building something in the arena demonstrates both skill and patience. You carefully assemble materials, creating something that could give you an advantage. The process requires focus, but the result could be crucial for your survival. Your training is paying off.`,
                    `Creating something useful shows real survival instincts. You work methodically, turning available resources into something valuable. The effort might attract attention, but the benefits could outweigh the risks. Your ingenuity could be your greatest weapon.`
                ];
                const randomResponse = buildResponses[randInt(buildResponses.length)];
                return res.json({ response: randomResponse });
            }
            // Generic but more action-aware responses for other actions
            const enhancedFallbackResponses = [
                `"${action}" - that's an interesting choice. You ${action.toLowerCase()}, and immediately the arena responds to your decision. The action feels purposeful, and you sense that every choice you make is being watched by both the Capitol and your fellow tributes. Your training kicks in, helping you execute the action effectively.`,
                `You decide to ${action.toLowerCase()}, and the arena's atmosphere shifts around you. The action feels right in this moment, and you can sense the weight of your decisions. Every movement in the Games has consequences, and you're learning to read the arena's subtle signals.`,
                `"${action}" - a strategic move. You ${action.toLowerCase()}, and the arena seems to acknowledge your choice. The action helps you better understand your environment and your place within it. You're adapting to the Games, learning to make decisions that could mean the difference between life and death.`,
                `You choose to ${action.toLowerCase()}, and the arena responds to your initiative. The action feels natural, as if you're finally finding your rhythm in this deadly game. Every choice is a step toward survival, and you're learning to trust your instincts.`,
                `"${action}" - good thinking. You ${action.toLowerCase()}, and the arena's dynamics shift slightly. The action helps you better position yourself for whatever comes next. You're learning that in the Games, every action is both a risk and an opportunity.`
            ];
            const randomResponse = enhancedFallbackResponses[randInt(enhancedFallbackResponses.length)];
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
