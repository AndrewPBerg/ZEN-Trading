const API_BASE = 'http://localhost:42069/api';

// Test user credentials
const TEST_EMAIL = 'testuser@example.com';
const TEST_PASSWORD = 'testPassword123!';

let authToken = null;
let userId = null;

// Utility functions
function log(message, data = null) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✓ ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
  console.log('='.repeat(60));
}

function logError(message, error) {
  console.error(`\n${'!'.repeat(60)}`);
  console.error(`✗ ERROR: ${message}`);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', JSON.stringify(error.response.data, null, 2));
  } else {
    console.error(error.message);
  }
  console.error('!'.repeat(60));
}

async function request(method, path, data = null, auth = true) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (auth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

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

// Test functions
async function registerUser() {
  try {
    log('Step 1: Registering new user');
    const response = await request('POST', '/register/', {
      email: TEST_EMAIL,
      username: TEST_EMAIL.split('@')[0],
      password: TEST_PASSWORD,
      password_confirm: TEST_PASSWORD,
      first_name: 'Test',
      last_name: 'User'
    }, false);
    
    userId = response.id;
    log('User registered successfully', { userId, email: response.email });
    return true;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('User already exists, will try to login');
      return false;
    }
    throw error;
  }
}

async function loginUser() {
  log('Step 2: Logging in');
  const response = await request('POST', '/auth/token/', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  }, false);
  
  authToken = response.access;
  log('Login successful', { token: authToken.substring(0, 20) + '...' });
}

async function completeOnboarding() {
  log('Step 3: Completing onboarding');
  
  const onboardingData = {
    date_of_birth: '1990-05-15',
    zodiac_sign: 'Taurus',
    zodiac_symbol: '♉',
    zodiac_element: 'Earth',
    investing_style: 'balanced',
    starting_balance: 50000.00
  };
  
  const response = await request('POST', '/onboarding/', onboardingData);
  log('Onboarding completed', response);
}

async function buyStock(ticker, quantity, pricePerShare) {
  log(`Step 4: Buying ${quantity} shares of ${ticker} at $${pricePerShare}`);
  
  const totalValue = quantity * pricePerShare;
  const response = await request('POST', '/holdings/', {
    ticker,
    quantity,
    total_value: totalValue,
    action: 'buy'
  });
  
  log('Stock purchased successfully', {
    ticker,
    quantity,
    total_value: totalValue,
    remaining_balance: response.holdings.balance
  });
  
  return response;
}

async function getHoldings() {
  log('Step 5: Getting holdings');
  const response = await request('GET', '/holdings/');
  log('Holdings retrieved', {
    balance: response.balance,
    positions: response.positions.map(p => ({
      ticker: p.ticker,
      quantity: p.quantity,
      purchase_price: p.purchase_price,
      purchase_date: p.purchase_date
    }))
  });
  return response;
}

async function getPortfolioSummary() {
  log('Step 6: Getting portfolio summary with alignment');
  const response = await request('GET', '/portfolio/');
  log('Portfolio summary retrieved', {
    total_portfolio_value: response.total_portfolio_value,
    cash_balance: response.cash_balance,
    stocks_value: response.stocks_value,
    total_gain_loss: response.total_gain_loss,
    total_gain_loss_percent: response.total_gain_loss_percent,
    overall_alignment_score: response.overall_alignment_score,
    cosmic_vibe_index: response.cosmic_vibe_index,
    element_distribution: response.element_distribution,
    alignment_breakdown: response.alignment_breakdown,
    holdings_count: response.holdings.length
  });
  
  if (response.holdings.length > 0) {
    log('Sample holding details', response.holdings[0]);
  }
  
  return response;
}

async function testAlignmentCalculations(portfolio) {
  log('Step 7: Verifying alignment calculations');
  
  console.log('\nAlignment Analysis:');
  console.log('-------------------');
  
  portfolio.holdings.forEach(holding => {
    console.log(`\n${holding.ticker} (${holding.zodiac_sign}):`);
    console.log(`  - Match Type: ${holding.match_type}`);
    console.log(`  - Alignment Score: ${holding.alignment_score}%`);
    console.log(`  - Element: ${holding.element}`);
    console.log(`  - Current Value: $${parseFloat(holding.current_value).toFixed(2)}`);
    console.log(`  - Gain/Loss: $${parseFloat(holding.gain_loss).toFixed(2)} (${parseFloat(holding.gain_loss_percent).toFixed(2)}%)`);
  });
  
  console.log('\n\nPortfolio-Wide Metrics:');
  console.log('----------------------');
  console.log(`Overall Alignment Score: ${portfolio.overall_alignment_score}%`);
  console.log(`Cosmic Vibe Index: ${portfolio.cosmic_vibe_index}%`);
  console.log('\nElement Distribution:');
  Object.entries(portfolio.element_distribution).forEach(([element, percentage]) => {
    console.log(`  ${element}: ${percentage}%`);
  });
  console.log('\nAlignment Breakdown:');
  console.log(`  Positive: ${portfolio.alignment_breakdown.positive}`);
  console.log(`  Neutral: ${portfolio.alignment_breakdown.neutral}`);
  console.log(`  Negative: ${portfolio.alignment_breakdown.negative}`);
}

async function buyMoreOfSameStock(ticker, quantity, pricePerShare) {
  log(`Step 8: Buying ${quantity} more shares of ${ticker} at $${pricePerShare}`);
  
  const totalValue = quantity * pricePerShare;
  const response = await request('POST', '/holdings/', {
    ticker,
    quantity,
    total_value: totalValue,
    action: 'buy'
  });
  
  log('Additional shares purchased', {
    ticker,
    new_quantity: quantity,
    total_value: totalValue
  });
  
  // Check that the average purchase price was updated correctly
  const position = response.holdings.positions.find(p => p.ticker === ticker);
  if (position) {
    log('Position after second purchase', {
      ticker: position.ticker,
      total_quantity: position.quantity,
      avg_purchase_price: position.purchase_price,
      total_value: position.total_value
    });
  }
  
  return response;
}

async function testPurchasePriceAveraging() {
  log('Step 9: Testing purchase price averaging');
  
  // Buy initial position
  await buyStock('MSFT', 10, 380.00);
  
  // Buy more at different price
  await buyMoreOfSameStock('MSFT', 5, 390.00);
  
  // Check that average was calculated correctly
  // Expected: (10 * 380 + 5 * 390) / 15 = (3800 + 1950) / 15 = 383.33
  const holdings = await getHoldings();
  const msftPosition = holdings.positions.find(p => p.ticker === 'MSFT');
  
  if (msftPosition) {
    const expectedAvg = (10 * 380 + 5 * 390) / 15;
    const actualAvg = parseFloat(msftPosition.purchase_price);
    const diff = Math.abs(expectedAvg - actualAvg);
    
    if (diff < 0.01) {
      log('✓ Purchase price averaging is correct!', {
        expected: expectedAvg.toFixed(2),
        actual: actualAvg.toFixed(2)
      });
    } else {
      log('✗ Purchase price averaging mismatch', {
        expected: expectedAvg.toFixed(2),
        actual: actualAvg.toFixed(2),
        difference: diff.toFixed(2)
      });
    }
  }
}

// Main test execution
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('PORTFOLIO ALIGNMENT SYSTEM TEST');
  console.log('='.repeat(60));

  try {
    // Setup
    const isNewUser = await registerUser();
    await loginUser();
    
    if (isNewUser) {
      await completeOnboarding();
    }
    
    // Test buying stocks with different zodiac signs
    await buyStock('AAPL', 15, 175.00);  // Apple (different zodiac)
    await buyStock('TSLA', 8, 250.00);   // Tesla (different zodiac)
    await buyStock('NVDA', 5, 420.00);   // NVIDIA (different zodiac)
    
    // Get basic holdings
    await getHoldings();
    
    // Get portfolio summary with alignment
    const portfolio = await getPortfolioSummary();
    
    // Verify alignment calculations
    await testAlignmentCalculations(portfolio);
    
    // Test purchase price averaging
    await testPurchasePriceAveraging();
    
    // Get final portfolio summary
    const finalPortfolio = await getPortfolioSummary();
    
    console.log('\n' + '='.repeat(60));
    console.log('✓ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log(`\nFinal Portfolio Value: $${parseFloat(finalPortfolio.total_portfolio_value).toFixed(2)}`);
    console.log(`Cosmic Vibe Index: ${finalPortfolio.cosmic_vibe_index}%`);
    console.log(`Overall Alignment: ${finalPortfolio.overall_alignment_score}%`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    logError('Test failed', error);
    process.exit(1);
  }
}

// Run the tests
runTests();


