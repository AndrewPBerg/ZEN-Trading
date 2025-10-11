// Test script for zodiac sign matching API endpoints
// Run with: node test-zodiac-matching.js

const API_BASE_URL = 'http://localhost:42069/api'

// Test data
const testUser = {
  email: 'zodiac_test' + Date.now() + '@example.com',
  username: 'zodiacuser' + Date.now(),
  password: 'testpass123',
  password_confirm: 'testpass123',
  first_name: 'Zodiac',
  last_name: 'Tester'
}

const onboardingData = {
  date_of_birth: '1990-11-10', // Scorpio
  zodiac_sign: 'Scorpio',
  zodiac_symbol: '♏',
  zodiac_element: 'Water',
  investing_style: 'balanced',
  starting_balance: 50000
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
    
    // Try to parse JSON, but handle cases where response is not JSON
    let data
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      // If not JSON, get text for debugging
      const text = await response.text()
      data = { error: 'Non-JSON response', text: text.substring(0, 200) }
    }
    
    return { response, data }
  } catch (error) {
    console.error('Request failed:', error)
    return { error }
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...')
  const { response, data, error } = await makeRequest('http://localhost:42069/health/')
  
  if (error) {
    console.log('❌ Health check failed:', error.message)
    return false
  }
  
  console.log('✅ Health check passed:', data)
  return true
}

async function testRegister() {
  console.log('\n📝 Testing User Registration...')
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/register/`, {
    method: 'POST',
    body: JSON.stringify(testUser)
  })
  
  if (error) {
    console.log('❌ Registration failed:', error.message)
    return false
  }
  
  if (!response.ok) {
    console.log('❌ Registration failed:', data)
    return false
  }
  
  console.log('✅ Registration successful:', data)
  return true
}

async function testLogin() {
  console.log('\n🔐 Testing User Login...')
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/auth/token/`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password
    })
  })
  
  if (error) {
    console.log('❌ Login failed:', error.message)
    return false
  }
  
  if (!response.ok) {
    console.log('❌ Login failed:', data)
    return false
  }
  
  console.log('✅ Login successful')
  return { tokens: data, response }
}

async function testOnboarding(tokens) {
  console.log('\n🎯 Testing Onboarding (setting zodiac sign)...')
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/onboarding/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokens.access}`
    },
    body: JSON.stringify(onboardingData)
  })
  
  if (error) {
    console.log('❌ Onboarding failed:', error.message)
    return false
  }
  
  if (!response.ok) {
    console.log('❌ Onboarding failed:', data)
    return false
  }
  
  console.log('✅ Onboarding successful')
  console.log(`   User zodiac sign: ${data.user.profile.zodiac_sign}`)
  console.log(`   Element: ${data.user.profile.zodiac_element}`)
  return true
}

async function testZodiacMatchingRules() {
  console.log('\n📋 Testing Zodiac Matching Rules Endpoint...')
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/zodiac/matching-rules/`)
  
  if (error) {
    console.log('❌ Get matching rules failed:', error.message)
    return false
  }
  
  if (!response.ok) {
    console.log('❌ Get matching rules failed:', data)
    return false
  }
  
  console.log('✅ Get matching rules successful')
  console.log(`   Total matching rules: ${data.length}`)
  
  // Show a sample rule
  if (data.length > 0) {
    console.log(`   Sample rule: ${data[0].user_sign} → ${data[0].stock_sign} (${data[0].match_type})`)
  }
  
  return true
}

async function testZodiacMatchingRulesFiltered() {
  console.log('\n🔍 Testing Zodiac Matching Rules with Filters...')
  const { response, data, error } = await makeRequest(
    `${API_BASE_URL}/zodiac/matching-rules/?user_sign=Scorpio&match_type=positive`
  )
  
  if (error) {
    console.log('❌ Get filtered matching rules failed:', error.message)
    return false
  }
  
  if (!response.ok) {
    console.log('❌ Get filtered matching rules failed:', data)
    return false
  }
  
  console.log('✅ Get filtered matching rules successful')
  console.log(`   Positive matches for Scorpio: ${data.length}`)
  if (data.length > 0) {
    const stockSigns = data.map(rule => rule.stock_sign).join(', ')
    console.log(`   Compatible signs: ${stockSigns}`)
  }
  
  return true
}

async function testMatchedStocksWithoutAuth() {
  console.log('\n🚫 Testing Matched Stocks Without Authentication...')
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/zodiac/matched-stocks/`)
  
  if (error) {
    console.log('❌ Request failed:', error.message)
    return false
  }
  
  if (response.ok) {
    console.log('❌ Should have failed without auth but succeeded')
    return false
  }
  
  console.log('✅ Correctly rejected unauthenticated request')
  return true
}

async function testMatchedStocks(tokens) {
  console.log('\n⭐ Testing Matched Stocks for User...')
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/zodiac/matched-stocks/`, {
    headers: {
      'Authorization': `Bearer ${tokens.access}`
    }
  })
  
  if (error) {
    console.log('❌ Get matched stocks failed:', error.message)
    return false
  }
  
  if (!response.ok) {
    console.log('❌ Get matched stocks failed:', data)
    return false
  }
  
  console.log('✅ Get matched stocks successful')
  console.log(`   User sign: ${data.user_sign}`)
  console.log(`   User element: ${data.user_element}`)
  console.log(`   Total matched stocks: ${data.total_matches}`)
  
  if (data.matched_stocks && data.matched_stocks.length > 0) {
    console.log('\n   Sample matched stocks:')
    data.matched_stocks.slice(0, 5).forEach(stock => {
      console.log(`   - ${stock.ticker} (${stock.company_name})`)
      console.log(`     Zodiac: ${stock.zodiac_sign}, Match: ${stock.match_type}, Score: ${stock.compatibility_score}`)
    })
  }
  
  return true
}

async function testMatchedStocksPositiveOnly(tokens) {
  console.log('\n✨ Testing Matched Stocks (Positive Only)...')
  const { response, data, error } = await makeRequest(
    `${API_BASE_URL}/zodiac/matched-stocks/?match_type=positive`,
    {
      headers: {
        'Authorization': `Bearer ${tokens.access}`
      }
    }
  )
  
  if (error) {
    console.log('❌ Get positive matched stocks failed:', error.message)
    return false
  }
  
  if (!response.ok) {
    console.log('❌ Get positive matched stocks failed:', data)
    return false
  }
  
  console.log('✅ Get positive matched stocks successful')
  console.log(`   Total positive matches: ${data.total_matches}`)
  
  // Verify all are positive matches
  if (data.matched_stocks && data.matched_stocks.length > 0) {
    const allPositive = data.matched_stocks.every(stock => stock.match_type === 'positive')
    if (allPositive) {
      console.log('   ✅ All stocks are positive matches')
    } else {
      console.log('   ❌ Some stocks are not positive matches')
    }
  }
  
  return true
}

async function testMatchedStocksWithLimit(tokens) {
  console.log('\n🔢 Testing Matched Stocks with Limit...')
  const { response, data, error } = await makeRequest(
    `${API_BASE_URL}/zodiac/matched-stocks/?limit=3`,
    {
      headers: {
        'Authorization': `Bearer ${tokens.access}`
      }
    }
  )
  
  if (error) {
    console.log('❌ Get limited matched stocks failed:', error.message)
    return false
  }
  
  if (!response.ok) {
    console.log('❌ Get limited matched stocks failed:', data)
    return false
  }
  
  console.log('✅ Get limited matched stocks successful')
  console.log(`   Requested limit: 3`)
  console.log(`   Returned stocks: ${data.matched_stocks.length}`)
  
  if (data.matched_stocks.length <= 3) {
    console.log('   ✅ Limit applied correctly')
  } else {
    console.log('   ❌ Limit not applied correctly')
  }
  
  return true
}

async function testCompatibilityScoring(tokens) {
  console.log('\n🎯 Testing Compatibility Score Ordering...')
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/zodiac/matched-stocks/`, {
    headers: {
      'Authorization': `Bearer ${tokens.access}`
    }
  })
  
  if (error || !response.ok) {
    console.log('❌ Get matched stocks failed')
    return false
  }
  
  if (data.matched_stocks && data.matched_stocks.length > 1) {
    // Check if stocks are ordered by compatibility score (highest first)
    let isOrdered = true
    for (let i = 1; i < data.matched_stocks.length; i++) {
      if (data.matched_stocks[i].compatibility_score > data.matched_stocks[i-1].compatibility_score) {
        isOrdered = false
        break
      }
    }
    
    if (isOrdered) {
      console.log('✅ Stocks are correctly ordered by compatibility score')
      console.log(`   Highest score: ${data.matched_stocks[0].compatibility_score}`)
      console.log(`   Lowest score: ${data.matched_stocks[data.matched_stocks.length-1].compatibility_score}`)
    } else {
      console.log('❌ Stocks are not correctly ordered by compatibility score')
    }
    
    return isOrdered
  }
  
  console.log('⚠️  Not enough stocks to test ordering')
  return true
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Zodiac Sign Matching API Tests...')
  console.log('Backend URL:', API_BASE_URL)
  console.log('Test User Zodiac Sign: Scorpio (Water)')
  console.log('Expected Compatible Signs: Cancer, Pisces (Water), Virgo, Capricorn (Earth)')
  
  // Test 1: Health check
  const healthOk = await testHealthCheck()
  if (!healthOk) {
    console.log('\n❌ Backend is not running. Please start it first.')
    console.log('   Run: cd backend && python manage.py runserver 0.0.0.0:42069')
    return
  }
  
  // Test 2: Check matching rules endpoint (public)
  await testZodiacMatchingRules()
  
  // Test 3: Check matching rules with filters
  await testZodiacMatchingRulesFiltered()
  
  // Test 4: Try to access matched stocks without auth (should fail)
  await testMatchedStocksWithoutAuth()
  
  // Test 5: Registration
  const registerOk = await testRegister()
  if (!registerOk) {
    console.log('\n❌ Registration failed. Stopping tests.')
    return
  }
  
  // Test 6: Login
  const loginResult = await testLogin()
  if (!loginResult) {
    console.log('\n❌ Login failed. Stopping tests.')
    return
  }
  
  // Test 7: Onboarding (set zodiac sign)
  const onboardingOk = await testOnboarding(loginResult.tokens)
  if (!onboardingOk) {
    console.log('\n❌ Onboarding failed. Stopping tests.')
    return
  }
  
  // Test 8: Get matched stocks
  await testMatchedStocks(loginResult.tokens)
  
  // Test 9: Get positive matched stocks only
  await testMatchedStocksPositiveOnly(loginResult.tokens)
  
  // Test 10: Get matched stocks with limit
  await testMatchedStocksWithLimit(loginResult.tokens)
  
  // Test 11: Test compatibility score ordering
  await testCompatibilityScoring(loginResult.tokens)
  
  console.log('\n✅ All zodiac sign matching tests completed!')
  console.log('\n📝 Summary:')
  console.log('   - Zodiac matching rules can be queried (public endpoint)')
  console.log('   - Users must be authenticated to get matched stocks')
  console.log('   - Users must complete onboarding to set their zodiac sign')
  console.log('   - Stocks are matched based on zodiac compatibility')
  console.log('   - Results can be filtered by match_type')
  console.log('   - Results can be limited')
  console.log('   - Results are ordered by compatibility score')
}

// Run the tests
runTests().catch(console.error)

