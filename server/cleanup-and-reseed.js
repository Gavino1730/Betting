/**
 * Cleanup and Re-seed Script
 * Deletes existing VC teams and re-runs the seed
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupAndReseed() {
  try {
    console.log('🗑️  Deleting existing VC teams...\n');

    // Delete existing VC teams (cascade will delete related games and players)
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .in('name', ['VC Boys Basketball', 'VC Girls Basketball']);

    if (deleteError) {
      throw new Error(`Delete failed: ${deleteError.message}`);
    }

    console.log('✅ Existing teams deleted successfully!\n');
    console.log('🏀 Now running seed script...\n');

    // Run the seed script
    require('./seed-valley-catholic.js');

  } catch (error) {
    console.error('❌ Cleanup Error:', error.message);
    process.exit(1);
  }
}

cleanupAndReseed();
