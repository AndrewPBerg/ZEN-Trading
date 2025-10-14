// Loop Test Runner for Sell Stock Functionality
// Runs sell tests multiple times to verify stability and catch intermittent issues

const { spawn } = require('child_process');

// Configuration
const TEST_FILE = 'test-sell-stocks.js';
const ITERATIONS = 5; // Number of times to run the test
const DELAY_BETWEEN_RUNS = 2000; // 2 seconds delay between runs

// Statistics
const stats = {
  totalRuns: 0,
  successful: 0,
  failed: 0,
  failureDetails: []
};

function printHeader() {
  console.log('\n' + '='.repeat(70));
  console.log('🔄 LOOP TEST RUNNER - Sell Stock Functionality');
  console.log('='.repeat(70));
  console.log(`Test File: ${TEST_FILE}`);
  console.log(`Iterations: ${ITERATIONS}`);
  console.log(`Delay Between Runs: ${DELAY_BETWEEN_RUNS}ms`);
  console.log('='.repeat(70) + '\n');
}

function printProgress(iteration) {
  console.log('\n' + '▶'.repeat(70));
  console.log(`🧪 Running Test Iteration ${iteration}/${ITERATIONS}`);
  console.log('▶'.repeat(70) + '\n');
}

function printSummary() {
  console.log('\n' + '█'.repeat(70));
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█' + '  📊 LOOP TEST SUMMARY'.padEnd(68) + '█');
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█'.repeat(70));
  
  console.log(`\nTotal Runs: ${stats.totalRuns}`);
  console.log(`✅ Successful: ${stats.successful}`);
  console.log(`❌ Failed: ${stats.failed}`);
  
  const successRate = stats.totalRuns > 0 
    ? ((stats.successful / stats.totalRuns) * 100).toFixed(1) 
    : 0;
  
  console.log(`\n📈 Success Rate: ${successRate}%`);
  
  if (stats.failed === 0) {
    console.log('\n🎉 All test iterations passed! Implementation is stable.');
  } else {
    console.log(`\n⚠️  ${stats.failed} iteration(s) failed. Review failures below:\n`);
    stats.failureDetails.forEach((detail, index) => {
      console.log(`Failure ${index + 1}:`);
      console.log(`  Iteration: ${detail.iteration}`);
      console.log(`  Exit Code: ${detail.exitCode}`);
      console.log(`  Error Output: ${detail.error || 'See logs above'}`);
      console.log('');
    });
  }
  
  console.log('█'.repeat(70) + '\n');
}

function runTest(iteration) {
  return new Promise((resolve) => {
    printProgress(iteration);
    
    const testProcess = spawn('node', [TEST_FILE], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    let errorOutput = '';
    
    testProcess.on('error', (error) => {
      errorOutput = error.message;
    });
    
    testProcess.on('close', (code) => {
      stats.totalRuns++;
      
      if (code === 0) {
        stats.successful++;
        console.log(`\n✅ Iteration ${iteration} PASSED\n`);
      } else {
        stats.failed++;
        console.log(`\n❌ Iteration ${iteration} FAILED (Exit code: ${code})\n`);
        stats.failureDetails.push({
          iteration,
          exitCode: code,
          error: errorOutput
        });
      }
      
      resolve(code);
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runLoopTests() {
  printHeader();
  
  const startTime = Date.now();
  
  for (let i = 1; i <= ITERATIONS; i++) {
    await runTest(i);
    
    // Add delay between runs (except after last run)
    if (i < ITERATIONS) {
      console.log(`⏳ Waiting ${DELAY_BETWEEN_RUNS}ms before next iteration...\n`);
      await sleep(DELAY_BETWEEN_RUNS);
    }
  }
  
  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`\n⏱️  Total execution time: ${totalTime} seconds\n`);
  
  printSummary();
  
  // Exit with error code if any tests failed
  process.exit(stats.failed > 0 ? 1 : 0);
}

// Handle interruptions
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test loop interrupted by user');
  printSummary();
  process.exit(1);
});

// Run the loop tests
runLoopTests().catch(error => {
  console.error('\n💥 Loop test runner crashed:', error);
  process.exit(1);
});

