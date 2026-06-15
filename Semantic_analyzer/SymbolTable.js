export class SymbolTable{
    constructor(){
        this.scopes = [new Map()]; // Scope stack
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
        
        currentScope.set(name, {type, line, column, used: false, isInitialized: false});
        
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