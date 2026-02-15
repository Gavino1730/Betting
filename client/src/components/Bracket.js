import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bracket as BracketDisplay, Seed, SeedItem } from 'react-brackets';
import apiClient from '../utils/axios';
import { formatCurrency } from '../utils/currency';
import '../styles/Bracket.css';


const ROUND_LABELS = {
  1: 'Round 1',
  2: 'Quarterfinals',
  3: 'Semifinals',
  4: 'Championship'
};

const makeGameKey = (gameNumber) => `game${gameNumber}`;

const normalizePicks = (picks) => ({
  round1: picks?.round1 || {},
  round2: picks?.round2 || {},
  round3: picks?.round3 || {},
  round4: picks?.round4 || {}
});

function Bracket({ updateUser }) {
  const navigate = useNavigate();
  const [bracket, setBracket] = useState(null);
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [entry, setEntry] = useState(null);
  const [picks, setPicks] = useState({ round1: {}, round2: {}, round3: {}, round4: {} });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const teamById = useMemo(() => {
    return teams.reduce((acc, team) => {
      acc[team.id] = team;
      return acc;
    }, {});
  }, [teams]);

  const gamesByRound = useMemo(() => {
    return games.reduce((acc, game) => {
      if (!acc[game.round]) acc[game.round] = [];
      acc[game.round].push(game);
      return acc;
    }, {});
  }, [games]);

  const loadBracket = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/brackets/active');
      const payload = response.data;

      if (!payload?.bracket) {
        setBracket(null);
        setTeams([]);
        setGames([]);
        return;
      }

      setBracket(payload.bracket);
      setTeams(payload.teams || []);
      setGames(payload.games || []);

      if (payload.bracket?.id) {
        try {
          const entryRes = await apiClient.get(`/brackets/${payload.bracket.id}/entries/me`);
          if (entryRes.data) {
            const normalized = normalizePicks(entryRes.data.picks);
            setEntry(entryRes.data);
            setPicks(normalized);
          } else {
            setEntry(null);
          }
        } catch (err) {
          setEntry(null);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load bracket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBracket();
  }, []);

  const isPickCorrect = (round, gameNumber, pickTeamId) => {
    if (!entry || !entry.picks) return null;
    
    const game = gamesByRound[round]?.find((g) => g.game_number === gameNumber);
    if (!game || !game.winner_team_id) return null;
    
    return game.winner_team_id === pickTeamId;
  };

  const applyRound1Pick = (gameNumber, teamId) => {
    setPicks((prev) => ({
      ...prev,
      round1: {
        ...prev.round1,
        [makeGameKey(gameNumber)]: teamId
      },
      round2: {},
      round3: {},
      round4: {}
    }));
  };

  const applyRound2Pick = (gameNumber, teamId) => {
    setPicks((prev) => ({
      ...prev,
      round2: {
        ...prev.round2,
        [makeGameKey(gameNumber)]: teamId
      },
      round3: {},
      round4: {}
    }));
  };

  const applyRound3Pick = (gameNumber, teamId) => {
    setPicks((prev) => ({
      ...prev,
      round3: {
        ...prev.round3,
        [makeGameKey(gameNumber)]: teamId
      },
      round4: {}
    }));
  };

  const applyRound4Pick = (teamId) => {
    setPicks((prev) => ({
      ...prev,
      round4: {
        game1: teamId
      }
    }));
  };

  const canSubmit = useMemo(() => {
    return (
      Object.keys(picks.round1).length === 8 &&
      Object.keys(picks.round2).length === 4 &&
      Object.keys(picks.round3).length === 2 &&
      picks.round4.game1 !== undefined
    );
  }, [picks]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Complete all picks before submitting');
      return;
    }

    try {
      setSubmitLoading(true);
      setError('');
      setMessage('');

      await apiClient.post(`/brackets/${bracket.id}/entries`, { picks });

      setMessage('Bracket submitted successfully!');
      
      // Refresh bracket data to show the submission
      await loadBracket();
      
      // Fetch updated user profile (balance may have changed due to entry fee)
      if (updateUser) {
        try {
          const response = await apiClient.get('/users/profile');
          updateUser(response.data);
        } catch (err) {
          console.error('Failed to fetch updated user profile:', err);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit bracket');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Transform game data into react-brackets format
  const transformedRounds = useMemo(() => {
    if (!bracket || games.length === 0) return [];
    
    const rounds = [];
    
    // Round 1-4
    for (let round = 1; round <= 4; round++) {
      const roundGames = gamesByRound[round] || [];
      const seeds = roundGames.sort((a, b) => a.game_number - b.game_number).map((game) => {
        const team1 = teamById[game.team1_id];
        const team2 = teamById[game.team2_id];
        
        return {
          id: game.id,
          gameNumber: game.game_number,
          round,
          teams: [
            {
              id: game.team1_id,
              name: team1 ? `${team1.seed}. ${team1.name}` : 'TBD',
              seed: team1?.seed || '?'
            },
            {
              id: game.team2_id,
              name: team2 ? `${team2.seed}. ${team2.name}` : 'TBD',
              seed: team2?.seed || '?'
            }
          ],
          winner: game.winner_team_id
        };
      });
      
      rounds.push({
        title: ROUND_LABELS[round],
        seeds
      });
    }
    
    return rounds;
  }, [games, gamesByRound, teamById, bracket]);

  // Custom seed component for interactive picking
  const CustomSeed = ({ seed, breakpoint, roundIndex }) => {
    const round = roundIndex + 1;
    const gameNumber = seed.gameNumber;
    const bracketLocked = bracket?.status !== 'open';
    const isDisabled = bracketLocked || !!entry;
    
    // Get the current pick for this game
    const roundKey = `round${round}`;
    const pickKey = makeGameKey(gameNumber);
    const selectedTeamId = picks[roundKey]?.[pickKey];
    
    // Handle team selection
    const handleTeamClick = (teamId) => {
      if (isDisabled || !teamId) return;
      
      if (round === 1) {
        applyRound1Pick(gameNumber, teamId);
      } else if (round === 2) {
        applyRound2Pick(gameNumber, teamId);
      } else if (round === 3) {
        applyRound3Pick(gameNumber, teamId);
      } else if (round === 4) {
        applyRound4Pick(teamId);
      }
    };
    
    // Check if pick is correct/incorrect (for submitted entries)
    const getPickStatus = (teamId) => {
      if (!entry) return '';
      const isCorrect = isPickCorrect(round, gameNumber, teamId);
      if (isCorrect === true) return 'correct';
      if (isCorrect === false) return 'incorrect';
      return '';
    };
    
    return (
      <Seed mobileBreakpoint={breakpoint}>
        <SeedItem>
          <div className="bracket-seed-container">
            {seed.teams.map((team, idx) => {
              const isSelected = selectedTeamId === team.id;
              const pickStatus = getPickStatus(team.id);
              const isWinner = seed.winner === team.id;
              
              return (
                <button
                  key={idx}
                  className={`bracket-seed-team ${isSelected ? 'selected' : ''} ${pickStatus}`}
                  onClick={() => handleTeamClick(team.id)}
                  disabled={isDisabled || team.name === 'TBD'}
                >
                  <span className="team-name">{team.name}</span>
                  {isWinner && <span className="winner-badge">✓</span>}
                </button>
              );
            })}
          </div>
        </SeedItem>
      </Seed>
    );
  };

  if (loading) {
    return (
      <div className="bracket-page">
        <div className="bracket-header">
          <h1>Championship Bracket</h1>
          <p>Loading bracket...</p>
        </div>
        <div className="bracket-actions">
          <button
            type="button"
            className="bracket-link"
            onClick={() => navigate('/actual-bracket')}
          >
            View Live Bracket
          </button>
          <button
            type="button"
            className="bracket-link"
            onClick={() => navigate('/bracket-leaderboard')}
          >
            View Leaderboard
          </button>
        </div>
      </div>
    );
  }

  const bracketLocked = bracket.status !== 'open';

  return (
    <div className="bracket-page">
      <div className="bracket-header">
        <div>
          <h1>Championship Bracket</h1>
          <p className="bracket-subtitle">3A Mens Basketball Tournament</p>
        </div>
        <div className="bracket-meta">
          <div className="bracket-meta__item">
            <span className="label">Entry Fee</span>
            <span className="value">{formatCurrency(Number(bracket.entry_fee || 0))}</span>
          </div>
          <div className="bracket-meta__item">
            <span className="label">Payout</span>
            <span className="value">{formatCurrency(Number(bracket.payout_per_point || 0))} per point</span>
          </div>
        </div>
      </div>

      <div className="beta-warning">
        <div className="beta-warning-content">
          <span className="beta-icon">⚠️</span>
          <div className="beta-text">
            <strong>Feature in Development</strong>
            <p>This bracket feature is not yet in production. Brackets created here will not be saved or scored. This is a preview of the upcoming feature.</p>
          </div>
        </div>
      </div>

      <div className="bracket-actions">
        <button
          type="button"
          className="bracket-link"
          onClick={() => navigate('/actual-bracket')}
        >
          View Live Bracket
        </button>
        <button
          type="button"
          className="bracket-link"
          onClick={() => navigate('/bracket-leaderboard')}
        >
          View Leaderboard
        </button>
        {entry && (
          <div className="bracket-entry-summary">
            <span>Your points: {entry.points}</span>
            <span>Payout: {formatCurrency(Number(entry.payout || 0))}</span>
          </div>
        )}
      </div>

      {error && <div className="bracket-alert bracket-alert--error">{error}</div>}
      {message && <div className="bracket-alert bracket-alert--success">{message}</div>}

      {bracketLocked && !entry && (
        <div className="bracket-alert bracket-alert--info">Bracket entries are locked.</div>
      )}

      {/* Instructions Section */}
      {!entry && !bracketLocked && (
        <div className="bracket-instructions">
          <div className="instructions-header">
            <h3>How to Pick Your Bracket</h3>
            <p className="instructions-intro">Pick the teams you think will win each game. Correct picks earn you points and Valiant Bucks!</p>
          </div>
          
          <div className="instructions-grid">
            <div className="instruction-card">
              <div className="instruction-number">1</div>
              <h4>Click a Team to Pick It</h4>
              <p>Click on the team name you want to advance. You'll pick winners for all 8 games in Round 1 first. Your picks turn blue when selected.</p>
            </div>
            
            <div className="instruction-card">
              <div className="instruction-number">2</div>
              <h4>Move to Next Rounds</h4>
              <p>After picking all Round 1 winners, those teams appear in Quarterfinals. Keep picking until all 4 rounds are done. You need 15 total picks.</p>
            </div>
            
            <div className="instruction-card">
              <div className="instruction-number">3</div>
              <h4>How You Get Paid</h4>
              <p><strong>Each correct pick earns:</strong> Round 1: 5 pts • Quarterfinals: 10 pts • Semifinals: 20 pts • Championship: 40 pts
              <br/><strong>Example:</strong> 10 correct picks = 100 points × ${bracket?.payout_per_point || 0} per point = ${10 * (bracket?.payout_per_point || 0)} Valiant Bucks
              <br/><strong>Max possible:</strong> All 15 picks correct = 160 points × ${bracket?.payout_per_point || 0} per point = ${160 * (bracket?.payout_per_point || 0)} Valiant Bucks</p>
            </div>
            
            <div className="instruction-card">
              <div className="instruction-number">4</div>
              <h4>Submit When Done</h4>
              <p>When all 15 picks are complete, click "Submit Bracket". Once you submit, you can't change your picks. The payout is based on how many you get right!</p>
            </div>
          </div>

          <div className="bracket-tips">
            <h4>💡 Quick Tips</h4>
            <ul>
              <li><strong>Balance Risk:</strong> Mix safe teams (seed 1-4) with some upsets to score big</li>
              <li><strong>Higher seeds beat lower seeds more:</strong> Seed 1 usually beats seed 16, but upsets happen!</li>
              <li><strong>Check the Leaderboard:</strong> See how other players picked - learn from the top scorers</li>
              <li><strong>Entry fee:</strong> Make sure you have enough Valiant Bucks for the entry fee shown above</li>
            </ul>
          </div>
        </div>
      )}

      {/* Bracket Display using react-brackets library */}
      <div className="bracket-container">
        <BracketDisplay
          rounds={transformedRounds}
          renderSeedComponent={CustomSeed}
          roundTitleComponent={(title) => <div className="bracket-round-title">{title}</div>}
        />
      </div>

      {/* Progress Indicator */}
      {!entry && (
        <div className="bracket-progress">
          <div className="progress-item">
            <span className="progress-label">Round 1</span>
            <span className={`progress-count ${Object.keys(picks.round1).length === 8 ? 'complete' : ''}`}>
              {Object.keys(picks.round1).length}/8
            </span>
          </div>
          <div className="progress-item">
            <span className="progress-label">Quarterfinals</span>
            <span className={`progress-count ${Object.keys(picks.round2).length === 4 ? 'complete' : ''}`}>
              {Object.keys(picks.round2).length}/4
            </span>
          </div>
          <div className="progress-item">
            <span className="progress-label">Semifinals</span>
            <span className={`progress-count ${Object.keys(picks.round3).length === 2 ? 'complete' : ''}`}>
              {Object.keys(picks.round3).length}/2
            </span>
          </div>
          <div className="progress-item">
            <span className="progress-label">Championship</span>
            <span className={`progress-count ${picks.round4.game1 !== undefined ? 'complete' : ''}`}>
              {picks.round4.game1 !== undefined ? '1' : '0'}/1
            </span>
          </div>
        </div>
      )}

      {!entry && (
        <div className="bracket-submit">
          <button
            type="button"
            className="bracket-submit-btn"
            onClick={handleSubmit}
            disabled={!canSubmit || submitLoading || bracketLocked}
          >
            {submitLoading ? 'Submitting...' : 'Submit Bracket'}
          </button>
          {!canSubmit && (
            <p className="submit-hint">Complete all picks to submit your bracket</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Bracket;
