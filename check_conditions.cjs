const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function check() {
  const { data: logs } = await supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(200);
  
  // Find logs with today data object
  for (const l of logs) {
    if (l.data && l.data.today) {
      const d = l.data.today;
      console.log(`${l.timestamp} | ${l.level} | ${l.message}`);
      console.log(`    close=${d.close}, ma50high=${d.ma50high}, ma50low=${d.ma50low}, ma200close=${d.ma200close}`);
      console.log(`    body=${d.body}, superTrend=${d.superTrendDirection}`);
      console.log('');
    }
  }
}

check().catch(console.error);
