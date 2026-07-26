const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function check() {
  // Count orders
  const { count: ordersCount, error: ordErr } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  console.log('Orders count:', ordersCount, 'Error:', ordErr?.message);

  // If orders exist, fetch latest 10 with details
  if (ordersCount && ordersCount > 0 && !ordErr) {
    const { data: orders } = await supabase.from('orders').select('*').order('timestamp', { ascending: false }).limit(10);
    console.log('\nRecent Orders (10):');
    orders.forEach(o => {
      console.log('  ', o.timestamp, o.symbol, o.side, o.price, o.qty, 'TP:', o.take_profit, 'SL:', o.stoploss, 'Status:', o.status, 'Strategy:', o.strategyId);
    });
  } else {
    console.log('No orders found.');
  }

  // Also check logs for order placement messages
  const { data: logs } = await supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(100);
  const orderLogs = logs.filter(l => l.message && l.message.includes('order'));
  console.log('\nLogs mentioning "order":');
  orderLogs.forEach(l => {
    console.log('  ', l.timestamp, l.identifier, l.level, l.message);
  });
}

check().catch(console.error);
