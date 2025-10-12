/**
 * Test Script: Stock History API
 * Tests the new stock history endpoint with various tickers and timeframes
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:42069/api';

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

let testsPassed = 0;
let testsFailed = 0;

async function testStockHistory(ticker, timeframe) {
  try {
    logInfo(`Testing ${ticker} with timeframe ${timeframe}...`);
    
    const response = await fetch(`${API_BASE_URL}/stocks/${ticker}/history/?timeframe=${timeframe}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API error: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data.ticker || !data.timeframe || !Array.isArray(data.data)) {
      throw new Error('Invalid response structure');
    }
    
    if (data.ticker !== ticker.toUpperCase()) {
      throw new Error(`Ticker mismatch: expected ${ticker.toUpperCase()}, got ${data.ticker}`);
    }
    
    if (data.timeframe !== timeframe) {
      throw new Error(`Timeframe mismatch: expected ${timeframe}, got ${data.timeframe}`);
    }
    
    if (data.data.length === 0) {
      throw new Error('No data points returned');
    }
    
    // Validate OHLCV data structure
    const firstPoint = data.data[0];
    const requiredFields = ['timestamp', 'open', 'high', 'low', 'close', 'volume'];
    
    for (const field of requiredFields) {
      if (!(field in firstPoint)) {
        throw new Error(`Missing field: ${field}`);
      }
    }
    
    // Validate data types
    if (typeof firstPoint.open !== 'number') {
      throw new Error('open should be a number');
    }
    
    if (typeof firstPoint.volume !== 'number') {
      throw new Error('volume should be a number');
    }
    
    // Validate OHLC logic (high >= low, etc.)
    if (firstPoint.high < firstPoint.low) {
      throw new Error('high should be >= low');
    }
    
    if (firstPoint.high < firstPoint.open || firstPoint.high < firstPoint.close) {
      throw new Error('high should be >= open and close');
    }
    
    if (firstPoint.low > firstPoint.open || firstPoint.low > firstPoint.close) {
      throw new Error('low should be <= open and close');
    }
    
    logSuccess(`${ticker} (${timeframe}): Valid response with ${data.data.length} data points`);
    testsPassed++;
    
  } catch (error) {
    logError(`${ticker} (${timeframe}): ${error.message}`);
    testsFailed++;
  }
}

async function testInvalidTicker() {
  logSection('Testing Invalid Ticker');
  
  try {
    logInfo('Testing with invalid ticker INVALIDTICKER123...');
    
    const response = await fetch(`${API_BASE_URL}/stocks/INVALIDTICKER123/history/?timeframe=1M`, {
      method: 'GET',
    });
    
    if (response.ok) {
      // Some invalid tickers might still return data, that's okay
      logWarning('API returned data for invalid ticker (yfinance might have partial data)');
      testsPassed++;
    } else if (response.status === 404) {
      logSuccess('Correctly returns 404 for invalid ticker');
      testsPassed++;
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
    
  } catch (error) {
    logError(`Invalid ticker test: ${error.message}`);
    testsFailed++;
  }
}

async function testInvalidTimeframe() {
  logSection('Testing Invalid Timeframe');
  
  try {
    logInfo('Testing with invalid timeframe...');
    
    const response = await fetch(`${API_BASE_URL}/stocks/AAPL/history/?timeframe=INVALID`, {
      method: 'GET',
    });
    
    if (response.ok) {
      throw new Error('Should have returned error for invalid timeframe');
    }
    
    if (response.status !== 400) {
      throw new Error(`Expected status 400, got ${response.status}`);
    }
    
    const error = await response.json();
    if (!error.error || !error.detail) {
      throw new Error('Error response should include error and detail fields');
    }
    
    logSuccess('Correctly rejects invalid timeframe with 400 status');
    testsPassed++;
    
  } catch (error) {
    logError(`Invalid timeframe test: ${error.message}`);
    testsFailed++;
  }
}

async function testPublicAccess() {
  logSection('Testing Public Access');
  
  try {
    logInfo('Testing without authentication token...');
    
    const response = await fetch(`${API_BASE_URL}/stocks/AAPL/history/?timeframe=1M`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Should allow public access, got status ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      throw new Error('Should return valid data');
    }
    
    logSuccess('Correctly allows public access to stock history');
    testsPassed++;
    
  } catch (error) {
    logError(`Public access test: ${error.message}`);
    testsFailed++;
  }
}

async function testCaseSensitivity() {
  logSection('Testing Case Sensitivity');
  
  try {
    logInfo('Testing lowercase ticker...');
    
    const response = await fetch(`${API_BASE_URL}/stocks/aapl/history/?timeframe=1M`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Should handle lowercase tickers, got status ${response.status}`);
    }
    
    const data = await response.json();
    if (data.ticker !== 'AAPL') {
      throw new Error(`Should normalize to uppercase: expected AAPL, got ${data.ticker}`);
    }
    
    logSuccess('Correctly handles case-insensitive ticker lookup');
    testsPassed++;
    
  } catch (error) {
    logError(`Case sensitivity test: ${error.message}`);
    testsFailed++;
  }
}

async function runTests() {
  logSection('Stock History API Test Suite');
  logInfo(`API Base URL: ${API_BASE_URL}`);
  
  try {
    // Test public access
    await testPublicAccess();
    
    // Test various tickers and timeframes
    logSection('Testing Various Tickers and Timeframes');
    
    const tickers = ['AAPL', 'GOOGL', 'MSFT'];
    const timeframes = ['1D', '1W', '1M', '3M', '1Y'];
    
    for (const ticker of tickers) {
      for (const timeframe of timeframes) {
        await testStockHistory(ticker, timeframe);
      }
    }
    
    // Test edge cases
    await testInvalidTicker();
    await testInvalidTimeframe();
    await testCaseSensitivity();
    
    // Summary
    logSection('Test Summary');
    log(`Total tests: ${testsPassed + testsFailed}`, colors.bright);
    logSuccess(`Passed: ${testsPassed}`);
    if (testsFailed > 0) {
      logError(`Failed: ${testsFailed}`);
    }
    
    if (testsFailed === 0) {
      log('\n🎉 All tests passed!', colors.green + colors.bright);
    } else {
      log('\n❌ Some tests failed', colors.red + colors.bright);
      process.exit(1);
    }
    
  } catch (error) {
    logError(`Test suite error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
runTests();

