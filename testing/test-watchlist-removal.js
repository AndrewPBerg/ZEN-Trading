const API_BASE = 'http://localhost:42069/api';

const TEST_EMAIL = 'watchlisttest' + Date.now() + '@example.com';
const TEST_PASSWORD = 'testPassword123!';

let authToken = null;

async function request(method, path, data = null, auth = true) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json' };

  if (auth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  const response = await fetch(url, options);
  const text = await response.text();
  
  let responseData;
  try {
    responseData = text ? JSON.parse(text) : null;
  } catch (e) {
    responseData = text;
  }

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.response = { status: response.status, data: responseData };
    throw error;
  }

  return responseData;
}

async function runTest() {
  console.log('\n=== Watchlist Removal Test ===\n');
  
  // Register and login
  await request('POST', '/register/', {
    email: TEST_EMAIL,
    username: TEST_EMAIL.split('@')[0],
    password: TEST_PASSWORD,
    password_confirm: TEST_PASSWORD,
    first_name: 'Test',
    last_name: 'User'
  }, false);
  
  const loginResponse = await request('POST', '/auth/token/', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  }, false);
  
  authToken = loginResponse.access;
  console.log('✓ Logged in');
  
  // Complete onboarding
  await request('POST', '/onboarding/', {
    date_of_birth: '1990-01-01',
    zodiac_sign: 'Capricorn',
    zodiac_symbol: '♑',
    zodiac_element: 'Earth',
    investing_style: 'balanced',
    starting_balance: 50000.00
  });
  console.log('✓ Onboarding complete');
  
  // Add GOOGL to watchlist
  await request('POST', '/watchlist/', { ticker: 'GOOGL' });
  console.log('✓ Added GOOGL to watchlist');
  
  // Check watchlist
  let watchlist = await request('GET', '/watchlist/');
  console.log('Watchlist before buy:', watchlist.watchlist.map(w => w.ticker));
  
  // Buy 10 shares
  await request('POST', '/holdings/', {
    ticker: 'GOOGL',
    quantity: 10,
    total_value: 1700,
    action: 'buy'
  });
  console.log('✓ Bought 10 shares of GOOGL');
  
  // Check watchlist again
  watchlist = await request('GET', '/watchlist/');
  console.log('Watchlist after buy:', watchlist.watchlist.map(w => w.ticker));
  
  // Sell all 10 shares
  await request('POST', '/holdings/', {
    ticker: 'GOOGL',
    quantity: 10,
    total_value: 1750,
    action: 'sell'
  });
  console.log('✓ Sold 10 shares of GOOGL');
  
  // Check watchlist final
  watchlist = await request('GET', '/watchlist/');
  console.log('Watchlist after sell:', watchlist.watchlist.map(w => w.ticker));
  
  const inWatchlistAfter = watchlist.watchlist.some(w => w.ticker === 'GOOGL');
  
  if (inWatchlistAfter) {
    console.log('\n❌ FAILED: GOOGL still in watchlist after selling all shares');
    process.exit(1);
  } else {
    console.log('\n✅ PASSED: GOOGL removed from watchlist after selling all shares');
    process.exit(0);
  }
}

runTest().catch(error => {
  console.error('\n❌ Test crashed:', error.message);
  if (error.response) {
    console.error('Response:', error.response.data);
  }
  process.exit(1);
});

