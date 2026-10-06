const sqlite3 = require('sqlite3').verbose();
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

// Create database connection
const db = new sqlite3.Database(dbPath);

// Initialize database tables
let initialized;
function initializeDatabase() {
    if (initialized) return initialized;
    initialized = new Promise((resolve, reject) => db.exec(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, email TEXT UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, last_login DATETIME);
        CREATE TABLE IF NOT EXISTS save_games (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), save_name TEXT NOT NULL, story_state TEXT NOT NULL, character_data TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, save_name));
        CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id), username TEXT, subject TEXT NOT NULL, message TEXT NOT NULL, rating INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, status TEXT DEFAULT 'pending');
        CREATE TABLE IF NOT EXISTS game_stats (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), save_id INTEGER NOT NULL REFERENCES save_games(id), actions_performed INTEGER DEFAULT 0, sponsor_points_earned INTEGER DEFAULT 0, training_score INTEGER DEFAULT 0, play_time_minutes INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        DELETE FROM game_stats WHERE id NOT IN (SELECT MAX(id) FROM game_stats GROUP BY user_id, save_id);
        CREATE UNIQUE INDEX IF NOT EXISTS game_stats_owner_save ON game_stats(user_id, save_id);
        CREATE TABLE IF NOT EXISTS leaderboard (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, district TEXT, win_type TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    `, err => err ? reject(err) : resolve()));
    return initialized;
}

// User management functions
const userDB = {
    createUser: (username, passwordHash, email = null) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
                [username, passwordHash, email],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, username });
                    }
                }
            );
        });
    },

    getUserByUsername: (username) => {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE username = ?',
                [username],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    },

    getUserById: (id) => {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT id, username, email, created_at, last_login FROM users WHERE id = ?',
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    },

    updateLastLogin: (userId) => {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                [userId],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }
};

// Save game management functions
const saveDB = {
    createSave: (userId, saveName, storyState, characterData) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO save_games (user_id, save_name, story_state, character_data) VALUES (?, ?, ?, ?)',
                [userId, saveName, JSON.stringify(storyState), JSON.stringify(characterData)],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, saveName });
                    }
                }
            );
        });
    },

    updateSave: (saveId, storyState, characterData, userId) => {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE save_games SET story_state = ?, character_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
                [JSON.stringify(storyState), JSON.stringify(characterData), saveId, userId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                }
            );
        });
    },

    getUserSaves: (userId) => {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT id, save_name, created_at, updated_at FROM save_games WHERE user_id = ? ORDER BY updated_at DESC',
                [userId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    },

    getSaveById: (saveId, userId) => {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM save_games WHERE id = ? AND user_id = ?',
                [saveId, userId],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (row) {
                            row.story_state = JSON.parse(row.story_state);
                            row.character_data = JSON.parse(row.character_data);
                        }
                        resolve(row);
                    }
                }
            );
        });
    },

    deleteSave: (saveId, userId) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM game_stats WHERE save_id = ? AND user_id = ?', [saveId, userId]);
            db.run(
                'DELETE FROM save_games WHERE id = ? AND user_id = ?',
                [saveId, userId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                }
            );
        });
    }
};

// Feedback management functions
const feedbackDB = {
    submitFeedback: (userId, username, subject, message, rating = null) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO feedback (user_id, username, subject, message, rating) VALUES (?, ?, ?, ?, ?)',
                [userId, username, subject, message, rating],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID });
                    }
                }
            );
        });
    },

    getFeedback: (limit = 50) => {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM feedback ORDER BY created_at DESC LIMIT ?',
                [limit],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    },

    updateFeedbackStatus: (feedbackId, status) => {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE feedback SET status = ? WHERE id = ?',
                [status, feedbackId],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }
};

// Game statistics functions
const statsDB = {
    updateGameStats: (userId, saveId, stats) => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO game_stats
                (user_id, save_id, actions_performed, sponsor_points_earned, training_score, play_time_minutes)
                VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(user_id, save_id) DO UPDATE SET actions_performed=excluded.actions_performed, sponsor_points_earned=excluded.sponsor_points_earned, training_score=excluded.training_score, play_time_minutes=excluded.play_time_minutes`,
                [userId, saveId, stats.actionsPerformed || 0, stats.sponsorPointsEarned || 0,
                 stats.trainingScore || 0, stats.playTimeMinutes || 0],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    },

    getUserStats: (userId) => {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM game_stats WHERE user_id = ? ORDER BY created_at DESC',
                [userId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }
};

// Leaderboard functions
const leaderboardDB = {
    submitWin: (username, district, winType) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO leaderboard (username, district, win_type) VALUES (?, ?, ?)',
                [username, district, winType],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID });
                    }
                }
            );
        });
    },
    getTop: (limit = 20) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT
                    username,
                    district,
                    COUNT(*) as wins,
                    MAX(created_at) as last_win,
                    GROUP_CONCAT(win_type) as win_types
                FROM leaderboard
                GROUP BY username, district
                ORDER BY wins DESC, last_win DESC
                LIMIT ?`,
                [limit],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }
};

module.exports = {
    db,
    initializeDatabase,
    userDB,
    saveDB,
    feedbackDB,
    statsDB,
    leaderboardDB
};
