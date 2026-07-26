const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function check() {
  const { data: logs } = await supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(200);
  
  console.log('Last 200 logs:');
  logs.forEach(l => {
    const time = l.timestamp || l.created_at || '?';
    const msg = l.message || '';
    // Highlight trade-related messages
    if (msg.includes('matched') || msg.includes('order placed') || msg.includes('exit') || msg.includes('position')) {
      console.log(`>>> ${time} [${l.level}] ${l.identifier}: ${msg}`);
      if (l.data) console.log('    Data:', JSON.stringify(l.data).substring(0, 200));
    } else if (l.level === 'warn') {
      console.log(`!!! ${time} [${l.level}] ${l.identifier}: ${msg}`);
    }
  });
}

check().catch(console.error);
