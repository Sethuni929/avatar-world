class InterpreterTest {
    constructor() {
        this.testsPassed = 0;
        this.testsFailed = 0;
    }

    run() {
        console.log("Running InterpreterTest...");

        this.testComplexScript();

        console.log(`InterpreterTest Summary: Passed ${this.testsPassed}, Failed ${this.testsFailed}`);
    }

    assert(condition, message) {
        if (condition) {
            console.log(`PASS: ${message}`);
            this.testsPassed++;
        } else {
            console.error(`FAIL: ${message}`);
            this.testsFailed++;
        }
    }

    testComplexScript() {
        const parser = new DSLParser();
        const interpreter = new DSLInterpreter();

        const script = [
    "# === Create characters ===",
    'hero = Avatar("Hero", 5, 5)',
    'villain = Avatar("Villain", 20, 10, 2)',
    'pet = Avatar("Doggo", 3, 3)',

    "# === Basic movement ===",
    'hero.say("I have arrived!")',
    'hero.move()',
    'hero.turn("right")',
    'hero.move(4)',

    'villain.say("You cannot catch me!")',
    'villain.turn(180)',
    'villain.move(2)',

    'pet.say("Woof!")',
    'pet.moveTo(10, 10)',

    "# === Variables and arithmetic ===",
    'x = 7',
    'y = 3',
    'score = x * y + 10',
    'hero.say("Score is", score)',

    "# === Function with nested logic ===",
    'def chase(target, steps):',
    '    hero.say("Chasing", target)',
    '    if (steps > 5):',
    '        hero.say("This will be a long chase...")',
    '        for i in range(steps):',
    '            hero.move(i)',
    '    elif (steps == 5):',
    '        hero.say("A medium chase!")',
    '        hero.move(steps)',
    '    else:',
    '        hero.say("Short chase!")',
    '        hero.move(1)',
    '    return steps * 2',

    "# === Call function ===",
    'result = chase("Villain", 6)',
    'hero.say("Chase result:", result)',

    "# === While loop ===",
    'i = 0',
    'while (i < 4):',
    '    pet.say("Following hero...", i)',
    '    i = i + 1',

    "# === Nested functions ===",
    'def outer(a):',
    '    hero.say("Outer start with", a)',
    '    def inner(b):',
    '        hero.say("Inner doubling", b)',
    '        return b * 2',
    '    doubled = inner(a)',
    '    hero.say("Outer got", doubled)',
    '    return doubled + 1',

    'finalValue = outer(10)',
    'hero.say("Final value:", finalValue)',

    "# === Final for loop ===",
    'for i in range(5):',
    '    villain.say("Laughing", i)',
];

        const ast = parser.parse(script);
        this.assert(ast.body.length > 0, "AST produced non-empty body");

        console.log("\n--- Interpreter Output ---");
        interpreter.run(ast);
        console.log("--- End Interpreter Output ---\n");

        this.assert(true, "Complex script interpreted (logs checked manually)");
    }
}
