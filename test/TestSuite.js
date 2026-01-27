// Array to hold all test instances
var testArray = [];

// TestSuite class
class TestSuite {
    constructor(tests = []) {
        this.tests = tests; // store the array of tests
    }

    // Execute a single test instance
    executeTest(test) {
        try {
            const result = test.run(); // assuming each test class has a run() method
            if (!result) {
                console.error("Test Failed ❌");
                return false;
            } else {
                console.log("Test Passed ✅ : ");
                return true;
            }
        } catch (err) {
            console.error("Test Error ❌ : ");
            return false;
        }
    }

    // Run all tests in the array
    runAll() {
        let allPassed = true;
        for (const test of this.tests) {
            const result = this.executeTest(test);
            if (!result) allPassed = false;
        }
        if (allPassed) console.log("🎉 All tests passed!");
        else console.warn("⚠ Some tests failed.");
        return allPassed;
    }
}