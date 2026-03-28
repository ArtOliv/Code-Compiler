import { tokenSpecs, Token } from "./Token.js";

export class Scanner{
    constructor(input){
        this.input = input;
        this.cursor = 0;
        this.line = 1;
        this.column = 1;
    }

    nextToken(){
        if(this.cursor >= this.input.length) return null;

        const string = this.input.slice(this.cursor); // Slice input based on cursor position

        for(const [regex, type] of tokenSpecs){
            const match = regex.exec(string); // Apply RegEx rules

            if(match){
                const token = match[0];

                // Save current token position
                const tokenLine = this.line;
                const tokenColumn = this.column;

                // Move the cursor and update row and column
                this.advance(token);

                if(type === null){
                    return this.nextToken(); // Ignore and goes to next token
                }

                return new Token(type, token, tokenLine, tokenColumn); // Output
            }
        }

        throw new Error(`Invalid token: '${string[0]}' on row ${this.line}, column ${this.column}`);
    }

    advance(token){
        for(let i = 0; i < token.length; i++){
            if(token[i] === "\n"){
                this.line++;
                this.column = 1;
            } else {
                this.column++;
            }
        }

        this.cursor += token.length; // Move cursor
    }
}