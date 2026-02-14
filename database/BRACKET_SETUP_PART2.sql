-- Part 2: Enable RLS and create policies
alter table brackets enable row level security;
alter table bracket_teams enable row level security;
alter table bracket_games enable row level security;
alter table bracket_entries enable row level security;

create policy "allow all brackets" on brackets
  for all using (true) with check (true);
create policy "allow all bracket_teams" on bracket_teams
  for all using (true) with check (true);
create policy "allow all bracket_games" on bracket_games
  for all using (true) with check (true);
create policy "allow all bracket_entries" on bracket_entries
  for all using (true) with check (true);
