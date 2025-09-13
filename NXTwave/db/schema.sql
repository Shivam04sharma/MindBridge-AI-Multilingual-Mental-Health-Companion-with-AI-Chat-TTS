-- MindBridge AI Database Schema

-- Users table (simplified for prototype - single user)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preferred_language TEXT DEFAULT 'en'
);

-- Daily check-ins table
CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
    note TEXT,
    language TEXT DEFAULT 'en',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ai_response TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    response TEXT,
    language TEXT DEFAULT 'en',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    crisis_detected BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default user for prototype
INSERT OR IGNORE INTO users (id, username, email, preferred_language) 
VALUES (1, 'demo_user', 'demo@mindbridge.ai', 'en');