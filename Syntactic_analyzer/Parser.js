import { tokenType } from "../Lexical_analyzer/Token.js";
import { Node } from "./Node.js";
import { SymbolTable } from "../Semantic_analyzer/SymbolTable.js";

export class Parser{
    constructor(tokens){
        this.tokens = tokens;
        this.current = 0;
        this.errors = [];
        this.symbolTable = new SymbolTable();
        this.semanticErrors = [];
        this.warnings = [];
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
        
        if(leftType === "char" || rightType === "char") return "char";
        if(leftType === "float" || rightType === "float") return "float";
        
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

        return node;
    }

    ifStatement(){
        const node = new Node("ifCommand");
        this.consume(tokenType.LPAREN, "Expected '('");

        node.addChild(this.relationalExpression());
        this.consume(tokenType.RPAREN, "Expected ')'");

        node.addChild(this.block());

        if(this.match(tokenType.ELSE)){
            const elseNode = new Node("elseCommand");
            elseNode.addChild(this.block());
            node.addChild(elseNode);
        }

        return node;
    }

    whileStatement(){
        const node = new Node("whileCommand");
        this.consume(tokenType.LPAREN, "Expected '('");

        node.addChild(this.relationalExpression());
        this.consume(tokenType.RPAREN, "Expected ')'");

        node.addChild(this.block());

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

        // Condition
        if(this.match(tokenType.SEMICOLON)){
            node.addChild(new Node("Null"));
        } else {
            node.addChild(this.relationalExpression());
            this.consume(tokenType.SEMICOLON, "Expected ';'");
        }

        // Iteration
        if(this.match(tokenType.RPAREN)){
            node.addChild(new Node("Null"));
        } else {
            node.addChild(this.assignment());
            this.consume(tokenType.RPAREN, "Expected ')'");
        }

        node.addChild(this.block());

        const removedScope = this.symbolTable.exitScope(); //Semantic: exit scope
        this.checkUnusedVariables(removedScope); // Semantic: check warnings

        return node;
    }

    returnStatement(){
        const node = new Node("returnCommand");

        node.addChild(this.relationalExpression());
        this.consume(tokenType.SEMICOLON, "Expected ';'");
        
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

            return new Node("Identifier", token.value, symbol.type);
        }

        // Semantic: define literal type based on token
        if(this.check(tokenType.LITER_INT)) return new Node("Literal", this.advance().value, "int");
        if(this.check(tokenType.LITER_FLOAT)) return new Node("Literal", this.advance().value, "float");
        if(this.check(tokenType.LITER_CHAR)) return new Node("Literal", this.advance().value, "char");
        if(this.check(tokenType.LITER_STRING)) return new Node("Literal", this.advance().value, "string");

        const token = this.peek();
        throw new Error(`Expected expression '${token.value}' at line ${token.line}`);
    }
}