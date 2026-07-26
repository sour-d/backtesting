const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function check() {
  // Get all strategies
  const { data: strategies, error: stratErr } = await supabase.from('strategies').select('*');
  if (stratErr) console.log('Strategies error:', stratErr.message);
  else {
    console.log('All strategies in DB:');
    strategies.forEach(s => {
      console.log('  ID:', s.id, 'Name:', s.strategyName, 'Symbol:', s.stockName, 'TF:', s.timeFrame, 'Status:', s.status);
    });
  }

  // Count orders (with correct column name assumption)
  const { count: ordersCount, error: ordErr } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  console.log('Orders count:', ordersCount, 'Error:', ordErr?.message);

  // Count logs
  const { count: logsCount, error: logErr } = await supabase.from('logs').select('*', { count: 'exact', head: true });
  console.log('Logs count:', logsCount, 'Error:', logErr?.message);
}

check().catch(console.error);
