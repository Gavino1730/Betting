-- Create admin user
-- Username: admin
-- Password: 12345

INSERT INTO users (username, password, balance, is_admin)
VALUES (
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  10000,
  true
)
ON CONFLICT (username) 
DO UPDATE SET 
  is_admin = true,
  balance = 10000,
  password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
