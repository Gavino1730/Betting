const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth, adminOnly } = require('../middleware/auth');
const { supabase } = require('../supabase');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const ROUND_POINTS = {
  1: 10,
  2: 20,
  3: 40
};

const normalizePickKey = (gameNumber) => `game${gameNumber}`;

const coercePicks = (picks) => {
  if (!picks || typeof picks !== 'object') {
    return { round1: {}, round2: {}, round3: {} };
  }
  return {
    round1: picks.round1 || {},
    round2: picks.round2 || {},
    round3: picks.round3 || {}
  };
};

const computePoints = (picks, winnersByRound) => {
  const safePicks = coercePicks(picks);
  let points = 0;

  [1, 2, 3].forEach((round) => {
    const roundWinners = winnersByRound[round] || {};
    Object.entries(roundWinners).forEach(([gameKey, winnerId]) => {
      if (!winnerId) return;
      const pickedTeamId = safePicks[`round${round}`]?.[gameKey];
      if (pickedTeamId && pickedTeamId === winnerId) {
        points += ROUND_POINTS[round] || 0;
      }
    });
  });

  return points;
};

const recalcEntries = async (bracketId) => {
  const { data: bracket, error: bracketError } = await supabase
    .from('brackets')
    .select('*')
    .eq('id', bracketId)
    .single();

  if (bracketError) throw bracketError;

  const { data: games, error: gamesError } = await supabase
    .from('bracket_games')
    .select('round, game_number, winner_team_id')
    .eq('bracket_id', bracketId);

  if (gamesError) throw gamesError;

  const winnersByRound = games.reduce((acc, game) => {
    const round = game.round;
    if (!acc[round]) acc[round] = {};
    acc[round][normalizePickKey(game.game_number)] = game.winner_team_id;
    return acc;
  }, {});

  const { data: entries, error: entriesError } = await supabase
    .from('bracket_entries')
    .select('id, user_id, picks, points, payout')
    .eq('bracket_id', bracketId);

  if (entriesError) throw entriesError;

  for (const entry of entries || []) {
    const points = computePoints(entry.picks, winnersByRound);
    const payout = points * Number(bracket.payout_per_point || 0);
    const previousPayout = Number(entry.payout || 0);
    const delta = payout - previousPayout;

    if (delta !== 0) {
      await User.updateBalance(entry.user_id, delta);
      await Transaction.create(
        entry.user_id,
        delta > 0 ? 'bracket_payout' : 'bracket_adjustment',
        delta,
        `${bracket.name} bracket payout update`
      );
    }

    await supabase
      .from('bracket_entries')
      .update({
        points,
        payout,
        updated_at: new Date().toISOString()
      })
      .eq('id', entry.id);
  }
};

const recomputeBracketGames = async (bracketId) => {
  const { data: games, error } = await supabase
    .from('bracket_games')
    .select('*')
    .eq('bracket_id', bracketId);

  if (error) throw error;

  const byRound = games.reduce((acc, game) => {
    if (!acc[game.round]) acc[game.round] = {};
    acc[game.round][game.game_number] = game;
    return acc;
  }, {});

  const round1 = byRound[1] || {};
  const round2 = byRound[2] || {};
  const round3 = byRound[3] || {};

  const updateGame = async (game, team1Id, team2Id) => {
    if (!game) return null;
    let winnerId = game.winner_team_id;
    let status = game.status;

    if (winnerId && winnerId !== team1Id && winnerId !== team2Id) {
      winnerId = null;
      status = 'scheduled';
    } else if (winnerId && team1Id && team2Id) {
      status = 'completed';
    } else if (!winnerId) {
      status = 'scheduled';
    }

    await supabase
      .from('bracket_games')
      .update({
        team1_id: team1Id,
        team2_id: team2Id,
        winner_team_id: winnerId,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', game.id);

    return { ...game, team1_id: team1Id, team2_id: team2Id, winner_team_id: winnerId, status };
  };

  const round2Game1 = await updateGame(
    round2[1],
    round1[1]?.winner_team_id || null,
    round1[2]?.winner_team_id || null
  );

  const round2Game2 = await updateGame(
    round2[2],
    round1[3]?.winner_team_id || null,
    round1[4]?.winner_team_id || null
  );

  const round3Game1 = await updateGame(
    round3[1],
    round2Game1?.winner_team_id || null,
    round2Game2?.winner_team_id || null
  );

  if (round3Game1?.winner_team_id) {
    await supabase
      .from('brackets')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', bracketId);
  }
};

router.get('/active', optionalAuth, async (req, res) => {
  try {
    const { data: bracket, error } = await supabase
      .from('brackets')
      .select('*')
      .in('status', ['open', 'locked', 'in-progress', 'completed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!bracket) {
      return res.json({ bracket: null, teams: [], games: [] });
    }

    const [{ data: teams }, { data: games }] = await Promise.all([
      supabase.from('bracket_teams').select('*').eq('bracket_id', bracket.id).order('seed', { ascending: true }),
      supabase.from('bracket_games').select('*').eq('bracket_id', bracket.id).order('round', { ascending: true }).order('game_number', { ascending: true })
    ]);

    res.json({ bracket, teams: teams || [], games: games || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bracket: ' + err.message });
  }
});

router.get('/admin', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('brackets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch brackets: ' + err.message });
  }
});

router.post('/', authenticateToken, adminOnly, async (req, res) => {
  const { name, season, entryFee, payoutPerPoint, status } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Bracket name is required' });
  }

  try {
    const { data, error } = await supabase
      .from('brackets')
      .insert([{ 
        name,
        season: season || null,
        entry_fee: entryFee ?? 0,
        payout_per_point: payoutPerPoint ?? 1000,
        status: status || 'open'
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create bracket: ' + err.message });
  }
});

router.put('/:id', authenticateToken, adminOnly, async (req, res) => {
  const { status, entryFee, payoutPerPoint, name, season } = req.body;
  const updates = {
    updated_at: new Date().toISOString()
  };

  if (status) updates.status = status;
  if (entryFee !== undefined) updates.entry_fee = entryFee;
  if (payoutPerPoint !== undefined) updates.payout_per_point = payoutPerPoint;
  if (name) updates.name = name;
  if (season !== undefined) updates.season = season;

  try {
    const { data, error } = await supabase
      .from('brackets')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update bracket: ' + err.message });
  }
});

router.put('/:id/teams', authenticateToken, adminOnly, async (req, res) => {
  const { teams } = req.body;

  if (!Array.isArray(teams) || teams.length !== 8) {
    return res.status(400).json({ error: 'Teams array must include 8 seeds' });
  }

  const seeds = teams.map((team) => Number(team.seed));
  const uniqueSeeds = new Set(seeds);
  if (uniqueSeeds.size !== 8 || seeds.some((seed) => !Number.isInteger(seed) || seed < 1 || seed > 8)) {
    return res.status(400).json({ error: 'Seeds must be unique numbers from 1 to 8' });
  }

  try {
    await supabase
      .from('bracket_teams')
      .delete()
      .eq('bracket_id', req.params.id);

    const payload = teams.map((team) => ({
      bracket_id: req.params.id,
      seed: Number(team.seed),
      name: team.name ? String(team.name).trim() : `TBD Seed ${team.seed}`
    }));

    const { error } = await supabase
      .from('bracket_teams')
      .insert(payload);

    if (error) throw error;
    res.json({ message: 'Teams updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update teams: ' + err.message });
  }
});

router.post('/:id/seed', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { data: existingGames, error: existingError } = await supabase
      .from('bracket_games')
      .select('id')
      .eq('bracket_id', req.params.id)
      .limit(1);

    if (existingError) throw existingError;
    if (existingGames && existingGames.length > 0) {
      return res.status(400).json({ error: 'Games already seeded for this bracket' });
    }

    const { data: teams, error: teamsError } = await supabase
      .from('bracket_teams')
      .select('id, seed')
      .eq('bracket_id', req.params.id);

    if (teamsError) throw teamsError;
    if (!teams || teams.length !== 8) {
      return res.status(400).json({ error: 'You must set all 8 teams before seeding games' });
    }

    const teamBySeed = teams.reduce((acc, team) => {
      acc[team.seed] = team.id;
      return acc;
    }, {});

    const games = [
      { round: 1, game_number: 1, team1_id: teamBySeed[1], team2_id: teamBySeed[8] },
      { round: 1, game_number: 2, team1_id: teamBySeed[4], team2_id: teamBySeed[5] },
      { round: 1, game_number: 3, team1_id: teamBySeed[2], team2_id: teamBySeed[7] },
      { round: 1, game_number: 4, team1_id: teamBySeed[3], team2_id: teamBySeed[6] },
      { round: 2, game_number: 1, team1_id: null, team2_id: null },
      { round: 2, game_number: 2, team1_id: null, team2_id: null },
      { round: 3, game_number: 1, team1_id: null, team2_id: null }
    ].map((game) => ({
      bracket_id: req.params.id,
      ...game
    }));

    const { error: insertError } = await supabase
      .from('bracket_games')
      .insert(games);

    if (insertError) throw insertError;

    res.json({ message: 'Bracket games seeded' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed games: ' + err.message });
  }
});

router.put('/:id/games/:gameId/winner', authenticateToken, adminOnly, async (req, res) => {
  const { winnerTeamId } = req.body;

  try {
    const { data: game, error } = await supabase
      .from('bracket_games')
      .select('*')
      .eq('id', req.params.gameId)
      .eq('bracket_id', req.params.id)
      .single();

    if (error) throw error;

    if (winnerTeamId && winnerTeamId !== game.team1_id && winnerTeamId !== game.team2_id) {
      return res.status(400).json({ error: 'Winner must be one of the teams in this game' });
    }

    await supabase
      .from('bracket_games')
      .update({
        winner_team_id: winnerTeamId || null,
        status: winnerTeamId ? 'completed' : 'scheduled',
        updated_at: new Date().toISOString()
      })
      .eq('id', game.id);

    await recomputeBracketGames(req.params.id);
    await recalcEntries(req.params.id);

    res.json({ message: 'Winner updated and bracket recalculated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update winner: ' + err.message });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { data: bracket, error } = await supabase
      .from('brackets')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    const [{ data: teams }, { data: games }] = await Promise.all([
      supabase.from('bracket_teams').select('*').eq('bracket_id', bracket.id).order('seed', { ascending: true }),
      supabase.from('bracket_games').select('*').eq('bracket_id', bracket.id).order('round', { ascending: true }).order('game_number', { ascending: true })
    ]);

    res.json({ bracket, teams: teams || [], games: games || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bracket: ' + err.message });
  }
});

router.get('/:id/leaderboard', optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bracket_entries')
      .select(`
        id,
        points,
        payout,
        created_at,
        users (
          id,
          username,
          is_admin
        )
      `)
      .eq('bracket_id', req.params.id)
      .order('points', { ascending: false });

    if (error) throw error;

    const filtered = (data || []).filter((entry) => !entry.users?.is_admin);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bracket leaderboard: ' + err.message });
  }
});

router.get('/:id/entries/me', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bracket_entries')
      .select('*')
      .eq('bracket_id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || null);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch entry: ' + err.message });
  }
});

router.post('/:id/entries', authenticateToken, async (req, res) => {
  const { picks } = req.body;

  try {
    const { data: bracket, error: bracketError } = await supabase
      .from('brackets')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (bracketError) throw bracketError;
    if (bracket.status !== 'open') {
      return res.status(400).json({ error: 'Bracket is not open for entries' });
    }

    const { data: existingEntry, error: existingEntryError } = await supabase
      .from('bracket_entries')
      .select('id')
      .eq('bracket_id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (existingEntryError && existingEntryError.code !== 'PGRST116') {
      throw existingEntryError;
    }

    if (existingEntry) {
      return res.status(400).json({ error: 'You already submitted a bracket' });
    }

    const { data: round1Games, error: gamesError } = await supabase
      .from('bracket_games')
      .select('id, round, game_number, team1_id, team2_id')
      .eq('bracket_id', req.params.id)
      .eq('round', 1)
      .order('game_number', { ascending: true });

    if (gamesError) throw gamesError;
    if (!round1Games || round1Games.length !== 4) {
      return res.status(400).json({ error: 'Bracket games not seeded yet' });
    }

    const safePicks = coercePicks(picks);

    const round1PickMap = {};
    for (const game of round1Games) {
      const pick = safePicks.round1[normalizePickKey(game.game_number)];
      if (!pick) {
        return res.status(400).json({ error: 'Complete all quarterfinal picks' });
      }
      if (pick !== game.team1_id && pick !== game.team2_id) {
        return res.status(400).json({ error: 'Quarterfinal pick must be one of the teams' });
      }
      round1PickMap[game.game_number] = pick;
    }

    const semi1Teams = [round1PickMap[1], round1PickMap[2]];
    const semi2Teams = [round1PickMap[3], round1PickMap[4]];

    const semi1Pick = safePicks.round2[normalizePickKey(1)];
    const semi2Pick = safePicks.round2[normalizePickKey(2)];

    if (!semi1Pick || !semi2Pick) {
      return res.status(400).json({ error: 'Complete all semifinal picks' });
    }

    if (!semi1Teams.includes(semi1Pick) || !semi2Teams.includes(semi2Pick)) {
      return res.status(400).json({ error: 'Semifinal picks must come from your quarterfinal winners' });
    }

    const finalTeams = [semi1Pick, semi2Pick];
    const finalPick = safePicks.round3[normalizePickKey(1)];
    if (!finalPick || !finalTeams.includes(finalPick)) {
      return res.status(400).json({ error: 'Final pick must be one of your semifinal winners' });
    }

    if (Number(bracket.entry_fee || 0) > 0) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (Number(user.balance || 0) < Number(bracket.entry_fee)) {
        return res.status(400).json({ error: 'Insufficient balance for entry fee' });
      }

      await Transaction.create(
        req.user.id,
        'bracket_entry',
        -Number(bracket.entry_fee),
        `${bracket.name} bracket entry fee`
      );
      await User.updateBalance(req.user.id, -Number(bracket.entry_fee));
    }

    const { data: entry, error: entryError } = await supabase
      .from('bracket_entries')
      .insert([{ 
        bracket_id: req.params.id,
        user_id: req.user.id,
        picks: safePicks
      }])
      .select()
      .single();

    if (entryError) throw entryError;

    await recalcEntries(req.params.id);

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit bracket: ' + err.message });
  }
});

module.exports = router;
