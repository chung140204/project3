-- Migration: Add phone field and rename name to full_name
-- Run this if your users table doesn't have phone field

-- Check if phone column exists, if not add it
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'phone';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(20) NULL AFTER email')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Rename name to full_name (if needed)
-- Note: This will fail if full_name already exists, which is fine
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = 'full_name')
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' CHANGE COLUMN name full_name VARCHAR(255) NOT NULL')
));
PREPARE alterIfNotExists2 FROM @preparedStatement;
EXECUTE alterIfNotExists2;
DEALLOCATE PREPARE alterIfNotExists2;






