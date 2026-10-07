const path = require('path');
const fs = require('fs');

// Database path logic
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
const persistentDataDir = '/data';
const dbName = 'game.db';
let dbPath;

if (process.env.DB_FILE) {
    dbPath = process.env.DB_FILE;
} else if (isProduction && fs.existsSync(persistentDataDir)) {
    // On Render or production, use the persistent disk if it exists
    dbPath = path.join(persistentDataDir, dbName);
} else {
    // In development or if /data is not available, use a local file
    dbPath = path.join(__dirname, dbName);
}

console.log(`[DB] Production mode: ${isProduction}`);
console.log(`[DB] Using SQLite DB at: ${dbPath}`);

// Node ships SQLite with its runtime, avoiding external Linux binary dependencies.
const { DatabaseSync } = require('node:sqlite');
fs.mkdirSync(path.dirname(dbPath),{recursive:true});
const db = new DatabaseSync(dbPath);

let initialized;
function initializeDatabase() {
    if (!initialized) initialized=Promise.resolve().then(()=>db.exec(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, email TEXT UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, last_login DATETIME);
        CREATE TABLE IF NOT EXISTS save_games (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), save_name TEXT NOT NULL, story_state TEXT NOT NULL, character_data TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, save_name));
        CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id), username TEXT, subject TEXT NOT NULL, message TEXT NOT NULL, rating INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, status TEXT DEFAULT 'pending');
        CREATE TABLE IF NOT EXISTS game_stats (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), save_id INTEGER NOT NULL REFERENCES save_games(id), actions_performed INTEGER DEFAULT 0, sponsor_points_earned INTEGER DEFAULT 0, training_score INTEGER DEFAULT 0, play_time_minutes INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        DELETE FROM game_stats WHERE id NOT IN (SELECT MAX(id) FROM game_stats GROUP BY user_id, save_id);
        CREATE UNIQUE INDEX IF NOT EXISTS game_stats_owner_save ON game_stats(user_id, save_id);
        CREATE TABLE IF NOT EXISTS leaderboard (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, district TEXT, win_type TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    `));
    return initialized;
}
const run=(sql,params=[])=>db.prepare(sql).run(...params);
const get=(sql,params=[])=>db.prepare(sql).get(...params);
const all=(sql,params=[])=>db.prepare(sql).all(...params);

const userDB={
    async createUser(username,passwordHash,email=null){
        const result=run('INSERT INTO users (username,password_hash,email) VALUES (?,?,?)',[username,passwordHash,email]);
        return {id:Number(result.lastInsertRowid),username};
    },
    async getUserByUsername(username){return get('SELECT * FROM users WHERE username = ?',[username]);},
    async getUserById(id){return get('SELECT id,username,email,created_at,last_login FROM users WHERE id = ?',[id]);},
    async updateLastLogin(id){run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',[id]);}
};
const saveDB={
    async createSave(userId,saveName,storyState,characterData){
        const result=run('INSERT INTO save_games (user_id,save_name,story_state,character_data) VALUES (?,?,?,?)',[userId,saveName,JSON.stringify(storyState),JSON.stringify(characterData)]);
        return {id:Number(result.lastInsertRowid),saveName};
    },
    async updateSave(saveId,storyState,characterData,userId){
        return Number(run('UPDATE save_games SET story_state = ?,character_data = ?,updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',[JSON.stringify(storyState),JSON.stringify(characterData),saveId,userId]).changes);
    },
    async getUserSaves(userId){return all('SELECT id,save_name,created_at,updated_at FROM save_games WHERE user_id = ? ORDER BY updated_at DESC',[userId]);},
    async getSaveById(saveId,userId){
        const row=get('SELECT * FROM save_games WHERE id = ? AND user_id = ?',[saveId,userId]);
        if(row){row.story_state=JSON.parse(row.story_state);row.character_data=JSON.parse(row.character_data);}
        return row;
    },
    async deleteSave(saveId,userId){
        db.exec('BEGIN IMMEDIATE');
        try{
            run('DELETE FROM game_stats WHERE save_id = ? AND user_id = ?',[saveId,userId]);
            const result=run('DELETE FROM save_games WHERE id = ? AND user_id = ?',[saveId,userId]);
            db.exec('COMMIT');return Number(result.changes);
        }catch(error){db.exec('ROLLBACK');throw error;}
    }
};
const feedbackDB={
    async submitFeedback(userId,username,subject,message,rating=null){
        const result=run('INSERT INTO feedback (user_id,username,subject,message,rating) VALUES (?,?,?,?,?)',[userId,username,subject,message,rating]);
        return {id:Number(result.lastInsertRowid)};
    },
    async getFeedback(limit=50){return all('SELECT * FROM feedback ORDER BY created_at DESC LIMIT ?',[limit]);},
    async updateFeedbackStatus(id,status){run('UPDATE feedback SET status = ? WHERE id = ?',[status,id]);}
};
const statsDB={
    async updateGameStats(userId,saveId,stats){
        run(`INSERT INTO game_stats (user_id,save_id,actions_performed,sponsor_points_earned,training_score,play_time_minutes)
        VALUES (?,?,?,?,?,?) ON CONFLICT(user_id,save_id) DO UPDATE SET actions_performed=excluded.actions_performed,sponsor_points_earned=excluded.sponsor_points_earned,training_score=excluded.training_score,play_time_minutes=excluded.play_time_minutes`,
        [userId,saveId,stats.actionsPerformed || 0,stats.sponsorPointsEarned || 0,stats.trainingScore || 0,stats.playTimeMinutes || 0]);
    },
    async getUserStats(userId){return all('SELECT * FROM game_stats WHERE user_id = ? ORDER BY created_at DESC',[userId]);}
};
const leaderboardDB={
    async submitWin(username,district,winType){
        const result=run('INSERT INTO leaderboard (username,district,win_type) VALUES (?,?,?)',[username,district,winType]);
        return {id:Number(result.lastInsertRowid)};
    },
    async getTop(limit=20){return all(`SELECT username,district,COUNT(*) as wins,MAX(created_at) as last_win,GROUP_CONCAT(win_type) as win_types FROM leaderboard GROUP BY username,district ORDER BY wins DESC,last_win DESC LIMIT ?`,[limit]);}
};
module.exports={db,initializeDatabase,userDB,saveDB,feedbackDB,statsDB,leaderboardDB};
