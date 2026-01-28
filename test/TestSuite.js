// Fixed TestSuite.js (no emojis)

class TestSuite {
  constructor(tests = []) {
    this.tests = tests; // array of test instances
  }

  // Execute a single test instance
  executeTest(test) {
    try {
      // Run the test (assumes exceptions thrown if failed)
      test.run();

      // If no exception, test passed
      console.log(`Test Passed: ${test.constructor.name}`);
      return true;
    } catch (err) {
      console.error(`Test Failed: ${test.constructor.name}`, err);
      return false;
    }
  }

  // Run all tests in the suite
  runAll() {
    let allPassed = true;

    console.log("=== Running Test Suite ===");

    for (const test of this.tests) {
      const result = this.executeTest(test);
      if (!result) allPassed = false;
    }

    if (allPassed) {
      console.log("All tests passed!");
    } else {
      console.warn("Some tests failed.");
    }

    return allPassed;
  }
}
