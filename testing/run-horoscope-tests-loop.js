/**
 * Run horoscope API tests in a loop
 * Usage: node run-horoscope-tests-loop.js [iterations]
 */

const { spawn } = require('child_process');

// Get number of iterations from command line, default to 3
const iterations = parseInt(process.argv[2]) || 3;

console.log(`\n🔄 Running horoscope tests ${iterations} times...\n`);

let currentIteration = 1;
let passedRuns = 0;
let failedRuns = 0;

function runTest() {
  if (currentIteration > iterations) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 LOOP TEST SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total runs: ${iterations}`);
    console.log(`Passed: ${passedRuns}`);
    console.log(`Failed: ${failedRuns}`);
    console.log(`Success rate: ${((passedRuns/iterations)*100).toFixed(1)}%`);
    console.log(`${'='.repeat(60)}\n`);
    return;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 TEST RUN ${currentIteration}/${iterations}`);
  console.log(`${'='.repeat(60)}\n`);

  const testProcess = spawn('node', ['test-horoscope-api.js'], {
    stdio: 'inherit'
  });

  testProcess.on('exit', (code) => {
    if (code === 0) {
      passedRuns++;
      console.log(`\n✅ Run ${currentIteration} completed successfully\n`);
    } else {
      failedRuns++;
      console.log(`\n❌ Run ${currentIteration} failed with code ${code}\n`);
    }
    
    currentIteration++;
    
    // Wait 2 seconds between runs
    setTimeout(runTest, 2000);
  });

  testProcess.on('error', (err) => {
    console.error(`\n❌ Error running test: ${err.message}\n`);
    failedRuns++;
    currentIteration++;
    setTimeout(runTest, 2000);
  });
}

// Start the test loop
runTest();

