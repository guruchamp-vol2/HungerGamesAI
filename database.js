const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'game.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
                reject(err);
                return;
            }
            console.log('Users table created/verified');
        });

        // Save games table
        db.run(`CREATE TABLE IF NOT EXISTS save_games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            save_name TEXT NOT NULL,
            story_state TEXT NOT NULL,
            character_data TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, save_name)
        )`, (err) => {
            if (err) {
                console.error('Error creating save_games table:', err);
                reject(err);
                return;
            }
            console.log('Save games table created/verified');
        });

        // Feedback table
        db.run(`CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            rating INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`, (err) => {
            if (err) {
                console.error('Error creating feedback table:', err);
                reject(err);
                return;
            }
            console.log('Feedback table created/verified');
        });

        // Game statistics table
        db.run(`CREATE TABLE IF NOT EXISTS game_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            save_id INTEGER NOT NULL,
            actions_performed INTEGER DEFAULT 0,
            sponsor_points_earned INTEGER DEFAULT 0,
            training_score INTEGER DEFAULT 0,
            play_time_minutes INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (save_id) REFERENCES save_games (id)
        )`, (err) => {
            if (err) {
                console.error('Error creating game_stats table:', err);
                reject(err);
                return;
            }
            console.log('Game stats table created/verified');
            resolve();
        });

        // Leaderboard table
        db.run(`CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            district TEXT,
            win_type TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating leaderboard table:', err);
                reject(err);
                return;
            }
            console.log('Leaderboard table created/verified');
            resolve();
        });
    });
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

    updateSave: (saveId, storyState, characterData) => {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE save_games SET story_state = ?, character_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [JSON.stringify(storyState), JSON.stringify(characterData), saveId],
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
            db.run(
                'DELETE FROM save_games WHERE id = ? AND user_id = ?',
                [saveId, userId],
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
                `INSERT OR REPLACE INTO game_stats 
                (user_id, save_id, actions_performed, sponsor_points_earned, training_score, play_time_minutes) 
                VALUES (?, ?, ?, ?, ?, ?)`,
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