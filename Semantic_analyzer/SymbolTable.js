export class SymbolTable{
    constructor(){
        this.scopes = [new Map()]; // Scope stack
        this.allSymbols = []; // Symbols history
    }

    enterScope(){
        this.scopes.push(new Map());
    }

    exitScope(){
        return this.scopes.pop();
    }

    declare(name, type, line, column){
        const currentScope = this.scopes[this.scopes.length - 1];
        
        if(currentScope.has(name)){
            return false; // Variable declared already
        }

        const symbolInfo = {
            name: name,
            type: type,
            scopeLevel: this.scopes.length - 1,
            line: line,
            column: column,
            used: false,
            isInitialized: false
        }
        
        currentScope.set(name, symbolInfo);

        this.allSymbols.push(symbolInfo);
        
        return true;
    }

    lookup(name){
        // Check stack from bottom-up
        for(let i = this.scopes.length - 1; i >= 0; i--){
            if(this.scopes[i].has(name)){
                return this.scopes[i].get(name);
            }
        
        }

        return null; // Variable not found
    }

    markUsed(name){
        const symbol = this.lookup(name);
        
        if(symbol){
            symbol.used = true;
        }
    }

    markInitialized(name) {
        const symbol = this.lookup(name);

        if(symbol){
            symbol.isInitialized = true;
        }
    }
}