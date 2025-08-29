import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'

// Initialize database
const dbPath = path.join(process.cwd(), 'database.sqlite')
const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Create tables
const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      profile_picture TEXT,
      credits INTEGER DEFAULT 0,
      email_verified BOOLEAN DEFAULT FALSE,
      verification_token TEXT,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Add is_admin column if it doesn't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE`)
  } catch (error) {
    // Column already exists, ignore error
  }

  // Songs table (from Genius API)
  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      genius_id INTEGER UNIQUE NOT NULL,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      genius_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      display_name TEXT NOT NULL,
      new_artist TEXT,
      member_thumbnail TEXT,
      status TEXT DEFAULT 'pending',
      total_credits INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (song_id) REFERENCES songs (id),
      UNIQUE(song_id) -- Prevent duplicate requests for same song
    )
  `)

  // Transactions table (PayPal payments)
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      credits INTEGER NOT NULL,
      paypal_transaction_id TEXT UNIQUE,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `)

  // Request boosts table (credits added to requests)
  db.exec(`
    CREATE TABLE IF NOT EXISTS request_boosts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      credits_amount INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES requests (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `)

  console.log('Database tables created successfully')
}

// Initialize database
createTables()

// User operations
export const userOperations = {
  create: async (username: string, email: string, password: string, verificationToken: string) => {
    const passwordHash = await bcrypt.hash(password, 12)
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash, verification_token)
      VALUES (?, ?, ?, ?)
    `)
    return stmt.run(username, email, passwordHash, verificationToken)
  },

  findByEmail: (email: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    return stmt.get(email)
  },

  findByUsername: (username: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?')
    return stmt.get(username)
  },

  findById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    return stmt.get(id)
  },

  findAll: () => {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC')
    return stmt.all()
  },

  verifyEmail: (token: string) => {
    const stmt = db.prepare(`
      UPDATE users 
      SET email_verified = TRUE, verification_token = NULL 
      WHERE verification_token = ?
    `)
    return stmt.run(token)
  },

  updateProfile: (id: number, username: string, profilePicture?: string) => {
    const stmt = db.prepare(`
      UPDATE users 
      SET username = ?, profile_picture = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `)
    return stmt.run(username, profilePicture, id)
  },

  addCredits: (userId: number, credits: number) => {
    const stmt = db.prepare(`
      UPDATE users 
      SET credits = credits + ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `)
    return stmt.run(credits, userId)
  },

  deductCredits: (userId: number, credits: number) => {
    const stmt = db.prepare(`
      UPDATE users 
      SET credits = credits - ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND credits >= ?
    `)
    return stmt.run(credits, userId, credits)
  }
}

// Song operations
export const songOperations = {
  create: (geniusId: number, title: string, artist: string, geniusUrl: string) => {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO songs (genius_id, title, artist, genius_url)
      VALUES (?, ?, ?, ?)
    `)
    return stmt.run(geniusId, title, artist, geniusUrl)
  },

  findByGeniusId: (geniusId: number) => {
    const stmt = db.prepare('SELECT * FROM songs WHERE genius_id = ?')
    return stmt.get(geniusId)
  },

  findById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM songs WHERE id = ?')
    return stmt.get(id)
  }
}

// Request operations
export const requestOperations = {
  create: (userId: number, songId: number, displayName: string, newArtist?: string, memberThumbnail?: string) => {
    const stmt = db.prepare(`
      INSERT INTO requests (user_id, song_id, display_name, new_artist, member_thumbnail)
      VALUES (?, ?, ?, ?, ?)
    `)
    return stmt.run(userId, songId, displayName, newArtist, memberThumbnail)
  },

  findBySongId: (songId: number) => {
    const stmt = db.prepare('SELECT * FROM requests WHERE song_id = ?')
    return stmt.get(songId)
  },

  findById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM requests WHERE id = ?')
    return stmt.get(id)
  },

  findAll: () => {
    const stmt = db.prepare(`
      SELECT r.*, u.username, u.profile_picture, s.title, s.artist, s.genius_url
      FROM requests r
      JOIN users u ON r.user_id = u.id
      JOIN songs s ON r.song_id = s.id
      ORDER BY r.total_credits DESC, r.created_at DESC
    `)
    return stmt.all()
  },

  findByUserId: (userId: number) => {
    const stmt = db.prepare(`
      SELECT r.*, s.title, s.artist, s.genius_url
      FROM requests r
      JOIN songs s ON r.song_id = s.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `)
    return stmt.all(userId)
  },

  updateStatus: (id: number, status: string) => {
    const stmt = db.prepare(`
      UPDATE requests 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `)
    return stmt.run(status, id)
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM requests WHERE id = ?')
    return stmt.run(id)
  },

  addBoost: (requestId: number, userId: number, creditsAmount: number) => {
    const boostStmt = db.prepare(`
      INSERT INTO request_boosts (request_id, user_id, credits_amount)
      VALUES (?, ?, ?)
    `)
    
    const updateStmt = db.prepare(`
      UPDATE requests 
      SET total_credits = total_credits + ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    const transaction = db.transaction(() => {
      boostStmt.run(requestId, userId, creditsAmount)
      updateStmt.run(creditsAmount, requestId)
    })

    return transaction()
  },

  getBoosts: (requestId: number) => {
    const stmt = db.prepare(`
      SELECT rb.*, u.username, u.profile_picture
      FROM request_boosts rb
      JOIN users u ON rb.user_id = u.id
      WHERE rb.request_id = ?
      ORDER BY rb.created_at DESC
    `)
    return stmt.all(requestId)
  }
}

// Transaction operations
export const transactionOperations = {
  create: (userId: number, amount: number, credits: number, paypalTransactionId?: string) => {
    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, amount, credits, paypal_transaction_id)
      VALUES (?, ?, ?, ?)
    `)
    return stmt.run(userId, amount, credits, paypalTransactionId)
  },

  findAll: () => {
    const stmt = db.prepare(`
      SELECT t.*, u.username
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `)
    return stmt.all()
  },

  updateStatus: (id: number, status: string) => {
    const stmt = db.prepare(`
      UPDATE transactions 
      SET status = ? 
      WHERE id = ?
    `)
    return stmt.run(status, id)
  },

  findByPaypalId: (paypalTransactionId: string) => {
    const stmt = db.prepare('SELECT * FROM transactions WHERE paypal_transaction_id = ?')
    return stmt.get(paypalTransactionId)
  }
}

export default db
