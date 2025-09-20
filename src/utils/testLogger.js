import logger from '../server/logger.js';

/**
 * Utility to test the enhanced logging system
 */

/**
 * Run a test of the logging system with various log levels and components
 */
export function testLogging() {
  // Create a test logger
  const testLogger = logger({
    component: 'TestLogger'
  });
  
  testLogger.info('Testing enhanced logging system...');
  
  // Create loggers for different components
  const strategyManagerLogger = logger({ 
    component: 'LiveStrategyManager'
  });
  
  const strategyLogger = logger({ 
    component: 'Strategy', 
    stockName: 'AAPL', 
    timeFrame: '1h', 
    strategyName: 'MovingAverageStrategy' 
  });
  
  const factoryLogger = logger({ 
    component: 'StrategyFactory' 
  });
  
  // Test different log levels
  strategyManagerLogger.debug('This is a debug message from LiveStrategyManager');
  strategyManagerLogger.info('This is an info message from LiveStrategyManager');
  strategyManagerLogger.warn('This is a warning message from LiveStrategyManager');
  strategyManagerLogger.error('This is an error message from LiveStrategyManager');
  
  strategyLogger.info('Strategy initialized successfully');
  strategyLogger.debug('Current state:', { position: 'long', entryPrice: 150.25 });
  
  factoryLogger.info('Creating new strategy instance');
  factoryLogger.error('Failed to create strategy', new Error('Strategy class not found'));
  
  testLogger.info('Logging test complete. Check console output or database logs.');
}

// Run the test if this file is executed directly
// Using ES modules approach
import { fileURLToPath } from 'url';
const currentFilePath = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === currentFilePath;

if (isMainModule) {
  testLogging();
  console.log('Test logging completed');
}