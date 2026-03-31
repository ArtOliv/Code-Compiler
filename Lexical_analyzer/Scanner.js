import { tokenType, tokenSpecs, Token } from "./Token.js";

export class Scanner{
    constructor(input){
        this.input = input;
        this.cursor = 0;
        this.line = 1;
        this.column = 1;
        this.errors = [];
    }

    nextToken(){
        if(this.cursor >= this.input.length) return null;

        while(true){
            const string = this.input.slice(this.cursor); // Slice input based on cursor position
            let matched = false;

            for(const [regex, type] of tokenSpecs){
                if(type != null) continue;

                const match = regex.exec(string);

                if(match){
                    this.advance(match[0]);
                    matched = true;
                    break;
                }
            }

            if(!matched) break;
        }

        if(this.cursor >= this.input.length) return null;

        const { lexeme, line, column } = this.getNextLexeme();

        for(const [regex, type] of tokenSpecs){
            if(type === null) continue;

            const match = regex.exec(lexeme);

            if (match && match[0] === lexeme) {
                return new Token(type, lexeme, line, column);
            }
        }

        this.errors.push({message: `Invalid token '${lexeme}'`, line, column});

        return new Token(tokenType.ERROR , lexeme, line, column);
    }

    getNextLexeme(){
        let lexeme = "";
        let startLine = this.line;
        let startColumn = this.column;
        
        while(this.cursor < this.input.length){
            const char = this.input[this.cursor];
            
            // Stop when delimiter found
            if(/\s/.test(char) || /[\(\)\{\}\[\];,]/.test(char)){
                break;
            }

            // Stop when operators found
            if(/[=\+\-\*\/<>!]/.test(char)){
                if(lexeme.length === 0){
                    lexeme += char;
                    this.advance(char);
                    
                    // Test double operator
                    const next = this.input[this.cursor];
                    if(next && /[=]/.test(next)){
                        lexeme += next;
                        this.advance(next);
                    }
                    
                    return { lexeme, line: startLine, column: startColumn };
                }

                break;
            } 
            
            lexeme += char;
            this.advance(char);
        }
        
        // Ensures that at least one character is read
        if(lexeme.length === 0){
            lexeme = this.input[this.cursor];
            this.advance(lexeme);
        }

        return { lexeme, line: startLine, column: startColumn };
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