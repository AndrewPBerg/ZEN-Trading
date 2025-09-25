  // Test script for auth.ts functions
// Run with: node test-auth.js

const API_BASE_URL = 'http://localhost:42069/api'

// Test data
const testUser = {
  email: 'test' + Date.now() + '@example.com',
  username: 'testuser' + Date.now(),
  password: 'testpass123',
  password_confirm: 'testpass123',
  first_name: 'Test',
  last_name: 'User'
}

// Helper function to make requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        ...options.headers
      },
      ...options
    })
    
    const data = await response.json()
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
  
  console.log('✅ Login successful, tokens received')
  console.log('Access token:', data.access.substring(0, 20) + '...')
  console.log('Refresh token:', data.refresh.substring(0, 20) + '...')
  
  return { tokens: data, response }
}

async function testGetCurrentUser(tokens) {
  console.log('\n👤 Testing Get Current User...')
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/users/me/`, {
    headers: {
      'Authorization': `Bearer ${tokens.access}`
    }
  })
  
  if (error) {
    console.log('❌ Get current user failed:', error.message)
    return false
  }
  
  if (!response.ok) {
    console.log('❌ Get current user failed:', data)
    return false
  }
  
  console.log('✅ Get current user successful:', data)
  return true
}

async function testRefreshToken(tokens) {
  console.log('\n�� Testing Token Refresh...')
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/auth/token/refresh/`, {
    method: 'POST',
    body: JSON.stringify({ refresh: tokens.refresh })
  })
  
  if (error) {
    console.log('❌ Token refresh failed:', error.message)
    return false
  }
  
  if (!response.ok) {
    console.log('❌ Token refresh failed:', data)
    return false
  }
  
  console.log('✅ Token refresh successful')
  console.log('New access token:', data.access.substring(0, 20) + '...')
  return true
}

async function testInvalidLogin() {
  console.log('\n�� Testing Invalid Login...')
  const { response, data, error } = await makeRequest(`${API_BASE_URL}/auth/token/`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'invalid@example.com',
      password: 'wrongpassword'
    })
  })
  
  if (error) {
    console.log('❌ Invalid login test failed:', error.message)
    return false
  }
  
  if (response.ok) {
    console.log('❌ Invalid login should have failed but succeeded')
    return false
  }
  
  console.log('✅ Invalid login correctly rejected:', data)
  return true
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Auth API Tests...')
  console.log('Backend URL:', API_BASE_URL)
  
  // Test 1: Health check
  const healthOk = await testHealthCheck()
  if (!healthOk) {
    console.log('\n❌ Backend is not running. Please start it first.')
    return
  }
  
  // Test 2: Registration
  const registerOk = await testRegister()
  if (!registerOk) {
    console.log('\n❌ Registration failed. Stopping tests.')
    return
  }
  
  // Test 3: Login
  const loginResult = await testLogin()
  if (!loginResult) {
    console.log('\n❌ Login failed. Stopping tests.')
    return
  }
  
  // Test 4: Get current user
  await testGetCurrentUser(loginResult.tokens)
  
  // Test 5: Token refresh
  await testRefreshToken(loginResult.tokens)
  
  // Test 6: Invalid login
  await testInvalidLogin()
  
  console.log('\n�� All tests completed!')
}

// Run the tests
runTests().catch(console.error)