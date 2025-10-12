/**
 * Test Script: Portfolio History API
 * Tests the new portfolio history endpoint with various timeframes
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

async function registerAndLogin() {
  logSection('Setting up test user');
  
  const timestamp = Date.now();
  const username = `testuser_${timestamp}`;
  const password = 'TestPassword123!';
  
  // Register
  logInfo(`Registering user: ${username}`);
  const registerResponse = await fetch(`${API_BASE_URL}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      password,
      password_confirm: password,
      email: `${username}@test.com`,
      first_name: 'Test',
      last_name: 'User',
    }),
  });
  
  if (!registerResponse.ok) {
    const error = await registerResponse.json();
    throw new Error(`Registration failed: ${JSON.stringify(error)}`);
  }
  
  logSuccess('User registered successfully');
  
  // Login
  logInfo('Logging in...');
  const loginResponse = await fetch(`${API_BASE_URL}/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `${username}@test.com`, password }),
  });
  
  if (!loginResponse.ok) {
    const error = await loginResponse.json();
    throw new Error(`Login failed: ${JSON.stringify(error)}`);
  }
  
  const { access } = await loginResponse.json();
  logSuccess('Login successful');
  
  return { token: access, username };
}

async function completeOnboarding(token) {
  logSection('Completing Onboarding');
  
  logInfo('Setting zodiac sign and starting balance...');
  const response = await fetch(`${API_BASE_URL}/onboarding/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      zodiac_sign: 'Aries',
      date_of_birth: '1990-04-15',
      starting_balance: '100000.00',
      investing_style: 'balanced',
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Onboarding failed: ${JSON.stringify(error)}`);
  }
  
  logSuccess('Onboarding completed');
}

async function buyStock(token, ticker, quantity, price) {
  logInfo(`Buying ${quantity} shares of ${ticker}...`);
  const response = await fetch(`${API_BASE_URL}/holdings/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      ticker,
      quantity,
      total_value: quantity * price,
      action: 'buy',
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Buy failed: ${JSON.stringify(error)}`);
  }
  
  logSuccess(`Bought ${quantity} shares of ${ticker}`);
}

async function testPortfolioHistory(token, timeframe) {
  try {
    logInfo(`Testing timeframe: ${timeframe}`);
    
    const response = await fetch(`${API_BASE_URL}/portfolio/history/?timeframe=${timeframe}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API error: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data.timeframe || !Array.isArray(data.data)) {
      throw new Error('Invalid response structure');
    }
    
    if (data.timeframe !== timeframe) {
      throw new Error(`Timeframe mismatch: expected ${timeframe}, got ${data.timeframe}`);
    }
    
    if (data.data.length === 0) {
      throw new Error('No data points returned');
    }
    
    // Validate data point structure
    const firstPoint = data.data[0];
    const requiredFields = ['timestamp', 'portfolio_value', 'cash_balance', 'stocks_value', 'cosmic_vibe_index'];
    
    for (const field of requiredFields) {
      if (!(field in firstPoint)) {
        throw new Error(`Missing field: ${field}`);
      }
    }
    
    // Validate data types
    if (typeof firstPoint.portfolio_value !== 'number') {
      throw new Error('portfolio_value should be a number');
    }
    
    if (typeof firstPoint.cosmic_vibe_index !== 'number') {
      throw new Error('cosmic_vibe_index should be a number');
    }
    
    logSuccess(`${timeframe}: Valid response with ${data.data.length} data points`);
    testsPassed++;
    
  } catch (error) {
    logError(`${timeframe}: ${error.message}`);
    testsFailed++;
  }
}

async function testNoHoldings(token) {
  logSection('Testing Portfolio History with No Holdings');
  
  try {
    logInfo('Fetching portfolio history before buying any stocks...');
    
    const response = await fetch(`${API_BASE_URL}/portfolio/history/?timeframe=1M`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API error: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    
    // Should return data with only cash balance
    if (!data.data || data.data.length === 0) {
      throw new Error('Should return data even with no holdings');
    }
    
    const firstPoint = data.data[0];
    if (firstPoint.stocks_value !== 0) {
      throw new Error('stocks_value should be 0 when there are no holdings');
    }
    
    logSuccess('Correctly returns cash-only portfolio when no holdings exist');
    testsPassed++;
    
  } catch (error) {
    logError(`No holdings test: ${error.message}`);
    testsFailed++;
  }
}

async function testInvalidTimeframe(token) {
  logSection('Testing Invalid Timeframe');
  
  try {
    logInfo('Testing with invalid timeframe...');
    
    const response = await fetch(`${API_BASE_URL}/portfolio/history/?timeframe=INVALID`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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

async function testAuthenticationRequired() {
  logSection('Testing Authentication Requirement');
  
  try {
    logInfo('Testing without authentication token...');
    
    const response = await fetch(`${API_BASE_URL}/portfolio/history/?timeframe=1M`, {
      method: 'GET',
    });
    
    if (response.ok) {
      throw new Error('Should require authentication');
    }
    
    if (response.status !== 401) {
      throw new Error(`Expected status 401, got ${response.status}`);
    }
    
    logSuccess('Correctly requires authentication');
    testsPassed++;
    
  } catch (error) {
    logError(`Authentication test: ${error.message}`);
    testsFailed++;
  }
}

async function runTests() {
  logSection('Portfolio History API Test Suite');
  logInfo(`API Base URL: ${API_BASE_URL}`);
  
  try {
    // Test authentication requirement
    await testAuthenticationRequired();
    
    // Register and login
    const { token } = await registerAndLogin();
    
    // Complete onboarding
    await completeOnboarding(token);
    
    // Test with no holdings
    await testNoHoldings(token);
    
    // Buy some stocks to test with holdings
    logSection('Creating Test Holdings');
    await buyStock(token, 'AAPL', 10, 175.50);
    await buyStock(token, 'GOOGL', 5, 140.30);
    
    // Test all timeframes
    logSection('Testing All Timeframes');
    const timeframes = ['1D', '5D', '1W', '1M', '3M', '1Y', '5Y'];
    
    for (const timeframe of timeframes) {
      await testPortfolioHistory(token, timeframe);
    }
    
    // Test invalid timeframe
    await testInvalidTimeframe(token);
    
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

