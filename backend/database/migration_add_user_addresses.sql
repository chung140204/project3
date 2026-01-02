-- Migration: Add user_addresses table for shipping address management
-- Ensures only one default address per user

-- Create user_addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipient_name VARCHAR(255) NOT NULL COMMENT 'Recipient full name',
    phone VARCHAR(20) NOT NULL COMMENT 'Recipient phone number',
    address TEXT NOT NULL COMMENT 'Full shipping address',
    is_default BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Default address flag (only one per user)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default),
    INDEX idx_user_default (user_id, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: Triggers are handled in application logic (UserAddressModel)
-- This ensures better portability and easier debugging
-- The model methods handle the "only one default" constraint

