const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function getLogs() {
  const { data, error } = await supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(50);
  if (error) {
    console.log('Logs query error:', error.message);
    return;
  }
  console.log('Full recent logs (50):');
  data.forEach(l => {
    const time = l.timestamp || l.created_at || '?';
    console.log(`${time} | ${l.level.padEnd(5)} | ${l.identifier.padEnd(30)} | ${l.message}`);
    if (l.data && Object.keys(l.data).length) {
      console.log('    Data:', JSON.stringify(l.data).substring(0, 200));
    }
  });
}

getLogs().catch(console.error);
