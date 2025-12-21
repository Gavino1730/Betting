-- METHOD 1: Register through the website with username "admin" and password "12345678"
-- Then run this SQL to make that user an admin:

UPDATE users 
SET is_admin = true, balance = 10000
WHERE username = 'admin';

-- METHOD 2: If you already have a user, make them admin:
-- UPDATE users SET is_admin = true, balance = 10000 WHERE username = 'yourusername';

-- METHOD 3: Create admin directly (may have password hash issues)
-- If this doesn't work, use METHOD 1 instead
INSERT INTO users (username, password, balance, is_admin)
VALUES (
  'admin',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  10000,
  true
)
ON CONFLICT (username) 
DO UPDATE SET 
  is_admin = true,
  balance = 10000;
