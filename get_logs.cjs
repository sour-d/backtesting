const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function getLogs() {
  // Try different possible timestamp column names
  for (const tsCol of ['created_at', 'createdAt', 'timestamp', 'time']) {
    try {
      const { data, error } = await supabase.from('logs').select('*').order(tsCol, { ascending: false }).limit(20);
      if (!error && data && data.length > 0) {
        console.log(`\nRecent logs (ordered by ${tsCol}):`);
        data.forEach(l => {
          console.log('  ', l[tsCol], l.identifier, l.level, l.message);
        });
        return;
      }
    } catch (e) {}
  }
  console.log('Could not retrieve logs with any known timestamp column.');
}

getLogs().catch(console.error);
