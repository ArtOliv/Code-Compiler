import { tokenType } from "../Lexical_analyzer/Token.js";
import { Node } from "./Node.js";

export class Parser{
    constructor(tokens){
        this.tokens = tokens;
        this.current = 0;
        this.errors = [];
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

    // Grammar Rules
    parse(){
        try{
            const ast = this.program();
            
            if(!this.isAtEOF()){
                throw new Error(`Unexpected token '${this.peek().value}' at EOF, line ${this.peek().line}`);
            }

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

        while(!this.check(tokenType.RBRACE) && !this.isAtEOF()){
            try{
                node.addChild(this.command());
            } catch(error){
                this.errors.push(error.message);
                this.synchronize();
            }
        }

        this.consume(tokenType.RBRACE, "Expected '}'");

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
        const node = new Node("Declaration");
        node.addChild(new Node("Type", typeToken.value))

        do{
            const idToken = this.consume(tokenType.IDENTIFIER, "Expected identifier");
            const varNode = new Node("Variable", idToken.value);

            // Check if there is declaration on the assingment
            if(this.match(tokenType.ASSIGN)){
                const assignNode = new Node("Assignment", "=");
                assignNode.addChild(new Node("Identifier", idToken.value));
                assignNode.addChild(this.relationalExpression());
                varNode.addChild(assignNode);
            }

            node.addChild(varNode);
        } while(this.match(tokenType.COMMA));

        return node;
    }

    assignment(){
        const idToken = this.consume(tokenType.IDENTIFIER, "Expected identifier");
        this.consume(tokenType.ASSIGN, "Expected '='");
        
        const node = new Node("Assignment", "=");
        node.addChild(new Node("Identifier", idToken.value));
        node.addChild(this.relationalExpression());

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
            const node = new Node("RalationalOperation", operator.value);
            node.addChild(left);
            node.addChild(this.arithmeticExpression());
            return node;
        }

        return left;
    }

    arithmeticExpression(){
        let left = this.term();

        while(this.check(tokenType.PLUS) || this.check(tokenType.MINUS)){
            const operator = this.advance();
            const node = new Node("ArithmeticOperation", operator.value);
            node.addChild(left);
            node.addChild(this.term());
            left = node;
        }

        return left;
    }

    term(){
        let left = this.factor();

        while(this.check(tokenType.MULT) || this.check(tokenType.DIV)){
            const operator = this.advance();
            const node = new Node("ArithmeticOperation", operator.value);
            node.addChild(left);
            node.addChild(this.factor());
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
            return new Node("Identifier", this.advance().value);
        }

        if(this.check(tokenType.LITER_INT) || this.check(tokenType.LITER_FLOAT) || this.check(tokenType.LITER_CHAR) || this.check(tokenType.LITER_STRING)){
            const token = this.advance();
            return new Node("Literal", token.value);
        }

        const token = this.peek();
        throw new Error(`Expected expression '${token.value}' at line ${token.line}`);
    }
}