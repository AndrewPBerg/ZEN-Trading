/**
 * Test script for ZEN Trading Discovery Features
 * Tests: Zodiac Matching, Watchlist, Dislike List
 */

const API_BASE_URL = 'http://localhost:42069/api'

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function testStart(name) {
  log(`\n🧪 ${name}...`, colors.cyan)
}

function testPass(message, data = null) {
  log(`✅ ${message}`, colors.green)
  if (data) {
    console.log('   ', JSON.stringify(data, null, 2).split('\n').join('\n    '))
  }
}

function testFail(message, data = null) {
  log(`❌ ${message}`, colors.red)
  if (data) {
    console.log('   ', JSON.stringify(data, null, 2).split('\n').join('\n    '))
  }
}

function testInfo(message) {
  log(`ℹ️  ${message}`, colors.blue)
}

// Helper function to make requests
async function makeRequest(url, options = {}) {
  try {
    // Properly merge headers
    const { headers: optionsHeaders, ...restOptions } = options
    const mergedHeaders = {
      'Content-Type': 'application/json',
      ...optionsHeaders
    }
    
    const response = await fetch(url, {
      ...restOptions,
      headers: mergedHeaders
    })

    let data = null
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      try {
        data = await response.text()
      } catch (e) {
        // Response might not be text either
      }
    }

    return { response, data, error: null }
  } catch (error) {
    return { response: null, data: null, error }
  }
}

// Test 1: Health Check
async function testHealthCheck() {
  testStart('Backend Health Check')

  const { response, data, error } = await makeRequest(`${API_BASE_URL.replace('/api', '')}/health/`)

  if (error) {
    testFail(`Backend is not running: ${error.message}`)
    return false
  }

  if (response.ok && data?.status === 'ok') {
    testPass('Backend is healthy', data)
    return true
  }

  testFail('Backend health check failed', data)
  return false
}

// Test 2: User Registration
async function testUserRegistration() {
  testStart('User Registration')

  const timestamp = Date.now()
  const userData = {
    email: `testdiscovery${timestamp}@example.com`,
    username: `testdiscovery${timestamp}`,
    password: 'TestPassword123!',
    password_confirm: 'TestPassword123!',
    first_name: 'Test',
    last_name: 'Discovery',
  }

  const { response, data, error } = await makeRequest(`${API_BASE_URL}/register/`, {
    method: 'POST',
    body: JSON.stringify(userData),
  })

  if (error) {
    testFail(`Registration failed: ${error.message}`)
    return null
  }

  if (!response.ok) {
    testFail('Registration returned non-OK status', data)
    return null
  }

  testPass('User registered successfully', { email: data.email, username: data.username })
  return userData
}

// Test 3: User Login
async function testUserLogin(credentials) {
  testStart('User Login')

  const { response, data, error } = await makeRequest(`${API_BASE_URL}/auth/token/`, {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  })

  if (error) {
    testFail(`Login failed: ${error.message}`)
    return null
  }

  if (!response.ok) {
    testFail('Login returned non-OK status', data)
    return null
  }

  if (!data.access || !data.refresh) {
    testFail('Login response missing tokens', data)
    return null
  }

  testPass('Login successful', { access_token_length: data.access.length })
  return data
}

// Test 4: Complete Onboarding
async function testOnboarding(tokens) {
  testStart('User Onboarding')

  const onboardingData = {
    date_of_birth: '1995-08-15',
    zodiac_sign: 'Leo',
    zodiac_symbol: '♌',
    zodiac_element: 'Fire',
    investing_style: 'balanced',
    starting_balance: 75000,
  }

  const { response, data, error } = await makeRequest(`${API_BASE_URL}/onboarding/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.access}`,
    },
    body: JSON.stringify(onboardingData),
  })

  if (error) {
    testFail(`Onboarding failed: ${error.message}`)
    return false
  }

  if (!response.ok) {
    testFail('Onboarding returned non-OK status', data)
    return false
  }

  testPass('Onboarding completed', { zodiac_sign: data.user?.profile?.zodiac_sign })
  return true
}

// Test 5: Get Zodiac Matched Stocks
async function testZodiacMatchedStocks(tokens) {
  testStart('Get Zodiac Matched Stocks')

  const { response, data, error } = await makeRequest(`${API_BASE_URL}/zodiac/matched-stocks/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokens.access}`,
    },
  })

  if (error) {
    testFail(`Zodiac matched stocks request failed: ${error.message}`)
    return null
  }

  if (!response.ok) {
    testFail('Zodiac matched stocks returned non-OK status', data)
    return null
  }

  if (!data.matched_stocks || !Array.isArray(data.matched_stocks)) {
    testFail('Zodiac matched stocks response missing stocks array', data)
    return null
  }

  testPass(`Zodiac matched stocks retrieved: ${data.matched_stocks.length} stocks`, {
    user_sign: data.user_sign,
    user_element: data.user_element,
    total_matches: data.total_matches,
    first_3_stocks: data.matched_stocks.slice(0, 3).map(s => ({
      ticker: s.ticker,
      company_name: s.company_name,
      zodiac_sign: s.zodiac_sign,
      element: s.element,
      match_type: s.match_type,
      is_same_sign: s.is_same_sign,
      compatibility_score: s.compatibility_score,
    })),
  })
  return data.matched_stocks
}

// Test 6: Add Stock to Watchlist
async function testAddToWatchlist(tokens, ticker) {
  testStart(`Add ${ticker} to Watchlist`)

  const { response, data, error } = await makeRequest(`${API_BASE_URL}/watchlist/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.access}`,
    },
    body: JSON.stringify({ ticker }),
  })

  if (error) {
    testFail(`Add to watchlist failed: ${error.message}`)
    return false
  }

  if (!response.ok) {
    testFail('Add to watchlist returned non-OK status', data)
    return false
  }

  testPass(`Added ${ticker} to watchlist`, data)
  return true
}

// Test 7: Get Watchlist
async function testGetWatchlist(tokens) {
  testStart('Get Watchlist')

  const { response, data, error } = await makeRequest(`${API_BASE_URL}/watchlist/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokens.access}`,
    },
  })

  if (error) {
    testFail(`Get watchlist failed: ${error.message}`)
    return null
  }

  if (!response.ok) {
    testFail('Get watchlist returned non-OK status', data)
    return null
  }

  if (!data.watchlist || !Array.isArray(data.watchlist)) {
    testFail('Watchlist response missing watchlist array', data)
    return null
  }

  testPass(`Watchlist retrieved: ${data.watchlist.length} stocks`, data.watchlist)
  return data.watchlist
}

// Test 8: Add Stock to Dislike List
async function testAddToDislikeList(tokens, ticker) {
  testStart(`Add ${ticker} to Dislike List`)

  const { response, data, error } = await makeRequest(`${API_BASE_URL}/dislike-list/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.access}`,
    },
    body: JSON.stringify({ ticker }),
  })

  if (error) {
    testFail(`Add to dislike list failed: ${error.message}`)
    return false
  }

  if (!response.ok) {
    testFail('Add to dislike list returned non-OK status', data)
    return false
  }

  testPass(`Added ${ticker} to dislike list`, data)
  return true
}

// Test 9: Get Dislike List
async function testGetDislikeList(tokens) {
  testStart('Get Dislike List')

  const { response, data, error } = await makeRequest(`${API_BASE_URL}/dislike-list/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokens.access}`,
    },
  })

  if (error) {
    testFail(`Get dislike list failed: ${error.message}`)
    return null
  }

  if (!response.ok) {
    testFail('Get dislike list returned non-OK status', data)
    return null
  }

  if (!data.dislike_list || !Array.isArray(data.dislike_list)) {
    testFail('Dislike list response missing dislike_list array', data)
    return null
  }

  testPass(`Dislike list retrieved: ${data.dislike_list.length} stocks`, data.dislike_list)
  return data.dislike_list
}

// Test 10: Verify Disliked Stock Excluded from Matches
async function testDislikedStockExcluded(tokens, dislikedTicker) {
  testStart('Verify Disliked Stock Excluded from Matches')

  const { response, data, error } = await makeRequest(`${API_BASE_URL}/zodiac/matched-stocks/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokens.access}`,
    },
  })

  if (error || !response.ok || !data.matched_stocks) {
    testFail('Could not fetch matched stocks for verification')
    return false
  }

  const foundDisliked = data.matched_stocks.find(s => s.ticker === dislikedTicker)
  
  if (foundDisliked) {
    testFail(`Disliked stock ${dislikedTicker} still appears in matches!`, foundDisliked)
    return false
  }

  testPass(`Disliked stock ${dislikedTicker} correctly excluded from matches`)
  return true
}

// Test 11: Remove from Watchlist
async function testRemoveFromWatchlist(tokens, ticker) {
  testStart(`Remove ${ticker} from Watchlist`)

  const { response, data, error } = await makeRequest(`${API_BASE_URL}/watchlist/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${tokens.access}`,
    },
    body: JSON.stringify({ ticker }),
  })

  if (error) {
    testFail(`Remove from watchlist failed: ${error.message}`)
    return false
  }

  if (!response.ok) {
    testFail('Remove from watchlist returned non-OK status', data)
    return false
  }

  testPass(`Removed ${ticker} from watchlist`, data)
  return true
}

// Main test runner
async function runTests() {
  log('\n' + '='.repeat(60), colors.bright)
  log('  ZEN Trading Discovery Features Test Suite', colors.bright)
  log('='.repeat(60) + '\n', colors.bright)

  let passedTests = 0
  let totalTests = 0

  // Test 1: Health Check
  totalTests++
  if (!(await testHealthCheck())) {
    log('\n❌ Backend is not running. Cannot continue tests.', colors.red)
    process.exit(1)
  }
  passedTests++

  // Test 2-3: Registration and Login
  totalTests++
  const credentials = await testUserRegistration()
  if (!credentials) {
    log('\n❌ Cannot continue without user registration.', colors.red)
    process.exit(1)
  }
  passedTests++

  totalTests++
  const tokens = await testUserLogin(credentials)
  if (!tokens) {
    log('\n❌ Cannot continue without login tokens.', colors.red)
    process.exit(1)
  }
  passedTests++

  // Test 4: Onboarding
  totalTests++
  if (!(await testOnboarding(tokens))) {
    log('\n❌ Onboarding failed. Cannot test zodiac matching.', colors.red)
    process.exit(1)
  }
  passedTests++

  // Test 5: Get Zodiac Matched Stocks
  totalTests++
  const stocks = await testZodiacMatchedStocks(tokens)
  if (!stocks || stocks.length === 0) {
    testFail('No stocks returned. Ensure database is populated.')
    log('\n⚠️  Run: python manage.py populate_stocks', colors.yellow)
  } else {
    passedTests++
  }

  // Get test tickers
  const testTicker1 = stocks && stocks.length > 0 ? stocks[0].ticker : 'AAPL'
  const testTicker2 = stocks && stocks.length > 1 ? stocks[1].ticker : 'MSFT'

  // Test 6-7: Watchlist
  totalTests++
  if (await testAddToWatchlist(tokens, testTicker1)) {
    passedTests++
  }

  totalTests++
  const watchlist = await testGetWatchlist(tokens)
  if (watchlist) {
    passedTests++
  }

  // Test 8-9: Dislike List
  totalTests++
  if (await testAddToDislikeList(tokens, testTicker2)) {
    passedTests++
  }

  totalTests++
  const dislikeList = await testGetDislikeList(tokens)
  if (dislikeList) {
    passedTests++
  }

  // Test 10: Verify Exclusion
  totalTests++
  if (await testDislikedStockExcluded(tokens, testTicker2)) {
    passedTests++
  }

  // Test 11: Remove from Watchlist
  totalTests++
  if (await testRemoveFromWatchlist(tokens, testTicker1)) {
    passedTests++
  }

  // Final Summary
  log('\n' + '='.repeat(60), colors.bright)
  log('  Test Summary', colors.bright)
  log('='.repeat(60), colors.bright)
  log(`  Total Tests: ${totalTests}`)
  log(`  Passed: ${passedTests}`, colors.green)
  log(`  Failed: ${totalTests - passedTests}`, totalTests - passedTests > 0 ? colors.red : colors.reset)
  log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`, passedTests === totalTests ? colors.green : colors.yellow)
  log('='.repeat(60) + '\n', colors.bright)

  if (passedTests === totalTests) {
    log('✅ All tests passed!', colors.green)
    process.exit(0)
  } else {
    log('❌ Some tests failed.', colors.red)
    process.exit(1)
  }
}

// Run the tests
runTests().catch((error) => {
  log(`\n💥 Test suite crashed: ${error.message}`, colors.red)
  console.error(error)
  process.exit(1)
})

