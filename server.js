import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./leaderboard.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    accuracy REAL DEFAULT 0,
    last_played TEXT,
    created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    created_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// Helper function to calculate accuracy
const calculateAccuracy = (correctAnswers, totalQuestions) => {
  return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
};

// API Routes

// Create or get user
app.post('/api/users', (req, res) => {
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  const trimmedName = name.trim();
  
  // Check if user already exists
  db.get('SELECT * FROM users WHERE LOWER(name) = LOWER(?)', [trimmedName], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (row) {
      // User exists, return existing user
      return res.json({
        id: row.id,
        name: row.name,
        xp: row.xp,
        totalQuestions: row.total_questions,
        correctAnswers: row.correct_answers,
        accuracy: row.accuracy,
        lastPlayed: row.last_played,
        createdAt: row.created_at
      });
    }
    
    // Create new user
    const userId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const now = new Date().toISOString();
    
    db.run(
      'INSERT INTO users (id, name, xp, total_questions, correct_answers, accuracy, last_played, created_at) VALUES (?, ?, 0, 0, 0, 0, ?, ?)',
      [userId, trimmedName, now, now],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create user' });
        }
        
        res.json({
          id: userId,
          name: trimmedName,
          xp: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          accuracy: 0,
          lastPlayed: now,
          createdAt: now
        });
      }
    );
  });
});

// Get current user by ID
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: row.id,
      name: row.name,
      xp: row.xp,
      totalQuestions: row.total_questions,
      correctAnswers: row.correct_answers,
      accuracy: row.accuracy,
      lastPlayed: row.last_played,
      createdAt: row.created_at
    });
  });
});

// Update user stats
app.put('/api/users/:id/stats', (req, res) => {
  const { id } = req.params;
  const { correct, xpGained } = req.body;
  
  if (typeof correct !== 'boolean' || typeof xpGained !== 'number') {
    return res.status(400).json({ error: 'Invalid data provided' });
  }
  
  // Get current user data
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update stats
    const newTotalQuestions = row.total_questions + 1;
    const newCorrectAnswers = row.correct_answers + (correct ? 1 : 0);
    const newXp = row.xp + xpGained;
    const newAccuracy = calculateAccuracy(newCorrectAnswers, newTotalQuestions);
    const now = new Date().toISOString();
    
    db.run(
      'UPDATE users SET total_questions = ?, correct_answers = ?, xp = ?, accuracy = ?, last_played = ? WHERE id = ?',
      [newTotalQuestions, newCorrectAnswers, newXp, newAccuracy, now, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update user stats' });
        }
        
        res.json({
          id: row.id,
          name: row.name,
          xp: newXp,
          totalQuestions: newTotalQuestions,
          correctAnswers: newCorrectAnswers,
          accuracy: newAccuracy,
          lastPlayed: now,
          createdAt: row.created_at
        });
      }
    );
  });
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  db.all(
    'SELECT id, name, xp, accuracy, total_questions FROM users ORDER BY xp DESC, accuracy DESC LIMIT ?',
    [limit],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const leaderboard = rows.map((row, index) => ({
        id: row.id,
        name: row.name,
        xp: row.xp,
        accuracy: row.accuracy,
        totalQuestions: row.total_questions,
        rank: index + 1
      }));
      
      res.json(leaderboard);
    }
  );
});

// Get user rank
app.get('/api/users/:id/rank', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT COUNT(*) as rank FROM users WHERE xp > (SELECT xp FROM users WHERE id = ?) OR (xp = (SELECT xp FROM users WHERE id = ?) AND accuracy > (SELECT accuracy FROM users WHERE id = ?))', 
    [id, id, id], 
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ rank: row.rank + 1 });
    }
  );
});

// Reset user data
app.put('/api/users/:id/reset', (req, res) => {
  const { id } = req.params;
  const now = new Date().toISOString();
  
  db.run(
    'UPDATE users SET xp = 0, total_questions = 0, correct_answers = 0, accuracy = 0, last_played = ? WHERE id = ?',
    [now, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to reset user data' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'User data reset successfully' });
    }
  );
});

// Get all users count
app.get('/api/users/count', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ count: row.count });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
