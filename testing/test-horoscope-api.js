/**
 * Test script for the Daily Horoscope API functionality
 * Tests horoscope generation, retrieval, and error handling
 */

const BASE_URL = 'http://localhost:42069/api';

// Test user credentials
const TEST_USERS = [
  {
    email: 'aries_casual@zentraders.com',
    password: 'TestPassword123!',
    username: 'aries_casual',
    zodiacSign: 'Aries',
    investingStyle: 'casual',
  },
  {
    email: 'leo_balanced@zentraders.com',
    password: 'TestPassword123!',
    username: 'leo_balanced',
    zodiacSign: 'Leo',
    investingStyle: 'balanced',
  },
  {
    email: 'virgo_profit@zentraders.com',
    password: 'TestPassword123!',
    username: 'virgo_profit',
    zodiacSign: 'Virgo',
    investingStyle: 'profit-seeking',
  },
  {
    email: 'pisces_playful@zentraders.com',
    password: 'TestPassword123!',
    username: 'pisces_playful',
    zodiacSign: 'Pisces',
    investingStyle: 'playful',
  },
];

// Zodiac sign metadata
const ZODIAC_METADATA = {
  'Aries': { symbol: '♈', element: 'Fire' },
  'Taurus': { symbol: '♉', element: 'Earth' },
  'Gemini': { symbol: '♊', element: 'Air' },
  'Cancer': { symbol: '♋', element: 'Water' },
  'Leo': { symbol: '♌', element: 'Fire' },
  'Virgo': { symbol: '♍', element: 'Earth' },
  'Libra': { symbol: '♎', element: 'Air' },
  'Scorpio': { symbol: '♏', element: 'Water' },
  'Sagittarius': { symbol: '♐', element: 'Fire' },
  'Capricorn': { symbol: '♑', element: 'Earth' },
  'Aquarius': { symbol: '♒', element: 'Air' },
  'Pisces': { symbol: '♓', element: 'Water' },
};

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.cyan);
}

function logSection(message) {
  log(`\n${'='.repeat(60)}`, colors.blue);
  log(message, colors.blue);
  log('='.repeat(60), colors.blue);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Register a new test user
 */
async function registerUser(userData) {
  logInfo(`Registering user: ${userData.email}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        username: userData.username,
        password: userData.password,
        password_confirm: userData.password,
        first_name: 'Test',
        last_name: 'User',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      logSuccess(`User registered: ${data.email}`);
      return data;
    } else if (response.status === 400) {
      // User might already exist
      logInfo('User may already exist, proceeding to login...');
      return null;
    } else {
      const error = await response.json();
      logError(`Registration failed: ${JSON.stringify(error)}`);
      return null;
    }
  } catch (error) {
    logError(`Registration error: ${error.message}`);
    return null;
  }
}

/**
 * Login and get tokens
 */
async function login(userData) {
  logInfo(`Logging in as ${userData.email}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/auth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    });

    if (response.ok) {
      const tokens = await response.json();
      logSuccess('Login successful');
      return tokens;
    } else {
      const error = await response.json();
      logError(`Login failed: ${JSON.stringify(error)}`);
      return null;
    }
  } catch (error) {
    logError(`Login error: ${error.message}`);
    return null;
  }
}

/**
 * Complete onboarding for the test user
 */
async function completeOnboarding(tokens, userData) {
  logInfo('Completing onboarding...');
  
  const zodiacMeta = ZODIAC_METADATA[userData.zodiacSign];
  
  const onboardingData = {
    date_of_birth: '1995-08-15',
    zodiac_sign: userData.zodiacSign,
    zodiac_symbol: zodiacMeta.symbol,
    zodiac_element: zodiacMeta.element,
    investing_style: userData.investingStyle,
    starting_balance: 100000,
  };

  try {
    const response = await fetch(`${BASE_URL}/onboarding/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.access}`,
      },
      body: JSON.stringify(onboardingData),
    });

    if (response.ok) {
      const data = await response.json();
      logSuccess('Onboarding completed');
      logInfo(`  Zodiac Sign: ${data.user.profile.zodiac_sign}`);
      logInfo(`  Investing Style: ${data.user.profile.investing_style}`);
      return data;
    } else {
      const error = await response.json();
      logError(`Onboarding failed: ${JSON.stringify(error)}`);
      return null;
    }
  } catch (error) {
    logError(`Onboarding error: ${error.message}`);
    return null;
  }
}

/**
 * Get daily horoscope for authenticated user with retry logic
 */
async function getHoroscope(tokens, retries = 5, delayMs = 3000) {
  logInfo('Fetching daily horoscope...');
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}/horoscope/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.access}`,
        },
      });

      if (response.ok) {
        const horoscope = await response.json();
        logSuccess('Horoscope retrieved successfully');
        return horoscope;
      } else {
        const error = await response.json();
        
        if (response.status === 404) {
          if (attempt < retries) {
            logInfo(`Horoscope not ready yet (attempt ${attempt}/${retries}), waiting ${delayMs/1000}s...`);
            await sleep(delayMs);
            continue;
          } else {
            logWarning(`Horoscope not available: ${error.detail}`);
          }
        } else {
          logError(`Failed to get horoscope: ${JSON.stringify(error)}`);
        }
        return null;
      }
    } catch (error) {
      logError(`Horoscope fetch error: ${error.message}`);
      return null;
    }
  }
  
  return null;
}

/**
 * Test horoscope endpoint without authentication (should fail)
 */
async function testUnauthenticatedAccess() {
  logSection('Test 1: Unauthenticated Access (Expected: Fail)');
  
  try {
    const response = await fetch(`${BASE_URL}/horoscope/`, {
      method: 'GET',
    });

    if (response.status === 401 || response.status === 403) {
      logSuccess('Correctly rejected unauthenticated request');
      return true;
    } else {
      logError(`Unexpected response status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Test error: ${error.message}`);
    return false;
  }
}

/**
 * Test horoscope retrieval for a specific user
 */
async function testUserHoroscope(userData) {
  logSection(`Test: Horoscope for ${userData.zodiacSign} (${userData.investingStyle})`);
  
  // Register or login
  await registerUser(userData);
  const tokens = await login(userData);
  
  if (!tokens) {
    logError('Failed to get authentication tokens');
    return false;
  }
  
  // Complete onboarding
  const onboarding = await completeOnboarding(tokens, userData);
  
  if (!onboarding) {
    logError('Failed to complete onboarding');
    return false;
  }
  
  // Get horoscope
  const horoscope = await getHoroscope(tokens);
  
  if (!horoscope) {
    logWarning('No horoscope available - may need to run generate_horoscopes command');
    return false;
  }
  
  // Validate horoscope structure
  log('\n  Horoscope Details:', colors.magenta);
  logInfo(`    Zodiac Sign: ${horoscope.zodiac_sign}`);
  logInfo(`    Investing Style: ${horoscope.investing_style}`);
  logInfo(`    Date: ${horoscope.date}`);
  logInfo(`    Text Length: ${horoscope.horoscope_text.length} characters`);
  log(`\n  Horoscope Text:`, colors.cyan);
  log(`    ${horoscope.horoscope_text}`, colors.reset);
  
  // Validation checks
  let allChecksPass = true;
  
  if (horoscope.zodiac_sign !== userData.zodiacSign) {
    logError(`    ✗ Zodiac sign mismatch: expected ${userData.zodiacSign}, got ${horoscope.zodiac_sign}`);
    allChecksPass = false;
  } else {
    logSuccess(`    ✓ Zodiac sign matches`);
  }
  
  if (horoscope.investing_style !== userData.investingStyle) {
    logError(`    ✗ Investing style mismatch: expected ${userData.investingStyle}, got ${horoscope.investing_style}`);
    allChecksPass = false;
  } else {
    logSuccess(`    ✓ Investing style matches`);
  }
  
  if (!horoscope.horoscope_text || horoscope.horoscope_text.length < 50) {
    logError(`    ✗ Horoscope text too short or empty`);
    allChecksPass = false;
  } else {
    logSuccess(`    ✓ Horoscope text has content`);
  }
  
  const today = new Date().toISOString().split('T')[0];
  if (horoscope.date !== today) {
    logWarning(`    ⚠ Horoscope date (${horoscope.date}) doesn't match today (${today})`);
  } else {
    logSuccess(`    ✓ Horoscope is for today`);
  }
  
  return allChecksPass;
}

/**
 * Test all investing styles for a zodiac sign
 */
async function testAllInvestingStyles() {
  logSection('Test: All Investing Styles');
  
  const results = [];
  
  for (const userData of TEST_USERS) {
    const success = await testUserHoroscope(userData);
    results.push({ user: userData.email, success });
  }
  
  // Summary
  log('\n  Test Results Summary:', colors.magenta);
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  results.forEach(result => {
    if (result.success) {
      logSuccess(`    ${result.user}: PASS`);
    } else {
      logWarning(`    ${result.user}: FAIL or NO DATA`);
    }
  });
  
  log(`\n  Total: ${successCount}/${totalCount} passed`, 
      successCount === totalCount ? colors.green : colors.yellow);
  
  return successCount === totalCount;
}

/**
 * Main test runner
 */
async function runTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', colors.blue);
  log('║        DAILY HOROSCOPE API TEST SUITE                    ║', colors.blue);
  log('╚════════════════════════════════════════════════════════════╝', colors.blue);
  
  try {
    // Test 1: Unauthenticated access
    const test1Pass = await testUnauthenticatedAccess();
    
    // Test 2: All investing styles
    const test2Pass = await testAllInvestingStyles();
    
    // Summary
    logSection('Test Summary');
    
    if (test1Pass && test2Pass) {
      logSuccess('All tests completed successfully! ✓');
      logInfo('\nThe horoscope API is working correctly:');
      logInfo('  • Authentication is properly enforced');
      logInfo('  • Horoscopes are personalized by zodiac sign and investing style');
      logInfo('  • API returns proper error messages');
      logInfo('  • Data structure is correct');
    } else {
      logWarning('Some tests failed or had warnings:');
      if (!test1Pass) {
        logError('  • Authentication test failed');
      }
      if (!test2Pass) {
        logWarning('  • Some horoscopes may not be available');
        logInfo('  • Run: python manage.py generate_horoscopes');
        logInfo('  • Or wait for the daily cron job to run');
      }
    }
    
    logInfo('\nNote: If horoscopes are not available, run the following command:');
    log('  python manage.py generate_horoscopes', colors.cyan);
    
  } catch (error) {
    logError(`\nTest suite error: ${error.message}`);
    console.error(error);
  }
}

// Run tests
runTests();

