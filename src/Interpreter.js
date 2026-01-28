// ===================== DSL Interpreter =====================
class DSLInterpreter {
    constructor() {
        this.globalEnv = this.createEnv(null);
        this.functions = {};
        this.avatars = {};
    }

    createEnv(parent) {
        return { vars: Object.create(null), parent };
    }

    getVar(env, name) {
        let e = env;
        while (e) {
            if (Object.prototype.hasOwnProperty.call(e.vars, name)) return e.vars[name];
            e = e.parent;
        }
        throw new Error(`Undefined variable: ${name}`);
    }

    setVar(env, name, value) {
        let e = env;
        while (e) {
            if (Object.prototype.hasOwnProperty.call(e.vars, name)) {
                e.vars[name] = value;
                return;
            }
            e = e.parent;
        }
        // if not found, set in current env
        env.vars[name] = value;
    }

    run(ast) {
        if (!ast || !ast.body) return;
        return this.executeBlock(ast.body, this.globalEnv);
    }

    executeBlock(block, env) {
        for (let i = 0; i < block.length; i++) {
            const node = block[i];

            if (node.type === 'IfChain') {
                const res = this.executeIfChain(node, env);
                if (res && res.__return) return res;
                continue;
            }

            const res = this.executeNode(node, env);
            if (res && res.__return) return res;
        }
        return undefined;
    }

    executeIfChain(ifChain, env) {
        for (const branch of ifChain.branches) {
            if (branch.type === 'If' || branch.type === 'Elif') {
                const cond = this.evaluate(branch.condition, env);
                if (cond) {
                    const res = this.executeBlock(branch.body, env);
                    if (res && res.__return) return res;
                    return undefined;
                }
            } else if (branch.type === 'Else') {
                const res = this.executeBlock(branch.body, env);
                if (res && res.__return) return res;
                return undefined;
            }
        }
        return undefined;
    }

    executeNode(node, env) {
        switch (node.type) {
            case 'AvatarCreation': {
                const evaluated = node.args.map(a => this.evaluate(a, env));
                const avatar = {
                    name: String(evaluated[0]),
                    x: Number(evaluated[1]),
                    y: Number(evaluated[2]),
                    speed: Number(evaluated[3]),
                    direction: Number(evaluated[4])
                };
                this.avatars[node.varName] = avatar;
                this.setVar(env, node.varName, avatar);
                console.log(`Avatar created: ${node.varName}`, avatar);
                return;
            }

            case 'MethodCall': {
                const obj = this.getVar(env, node.object);
                const args = node.args.map(a => this.evaluate(a, env));

                if (!obj) throw new Error(`Unknown object: ${node.object}`);

                // Avatar-specific behavior
                if (this.avatars[node.object]) {
                    this.executeAvatarMethod(node.object, obj, node.method, args);
                } else {
                    console.log(`Method call on non-avatar: ${node.object}.${node.method}(${args.join(', ')})`);
                }
                return;
            }

            case 'Assignment': {
                const value = this.evaluate(node.expr, env);
                this.setVar(env, node.varName, value);
                return;
            }

            case 'FunctionDef': {
                // store function with its defining environment for future closures
                this.functions[node.name] = { node, env };
                return;
            }

            case 'FunctionCall': {
                // built-in: say()
                if (node.name === 'say') {
                    const vals = node.args.map(a => this.evaluate(a, env));
                    console.log(...vals);
                    return;
                }

                const fn = this.functions[node.name];
                if (!fn) {
                    throw new Error(`Unknown function: ${node.name}`);
                }
                const { node: fnNode, env: defEnv } = fn;
                const callEnv = this.createEnv(defEnv);

                const evaluatedArgs = node.args.map(a => this.evaluate(a, env));
                fnNode.args.forEach((argName, i) => {
                    callEnv.vars[argName] = evaluatedArgs[i];
                });

                const res = this.executeBlock(fnNode.body, callEnv);
                if (res && res.__return) return res.value;
                return;
            }

            case 'While': {
                while (this.evaluate(node.condition, env)) {
                    const res = this.executeBlock(node.body, env);
                    if (res && res.__return) return res;
                }
                return;
            }

            case 'For': {
                const count = this.evaluate(node.rangeExpr, env);
                const n = Number(count);
                if (!Number.isInteger(n) || n < 0) {
                    throw new Error(`range() must be a non-negative integer, got: ${count}`);
                }
                for (let i = 0; i < n; i++) {
                    this.setVar(env, node.varName, i);
                    const res = this.executeBlock(node.body, env);
                    if (res && res.__return) return res;
                }
                return;
            }

            case 'Return': {
                const value = this.evaluate(node.expr, env);
                return { __return: true, value };
            }

            default:
                console.warn('Unknown AST node:', node);
                return;
        }
    }

    executeAvatarMethod(name, avatar, method, args) {
        if (method === 'move') {
            const amount = args.length === 0 ? 1 : Number(args[0]);
            console.log(`${name}.move(${amount})`);
            // You could mutate avatar.x / avatar.y here based on direction
        } else if (method === 'moveTo') {
            if (args.length !== 2) throw new Error(`moveTo requires 2 arguments`);
            const x = Number(args[0]);
            const y = Number(args[1]);
            console.log(`${name}.moveTo(${x}, ${y})`);
            // avatar.x = x; avatar.y = y;
        } else if (method === 'turn') {
            const arg = args[0];
            if (typeof arg === 'string') {
                if (arg !== 'left' && arg !== 'right') {
                    throw new Error(`turn() string must be "left" or "right"`);
                }
                console.log(`${name}.turn("${arg}")`);
            } else {
                const angle = Number(arg);
                console.log(`${name}.turn(${angle})`);
            }
        } else if (method === 'say') {
            console.log(`${name}.say(${args.map(a => JSON.stringify(a)).join(', ')})`);
        } else {
            console.log(`${name}.${method}(${args.join(', ')})`);
        }
    }

    // ===================== Expression Evaluator =====================

    evaluate(expr, env) {
        const tokens = this.tokenize(expr);
        let pos = 0;

        const peek = () => tokens[pos];
        const consume = () => tokens[pos++];

        const expect = (type, value = null) => {
            const t = consume();
            if (!t || t.type !== type || (value !== null && t.value !== value)) {
                throw new Error(`Expected ${type} ${value ?? ''} but got ${t ? t.type + ' ' + t.value : 'EOF'}`);
            }
            return t;
        };

        const parseExpression = () => parseOr();

        const parseOr = () => {
            let left = parseAnd();
            while (peek() && peek().type === 'op' && peek().value === 'or') {
                consume();
                const right = parseAnd();
                left = (left || right);
            }
            return left;
        };

        const parseAnd = () => {
            let left = parseNot();
            while (peek() && peek().type === 'op' && peek().value === 'and') {
                consume();
                const right = parseNot();
                left = (left && right);
            }
            return left;
        };

        const parseNot = () => {
            while (peek() && peek().type === 'op' && peek().value === 'not') {
                consume();
                return !parseNot();
            }
            return parseComparison();
        };

        const parseComparison = () => {
            let left = parseAddSub();
            while (peek() && peek().type === 'cmp') {
                const op = consume().value;
                const right = parseAddSub();
                switch (op) {
                    case '==': left = (left == right); break;
                    case '!=': left = (left != right); break;
                    case '<': left = (left < right); break;
                    case '>': left = (left > right); break;
                    case '<=': left = (left <= right); break;
                    case '>=': left = (left >= right); break;
                }
            }
            return left;
        };

        const parseAddSub = () => {
            let left = parseMulDiv();
            while (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
                const op = consume().value;
                const right = parseMulDiv();
                left = op === '+' ? (left + right) : (left - right);
            }
            return left;
        };

        const parseMulDiv = () => {
            let left = parseUnary();
            while (peek() && peek().type === 'op' && (peek().value === '*' || peek().value === '/')) {
                const op = consume().value;
                const right = parseUnary();
                left = op === '*' ? (left * right) : (left / right);
            }
            return left;
        };

        const parseUnary = () => {
            if (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
                const op = consume().value;
                const val = parseUnary();
                return op === '+' ? +val : -val;
            }
            return parsePrimary();
        };

        const parsePrimary = () => {
            const t = peek();
            if (!t) throw new Error('Unexpected end of expression');

            if (t.type === 'number') {
                consume();
                return Number(t.value);
            }
            if (t.type === 'string') {
                consume();
                return t.value;
            }
            if (t.type === 'bool') {
                consume();
                return t.value === 'True';
            }
            if (t.type === 'ident') {
                // function call or variable
                const ident = consume().value;
                if (peek() && peek().type === 'paren' && peek().value === '(') {
                    // function call in expression
                    consume(); // (
                    const args = [];
                    if (!(peek() && peek().type === 'paren' && peek().value === ')')) {
                        while (true) {
                            const argExpr = parseExpression();
                            args.push(argExpr);
                            if (peek() && peek().type === 'comma') {
                                consume();
                                continue;
                            }
                            break;
                        }
                    }
                    expect('paren', ')');

                    // builtins: int, str, range
                    if (ident === 'int') {
                        if (args.length !== 1) throw new Error('int() takes exactly 1 argument');
                        return parseInt(args[0]);
                    }
                    if (ident === 'str') {
                        if (args.length !== 1) throw new Error('str() takes exactly 1 argument');
                        return String(args[0]);
                    }
                    if (ident === 'range') {
                        if (args.length !== 1) throw new Error('range() in expressions not supported (use in for only)');
                        throw new Error('range() is only allowed in for loops');
                    }

                    // user function returning value
                    const fn = this.functions[ident];
                    if (!fn) throw new Error(`Unknown function: ${ident}`);
                    const { node: fnNode, env: defEnv } = fn;
                    const callEnv = this.createEnv(defEnv);
                    fnNode.args.forEach((argName, i) => {
                        callEnv.vars[argName] = args[i];
                    });
                    const res = this.executeBlock(fnNode.body, callEnv);
                    if (res && res.__return) return res.value;
                    return undefined;
                } else {
                    // variable
                    return this.getVar(env, ident);
                }
            }
            if (t.type === 'paren' && t.value === '(') {
                consume();
                const val = parseExpression();
                expect('paren', ')');
                return val;
            }

            throw new Error(`Unexpected token: ${t.type} ${t.value}`);
        };

        const result = parseExpression();
        if (peek()) {
            throw new Error(`Unexpected token at end: ${peek().type} ${peek().value}`);
        }
        return result;
    }

    tokenize(expr) {
        const tokens = [];
        let i = 0;

        const isSpace = c => /\s/.test(c);
        const isDigit = c => /[0-9]/.test(c);
        const isIdentStart = c => /[A-Za-z_]/.test(c);
        const isIdentPart = c => /[A-Za-z0-9_]/.test(c);

        while (i < expr.length) {
            const c = expr[i];

            if (isSpace(c)) { i++; continue; }

            // numbers
            if (isDigit(c)) {
                let start = i;
                while (i < expr.length && isDigit(expr[i])) i++;
                tokens.push({ type: 'number', value: expr.slice(start, i) });
                continue;
            }

            // strings
            if (c === '"' || c === "'") {
                const quote = c;
                i++;
                let str = '';
                while (i < expr.length && expr[i] !== quote) {
                    if (expr[i] === '\\' && i + 1 < expr.length) {
                        str += expr[i + 1];
                        i += 2;
                    } else {
                        str += expr[i++];
                    }
                }
                if (expr[i] !== quote) throw new Error('Unterminated string literal');
                i++; // closing quote
                tokens.push({ type: 'string', value: str });
                continue;
            }

            // comparison operators
            if (expr.startsWith('==', i) || expr.startsWith('!=', i) ||
                expr.startsWith('<=', i) || expr.startsWith('>=', i)) {
                tokens.push({ type: 'cmp', value: expr.slice(i, i + 2) });
                i += 2;
                continue;
            }
            if (c === '<' || c === '>') {
                tokens.push({ type: 'cmp', value: c });
                i++;
                continue;
            }

            // parentheses and comma
            if (c === '(' || c === ')') {
                tokens.push({ type: 'paren', value: c });
                i++;
                continue;
            }
            if (c === ',') {
                tokens.push({ type: 'comma', value: ',' });
                i++;
                continue;
            }

            // arithmetic operators
            if ('+-*/'.includes(c)) {
                tokens.push({ type: 'op', value: c });
                i++;
                continue;
            }

            // identifiers / keywords
            if (isIdentStart(c)) {
                let start = i;
                while (i < expr.length && isIdentPart(expr[i])) i++;
                const ident = expr.slice(start, i);
                if (ident === 'and' || ident === 'or' || ident === 'not') {
                    tokens.push({ type: 'op', value: ident });
                } else if (ident === 'True' || ident === 'False') {
                    tokens.push({ type: 'bool', value: ident });
                } else {
                    tokens.push({ type: 'ident', value: ident });
                }
                continue;
            }

            throw new Error(`Unexpected character in expression: '${c}'`);
        }

        return tokens;
    }
}
