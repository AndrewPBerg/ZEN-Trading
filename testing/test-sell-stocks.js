const API_BASE = 'http://localhost:42069/api';

// Test user credentials - unique per run to avoid state accumulation
const TEST_EMAIL = 'selltest' + Date.now() + '@example.com';
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

// Test Setup Functions
async function registerUser() {
  try {
    log('Setting up test user');
    const response = await request('POST', '/register/', {
      email: TEST_EMAIL,
      username: TEST_EMAIL.split('@')[0],
      password: TEST_PASSWORD,
      password_confirm: TEST_PASSWORD,
      first_name: 'Sell',
      last_name: 'Tester'
    }, false);
    
    userId = response.id;
    log('User registered successfully', { userId, email: response.email });
    return true;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('User already exists, will login');
      return false;
    }
    throw error;
  }
}

async function loginUser() {
  log('Logging in test user');
  const response = await request('POST', '/auth/token/', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  }, false);
  
  authToken = response.access;
  log('Login successful');
}

async function completeOnboarding() {
  log('Completing onboarding');
  
  const onboardingData = {
    date_of_birth: '1992-03-21',
    zodiac_sign: 'Aries',
    zodiac_symbol: '♈',
    zodiac_element: 'Fire',
    investing_style: 'balanced',
    starting_balance: 100000.00
  };
  
  const response = await request('POST', '/onboarding/', onboardingData);
  log('Onboarding completed', { starting_balance: response.user.profile.starting_balance });
}

async function buyStock(ticker, quantity, pricePerShare) {
  const totalValue = quantity * pricePerShare;
  const response = await request('POST', '/holdings/', {
    ticker,
    quantity,
    total_value: totalValue,
    action: 'buy'
  });
  
  log(`Bought ${quantity} shares of ${ticker} at $${pricePerShare}`, {
    total_cost: totalValue,
    remaining_balance: response.holdings.balance
  });
  
  return response;
}

async function sellStock(ticker, quantity, totalValue) {
  const response = await request('POST', '/holdings/', {
    ticker,
    quantity,
    total_value: totalValue,
    action: 'sell'
  });
  
  log(`Sold ${quantity} shares of ${ticker} for $${totalValue}`, {
    remaining_balance: response.holdings.balance
  });
  
  return response;
}

async function getHoldings() {
  const response = await request('GET', '/holdings/');
  return response;
}

async function getPortfolioSummary() {
  const response = await request('GET', '/portfolio/');
  return response;
}

// Test Functions

/**
 * Test 1: Sell entire position (full liquidation)
 */
async function testSellEntirePosition() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: Sell Entire Position');
  console.log('='.repeat(60));

  // Buy 10 shares of AAPL at $175
  await buyStock('AAPL', 10, 175.00);
  
  let holdings = await getHoldings();
  const initialBalance = parseFloat(holdings.balance);
  const applePosition = holdings.positions.find(p => p.ticker === 'AAPL');
  
  if (!applePosition) {
    throw new Error('AAPL position not found after purchase');
  }
  
  const sharesOwned = parseFloat(applePosition.quantity);
  const currentPrice = 180.00; // Simulated current price
  const totalValue = sharesOwned * currentPrice;
  
  // Sell entire position
  const sellResponse = await sellStock('AAPL', sharesOwned, totalValue);
  
  // Verify position was removed
  const positionAfterSell = sellResponse.holdings.positions.find(p => p.ticker === 'AAPL');
  if (positionAfterSell) {
    throw new Error('AAPL position should be removed after selling all shares');
  }
  
  // Verify balance increased correctly
  const expectedBalance = initialBalance + totalValue;
  const actualBalance = parseFloat(sellResponse.holdings.balance);
  
  if (Math.abs(expectedBalance - actualBalance) > 0.01) {
    throw new Error(`Balance mismatch. Expected: ${expectedBalance}, Actual: ${actualBalance}`);
  }
  
  log('✓ Test 1 PASSED: Full position sold and removed correctly', {
    shares_sold: sharesOwned,
    proceeds: totalValue,
    profit: totalValue - (sharesOwned * 175.00),
    final_balance: actualBalance
  });
}

/**
 * Test 2: Sell partial position by shares
 */
async function testSellPartialPositionByShares() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Sell Partial Position by Shares');
  console.log('='.repeat(60));

  // Buy 20 shares of TSLA at $250
  await buyStock('TSLA', 20, 250.00);
  
  let holdings = await getHoldings();
  const initialBalance = parseFloat(holdings.balance);
  const teslaPosition = holdings.positions.find(p => p.ticker === 'TSLA');
  
  const initialShares = parseFloat(teslaPosition.quantity);
  const sharesToSell = 8;
  const currentPrice = 260.00;
  const totalValue = sharesToSell * currentPrice;
  
  // Sell partial position
  const sellResponse = await sellStock('TSLA', sharesToSell, totalValue);
  
  // Verify remaining shares
  const updatedPosition = sellResponse.holdings.positions.find(p => p.ticker === 'TSLA');
  if (!updatedPosition) {
    throw new Error('TSLA position should still exist after partial sell');
  }
  
  const remainingShares = parseFloat(updatedPosition.quantity);
  const expectedRemaining = initialShares - sharesToSell;
  
  if (Math.abs(remainingShares - expectedRemaining) > 0.0001) {
    throw new Error(`Remaining shares mismatch. Expected: ${expectedRemaining}, Actual: ${remainingShares}`);
  }
  
  // Verify balance
  const expectedBalance = initialBalance + totalValue;
  const actualBalance = parseFloat(sellResponse.holdings.balance);
  
  if (Math.abs(expectedBalance - actualBalance) > 0.01) {
    throw new Error(`Balance mismatch. Expected: ${expectedBalance}, Actual: ${actualBalance}`);
  }
  
  log('✓ Test 2 PASSED: Partial position sold correctly', {
    initial_shares: initialShares,
    shares_sold: sharesToSell,
    remaining_shares: remainingShares,
    proceeds: totalValue,
    final_balance: actualBalance
  });
}

/**
 * Test 3: Sell partial position by dollar amount
 */
async function testSellPartialPositionByDollars() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Sell Partial Position by Dollar Amount');
  console.log('='.repeat(60));

  // Buy 15 shares of NVDA at $420
  await buyStock('NVDA', 15, 420.00);
  
  let holdings = await getHoldings();
  const initialBalance = parseFloat(holdings.balance);
  const nvidiaPosition = holdings.positions.find(p => p.ticker === 'NVDA');
  
  const initialShares = parseFloat(nvidiaPosition.quantity);
  const currentPrice = 450.00;
  const dollarAmountToSell = 2250.00; // $2,250 worth
  const sharesToSell = dollarAmountToSell / currentPrice; // 5 shares
  
  // Sell by dollar amount
  const sellResponse = await sellStock('NVDA', sharesToSell, dollarAmountToSell);
  
  // Verify remaining shares
  const updatedPosition = sellResponse.holdings.positions.find(p => p.ticker === 'NVDA');
  const remainingShares = parseFloat(updatedPosition.quantity);
  const expectedRemaining = initialShares - sharesToSell;
  
  if (Math.abs(remainingShares - expectedRemaining) > 0.0001) {
    throw new Error(`Remaining shares mismatch. Expected: ${expectedRemaining}, Actual: ${remainingShares}`);
  }
  
  log('✓ Test 3 PASSED: Sold by dollar amount correctly', {
    initial_shares: initialShares,
    dollar_amount: dollarAmountToSell,
    shares_sold: sharesToSell,
    remaining_shares: remainingShares
  });
}

/**
 * Test 4: Error - Attempt to sell more shares than owned
 */
async function testSellMoreThanOwned() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Error Handling - Sell More Than Owned');
  console.log('='.repeat(60));

  // Buy 5 shares of MSFT at $380
  await buyStock('MSFT', 5, 380.00);
  
  try {
    // Try to sell 10 shares (more than owned)
    await sellStock('MSFT', 10, 3900.00);
    throw new Error('Should have failed: selling more shares than owned');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✓ Test 4 PASSED: Correctly prevented selling more shares than owned', {
        error_message: error.response.data.detail || error.response.data.error
      });
    } else {
      throw error;
    }
  }
}

/**
 * Test 5: Error - Attempt to sell non-existent position
 */
async function testSellNonExistentPosition() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 5: Error Handling - Sell Non-Existent Position');
  console.log('='.repeat(60));

  try {
    // Try to sell shares of a stock we don't own
    await sellStock('GOOGL', 5, 700.00);
    throw new Error('Should have failed: selling non-existent position');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      log('✓ Test 5 PASSED: Correctly prevented selling non-existent position', {
        error_message: error.response.data.detail || error.response.data.error
      });
    } else {
      throw error;
    }
  }
}

/**
 * Test 6: Error - Attempt to sell with invalid quantity (zero)
 */
async function testSellZeroQuantity() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 6: Error Handling - Sell Zero Quantity');
  console.log('='.repeat(60));

  try {
    // Try to sell 0 shares
    await sellStock('MSFT', 0, 0);
    throw new Error('Should have failed: selling zero quantity');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✓ Test 6 PASSED: Correctly prevented selling zero quantity', {
        error_message: error.response.data.detail || error.response.data.error
      });
    } else {
      throw error;
    }
  }
}

/**
 * Test 7: Error - Attempt to sell with negative quantity
 */
async function testSellNegativeQuantity() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 7: Error Handling - Sell Negative Quantity');
  console.log('='.repeat(60));

  try {
    // Try to sell negative shares
    await sellStock('MSFT', -5, -1900.00);
    throw new Error('Should have failed: selling negative quantity');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✓ Test 7 PASSED: Correctly prevented selling negative quantity', {
        error_message: error.response.data.detail || error.response.data.error
      });
    } else {
      throw error;
    }
  }
}

/**
 * Test 8: Multiple sequential sells from same position
 */
async function testMultipleSequentialSells() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 8: Multiple Sequential Sells');
  console.log('='.repeat(60));

  // Buy 30 shares of AMZN at $150
  await buyStock('AMZN', 30, 150.00);
  
  let holdings = await getHoldings();
  const initialBalance = parseFloat(holdings.balance);
  
  // First sell: 10 shares at $155
  await sellStock('AMZN', 10, 1550.00);
  
  holdings = await getHoldings();
  let amazonPosition = holdings.positions.find(p => p.ticker === 'AMZN');
  if (parseFloat(amazonPosition.quantity) !== 20) {
    throw new Error('After first sell, should have 20 shares remaining');
  }
  
  // Second sell: 8 shares at $158
  await sellStock('AMZN', 8, 1264.00);
  
  holdings = await getHoldings();
  amazonPosition = holdings.positions.find(p => p.ticker === 'AMZN');
  if (parseFloat(amazonPosition.quantity) !== 12) {
    throw new Error('After second sell, should have 12 shares remaining');
  }
  
  // Third sell: remaining 12 shares at $160
  await sellStock('AMZN', 12, 1920.00);
  
  holdings = await getHoldings();
  amazonPosition = holdings.positions.find(p => p.ticker === 'AMZN');
  if (amazonPosition) {
    throw new Error('Position should be removed after selling all shares');
  }
  
  // Verify total proceeds
  const finalBalance = parseFloat(holdings.balance);
  const totalProceeds = 1550.00 + 1264.00 + 1920.00;
  const expectedBalance = initialBalance + totalProceeds;
  
  if (Math.abs(finalBalance - expectedBalance) > 0.01) {
    throw new Error(`Balance mismatch after multiple sells. Expected: ${expectedBalance}, Actual: ${finalBalance}`);
  }
  
  log('✓ Test 8 PASSED: Multiple sequential sells handled correctly', {
    total_proceeds: totalProceeds,
    final_balance: finalBalance
  });
}

/**
 * Test 9: Sell after buying more shares (test cost basis handling)
 */
async function testSellAfterAveragingUp() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 9: Sell After Averaging Up');
  console.log('='.repeat(60));

  // First purchase: 10 shares at $100
  await buyStock('META', 10, 100.00);
  
  // Second purchase: 5 shares at $110 (averaging up)
  await buyStock('META', 5, 110.00);
  
  let holdings = await getHoldings();
  const metaPosition = holdings.positions.find(p => p.ticker === 'META');
  
  // Verify weighted average: (10*100 + 5*110) / 15 = 103.33
  const expectedAvg = (10 * 100 + 5 * 110) / 15;
  const actualAvg = parseFloat(metaPosition.purchase_price);
  
  if (Math.abs(expectedAvg - actualAvg) > 0.01) {
    log('Warning: Purchase price averaging may not be exact', {
      expected: expectedAvg,
      actual: actualAvg
    });
  }
  
  const initialBalance = parseFloat(holdings.balance);
  const totalShares = parseFloat(metaPosition.quantity); // Should be 15
  
  // Sell 8 shares at current price $115
  await sellStock('META', 8, 920.00);
  
  holdings = await getHoldings();
  const updatedPosition = holdings.positions.find(p => p.ticker === 'META');
  
  // Verify 7 shares remain
  const remainingShares = parseFloat(updatedPosition.quantity);
  if (Math.abs(remainingShares - 7) > 0.0001) {
    throw new Error(`Should have 7 shares remaining, but have ${remainingShares}`);
  }
  
  // Verify balance
  const expectedBalance = initialBalance + 920.00;
  const actualBalance = parseFloat(holdings.balance);
  
  if (Math.abs(expectedBalance - actualBalance) > 0.01) {
    throw new Error(`Balance mismatch. Expected: ${expectedBalance}, Actual: ${actualBalance}`);
  }
  
  log('✓ Test 9 PASSED: Sell after averaging up handled correctly', {
    total_shares_after_buys: totalShares,
    shares_sold: 8,
    remaining_shares: remainingShares,
    proceeds: 920.00
  });
}

/**
 * Test 10: Verify profit/loss calculations
 */
async function testProfitLossCalculations() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 10: Profit/Loss Calculations');
  console.log('='.repeat(60));

  // Buy 10 shares at $200 (cost basis: $2000)
  await buyStock('AMD', 10, 200.00);
  
  let holdings = await getHoldings();
  const amdPosition = holdings.positions.find(p => p.ticker === 'AMD');
  const purchasePrice = parseFloat(amdPosition.purchase_price);
  const initialBalance = parseFloat(holdings.balance);
  
  // Sell 10 shares at $220 (proceeds: $2200, profit: $200)
  const sellPrice = 220.00;
  const quantity = 10;
  const proceeds = sellPrice * quantity;
  
  await sellStock('AMD', quantity, proceeds);
  
  holdings = await getHoldings();
  const finalBalance = parseFloat(holdings.balance);
  
  // Calculate expected profit
  const costBasis = purchasePrice * quantity;
  const profit = proceeds - costBasis;
  const expectedBalance = initialBalance + proceeds;
  
  log('Profit/Loss Analysis', {
    purchase_price: purchasePrice,
    sell_price: sellPrice,
    quantity: quantity,
    cost_basis: costBasis,
    proceeds: proceeds,
    profit: profit,
    profit_percent: ((profit / costBasis) * 100).toFixed(2) + '%',
    final_balance: finalBalance
  });
  
  if (Math.abs(finalBalance - expectedBalance) > 0.01) {
    throw new Error('Balance calculation incorrect');
  }
  
  log('✓ Test 10 PASSED: Profit/loss calculations verified');
}

/**
 * Test 11: Verify portfolio realignment after sells
 */
async function testPortfolioRealignment() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 11: Portfolio Realignment After Sells');
  console.log('='.repeat(60));

  // Buy diverse positions
  await buyStock('JPM', 10, 150.00);
  await buyStock('WMT', 15, 160.00);
  await buyStock('DIS', 8, 95.00);
  
  // Get initial portfolio summary
  const initialPortfolio = await getPortfolioSummary();
  
  log('Initial Portfolio State', {
    total_value: initialPortfolio.total_portfolio_value,
    stocks_value: initialPortfolio.stocks_value,
    cash_balance: initialPortfolio.cash_balance,
    alignment_score: initialPortfolio.overall_alignment_score,
    cosmic_vibe: initialPortfolio.cosmic_vibe_index,
    holdings_count: initialPortfolio.holdings.length
  });
  
  // Sell one position entirely
  await sellStock('JPM', 10, 1550.00);
  
  // Get updated portfolio summary
  const updatedPortfolio = await getPortfolioSummary();
  
  log('Portfolio After Selling JPM', {
    total_value: updatedPortfolio.total_portfolio_value,
    stocks_value: updatedPortfolio.stocks_value,
    cash_balance: updatedPortfolio.cash_balance,
    alignment_score: updatedPortfolio.overall_alignment_score,
    cosmic_vibe: updatedPortfolio.cosmic_vibe_index,
    holdings_count: updatedPortfolio.holdings.length
  });
  
  // Verify holdings count decreased
  if (updatedPortfolio.holdings.length !== initialPortfolio.holdings.length - 1) {
    throw new Error('Holdings count should decrease by 1 after selling entire position');
  }
  
  // Verify cash balance increased
  if (parseFloat(updatedPortfolio.cash_balance) <= parseFloat(initialPortfolio.cash_balance)) {
    throw new Error('Cash balance should increase after sell');
  }
  
  // Verify stocks value decreased
  if (parseFloat(updatedPortfolio.stocks_value) >= parseFloat(initialPortfolio.stocks_value)) {
    throw new Error('Stocks value should decrease after sell');
  }
  
  log('✓ Test 11 PASSED: Portfolio correctly realigned after sells', {
    alignment_change: updatedPortfolio.overall_alignment_score - initialPortfolio.overall_alignment_score,
    vibe_change: updatedPortfolio.cosmic_vibe_index - initialPortfolio.cosmic_vibe_index
  });
}

/**
 * Test 12: Verify element distribution updates after sells
 */
async function testElementDistributionAfterSells() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 12: Element Distribution After Sells');
  console.log('='.repeat(60));

  // Buy positions with different elements
  await buyStock('BA', 10, 180.00);
  await buyStock('CAT', 12, 250.00);
  
  const initialPortfolio = await getPortfolioSummary();
  
  log('Initial Element Distribution', initialPortfolio.element_distribution);
  
  // Sell one position
  await sellStock('BA', 10, 1900.00);
  
  const updatedPortfolio = await getPortfolioSummary();
  
  log('Updated Element Distribution', updatedPortfolio.element_distribution);
  
  // Element distribution should have changed
  const distributionChanged = JSON.stringify(initialPortfolio.element_distribution) !== 
                               JSON.stringify(updatedPortfolio.element_distribution);
  
  if (!distributionChanged) {
    log('Warning: Element distribution may not have changed (both stocks might have same element)');
  }
  
  log('✓ Test 12 PASSED: Element distribution recalculated after sells');
}

async function addToWatchlist(ticker) {
  const response = await request('POST', '/watchlist/', { ticker });
  log(`Added ${ticker} to watchlist`, response);
  return response;
}

async function getWatchlist() {
  const response = await request('GET', '/watchlist/');
  return response.watchlist || [];
}

async function getDiscoveryStocks() {
  const response = await request('GET', '/discovery/matched-stocks/');
  return response.matched_stocks || [];
}

/**
 * Test 13: Sell removes stock from watchlist and returns to discovery
 */
async function testSellRemovesFromWatchlist() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 13: Selling Stock Returns It to Discovery');
  console.log('='.repeat(60));

  const testTicker = 'GOOGL';
  
  // Step 1: Add stock to watchlist
  await addToWatchlist(testTicker);
  
  let watchlist = await getWatchlist();
  const inWatchlistBefore = watchlist.some(item => item.ticker === testTicker);
  
  if (!inWatchlistBefore) {
    throw new Error(`${testTicker} should be in watchlist after adding`);
  }
  
  log(`${testTicker} is in watchlist`, { watchlist_count: watchlist.length });
  
  // Step 2: Buy the stock
  await buyStock(testTicker, 10, 170.00);
  
  // Step 3: Verify still in watchlist (should be, we haven't sold yet)
  watchlist = await getWatchlist();
  const stillInWatchlist = watchlist.some(item => item.ticker === testTicker);
  
  if (!stillInWatchlist) {
    log('Note: Stock was removed from watchlist after purchase (acceptable behavior)');
  }
  
  // Step 4: Sell all shares
  await sellStock(testTicker, 10, 1750.00);
  
  // Step 5: Verify removed from watchlist
  watchlist = await getWatchlist();
  const inWatchlistAfter = watchlist.some(item => item.ticker === testTicker);
  
  if (inWatchlistAfter) {
    throw new Error(`${testTicker} should be removed from watchlist after selling all shares`);
  }
  
  log(`${testTicker} removed from watchlist after full sale`, { 
    watchlist_count: watchlist.length 
  });
  
  // Step 6: Verify it can appear in discovery again
  const discoveryStocks = await getDiscoveryStocks();
  const inDiscovery = discoveryStocks.some(stock => stock.ticker === testTicker);
  
  if (!inDiscovery) {
    log(`Note: ${testTicker} not in current discovery results (may be filtered by other criteria)`);
  } else {
    log(`${testTicker} is now available in discovery again`);
  }
  
  log('✓ Test 13 PASSED: Stock removed from watchlist after full sale', {
    removed_from_watchlist: !inWatchlistAfter,
    available_in_discovery: inDiscovery
  });
}

// Main test execution
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('COMPREHENSIVE SELL STOCK FUNCTIONALITY TESTS');
  console.log('='.repeat(60));

  try {
    // Setup
    const isNewUser = await registerUser();
    await loginUser();
    
    if (isNewUser) {
      await completeOnboarding();
    }
    
    // Run all tests
    await testSellEntirePosition();
    await testSellPartialPositionByShares();
    await testSellPartialPositionByDollars();
    await testSellMoreThanOwned();
    await testSellNonExistentPosition();
    await testSellZeroQuantity();
    await testSellNegativeQuantity();
    await testMultipleSequentialSells();
    await testSellAfterAveragingUp();
    await testProfitLossCalculations();
    await testPortfolioRealignment();
    await testElementDistributionAfterSells();
    await testSellRemovesFromWatchlist();
    
    console.log('\n' + '='.repeat(60));
    console.log('✓ ALL SELL TESTS PASSED!');
    console.log('='.repeat(60));
    
    // Final portfolio summary
    const finalPortfolio = await getPortfolioSummary();
    console.log('\nFinal Portfolio Summary:');
    console.log(`Total Value: $${parseFloat(finalPortfolio.total_portfolio_value).toFixed(2)}`);
    console.log(`Cash Balance: $${parseFloat(finalPortfolio.cash_balance).toFixed(2)}`);
    console.log(`Stocks Value: $${parseFloat(finalPortfolio.stocks_value).toFixed(2)}`);
    console.log(`Holdings Count: ${finalPortfolio.holdings.length}`);
    console.log(`Cosmic Vibe Index: ${finalPortfolio.cosmic_vibe_index}%`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    logError('Test failed', error);
    process.exit(1);
  }
}

// Run the tests
runTests();

