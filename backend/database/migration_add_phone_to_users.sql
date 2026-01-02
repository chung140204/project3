-- Migration: Add phone column to users table
-- This migration adds the phone column if it doesn't exist

-- Check if phone column exists, if not add it
-- Note: MySQL doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- So we'll use a stored procedure or just run ALTER TABLE directly
-- If column already exists, it will throw an error which we can ignore

ALTER TABLE users 
ADD COLUMN phone VARCHAR(20) NULL 
AFTER password_hash 
COMMENT 'User phone number (optional)';




