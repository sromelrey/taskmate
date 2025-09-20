-- Fix password authentication by adding password_hash column
-- Run this in your Neon SQL console

-- 1. Add password_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. Update the admin user with the correct password hash
UPDATE users 
SET password_hash = '$2b$12$WWBXEaSeqH/CpLcV467YwetlO2BJ2tdWX9DqKO7AkSKhQGahoGEsG'
WHERE email = 'admin@gmail.com';

-- 3. If the admin user doesn't exist, create it
INSERT INTO users (id, email, name, password_hash, timezone, wip_limit)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@gmail.com',
  'Admin User',
  '$2b$12$WWBXEaSeqH/CpLcV467YwetlO2BJ2tdWX9DqKO7AkSKhQGahoGEsG',
  'UTC',
  1
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name;

-- 4. Verify the user was created/updated
SELECT id, email, name, password_hash IS NOT NULL as has_password FROM users WHERE email = 'admin@gmail.com';
