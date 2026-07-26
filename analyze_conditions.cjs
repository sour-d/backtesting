const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function analyze() {
  const { data: logs } = await supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(500);
  
  // Group by timestamp pairs (buy and sell condition logs appear together)
  const entries = [];
  
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    if (log.message === 'buy condition' && log.data && log.data.today) {
      // Look for corresponding sell condition nearby
      const sellLog = logs.find(l => l.message === 'sell condition' && l.timestamp === log.timestamp);
      entries.push({ buy: log, sell: sellLog });
    }
  }

  console.log(`Found ${entries.length} buy/sell condition pairs.\n`);
  console.log('Analyzing entry conditions (per MovingAverage_v2 logic):\n');

  entries.forEach((pair, idx) => {
    const b = pair.buy.data.today;
    const s = pair.sell?.data?.today || b; // same base data

    // For buy entry:
    const price = b.close;
    const ma50high = b.ma50high;
    const ma50low = b.ma50low;
    const ma200 = b.ma200close;
    const body = b.body;
    const superTrend = b.superTrendDirection;
    // The strategy logs "buy condition" with {today, yesterday}. Yesterday is in pair.buy.data.yesterday
    const yesterday = pair.buy.data.yesterday;
    const yesterdayBody = yesterday ? yesterday.body : undefined;

    // Conditions:
    const condPriceAbove50High = price > ma50high;
    const condTodayBodyPositive = body > 0;
    const condYesterdayBodyPositive = yesterdayBody !== undefined ? yesterdayBody > 0 : 'unknown';
    const condSuperTrendBuy = superTrend === 'Buy';
    const condPriceAboveSMA200 = price > ma200;

    const buyWouldEnter = condPriceAbove50High && condTodayBodyPositive && condYesterdayBodyPositive && condSuperTrendBuy && condPriceAboveSMA200;

    // Sell conditions:
    const condPriceBelow50Low = price < ma50low;
    const condTodayBodyNegative = body < 0;
    const condYesterdayBodyNegative = yesterdayBody !== undefined ? yesterdayBody < 0 : 'unknown';
    const condSuperTrendSell = superTrend === 'Sell';
    const condPriceBelowSMA200 = price < ma200;

    const sellWouldEnter = condPriceBelow50Low && condTodayBodyNegative && condYesterdayBodyNegative && condSuperTrendSell && condPriceBelowSMA200;

    const timestamp = pair.buy.timestamp;
    console.log(`${idx + 1}. ${timestamp.split('T')[0]} ${timestamp.substring(11, 16)} | price=${price} ma50high=${ma50high} ma50low=${ma50low} ma200=${ma200} body=${body} superTrend=${superTrend} yestBody=${yesterdayBody}`);
    console.log(`   BUY:  ${condPriceAbove50High ? '✓' : '✗'} price>ma50high ${condTodayBodyPositive ? '✓' : '✗'} body>0 ${condYesterdayBodyPositive === true ? '✓' : (condYesterdayBodyPositive === false ? '✗' : '?')} yestBody>0 ${condSuperTrendBuy ? '✓' : '✗'} ST=Buy ${condPriceAboveSMA200 ? '✓' : '✗'} price>SMA200 => ${buyWouldEnter ? 'ENTER' : 'no'}`);
    console.log(`   SELL: ${condPriceBelow50Low ? '✓' : '✗'} price<ma50low ${condTodayBodyNegative ? '✓' : '✗'} body<0 ${condYesterdayBodyNegative === true ? '✓' : (condYesterdayBodyNegative === false ? '✗' : '?')} yestBody<0 ${condSuperTrendSell ? '✓' : '✗'} ST=Sell ${condPriceBelowSMA200 ? '✓' : '✗'} price<SMA200 => ${sellWouldEnter ? 'ENTER' : 'no'}`);
    console.log('');
  });
}

analyze().catch(console.error);
