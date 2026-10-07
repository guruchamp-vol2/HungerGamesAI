const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const { initializeDatabase, userDB, saveDB, feedbackDB, statsDB, leaderboardDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// JWT secret (in production, use a strong secret from environment variables)
const secretFile = path.join(path.dirname(process.env.DB_FILE || path.join(__dirname, 'game.db')), '.jwt-secret');
fs.mkdirSync(path.dirname(secretFile),{recursive:true});
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    try { JWT_SECRET = fs.readFileSync(secretFile, 'utf8').trim(); } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        JWT_SECRET = crypto.randomBytes(48).toString('hex');
        fs.writeFileSync(secretFile, JWT_SECRET, { mode: 0o600, flag: 'wx' });
    }
}

// Middleware
app.use(cors());
app.disable('x-powered-by');
app.use(express.json({ limit: '512kb' }));
app.use((req,res,next) => { res.setHeader('X-Content-Type-Options','nosniff'); next(); });
app.use(express.static(path.join(__dirname, 'public'),{
    setHeaders(res,file){
        if(/\.(?:html|js|json)$/.test(file))res.setHeader('Cache-Control','no-store');
    }
}));

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

const ready = initializeDatabase();
app.use((req, res, next) => ready.then(() => next()).catch(next));
const requests = new Map();
app.use('/api', (req,res,next) => {
    if (req.method === 'GET') return next();
    const key = req.ip;
    const now = Date.now();
    const entry = requests.get(key);
    if (!entry || now-entry.time > 60000) { if (requests.size > 5000) requests.clear(); requests.set(key,{time:now,count:1}); }
    else if (++entry.count > 100) return res.status(429).json({error:'Too many requests. Try again in a minute.'});
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({error:'A JSON object is required.'});
    next();
});
const text = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const validSave = body => {try {const state=JSON.parse(body.storyState);return typeof body.storyState==='string' && body.storyState.length<=400000 && state && typeof state==='object' && !Array.isArray(state) && body.characterData && typeof body.characterData==='object' && !Array.isArray(body.characterData);}catch{return false;}};
const {createDirector}=require('./ai-director');
const director=require('./public/director');
const arenaDirector=createDirector();

// Email configuration
let emailTransporter = null;
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    console.log('Email notifications configured successfully');
} else {
    console.log('Email configuration not found - feedback notifications will be disabled');
}

// Email notification function
async function sendFeedbackNotification(feedback) {
    if (!emailTransporter || !process.env.ADMIN_EMAIL) {
        console.log('Email notification skipped - email not configured or admin email not set');
        return;
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `New Feedback: ${feedback.subject}`,
            text: `From: ${feedback.username || 'Anonymous'}\nSubject: ${feedback.subject}\nRating: ${feedback.rating || 'Not provided'}\n\n${feedback.message}`
        };

        await emailTransporter.sendMail(mailOptions);
        console.log(`Feedback notification sent to ${process.env.ADMIN_EMAIL}`);
    } catch (error) {
        console.error('Failed to send feedback notification:', error);
    }
}

// Authentication routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!text(username, 32) || !text(password, 128) || Buffer.byteLength(password,'utf8')>72) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        if (email != null && email !== '' && (!text(email,254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return res.status(400).json({error:'Invalid email'});
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
        const user = await userDB.createUser(username, passwordHash, email || null);

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

        if (!text(username, 32) || !text(password, 128) || Buffer.byteLength(password,'utf8')>72) {
            return res.status(400).json({ error: 'Username and password are required' });
        }


        // Get user
        const user = await userDB.getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }


        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await userDB.updateLastLogin(user.id);

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });


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

        if (!text(saveName,80) || !validSave(req.body)) {
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

        if (!validSave(req.body)) {
            return res.status(400).json({ error: 'Story state and character data are required' });
        }

        const changed = await saveDB.updateSave(req.params.saveId, storyState, characterData, req.user.userId);
        if (!changed) return res.status(404).json({error:'Save not found'});
        res.json({ message: 'Save updated successfully' });
    } catch (error) {
        console.error('Update save error:', error);
        res.status(500).json({ error: 'Failed to update save' });
    }
});

app.delete('/api/saves/:saveId', authenticateToken, async (req, res) => {
    try {
        const changed = await saveDB.deleteSave(req.params.saveId, req.user.userId);
        if (!changed) return res.status(404).json({error:'Save not found'});
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

        if (!text(subject,120) || !text(message,4000) || (username != null && !text(username,32)) || (rating != null && (!Number.isInteger(Number(rating)) || Number(rating)<1 || Number(rating)>5))) {
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
        
        // Send email notification
        await sendFeedbackNotification({...feedback,subject,message,rating,username,user_id:userId,created_at:new Date().toISOString()});
        
        res.json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

app.get('/api/feedback', (_req,res) => res.status(404).json({error:'Feedback is private.'}));

// Game statistics routes
app.post('/api/stats', authenticateToken, async (req, res) => {
    try {
        const { saveId, stats } = req.body;

        if (!saveId || !stats) {
            return res.status(400).json({ error: 'Save ID and stats are required' });
        }

        if (!(await saveDB.getSaveById(saveId, req.user.userId))) return res.status(404).json({error:'Save not found'});
        if (typeof stats !== 'object' || ['actionsPerformed','sponsorPointsEarned','trainingScore','playTimeMinutes'].some(key => stats[key] != null && (!Number.isFinite(stats[key]) || stats[key]<0 || stats[key]>1000000))) return res.status(400).json({error:'Invalid stats'});
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

// Narration describes resolved actions; it never edits gameplay state.
app.get('/api/ai/status', (_req,res)=>res.json(arenaDirector.status()));
app.get('/api/version', (_req,res)=>res.json({version:'arena-ai-4',commit:process.env.RENDER_GIT_COMMIT || null}));
function aiIdentity(req){
    if(!arenaDirector.status().available || req.body.mode==='local')return 'local';
    try{return jwt.verify((req.headers.authorization || '').replace(/^Bearer /,''),JWT_SECRET).userId;}
    catch{return null;}
}
app.post('/api/free-roam',async(req,res)=>{
    const payload=req.body;
    if(!text(payload.action,500))return res.status(400).json({error:'A valid action is required.'});
    // Old clients may send only character statistics. Never invent mechanical outcomes.
    if(!payload.state){
        if(!payload.playerStats || typeof payload.playerStats!=='object' || Array.isArray(payload.playerStats))return res.status(400).json({error:'Arena state is required.'});
        return res.json({response:payload.playerStats.health===0?'Your tribute has no health remaining. This run has ended.':'Reload the game to use the current arena director.',suggestions:[],source:'local',reason:'legacy_client'});
    }
    try{
        director.context(payload);
        const user=aiIdentity(req);if(user===null)return res.status(401).json({error:'Sign in to use AI narration, or select local narration.'});
        res.json(await arenaDirector.narrate(payload,user));
    }catch{return res.status(400).json({error:'Invalid arena context.'});}
});
app.post('/api/ai/intent',async(req,res)=>{
    if(!text(req.body.action,500))return res.status(400).json({error:'Describe an action in at most 500 characters.'});
    try{
        director.context(req.body);
        const user=aiIdentity(req);if(user===null)return res.status(401).json({error:'Sign in to interpret an action with AI.'});
        res.json(await arenaDirector.interpret(req.body,user));
    }catch{return res.status(400).json({error:'Invalid arena context.'});}
});

// Leaderboard routes
app.post('/api/leaderboard', authenticateToken, async (req, res) => {
    try {
        const {district, winType} = req.body;
        const username = req.user.username;
        if (!text(district,32) || !['Hunger Games Champion','Cheat Win'].includes(winType)) return res.status(400).json({error:'Invalid result'});
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
        const limit = Math.max(1,Math.min(100,parseInt(req.query.limit) || 20));
        const top = await leaderboardDB.getTop(limit);
        res.json({ leaderboard: top });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
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

app.get('/health', (_req,res) => res.json({status:'ok'}));
app.use((err,req,res,next) => {
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({error:err.status === 400 ? 'Invalid JSON' : err.status === 413 ? 'Request too large' : 'Request failed'});
});
module.exports = {app, ready};
if (require.main === module) ready.then(() => app.listen(PORT, () => console.log(`Server running on ${PORT} · Arena AI 4`))).catch(error => {console.error('Database initialization failed:',error.message);process.exitCode=1;});
