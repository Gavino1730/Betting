const { supabase } = require('./supabase');

/**
 * Manages automatic game visibility based on game timing:
 * - Games become visible 2 days before game_date (in Pacific timezone)
 * - Games are hidden at midnight (00:00 Pacific) after the game_date
 */

const PACIFIC_TZ = 'America/Los_Angeles';

/**
 * Get current time in Pacific timezone
 */
const getNowInPacific = () => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: PACIFIC_TZ
  });
  
  const parts = formatter.formatToParts(new Date());
  const date = {};
  parts.forEach(part => {
    date[part.type] = part.value;
  });
  
  return new Date(
    parseInt(date.year),
    parseInt(date.month) - 1,
    parseInt(date.day),
    parseInt(date.hour),
    parseInt(date.minute),
    parseInt(date.second)
  );
};

/**
 * Get start of day (00:00) in Pacific timezone for a given date
 */
const getStartOfDayPacific = (date) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: PACIFIC_TZ
  });
  
  const parts = formatter.formatToParts(date);
  const dateObj = {};
  parts.forEach(part => {
    dateObj[part.type] = part.value;
  });
  
  return new Date(
    parseInt(dateObj.year),
    parseInt(dateObj.month) - 1,
    parseInt(dateObj.day),
    0, 0, 0
  );
};

const updateGameVisibility = async () => {
  try {
    // Get all games
    const { data: games, error: fetchError } = await supabase
      .from('games')
      .select('id, game_date, game_time, status, is_visible, updated_at');

    if (fetchError) {
      console.error('Error fetching games for visibility update:', fetchError);
      return;
    }

    if (!games || games.length === 0) return;

    const now = getNowInPacific();
    const updates = [];

    games.forEach(game => {
      if (!game.game_date) return;

      // Parse game_date (assumed to be YYYY-MM-DD format in database)
      const gameDate = new Date(game.game_date + 'T00:00:00');
      const gameDateStart = getStartOfDayPacific(gameDate);

      // Calculate visibility windows (in Pacific time)
      const twoDaysBeforeGame = new Date(gameDateStart);
      twoDaysBeforeGame.setDate(twoDaysBeforeGame.getDate() - 2);

      const dayAfterGame = new Date(gameDateStart);
      dayAfterGame.setDate(dayAfterGame.getDate() + 1);

      // Determine if game should be visible
      // Visible: 2 days before game until midnight after game (all in Pacific time)
      const shouldBeVisible = now >= twoDaysBeforeGame && now < dayAfterGame;

      // Only update if visibility status needs to change
      if (shouldBeVisible !== game.is_visible) {
        updates.push({
          id: game.id,
          is_visible: shouldBeVisible,
          updated_at: new Date().toISOString()
        });
      }
    });

    // Apply updates in batches
    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('games')
          .update({ is_visible: update.is_visible, updated_at: update.updated_at })
          .eq('id', update.id);

        if (updateError) {
          console.error(`Error updating game ${update.id}:`, updateError);
        } else {
          const action = update.is_visible ? 'made visible' : 'hidden';
          const pacificTime = now.toLocaleString('en-US', { timeZone: PACIFIC_TZ });
          console.log(`[${pacificTime} PT] Game ${update.id} ${action}`);
        }
      }
    }
  } catch (error) {
    console.error('Error in updateGameVisibility:', error);
  }
};

/**
 * Start the scheduler to run every 5 minutes
 */
const startScheduler = () => {
  // Run immediately on startup
  updateGameVisibility();

  // Run every 5 minutes (300000 ms)
  setInterval(updateGameVisibility, 5 * 60 * 1000);
  const startTime = new Date().toLocaleString('en-US', { timeZone: PACIFIC_TZ });
  console.log(`Game visibility scheduler started at ${startTime} PT (runs every 5 minutes)`);
};

module.exports = {
  startScheduler,
  updateGameVisibility
};
