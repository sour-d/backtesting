/**
 * This is an example of how to use the broker with the provided logger.
 */
import logger from '../server/logger.js';
import HistoricalKline from '../broker/HistoricalKline.js';
import Trade from '../broker/Trade.js';
import getBalance from '../broker/Account.js';
import getInstrumentInfo from '../broker/instrument.js';

/**
 * Demonstrates how to use the enhanced logger with broker components
 */
async function testBrokerWithLogger() {
  // Create a logger for broker operations
  const brokerLogger = logger({
    component: 'BrokerService',
    stockName: 'BTCUSDT'
  });

  brokerLogger.info('Starting broker operations test');

  try {
    // Example: Get instrument info with logger
    brokerLogger.info('Fetching instrument info');
    const instrumentInfo = await getInstrumentInfo('BTCUSDT', brokerLogger);
    brokerLogger.info('Instrument info received', instrumentInfo);

    // Example: Get account balance with logger
    brokerLogger.info('Fetching account balance');
    const balance = await getBalance(brokerLogger);
    brokerLogger.info('Account balance received', balance);

    // Example: Create Trade instance with logger
    const trade = new Trade('BTCUSDT', brokerLogger);

    // Example: Get historical klines with logger
    const startTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    const endTime = Date.now();
    brokerLogger.info('Fetching historical klines', { startTime, endTime });

    const klines = await HistoricalKline(
      'BTCUSDT',
      '15',  // 15 minute timeframe
      startTime,
      endTime,
      brokerLogger
    );

    brokerLogger.info(`Retrieved ${klines.length} klines`);

    brokerLogger.info('Broker operations test completed successfully');
  } catch (error) {
    brokerLogger.error('Error in broker operations test', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  testBrokerWithLogger()
    .then(() => console.log('Example completed'))
    .catch(err => console.error('Example failed:', err));
}

export default testBrokerWithLogger;