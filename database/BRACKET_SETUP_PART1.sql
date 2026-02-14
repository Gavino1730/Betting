-- Part 1: Create extension and main tables
create extension if not exists "pgcrypto";

create table if not exists brackets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  season text,
  status text not null default 'open',
  entry_fee numeric not null default 0,
  payout_per_point numeric not null default 1000,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists bracket_teams (
  id uuid primary key default gen_random_uuid(),
  bracket_id uuid not null references brackets(id) on delete cascade,
  seed int not null,
  name text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create unique index if not exists bracket_teams_unique_seed
  on bracket_teams (bracket_id, seed);

create table if not exists bracket_games (
  id uuid primary key default gen_random_uuid(),
  bracket_id uuid not null references brackets(id) on delete cascade,
  round int not null,
  game_number int not null,
  team1_id uuid references bracket_teams(id) on delete set null,
  team2_id uuid references bracket_teams(id) on delete set null,
  winner_team_id uuid references bracket_teams(id) on delete set null,
  status text not null default 'scheduled',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create unique index if not exists bracket_games_unique_round
  on bracket_games (bracket_id, round, game_number);

create table if not exists bracket_entries (
  id uuid primary key default gen_random_uuid(),
  bracket_id uuid not null references brackets(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  picks jsonb not null default '{}'::jsonb,
  points int not null default 0,
  payout numeric not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create unique index if not exists bracket_entries_unique_user
  on bracket_entries (bracket_id, user_id);
