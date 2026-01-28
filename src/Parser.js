// ===================== DSL Parser =====================
class DSLParser {
    constructor() {}

    parse(lines) {
        const ast = [];
        const stack = [{ body: ast, indent: 0 }];
        let lineNumber = 1;

        for (let rawLine of lines) {
            if (this.isIgnorable(rawLine)) { lineNumber++; continue; }

            const indent = this.getIndentLevel(rawLine);
            const line = rawLine.trim();

            while (indent < stack[stack.length - 1].indent) {
                stack.pop();
            }

            const node = this.parseLine(line, lineNumber);
            node.indent = indent;

            // Block starters
            if (node.type === 'FunctionDef' || node.type === 'If' || node.type === 'Elif' ||
                node.type === 'Else' || node.type === 'While' || node.type === 'For') {

                // Special handling for elif/else chaining
                if (node.type === 'Elif' || node.type === 'Else') {
                    const parentBody = stack[stack.length - 1].body;
                    const last = parentBody[parentBody.length - 1];
                    if (!last || last.type !== 'IfChain' || last.indent !== indent) {
                        throw new Error(`'${node.type.toLowerCase()}' without matching 'if' at line ${lineNumber}`);
                    }
                    last.branches.push(node);
                    // push new body frame for this branch
                    stack.push({ body: node.body, indent: indent + 4 });
                } else if (node.type === 'If') {
                    const ifChain = {
                        type: 'IfChain',
                        branches: [node],
                        indent,
                        lineNumber
                    };
                    stack[stack.length - 1].body.push(ifChain);
                    stack.push({ body: node.body, indent: indent + 4 });
                } else {
                    // While, For, FunctionDef
                    stack[stack.length - 1].body.push(node);
                    stack.push({ body: node.body, indent: indent + 4 });
                }
            } else {
                stack[stack.length - 1].body.push(node);
            }

            lineNumber++;
        }

        return { type: 'Program', body: ast };
    }

    isIgnorable(line) {
        const t = line.trim();
        return t === '' || t.startsWith('#');
    }

    getIndentLevel(line) {
        return (line.match(/^\s*/) || [''])[0].length;
    }

    parseLine(line, lineNumber) {
        if (/^\w+\s*=\s*Avatar\(/.test(line)) return this.parseAvatar(line, lineNumber);
        if (/^def\s+\w+\(/.test(line)) return this.parseFunction(line, lineNumber);
        if (/^return\b/.test(line)) return this.parseReturn(line, lineNumber);
        if (/^if\s*\(/.test(line)) return this.parseIf(line, lineNumber);
        if (/^elif\s*\(/.test(line)) return this.parseElif(line, lineNumber);
        if (/^else\s*:$/ .test(line)) return this.parseElse(line, lineNumber);
        if (/^while\s*\(/.test(line)) return this.parseWhile(line, lineNumber);
        if (/^for\b/.test(line)) return this.parseFor(line, lineNumber);
        if (/^\w+\s*=/.test(line)) return this.parseAssignment(line, lineNumber);
        if (/^\w+\.\w+\(/.test(line)) return this.parseMethodCall(line, lineNumber);
        if (/^\w+\(.*\)$/.test(line)) return this.parseFunctionCall(line, lineNumber);
        throw new Error(`Syntax error at line ${lineNumber}: ${line}`);
    }

    parseAvatar(line, lineNumber) {
        const match = line.match(/^(\w+)\s*=\s*Avatar\((.*)\)$/);
        if (!match) throw new Error(`Invalid Avatar at line ${lineNumber}`);
        const varName = match[1];
        let args = this.splitArgs(match[2]);
        if (args.length < 3) throw new Error(`Avatar requires at least name, x, y at line ${lineNumber}`);
        if (args.length < 4) args.push('1');   // speed default
        if (args.length < 5) args.push('90');  // direction default
        return { type: 'AvatarCreation', varName, args, lineNumber };
    }

    parseMethodCall(line, lineNumber) {
        const match = line.match(/^(\w+)\.(\w+)\((.*)\)$/);
        if (!match) throw new Error(`Invalid method call at line ${lineNumber}`);
        const [_, obj, method, argStr] = match;
        const args = argStr.trim() === '' ? [] : this.splitArgs(argStr);
        return { type: 'MethodCall', object: obj, method, args, lineNumber };
    }

    parseAssignment(line, lineNumber) {
        const match = line.match(/^(\w+)\s*=\s*(.*)$/);
        if (!match) throw new Error(`Invalid assignment at line ${lineNumber}`);
        return { type: 'Assignment', varName: match[1], expr: match[2].trim(), lineNumber };
    }

    parseFunction(line, lineNumber) {
        const match = line.match(/^def\s+(\w+)\((.*)\):$/);
        if (!match) throw new Error(`Invalid function definition at line ${lineNumber}`);
        const args = match[2].split(',').map(a => a.trim()).filter(a => a);
        return { type: 'FunctionDef', name: match[1], args, body: [], lineNumber };
    }

    parseFunctionCall(line, lineNumber) {
        const match = line.match(/^(\w+)\((.*)\)$/);
        if (!match) throw new Error(`Invalid function call at line ${lineNumber}`);
        const name = match[1];
        const argStr = match[2].trim();
        const args = argStr === '' ? [] : this.splitArgs(argStr);
        return { type: 'FunctionCall', name, args, lineNumber };
    }

    stripParensCondition(raw, keyword, lineNumber) {
        // e.g. "if (x == 5):"
        const pattern = new RegExp(`^${keyword}\\s*\\((.*)\\)\\s*:$`);
        const match = raw.match(pattern);
        if (!match) throw new Error(`Invalid ${keyword} condition at line ${lineNumber}. Conditions must be in parentheses.`);
        return match[1].trim();
    }

    parseIf(line, lineNumber) {
        const condition = this.stripParensCondition(line, 'if', lineNumber);
        return { type: 'If', condition, body: [], lineNumber };
    }

    parseElif(line, lineNumber) {
        const condition = this.stripParensCondition(line, 'elif', lineNumber);
        return { type: 'Elif', condition, body: [], lineNumber };
    }

    parseElse(line, lineNumber) {
        return { type: 'Else', body: [], lineNumber };
    }

    parseWhile(line, lineNumber) {
        const condition = this.stripParensCondition(line, 'while', lineNumber);
        return { type: 'While', condition, body: [], lineNumber };
    }

    parseFor(line, lineNumber) {
        // for i in range(5):
        const match = line.match(/^for\s+(\w+)\s+in\s+range\((.*)\)\s*:\s*$/);
        if (!match) throw new Error(`Invalid for loop at line ${lineNumber}. Use: for i in range(5):`);
        const varName = match[1];
        const rangeExpr = match[2].trim();
        return { type: 'For', varName, rangeExpr, body: [], lineNumber };
    }

    parseReturn(line, lineNumber) {
        const expr = line.replace(/^return\b\s*/, '').trim();
        return { type: 'Return', expr, lineNumber };
    }

    splitArgs(argString) {
        let args = [], curr = '', inQuotes = false, quoteChar = '', depth = 0;
        for (let c of argString) {
            if ((c === '"' || c === "'") && !inQuotes) {
                inQuotes = true; quoteChar = c; curr += c; continue;
            }
            if (c === quoteChar && inQuotes) {
                inQuotes = false; curr += c; continue;
            }
            if (!inQuotes) {
                if (c === '(') { depth++; curr += c; continue; }
                if (c === ')') { depth--; curr += c; continue; }
                if (c === ',' && depth === 0) {
                    args.push(curr.trim());
                    curr = '';
                    continue;
                }
            }
            curr += c;
        }
        if (curr.trim() !== '') args.push(curr.trim());
        return args;
    }
}
