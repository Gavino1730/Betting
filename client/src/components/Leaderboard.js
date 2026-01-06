import React, { useState, useEffect } from 'react';
import apiClient from '../utils/axios';
import '../styles/Leaderboard.css';
import { formatCurrency } from '../utils/currency';

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('score'); // 'score', 'balance', 'winRate', 'profit'


  useEffect(() => {
    fetchData();
    // Poll for leaderboard updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      // Get all users
      const usersRes = await apiClient.get('/users');
      // Filter out admin account
      setUsers(usersRes.data.filter(u => u.username !== 'admin'));

      // Get all bets
      const betsRes = await apiClient.get('/bets/all');
      setBets(betsRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateUserStats = (userId) => {
    const userBets = bets.filter(b => b.user_id === userId);
    const resolvedBets = userBets.filter(b => b.status === 'resolved');
    const totalBets = userBets.length;
    const resolvedCount = resolvedBets.length;
    const wonBets = userBets.filter(b => b.outcome === 'won').length;
    const lostBets = userBets.filter(b => b.outcome === 'lost').length;
    const pendingBets = userBets.filter(b => b.status === 'pending').length;
    const totalWagered = resolvedBets.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalWinnings = userBets
      .filter(b => b.outcome === 'won')
      .reduce((sum, b) => sum + (b.potential_win || 0), 0);
    const netProfit = totalWinnings - totalWagered;
    const winRate = resolvedCount > 0 ? ((wonBets / resolvedCount) * 100) : 0;
    const roi = totalWagered > 0 ? ((netProfit / totalWagered) * 100) : 0;

    return {
      totalBets,
      resolvedCount,
      wonBets,
      lostBets,
      pendingBets,
      totalWagered,
      totalWinnings,
      netProfit,
      winRate,
      roi,
    };
  };

  // Calculate the multi-factor ranking score
  const calculateRankingScore = (user, stats, allUsersStats) => {
    // Get max values for normalization
    const maxProfit = Math.max(...allUsersStats.map(s => s.stats.netProfit), 1);
    const maxBets = Math.max(...allUsersStats.map(s => s.stats.resolvedCount), 1);
    const minProfit = Math.min(...allUsersStats.map(s => s.stats.netProfit), 0);
    
    // Normalized scores (0-100)
    const winRateScore = stats.winRate; // Already 0-100
    const roiScore = Math.min(Math.max((stats.roi + 100) / 2, 0), 100); // Normalize ROI (-100% to 100% -> 0 to 100)
    
    // Profit score (normalized to 0-100 based on range)
    const profitRange = maxProfit - minProfit;
    const profitScore = profitRange > 0 ? ((stats.netProfit - minProfit) / profitRange) * 100 : 50;
    
    // Activity score (normalized by max bets)
    const activityScore = (stats.resolvedCount / maxBets) * 100;
    
    // Minimum bets requirement - need at least 3 resolved bets for full score
    const minBetsMultiplier = Math.min(stats.resolvedCount / 3, 1);
    
    // Weighted composite score
    // Win Rate: 35%, ROI: 25%, Profit: 25%, Activity: 15%
    const rawScore = (
      (winRateScore * 0.35) +
      (roiScore * 0.25) +
      (profitScore * 0.25) +
      (activityScore * 0.15)
    );
    
    // Apply minimum bets multiplier (reduces score if < 3 bets)
    const finalScore = rawScore * minBetsMultiplier;
    
    return {
      total: Math.round(finalScore * 10) / 10,
      breakdown: {
        winRate: Math.round(winRateScore * 0.35 * 10) / 10,
        roi: Math.round(roiScore * 0.25 * 10) / 10,
        profit: Math.round(profitScore * 0.25 * 10) / 10,
        activity: Math.round(activityScore * 0.15 * 10) / 10,
      }
    };
  };

  const getUsersWithStats = () => {
    const usersWithBasicStats = users.map(user => ({
      ...user,
      stats: calculateUserStats(user.id),
    }));
    
    // Calculate ranking scores with all users data for normalization
    return usersWithBasicStats.map(user => ({
      ...user,
      rankingScore: calculateRankingScore(user, user.stats, usersWithBasicStats),
    }));
  };

  const getSortedUsers = () => {
    const usersWithStats = getUsersWithStats();
    
    switch (sortBy) {
      case 'balance':
        return usersWithStats.sort((a, b) => b.balance - a.balance);
      case 'winRate':
        return usersWithStats.sort((a, b) => b.stats.winRate - a.stats.winRate);
      case 'profit':
        return usersWithStats.sort((a, b) => b.stats.netProfit - a.stats.netProfit);
      case 'score':
      default:
        return usersWithStats.sort((a, b) => b.rankingScore.total - a.rankingScore.total);
    }
  };

  // Get tier based on ranking score
  const getTier = (score) => {
    if (score >= 70) return { name: 'Diamond', emoji: '💎', color: '#b9f2ff' };
    if (score >= 55) return { name: 'Platinum', emoji: '⚪', color: '#e5e4e2' };
    if (score >= 40) return { name: 'Gold', emoji: '🥇', color: '#ffd700' };
    if (score >= 25) return { name: 'Silver', emoji: '🥈', color: '#c0c0c0' };
    if (score >= 10) return { name: 'Bronze', emoji: '🥉', color: '#cd7f32' };
    return { name: 'Rookie', emoji: '🌱', color: '#66bb6a' };
  };

  if (loading) {
    return (
      <div className="leaderboard-page">
        <div style={{textAlign: 'center', padding: '40px', color: '#b8c5d6'}}>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading Leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const rankedUsers = getSortedUsers();
  const totalPicks = bets.length;
  const totalWagered = bets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalWinnings = bets.filter(b => b.outcome === 'won').reduce((sum, b) => sum + (b.potential_win || 0), 0);

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p className="subtitle">Track your picks and compete with other players</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Sort Controls */}
      <div className="sort-controls">
        <span className="sort-label">Rank by:</span>
        <button 
          className={`sort-btn ${sortBy === 'score' ? 'active' : ''}`}
          onClick={() => setSortBy('score')}
        >
          📊 Overall Score
        </button>
        <button 
          className={`sort-btn ${sortBy === 'balance' ? 'active' : ''}`}
          onClick={() => setSortBy('balance')}
        >
          💰 Balance
        </button>
        <button 
          className={`sort-btn ${sortBy === 'winRate' ? 'active' : ''}`}
          onClick={() => setSortBy('winRate')}
        >
          🎯 Win Rate
        </button>
        <button 
          className={`sort-btn ${sortBy === 'profit' ? 'active' : ''}`}
          onClick={() => setSortBy('profit')}
        >
          📈 Profit
        </button>
      </div>

      {/* Overview Stats */}
      <div className="overview-stats">
        <div className="stat-card">
          <div className="stat-card-value">{users.length}</div>
          <div className="stat-card-label">Active Players</div>
          <div className="stat-card-icon">👥</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{totalPicks}</div>
          <div className="stat-card-label">Total Picks</div>
          <div className="stat-card-icon">🎲</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{formatCurrency(totalWagered)}</div>
          <div className="stat-card-label">Total Wagered</div>
          <div className="stat-card-icon">💰</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{color: '#66bb6a'}}>{formatCurrency(totalWinnings)}</div>
          <div className="stat-card-label">Total Winnings</div>
          <div className="stat-card-icon">🎉</div>
        </div>
      </div>

      {/* Leaderboard Table/Cards */}
      <div className="leaderboard-container">
        {rankedUsers.length === 0 ? (
          <div className="empty-state">
            <p>No players yet. Be the first to place a pick!</p>
          </div>
        ) : (
          rankedUsers.map((user, index) => {
            const tier = getTier(user.rankingScore.total);
            return (
              <div key={user.id} className={`leaderboard-row rank-${index + 1}`}>
                <div className="rank-cell">
                  <div className="rank-number">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </div>
                </div>
                
                <div className="user-cell">
                  <div className="user-info">
                    <div className="user-name-row">
                      <span className="user-name">{user.username}</span>
                      <span className="tier-badge" style={{ backgroundColor: tier.color }}>
                        {tier.emoji} {tier.name}
                      </span>
                    </div>
                    {user.is_admin && <span className="admin-badge">ADMIN</span>}
                  </div>
                  {sortBy === 'score' && (
                    <div className="ranking-score-preview">
                      <span className="score-total">{user.rankingScore.total.toFixed(1)} pts</span>
                    </div>
                  )}
                </div>

                {/* Score breakdown - shows on score sort */}
                {sortBy === 'score' && (
                  <div className="stats-cell score-cell">
                    <div className="cell-label">Score Breakdown</div>
                    <div className="score-breakdown">
                      <span className="score-part" title="Win Rate (35%)">🎯{user.rankingScore.breakdown.winRate.toFixed(0)}</span>
                      <span className="score-part" title="ROI (25%)">📊{user.rankingScore.breakdown.roi.toFixed(0)}</span>
                      <span className="score-part" title="Profit (25%)">💰{user.rankingScore.breakdown.profit.toFixed(0)}</span>
                      <span className="score-part" title="Activity (15%)">🔥{user.rankingScore.breakdown.activity.toFixed(0)}</span>
                    </div>
                  </div>
                )}
                
                <div className="stats-cell balance-cell">
                  <div className="cell-label">Balance</div>
                  <div className="cell-value balance">{formatCurrency(user.balance)}</div>
                </div>

                <div className="stats-cell">
                  <div className="cell-label">Record</div>
                  <div className="cell-value record">
                    <span className="wins">{user.stats.wonBets}W</span>
                    <span className="separator">•</span>
                    <span className="losses">{user.stats.lostBets}L</span>
                  </div>
                </div>

                <div className="stats-cell">
                  <div className="cell-label">Win Rate</div>
                  <div className={`cell-value win-rate ${parseFloat(user.stats.winRate) >= 50 ? 'positive' : parseFloat(user.stats.winRate) === 0 ? 'neutral' : 'negative'}`}>
                    {user.stats.winRate}%
                  </div>
                </div>

                <div className="stats-cell profit-cell">
                  <div className="cell-label">Profit</div>
                  <div className={`cell-value profit ${user.stats.netProfit >= 0 ? 'positive' : 'negative'}`}>
                    {user.stats.netProfit >= 0 ? '+' : ''}{formatCurrency(user.stats.netProfit)}
                  </div>
                </div>

                <div className="stats-cell picks-cell">
                  <div className="cell-label">Picks</div>
                  <div className="cell-value">{user.stats.totalBets}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
