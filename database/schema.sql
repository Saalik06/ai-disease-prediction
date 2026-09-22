-- =================================================================
-- AI Disease Prediction System - Database Schema
-- Compatible with SQLite, PostgreSQL, and MySQL
-- =================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    phone VARCHAR(32),
    age INTEGER CHECK (age > 0 AND age < 130),
    gender VARCHAR(24),
    role VARCHAR(20) DEFAULT 'patient', -- 'patient' or 'admin'
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. DISEASES TABLE
CREATE TABLE IF NOT EXISTS diseases (
    disease_id VARCHAR(64) PRIMARY KEY,
    disease_name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    symptoms TEXT NOT NULL, -- JSON array string of symptoms
    precautions TEXT NOT NULL, -- JSON array string of precautions
    when_to_seek_doctor TEXT,
    risk_level VARCHAR(20) DEFAULT 'moderate', -- 'low', 'moderate', 'high', 'critical'
    category VARCHAR(64) DEFAULT 'General'
);

-- 3. SYMPTOMS TABLE
CREATE TABLE IF NOT EXISTS symptoms (
    symptom_id VARCHAR(64) PRIMARY KEY,
    symptom_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(64) NOT NULL,
    description TEXT
);

-- 4. PREDICTIONS TABLE
CREATE TABLE IF NOT EXISTS predictions (
    prediction_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(120),
    user_email VARCHAR(160),
    symptoms TEXT NOT NULL, -- JSON array string of entered symptoms
    predicted_disease VARCHAR(120) NOT NULL,
    confidence REAL NOT NULL, -- Machine learning probability score (0.0 to 100.0)
    prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disease_description TEXT,
    precautions TEXT, -- JSON array string
    recommended_next_step TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. ADMIN CREDENTIALS TABLE
CREATE TABLE IF NOT EXISTS admins (
    admin_id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Indexing for high-performance querying
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_date ON predictions(prediction_date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
