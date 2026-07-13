import { tokenType } from "../Lexical_analyzer/Token.js";
import { Node } from "./Node.js";
import { SymbolTable } from "../Semantic_analyzer/SymbolTable.js";
import { CodeGenerator } from "../Code_Generator/CodeGenerator.js";

export class Parser{
    constructor(tokens){
        this.tokens = tokens;
        this.current = 0;
        this.errors = [];
        this.symbolTable = new SymbolTable();
        this.semanticErrors = [];
        this.warnings = [];
        this.generator = new CodeGenerator();
    }

    // Auxiliary Methods
    peek(){
        return this.tokens[this.current];
    }

    advance(){
        if(!this.isAtEOF()) this.current++;
        return this.tokens[this.current - 1];
    }

    check(type){
        if(this.isAtEOF()) return false;
        return this.peek().type === type;
    }

    match(type){
        if(this.check(type)){
            return this.advance();
        }

        return null;
    }

    consume(type, message){
        const token = this.peek();

        if(this.check(type)){
            return this.advance();
        }

        throw new Error(`${message} at line ${token.line}, column ${token.column}`);
    }

    synchronize(){
        this.advance();

        while(!this.isAtEOF()){
            if(this.tokens[this.current - 1].type === tokenType.SEMICOLON) return;

            switch(this.peek().type){
                case tokenType.INT:
                case tokenType.FLOAT:
                case tokenType.CHAR:
                case tokenType.IF:
                case tokenType.WHILE:
                case tokenType.FOR:
                case tokenType.RETURN:
                case tokenType.RBRACE:
                    return;
            }

            this.advance();
        }
    }

    isAtEOF(){
        if(this.current >= this.tokens.length) return true;
        return this.peek().type === tokenType.EOF;
    }

    checkTypeCompatibility(expected, actual, line, column) {
        if(expected === "error" || actual === "error") return;
        if(expected === actual) return;
        if(expected === "float" && actual === "int") return;
        if(expected === "char" && actual === "int") return;
        
        this.semanticErrors.push(`Semantic Error (Line ${line}, Column ${column}): Incompatible types. Cannot assign '${actual}' to '${expected}'.`);
    }

    checkOperationCompatibility(leftType, rightType, operator, line, column) {
        if(leftType === "error" || rightType === "error") return "error";
        
        if(leftType === "string" || rightType === "string"){
            this.semanticErrors.push(`Semantic Error (Line ${line}, Column ${column}): Operator '${operator}' cannot be applied to types '${leftType}' and '${rightType}'.`);
            return "error";
        }
        
        if(leftType === "float" || rightType === "float") return "float";
        if(leftType === "char" || rightType === "char") return "char";
        
        return "int";
    }

    checkUnusedVariables(scope) {
        for(const [name, info] of scope.entries()){
            if(!info.used) {
                this.warnings.push(`Warning (Line ${info.line}): Variable '${name}' was declared but never used.`);
            }
        }
    }

    // Grammar Rules
    parse(){
        try{
            const ast = this.program();
            
            if(!this.isAtEOF()){
                throw new Error(`Unexpected token '${this.peek().value}' at EOF, line ${this.peek().line}`);
            }

            this.checkUnusedVariables(this.symbolTable.exitScope()); // Check unused variables on global scope

            this.generator.finish();

            return ast;
        } catch(error){
            this.errors.push(error.message);
            return null;
        }
    }

    program(){
        const node = new Node("Program");

        try{
            this.consume(tokenType.INT, "Expected 'int'");
            const mainToken = this.consume(tokenType.IDENTIFIER, "Expected 'main'");

            if(mainToken.value !== "main"){
                throw new Error(`Expected 'main' function at line ${mainToken.line}`);
            }

            this.consume(tokenType.LPAREN, "Expected '('");
            this.consume(tokenType.RPAREN, "Expected ')'");
        } catch(error){
            this.errors.push(error.message);
            
            while(!this.isAtEOF && !this.check(tokenType.LBRACE)){
                this.advance();
            }
        }

        if(this.check(tokenType.LBRACE)){
            node.addChild(this.block());
        }

        return node;
    }

    block(){
        const node = new Node("Block");
        this.consume(tokenType.LBRACE, "Expected '{'");
        this.symbolTable.enterScope(); // Semantic: enter new scope

        while(!this.check(tokenType.RBRACE) && !this.isAtEOF()){
            try{
                node.addChild(this.command());
            } catch(error){
                this.errors.push(error.message);
                this.synchronize();
            }
        }

        this.consume(tokenType.RBRACE, "Expected '}'");

        const removedScope = this.symbolTable.exitScope(); //Semantic: exit scope
        this.checkUnusedVariables(removedScope); // Semantic: check warnings

        return node;
    }

    command(){
        // Declaration
        if(this.check(tokenType.INT) || this.check(tokenType.FLOAT) || this.check(tokenType.CHAR)){
            const node = this.declaration();
            this.consume(tokenType.SEMICOLON, "Expected ';'");
            return node;
        }

        // Statements
        if (this.match(tokenType.IF)) return this.ifStatement();
        if (this.match(tokenType.WHILE)) return this.whileStatement();
        if (this.match(tokenType.FOR)) return this.forStatement();
        if (this.match(tokenType.RETURN)) return this.returnStatement();

        // Assigment
        if(this.check(tokenType.IDENTIFIER)){
            const node = this.assignment();
            this.consume(tokenType.SEMICOLON, "Expected ';'");
            return node;
        }

        const token = this.peek();
        throw new Error(`Unexpected command '${token.value}' at line ${token.line}, column ${token.column}`);
    }

    declaration(){
        const typeToken = this.advance(); // Catch type (int, float, char)
        const declaredType = typeToken.value;
        const node = new Node("Declaration", null, declaredType);
        node.addChild(new Node("Type", typeToken.value))

        do{
            const idToken = this.consume(tokenType.IDENTIFIER, "Expected identifier");
            const varNode = new Node("Variable", idToken.value, declaredType);

            // Semantic: register variable on symbol table
            if(!this.symbolTable.declare(idToken.value, declaredType, idToken.line, idToken.column)){
                this.semanticErrors.push(`Semantic Error (Line ${idToken.line}, Column ${idToken.column}): Redeclaration of variable '${idToken.value}'.`);
            }

            this.generator.declareVariable(idToken.value, declaredType);

            // Check if there is declaration on the assingment
            if(this.match(tokenType.ASSIGN)){
                // Semantic: variable assigned with value, then initialized
                this.symbolTable.markInitialized(idToken.value);

                const assignNode = new Node("Assignment", "=");
                assignNode.addChild(new Node("Identifier", idToken.value, declaredType));
                
                const exprNode = this.relationalExpression();
                assignNode.addChild(exprNode);

                // Semantic: check type conpatibility
                this.checkTypeCompatibility(declaredType, exprNode.evalType, idToken.line, idToken.column);

                if(exprNode.register !== undefined){
                    this.generator.storeVariable(idToken.value, exprNode.register, declaredType);
                    this.generator.registers.free(exprNode.register);
                }

                varNode.addChild(assignNode);
            }

            node.addChild(varNode);
        } while(this.match(tokenType.COMMA));

        return node;
    }

    assignment(){
        const idToken = this.consume(tokenType.IDENTIFIER, "Expected identifier");

        // Semantic: check if variable exists
        const symbol = this.symbolTable.lookup(idToken.value);
        let expectedType = "error";

        if(!symbol){
            this.semanticErrors.push(`Semantic Error (Line ${idToken.line}, Column ${idToken.column}): Undeclared variable '${idToken.value}'.`);
        } else {
            this.symbolTable.markInitialized(idToken.value);
            expectedType = symbol.type;
        }

        this.consume(tokenType.ASSIGN, "Expected '='");
        
        const node = new Node("Assignment", "=");
        node.addChild(new Node("Identifier", idToken.value, expectedType));

        const exprNode = this.relationalExpression();
        node.addChild(exprNode);
        
        // Semantic: check type conpatibility on assigment
        this.checkTypeCompatibility(expectedType, exprNode.evalType, idToken.line, idToken.column);
        
        if(exprNode.register !== undefined){
            this.generator.storeVariable(idToken.value, exprNode.register, expectedType);
            this.generator.registers.free(exprNode.register);
        }

        return node;
    }

    ifStatement(){
        const node = new Node("ifCommand");
        this.consume(tokenType.LPAREN, "Expected '('");

        const condition = this.relationalExpression();

        node.addChild(condition);
        this.consume(tokenType.RPAREN, "Expected ')'");

        const elseLabel = this.generator.labels.generate("ELSE");
        const endLabel = this.generator.labels.generate("ENDIF");
        this.generator.beq(condition.register, "$zero", elseLabel);
        this.generator.registers.free(condition.register);

        node.addChild(this.block());

        this.generator.jump(endLabel);
        this.generator.label(elseLabel);

        if(this.match(tokenType.ELSE)){
            const elseNode = new Node("elseCommand");
            elseNode.addChild(this.block());
            node.addChild(elseNode);
        }

        this.generator.label(endLabel);

        return node;
    }

    whileStatement(){
        const node = new Node("whileCommand");

        const beginLabel = this.generator.labels.generate("WHILE");
        const endLabel = this.generator.labels.generate("ENDWHILE");
        this.generator.label(beginLabel);

        this.consume(tokenType.LPAREN, "Expected '('");

        const condition = this.relationalExpression();

        node.addChild(condition);
        this.consume(tokenType.RPAREN, "Expected ')'");

        this.generator.beq(condition.register, "$zero", endLabel);
        this.generator.registers.free(condition.register);

        node.addChild(this.block());

        this.generator.jump(beginLabel);
        this.generator.label(endLabel);

        return node;
    }

    forStatement(){
        const node = new Node("forCommand");
        this.symbolTable.enterScope(); // Semantic: statement for has its own scope

        this.consume(tokenType.LPAREN, "Expected '('");

        // Inicialization
        if(this.match(tokenType.SEMICOLON)){
            node.addChild(new Node("Null"));
        } else {
            if(this.check(tokenType.INT) || this.check(tokenType.FLOAT) || this.check(tokenType.CHAR)){
                node.addChild(this.declaration());
            } else {
                node.addChild(this.assignment());
            }

            this.consume(tokenType.SEMICOLON, "Expected ';'");
        }

        const startLabel = this.generator.labels.generate("FOR");
        const endLabel = this.generator.labels.generate("ENDFOR");

        this.generator.label(startLabel);

        // Condition
        if(this.match(tokenType.SEMICOLON)){
            node.addChild(new Node("Null"));
        } else {
            const condition = this.relationalExpression();
            node.addChild(condition);
            this.consume(tokenType.SEMICOLON, "Expected ';'");
            this.generator.beq(condition.register, "$zero", endLabel);
            this.generator.registers.free(condition.register);
        }

        // Iteration
        let iterationCode = [];

        if(this.match(tokenType.RPAREN)){
            node.addChild(new Node("Null"));
        } else {
            this.generator.beginBuffer();
            const iteration = this.assignment();
            iterationCode = this.generator.endBuffer();
            node.addChild(iteration);
            this.consume(tokenType.RPAREN, "Expected ')'");
        }

        node.addChild(this.block());

        for(const inst of iterationCode){
            this.generator.instructions.push(inst);
        }

        this.generator.jump(startLabel);
        this.generator.label(endLabel);

        const removedScope = this.symbolTable.exitScope(); //Semantic: exit scope
        this.checkUnusedVariables(removedScope); // Semantic: check warnings

        return node;
    }

    returnStatement(){
        const node = new Node("returnCommand");
        const expr = this.relationalExpression();

        node.addChild(expr);
        this.consume(tokenType.SEMICOLON, "Expected ';'");

        if(expr.register !== undefined){
            this.generator.emit("move", "$v0", expr.register);
            this.generator.registers.free(expr.register);
        }
        
        return node;
    }

    relationalExpression(){
        let left = this.arithmeticExpression();

        if(this.check(tokenType.EQ) || this.check(tokenType.NE) || this.check(tokenType.LT) || this.check(tokenType.GT) || this.check(tokenType.LE) || this.check(tokenType.GE)){
            const operator = this.advance();
            const right = this.arithmeticExpression();

            const node = new Node("RelationalOperation", operator.value, "int");

            // Semantic: check operation compatibility 
            this.checkOperationCompatibility(left.evalType, right.evalType, operator.value, operator.line, operator.column);

            node.addChild(left);
            node.addChild(right);

            if(left.register !== undefined && right.register !== undefined){
                if(left.evalType === "float" || right.evalType === "float"){
                    const result = this.generator.registers.allocate();

                    switch(operator.type){
                        case tokenType.EQ:
                            this.generator.emit("c.eq.s", left.register, right.register);
                            break;

                        case tokenType.NE:
                            this.generator.emit("c.eq.s", left.register, right.register);
                            break;

                        case tokenType.LT:
                            this.generator.emit("c.lt.s", left.register, right.register);
                            break;

                        case tokenType.LE:
                            this.generator.emit("c.le.s", left.register, right.register);
                            break;

                        case tokenType.GT:
                            this.generator.emit("c.le.s", left.register, right.register);
                            break;

                        case tokenType.GE:
                            this.generator.emit("c.lt.s", left.register, right.register);
                            break;
                    }

                    this.generator.emit("li", result, 1);

                    const end = this.generator.labels.generate("CMP");

                    switch(operator.type){
                        case tokenType.NE:
                            this.generator.emit("bc1f", end);
                            break;

                        case tokenType.GT:
                            this.generator.emit("bc1f", end);
                            break;

                        case tokenType.GE:
                            this.generator.emit("bc1f", end);
                            break;

                        default:
                            this.generator.emit("bc1t", end);
                    }

                    this.generator.emit("li", result, 0);
                    this.generator.label(end);

                    node.register = result;
                } else {
                    const result = this.generator.registers.allocate();

                    switch(operator.type){
                        case tokenType.EQ:
                            this.generator.emit("seq", result, left.register, right.register);
                            break;

                        case tokenType.NE:
                            this.generator.emit("sne", result, left.register, right.register);
                            break;

                        case tokenType.LT:
                            this.generator.emit("slt", result, left.register, right.register);
                            break;

                        case tokenType.GT:
                            this.generator.emit("sgt", result, left.register, right.register);
                            break;

                        case tokenType.LE:
                            this.generator.emit("sle", result, left.register, right.register);
                            break;

                        case tokenType.GE:
                            this.generator.emit("sge", result, left.register, right.register);
                            break;
                    }
                    
                    node.register = result;
                }
                
                this.generator.registers.free(left.register);
                this.generator.registers.free(right.register);
            }
            
            return node;
        }

        return left;
    }

    arithmeticExpression(){
        let left = this.term();

        while(this.check(tokenType.PLUS) || this.check(tokenType.MINUS)){
            const operator = this.advance();
            const right = this.term();

            // Semantic: type synthesis 
            const resultingType = this.checkOperationCompatibility(left.evalType, right.evalType, operator.value, operator.line, operator.column);
            
            const node = new Node("ArithmeticOperation", operator.value, resultingType);
            
            node.addChild(left);
            node.addChild(right);

            if(left.register !== undefined && right.register !== undefined){
                if(operator.type === tokenType.PLUS){
                    node.register = this.generator.add(left.register, right.register, resultingType);
                } else {
                    node.register = this.generator.sub(left.register, right.register, resultingType);
                }

                this.generator.registers.free(left.register);
                this.generator.registers.free(right.register);
            }
            
            left = node;
        }

        return left;
    }

    term(){
        let left = this.factor();

        while(this.check(tokenType.MULT) || this.check(tokenType.DIV)){
            const operator = this.advance();
            const right = this.factor();

            // Semantic: type synthesis
            const resultingType = this.checkOperationCompatibility(left.evalType, right.evalType, operator.value, operator.line, operator.column);

            const node = new Node("ArithmeticOperation", operator.value, resultingType);

            node.addChild(left);
            node.addChild(right);

            if(left.register !== undefined && right.register !== undefined){
                if(operator.type === tokenType.MULT){
                    node.register = this.generator.mul(left.register, right.register, resultingType);
                } else {
                    node.register = this.generator.div(left.register, right.register, resultingType);
                }

                this.generator.registers.free(left.register);
                this.generator.registers.free(right.register);
            }

            left = node;
        }

        return left;
    }

    factor(){
        if(this.match(tokenType.LPAREN)){
            const node = this.relationalExpression();
            this.consume(tokenType.RPAREN, "Expected ')'");
            return node;
        }

        if(this.check(tokenType.IDENTIFIER)){
            const token = this.advance();
            
            // Semantic: check if variable exists
            const symbol = this.symbolTable.lookup(token.value);
            if(!symbol){
                this.semanticErrors.push(`Semantic Error (Line ${token.line}, Column ${token.column}): Undeclared variable '${token.value}' used in expression.`);
                return new Node("Identifier", token.value, "error");
            }
            
            this.symbolTable.markUsed(token.value);

            // Semantic: check if variable has any value
            if(!symbol.isInitialized){
                this.warnings.push(`Warning (Line ${token.line}, Column ${token.column}): Variable '${token.value}' is used uninitialized.`);
            }

            const node = new Node("Identifier", token.value, symbol.type);

            node.register = this.generator.loadVariable(token.value, symbol.type);

            return node;
        }

        // Semantic: define literal type based on token
        if(this.check(tokenType.LITER_INT)){
            const token = this.advance();
            const node = new Node("Literal", token.value, "int");

            node.register = this.generator.loadImmediate(token.value);

            return node;
        }

        if(this.check(tokenType.LITER_FLOAT)){
            const token = this.advance();
            const node = new Node("Literal", token.value, "float");

            node.register = this.generator.loadImmediate(token.value, "float");

            return node;
        }

        if(this.check(tokenType.LITER_CHAR)){
            const token = this.advance();
            const value = token.value.charCodeAt(1);
            const node = new Node("Literal", value, "char");

            node.register = this.generator.loadImmediate(value);

            return node;
        }
        
        if(this.check(tokenType.LITER_STRING)){
            const token = this.advance();
            const node = new Node("Literal", token.value, "string");

            node.register = this.generator.loadImmediate(token.value);

            return node;
        }

        const token = this.peek();
        throw new Error(`Expected expression '${token.value}' at line ${token.line}`);
    }
}