// Master Test Runner for Sell Feature Validation
// Runs both sell-specific tests and complete flow tests in sequence

const { spawn } = require('child_process');

// Test suites to run
const TEST_SUITES = [
  {
    name: 'Sell Stock Tests (Single Run)',
    file: 'test-sell-stocks.js',
    description: 'Comprehensive sell functionality tests'
  },
  {
    name: 'Complete Flow Test (Single Run)',
    file: 'test-complete-flow.js',
    description: 'End-to-end flow including buy-sell cycle'
  }
];

// Statistics
const stats = {
  totalSuites: TEST_SUITES.length,
  passedSuites: 0,
  failedSuites: 0,
  suiteResults: []
};

function printHeader() {
  console.log('\n' + '█'.repeat(70));
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█' + '  🚀 SELL FEATURE - COMPREHENSIVE TEST SUITE'.padEnd(68) + '█');
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█'.repeat(70));
  console.log('\nThis will run all tests to validate the sell feature implementation:');
  TEST_SUITES.forEach((suite, index) => {
    console.log(`  ${index + 1}. ${suite.name}`);
    console.log(`     ${suite.description}`);
  });
  console.log('\n' + '█'.repeat(70) + '\n');
}

function printSuiteHeader(suite, index) {
  console.log('\n' + '▶'.repeat(70));
  console.log(`📋 Test Suite ${index + 1}/${TEST_SUITES.length}: ${suite.name}`);
  console.log(`📝 ${suite.description}`);
  console.log('▶'.repeat(70) + '\n');
}

function runTestSuite(suite) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const testProcess = spawn('node', [suite.file], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    testProcess.on('close', (code) => {
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      const result = {
        name: suite.name,
        file: suite.file,
        passed: code === 0,
        exitCode: code,
        duration
      };
      
      stats.suiteResults.push(result);
      
      if (code === 0) {
        stats.passedSuites++;
        console.log(`\n✅ ${suite.name} PASSED (${duration}s)\n`);
      } else {
        stats.failedSuites++;
        console.log(`\n❌ ${suite.name} FAILED (${duration}s, Exit code: ${code})\n`);
      }
      
      resolve(code);
    });
  });
}

function printFinalSummary() {
  console.log('\n' + '█'.repeat(70));
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█' + '  🎯 FINAL TEST RESULTS'.padEnd(68) + '█');
  console.log('█' + ' '.repeat(68) + '█');
  console.log('█'.repeat(70));
  
  console.log('\n📊 Suite-by-Suite Results:\n');
  
  stats.suiteResults.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    const status = result.passed ? 'PASSED' : 'FAILED';
    console.log(`${icon} Suite ${index + 1}: ${result.name}`);
    console.log(`   Status: ${status}`);
    console.log(`   Duration: ${result.duration}s`);
    console.log(`   Exit Code: ${result.exitCode}`);
    console.log('');
  });
  
  console.log('='.repeat(70));
  console.log(`\nTotal Test Suites: ${stats.totalSuites}`);
  console.log(`✅ Passed: ${stats.passedSuites}`);
  console.log(`❌ Failed: ${stats.failedSuites}`);
  
  const successRate = stats.totalSuites > 0 
    ? ((stats.passedSuites / stats.totalSuites) * 100).toFixed(1) 
    : 0;
  
  console.log(`\n📈 Success Rate: ${successRate}%`);
  
  if (stats.failedSuites === 0) {
    console.log('\n' + '🎉'.repeat(35));
    console.log('🎉  ALL TESTS PASSED!  🎉');
    console.log('🎉  Sell feature is fully functional and tested!  🎉');
    console.log('🎉'.repeat(35));
  } else {
    console.log('\n⚠️  Some tests failed. Please review the failures above.');
    console.log('💡 Tip: Run individual test files to see detailed error messages.');
  }
  
  console.log('\n' + '█'.repeat(70));
  console.log('\n📚 To run tests individually:');
  console.log('   node test-sell-stocks.js');
  console.log('   node test-complete-flow.js');
  console.log('\n🔄 To run tests in a loop for stability:');
  console.log('   node run-sell-tests-loop.js');
  console.log('   node run-complete-flow-loop.js');
  console.log('\n' + '█'.repeat(70) + '\n');
}

async function runAllTests() {
  printHeader();
  
  const overallStartTime = Date.now();
  
  for (let i = 0; i < TEST_SUITES.length; i++) {
    const suite = TEST_SUITES[i];
    printSuiteHeader(suite, i);
    await runTestSuite(suite);
    
    // Add a small delay between suites
    if (i < TEST_SUITES.length - 1) {
      console.log('⏳ Preparing next test suite...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  const overallEndTime = Date.now();
  const totalTime = ((overallEndTime - overallStartTime) / 1000).toFixed(2);
  
  console.log(`\n⏱️  Total execution time: ${totalTime} seconds\n`);
  
  printFinalSummary();
  
  // Exit with error code if any suite failed
  process.exit(stats.failedSuites > 0 ? 1 : 0);
}

// Handle interruptions
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Tests interrupted by user');
  printFinalSummary();
  process.exit(1);
});

// Run all tests
runAllTests().catch(error => {
  console.error('\n💥 Test runner crashed:', error);
  process.exit(1);
});

