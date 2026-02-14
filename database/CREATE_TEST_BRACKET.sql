-- Create test bracket for 3A State Basketball with the provided teams
-- This script handles table creation if needed and inserts bracket data

-- Step 1: Create tables if they don't exist
CREATE TABLE IF NOT EXISTS brackets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  season text,
  status text NOT NULL DEFAULT 'open',
  entry_fee numeric NOT NULL DEFAULT 0,
  payout_per_point numeric NOT NULL DEFAULT 1000,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bracket_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bracket_id uuid NOT NULL REFERENCES brackets(id) ON DELETE CASCADE,
  seed int NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS bracket_teams_unique_seed
  ON bracket_teams (bracket_id, seed);

CREATE TABLE IF NOT EXISTS bracket_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bracket_id uuid NOT NULL REFERENCES brackets(id) ON DELETE CASCADE,
  round int NOT NULL,
  game_number int NOT NULL,
  team1_id uuid REFERENCES bracket_teams(id) ON DELETE SET NULL,
  team2_id uuid REFERENCES bracket_teams(id) ON DELETE SET NULL,
  winner_team_id uuid REFERENCES bracket_teams(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS bracket_games_unique_round
  ON bracket_games (bracket_id, round, game_number);

-- Enable RLS if not already enabled
ALTER TABLE brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bracket_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE bracket_games ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "allow all brackets" ON brackets;
DROP POLICY IF EXISTS "allow all bracket_teams" ON bracket_teams;
DROP POLICY IF EXISTS "allow all bracket_games" ON bracket_games;

CREATE POLICY "allow all brackets" ON brackets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all bracket_teams" ON bracket_teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all bracket_games" ON bracket_games FOR ALL USING (true) WITH CHECK (true);

-- Step 2: Insert bracket
INSERT INTO brackets (name, season, status, entry_fee, payout_per_point)
VALUES ('3A State Bracket', '2026', 'open', 0, 1000)
ON CONFLICT DO NOTHING;

-- Get the bracket ID (most recent one)
WITH bracket_id AS (
  SELECT id FROM brackets WHERE name = '3A State Bracket' AND season = '2026' ORDER BY created_at DESC LIMIT 1
)

-- Step 3: Insert teams
INSERT INTO bracket_teams (bracket_id, seed, name)
SELECT b.id, t.seed, t.name
FROM bracket_id b,
(VALUES
  (1, 'Westside Christian'),
  (2, 'Valley Catholic'),
  (3, 'Pleasant Hill'),
  (4, 'Riverside'),
  (5, 'Cascade Christian'),
  (6, 'Salem Acad.'),
  (7, 'St. Mary''s, Medford'),
  (8, 'Burns')
) AS t(seed, name)
ON CONFLICT DO NOTHING;

-- Step 4: Create tournament games (quarterfinals)
-- Get bracket and create matchups: 1v8, 4v5, 2v7, 3v6
WITH bracket_id AS (
  SELECT id FROM brackets WHERE name = '3A State Bracket' AND season = '2026' ORDER BY created_at DESC LIMIT 1
),
teams_by_seed AS (
  SELECT b.id as bracket_id, bt.id as team_id, bt.seed
  FROM bracket_id b
  JOIN bracket_teams bt ON bt.bracket_id = b.id
),
quarterfinal_pairs AS (
  SELECT 
    b.id as bracket_id,
    1 as round,
    1 as game_number,
    (SELECT team_id FROM teams_by_seed WHERE bracket_id = b.id AND seed = 1) as team1_id,
    (SELECT team_id FROM teams_by_seed WHERE bracket_id = b.id AND seed = 8) as team2_id
  FROM bracket_id b
  UNION ALL
  SELECT b.id, 1, 2, 
    (SELECT team_id FROM teams_by_seed WHERE bracket_id = b.id AND seed = 4),
    (SELECT team_id FROM teams_by_seed WHERE bracket_id = b.id AND seed = 5)
  FROM bracket_id b
  UNION ALL
  SELECT b.id, 1, 3,
    (SELECT team_id FROM teams_by_seed WHERE bracket_id = b.id AND seed = 2),
    (SELECT team_id FROM teams_by_seed WHERE bracket_id = b.id AND seed = 7)
  FROM bracket_id b
  UNION ALL
  SELECT b.id, 1, 4,
    (SELECT team_id FROM teams_by_seed WHERE bracket_id = b.id AND seed = 3),
    (SELECT team_id FROM teams_by_seed WHERE bracket_id = b.id AND seed = 6)
  FROM bracket_id b
)
INSERT INTO bracket_games (bracket_id, round, game_number, team1_id, team2_id, status)
SELECT bracket_id, round, game_number, team1_id, team2_id, 'scheduled'
FROM quarterfinal_pairs
ON CONFLICT DO NOTHING;

-- Create empty semifinal games (round 2, will be auto-populated when quarterfinals have winners)
WITH bracket_id AS (
  SELECT id FROM brackets WHERE name = '3A State Bracket' AND season = '2026' ORDER BY created_at DESC LIMIT 1
)
INSERT INTO bracket_games (bracket_id, round, game_number, team1_id, team2_id, status)
SELECT b.id, 2, n, NULL, NULL, 'scheduled' FROM bracket_id b, generate_series(1, 2) n
ON CONFLICT DO NOTHING;

-- Create empty championship game (round 3, will be auto-populated when semifinals have winners)
WITH bracket_id AS (
  SELECT id FROM brackets WHERE name = '3A State Bracket' AND season = '2026' ORDER BY created_at DESC LIMIT 1
)
INSERT INTO bracket_games (bracket_id, round, game_number, team1_id, team2_id, status)
SELECT b.id, 3, 1, NULL, NULL, 'scheduled' FROM bracket_id b
ON CONFLICT DO NOTHING;
