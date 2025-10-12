// Comprehensive test script for ZEN Trading API
// Tests: Registration → Login → Stock APIs → Onboarding → Holdings
// Run with: node test-complete-flow.js

const API_BASE_URL = 'http://localhost:42069/api'

// Test data
const testUser = {
  email: 'test' + Date.now() + '@example.com',
  username: 'testuser' + Date.now(),
  password: 'TestPass123!',
  password_confirm: 'TestPass123!',
  first_name: 'Test',
  last_name: 'User'
}

const onboardingData = {
  date_of_birth: '1990-05-15',
  zodiac_sign: 'Taurus',
  zodiac_symbol: '♉',
  zodiac_element: 'Earth',
  investing_style: 'balanced',
  starting_balance: 50000.00
}

// Test statistics
let stats = {
  total: 0,
  passed: 0,
  failed: 0
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
    
    let data
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }
    
    return { response, data }
  } catch (error) {
    return { error }
  }
}

// Test result helpers
function testStart(name) {
  stats.total++
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🧪 Test ${stats.total}: ${name}`)
  console.log('='.repeat(60))
}

function testPass(message, data = null) {
  stats.passed++
  console.log(`✅ PASS: ${message}`)
  if (data) {
    console.log('Response:', JSON.stringify(data, null, 2))
  }
}

function testFail(message, data = null) {
  stats.failed++
  console.log(`❌ FAIL: ${message}`)
  if (data) {
    console.log('Error:', JSON.stringify(data, null, 2))
  }
}

// Test functions
async function testHealthCheck() {
  testStart('Health Check')
  
  const { response, data, error } = await makeRequest('http://localhost:42069/health/')
  
  if (error) {
    testFail(`Health check failed: ${error.message}`)
    return false
  }
  
  if (!response.ok) {
    testFail('Health check returned non-OK status', data)
    return false
  }
  
  testPass('Backend is healthy', data)
  return true
}

async function testStockList() {
  testStart('Get Stock List')
  
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/stocks/`)
  
  if (error) {
    testFail(`Stock list request failed: ${error.message}`)
    return false
  }
  
  if (!response.ok) {
    testFail('Stock list returned non-OK status', data)
    return false
  }
  
  if (!Array.isArray(data)) {
    testFail('Stock list is not an array', data)
    return false
  }
  
  testPass(`Retrieved ${data.length} stocks`)
  
  // Show sample stock
  if (data.length > 0) {
    console.log('\nSample stock:', JSON.stringify(data[0], null, 2))
  }
  
  return true
}

async function testStockDetail() {
  testStart('Get Single Stock (AAPL)')
  
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/stocks/AAPL/`)
  
  if (error) {
    testFail(`Stock detail request failed: ${error.message}`)
    return false
  }
  
  if (!response.ok) {
    testFail('Stock detail returned non-OK status', data)
    return false
  }
  
  if (data.ticker !== 'AAPL') {
    testFail(`Expected ticker AAPL, got ${data.ticker}`, data)
    return false
  }
  
  testPass('Retrieved AAPL stock details', data)
  return true
}

async function testRegister() {
  testStart('User Registration')
  
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/register/`, {
    method: 'POST',
    body: JSON.stringify(testUser)
  })
  
  if (error) {
    testFail(`Registration failed: ${error.message}`)
    return false
  }
  
  if (!response.ok) {
    testFail('Registration returned non-OK status', data)
    return false
  }
  
  if (!data.email || !data.username) {
    testFail('Registration response missing required fields', data)
    return false
  }
  
  testPass(`User registered: ${data.email}`, { email: data.email, username: data.username })
  return true
}

async function testLogin() {
  testStart('User Login')
  
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/auth/token/`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password
    })
  })
  
  if (error) {
    testFail(`Login failed: ${error.message}`)
    return false
  }
  
  if (!response.ok) {
    testFail('Login returned non-OK status', data)
    return false
  }
  
  if (!data.access || !data.refresh) {
    testFail('Login response missing tokens', data)
    return false
  }
  
  testPass('Login successful, tokens received', {
    access: data.access.substring(0, 30) + '...',
    refresh: data.refresh.substring(0, 30) + '...'
  })
  
  return { tokens: data }
}

async function testGetCurrentUser(tokens) {
  testStart('Get Current User')
  
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/users/me/`, {
    headers: {
      'Authorization': `Bearer ${tokens.access}`
    }
  })
  
  if (error) {
    testFail(`Get current user failed: ${error.message}`)
    return false
  }
  
  if (!response.ok) {
    testFail('Get current user returned non-OK status', data)
    return false
  }
  
  testPass('Retrieved current user', {
    email: data.email,
    username: data.username,
    profile: data.profile
  })
  
  return true
}

async function testOnboarding(tokens) {
  testStart('Submit Onboarding Data')
  
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/onboarding/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens.access}`
    },
    body: JSON.stringify(onboardingData)
  })
  
  if (error) {
    testFail(`Onboarding failed: ${error.message}`)
    return false
  }
  
  if (!response.ok) {
    testFail('Onboarding returned non-OK status', data)
    return false
  }
  
  if (!data.user || !data.user.profile) {
    testFail('Onboarding response missing user/profile', data)
    return false
  }
  
  if (!data.user.profile.onboarding_completed) {
    testFail('Onboarding not marked as completed', data)
    return false
  }
  
  testPass('Onboarding completed successfully', {
    zodiac_sign: data.user.profile.zodiac_sign,
    investing_style: data.user.profile.investing_style,
    starting_balance: data.user.profile.starting_balance,
    onboarding_completed: data.user.profile.onboarding_completed
  })
  
  return true
}

async function testGetHoldings(tokens) {
  testStart('Get User Holdings')
  
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/holdings/`, {
    headers: {
      'Authorization': `Bearer ${tokens.access}`
    }
  })
  
  if (error) {
    testFail(`Get holdings failed: ${error.message}`)
    return false
  }
  
  if (!response.ok) {
    testFail('Get holdings returned non-OK status', data)
    return false
  }
  
  if (data.balance === undefined) {
    testFail('Holdings response missing balance', data)
    return false
  }
  
  // Check if balance matches starting balance
  const expectedBalance = parseFloat(onboardingData.starting_balance)
  const actualBalance = parseFloat(data.balance)
  
  if (Math.abs(expectedBalance - actualBalance) > 0.01) {
    testFail(`Balance mismatch: expected ${expectedBalance}, got ${actualBalance}`, data)
    return false
  }
  
  testPass('Retrieved user holdings', {
    balance: data.balance,
    positions: data.positions || []
  })
  
  return true
}

async function testVerifyOnboardingStatus(tokens) {
  testStart('Verify Onboarding Status')
  
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/onboarding/`, {
    headers: {
      'Authorization': `Bearer ${tokens.access}`
    }
  })
  
  if (error) {
    testFail(`Verify onboarding failed: ${error.message}`)
    return false
  }
  
  if (!response.ok) {
    testFail('Verify onboarding returned non-OK status', data)
    return false
  }
  
  if (!data.onboarding_completed) {
    testFail('Onboarding should be completed but is not', data)
    return false
  }
  
  testPass('Onboarding status verified', {
    onboarding_completed: data.onboarding_completed
  })
  
  return true
}

async function testBuyStock(tokens, ticker, quantity, pricePerShare) {
  testStart(`Buy Stock: ${ticker}`)
  
  const totalValue = quantity * pricePerShare
  
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/holdings/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokens.access}`
    },
    body: JSON.stringify({
      ticker,
      quantity,
      total_value: totalValue,
      action: 'buy'
    })
  })
  
  if (error) {
    testFail(`Buy stock failed: ${error.message}`)
    return false
  }
  
  if (!response.ok) {
    testFail('Buy stock returned non-OK status', data)
    return false
  }
  
  if (!data.holdings || !data.holdings.positions) {
    testFail('Buy stock response missing holdings data', data)
    return false
  }
  
  // Find the position
  const position = data.holdings.positions.find(p => p.ticker === ticker)
  if (!position) {
    testFail(`Position for ${ticker} not found after purchase`, data)
    return false
  }
  
  testPass(`Purchased ${quantity} shares of ${ticker}`, {
    ticker,
    quantity: position.quantity,
    total_value: position.total_value,
    remaining_balance: data.holdings.balance
  })
  
  return { holdings: data.holdings }
}

async function testSellStock(tokens, ticker, quantity, totalValue) {
  testStart(`Sell Stock: ${ticker}`)
  
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/holdings/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokens.access}`
    },
    body: JSON.stringify({
      ticker,
      quantity,
      total_value: totalValue,
      action: 'sell'
    })
  })
  
  if (error) {
    testFail(`Sell stock failed: ${error.message}`)
    return false
  }
  
  if (!response.ok) {
    testFail('Sell stock returned non-OK status', data)
    return false
  }
  
  if (!data.holdings) {
    testFail('Sell stock response missing holdings data', data)
    return false
  }
  
  // Calculate profit/loss
  const purchasePrice = totalValue / quantity
  const profit = totalValue - (quantity * purchasePrice)
  
  testPass(`Sold ${quantity} shares of ${ticker}`, {
    ticker,
    quantity,
    proceeds: totalValue,
    remaining_balance: data.holdings.balance,
    positions_count: data.holdings.positions.length
  })
  
  return { holdings: data.holdings }
}

async function testGetPortfolioSummary(tokens) {
  testStart('Get Portfolio Summary')
  
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/portfolio/`, {
    headers: {
      'Authorization': `Bearer ${tokens.access}`
    }
  })
  
  if (error) {
    testFail(`Get portfolio summary failed: ${error.message}`)
    return false
  }
  
  if (!response.ok) {
    testFail('Get portfolio summary returned non-OK status', data)
    return false
  }
  
  if (data.total_portfolio_value === undefined) {
    testFail('Portfolio summary missing total_portfolio_value', data)
    return false
  }
  
  testPass('Retrieved portfolio summary', {
    total_portfolio_value: data.total_portfolio_value,
    cash_balance: data.cash_balance,
    stocks_value: data.stocks_value,
    overall_alignment_score: data.overall_alignment_score,
    cosmic_vibe_index: data.cosmic_vibe_index,
    holdings_count: data.holdings ? data.holdings.length : 0
  })
  
  return { portfolio: data }
}

async function testCompleteBuySellCycle(tokens) {
  testStart('Complete Buy-Sell Cycle')
  
  // Step 1: Buy AAPL
  const buyResult = await testBuyStock(tokens, 'AAPL', 10, 175.00)
  if (!buyResult) {
    testFail('Buy phase failed')
    return false
  }
  
  const balanceAfterBuy = parseFloat(buyResult.holdings.balance)
  
  // Step 2: Hold and get portfolio summary
  const portfolioResult = await testGetPortfolioSummary(tokens)
  if (!portfolioResult) {
    testFail('Portfolio summary failed')
    return false
  }
  
  // Step 3: Sell partial position
  const sellResult = await testSellStock(tokens, 'AAPL', 5, 900.00)
  if (!sellResult) {
    testFail('Sell phase failed')
    return false
  }
  
  const balanceAfterSell = parseFloat(sellResult.holdings.balance)
  
  // Verify balance increased by sale proceeds
  const expectedIncrease = 900.00
  const actualIncrease = balanceAfterSell - balanceAfterBuy
  
  if (Math.abs(actualIncrease - expectedIncrease) > 0.01) {
    testFail(`Balance increase mismatch: expected ${expectedIncrease}, got ${actualIncrease}`)
    return false
  }
  
  // Step 4: Sell remaining shares
  const finalSellResult = await testSellStock(tokens, 'AAPL', 5, 920.00)
  if (!finalSellResult) {
    testFail('Final sell phase failed')
    return false
  }
  
  // Verify position was removed
  const applePosition = finalSellResult.holdings.positions.find(p => p.ticker === 'AAPL')
  if (applePosition) {
    testFail('AAPL position should be removed after selling all shares')
    return false
  }
  
  testPass('Complete buy-sell cycle successful', {
    balance_after_buy: balanceAfterBuy,
    balance_after_partial_sell: balanceAfterSell,
    balance_after_full_sell: finalSellResult.holdings.balance,
    total_proceeds: 900.00 + 920.00
  })
  
  return true
}

// Main test runner
async function runTests() {
  console.log('\n' + '█'.repeat(70))
  console.log('█' + ' '.repeat(68) + '█')
  console.log('█' + '  🚀 ZEN Trading - Comprehensive API Test Suite'.padEnd(68) + '█')
  console.log('█' + ' '.repeat(68) + '█')
  console.log('█'.repeat(70))
  console.log(`\nBackend URL: ${API_BASE_URL}`)
  console.log(`Test User: ${testUser.email}`)
  console.log(`Starting Balance: $${onboardingData.starting_balance}`)
  
  // Test 1: Health check
  const healthOk = await testHealthCheck()
  if (!healthOk) {
    console.log('\n❌ Backend is not running. Please start it first.')
    printSummary()
    return
  }
  
  // Test 2: Stock List
  await testStockList()
  
  // Test 3: Stock Detail
  await testStockDetail()
  
  // Test 4: Registration
  const registerOk = await testRegister()
  if (!registerOk) {
    console.log('\n❌ Registration failed. Stopping tests.')
    printSummary()
    return
  }
  
  // Test 5: Login
  const loginResult = await testLogin()
  if (!loginResult) {
    console.log('\n❌ Login failed. Stopping tests.')
    printSummary()
    return
  }
  
  const tokens = loginResult.tokens
  
  // Test 6: Get current user
  await testGetCurrentUser(tokens)
  
  // Test 7: Onboarding
  const onboardingOk = await testOnboarding(tokens)
  if (!onboardingOk) {
    console.log('\n⚠️  Onboarding failed. Continuing with remaining tests...')
  }
  
  // Test 8: Get Holdings
  await testGetHoldings(tokens)
  
  // Test 9: Verify onboarding status
  await testVerifyOnboardingStatus(tokens)
  
  // Test 10: Complete buy-sell cycle
  await testCompleteBuySellCycle(tokens)
  
  // Test 11: Final portfolio summary
  await testGetPortfolioSummary(tokens)
  
  printSummary()
}

function printSummary() {
  console.log('\n' + '█'.repeat(70))
  console.log('█' + ' '.repeat(68) + '█')
  console.log('█' + '  📊 Test Summary'.padEnd(68) + '█')
  console.log('█' + ' '.repeat(68) + '█')
  console.log('█'.repeat(70))
  
  console.log(`\nTotal Tests: ${stats.total}`)
  console.log(`✅ Passed: ${stats.passed}`)
  console.log(`❌ Failed: ${stats.failed}`)
  
  const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0
  console.log(`\n📈 Pass Rate: ${passRate}%`)
  
  if (stats.failed === 0) {
    console.log('\n🎉 All tests passed! System is working correctly.')
  } else {
    console.log(`\n⚠️  ${stats.failed} test(s) failed. Please review the errors above.`)
  }
  
  console.log('\n' + '█'.repeat(70) + '\n')
}

// Run the tests
runTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error)
  printSummary()
  process.exit(1)
})

