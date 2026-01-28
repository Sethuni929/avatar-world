class ParserTest {
    constructor() {
        this.testsPassed = 0;
        this.testsFailed = 0;
    }

    run() {
        console.log('Running ParserTest...');

        this.testAvatarCreation();
        this.testMethodCalls();
        this.testAssignments();
        this.testSayMethod();
        this.testBulkAST();

        console.log(`ParserTest Summary: Passed ${this.testsPassed}, Failed ${this.testsFailed}`);
    }

    assert(condition, message, ast = null) {
        if (condition) {
            console.log(`PASS: ${message}`);
            this.testsPassed++;
        } else {
            console.error(`FAIL: ${message}`);
            if (ast) console.log('AST:', JSON.stringify(ast, null, 2));
            this.testsFailed++;
        }
    }

    testAvatarCreation() {
        const parser = new DSLParser();
        const script = ['dog = Avatar("Dog", 0, 0)'];
        const ast = parser.parse(script);

        this.assert(
            ast.body.length === 1 &&
            ast.body[0].type === 'AvatarCreation' &&
            ast.body[0].varName === 'dog',
            'Avatar creation parsing',
            ast
        );
    }

    testMethodCalls() {
        const parser = new DSLParser();

        const script = ['dog.move()', 'dog.turn("left")'];
        const ast = parser.parse(script);

        this.assert(
            ast.body.length === 2 &&
            ast.body[0].type === 'MethodCall' &&
            ast.body[0].method === 'move' &&
            ast.body[1].type === 'MethodCall' &&
            ast.body[1].method === 'turn',
            'Method calls parsing',
            ast
        );
    }

    testAssignments() {
        const parser = new DSLParser();

        const script = ['x = 5', 'y = x + 2'];
        const ast = parser.parse(script);

        this.assert(
            ast.body.length === 2 &&
            ast.body[0].type === 'Assignment' &&
            ast.body[1].type === 'Assignment',
            'Variable assignments parsing',
            ast
        );
    }

    testSayMethod() {
        const parser = new DSLParser();

        const script = ['dog.say("Hello")', 'dog.say("I am", x, "years old")'];
        const ast = parser.parse(script);

        this.assert(
            ast.body.length === 2 &&
            ast.body[0].type === 'MethodCall' &&
            ast.body[0].method === 'say' &&
            ast.body[1].type === 'MethodCall' &&
            ast.body[1].method === 'say',
            'dog.say parsing',
            ast
        );
    }

    testBulkAST() {
        const parser = new DSLParser();

        const script = [
            '# Create avatars',
            'dog = Avatar("Dog", 0, 0)',
            'cat = Avatar("Cat", 10, 5, 2)',
            '',
            '# Move avatars',
            'dog.move()',
            'dog.turn(45)',
            'dog.move(3)',
            'cat.move(5)',
            'cat.turn("left")',
            '',
            '# Assign variables',
            'x = 10',
            'y = 20',
            '',
            '# Say commands',
            'dog.say("Hello world")',
            'cat.say("I am", x, "years old")',
            '',
            '# Simple function',
            'def greet(name):',
            '    dog.say("Hi", name)',
            '',
            '# If example',
            'if (x > 5):',
            '    dog.say("x is greater than 5")',
            'else:',
            '    dog.say("x is 5 or less")',
            'greet("Sethuni")'
        ];

        const ast = parser.parse(script);

        console.log("Bulk AST Output:");
        console.log(JSON.stringify(ast, null, 2));

        this.assert(ast.body.length > 0, 'Bulk AST parsing produces non-empty body', ast);
    }
}
