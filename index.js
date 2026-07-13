import fs from "fs";
import { Scanner } from "./Lexical_analyzer/Scanner.js";
import { Parser } from "./Syntactic_analyzer/Parser.js";
import { Printer } from "./Syntactic_analyzer/Printer.js";

const filePath = process.argv[2];

if(!filePath){
    process.exit(1);
}

const code = fs.readFileSync(filePath, "utf-8");

const scanner = new Scanner(code);
const tokens = [];
let token;

// Lexic analysis
console.log("====== Tokens List ======\n")

while((token = scanner.nextToken()) !== null){
    console.log(token);
    tokens.push(token);
}

if(scanner.errors.length > 0){
    console.error("\nLexical errors found:\n");

    for(const error of scanner.errors){
        console.error(`- ${error.message}, line: ${error.line}, column: ${error.column}`);
    }

    process.exit(1);
}

// Sintactic analysis
const parser = new Parser(tokens);
const ast = parser.parse();

if(parser.errors.length > 0){
    console.error("\nSyntactic errors found:\n");
    
    for(const error of parser.errors){
        console.error(`- ${error}`);
    }
    
    process.exit(1);
}

// Semantic analysis
console.log("\n====== Semantic Analysis ======\n");

if(parser.symbolTable.allSymbols.length > 0){
    const tableData = parser.symbolTable.allSymbols.map(sym => ({
        Name: sym.name,
        Type: sym.type,
        Scope: sym.scopeLevel === 0 ? "Global" : `Local (${sym.scopeLevel})`,
        Line: sym.line,
        Column: sym.column,
        Initialized: sym.isInitialized ? "Yes" : "No",
        Used: sym.used ? "Yes" : "No"
    }));
    
    console.table(tableData);
}

if(parser.warnings.length > 0){
    console.log("\nWarnings:");

    for(const warning of parser.warnings){
        console.log(`\x1b[33m- ${warning}\x1b[0m`);
    }

    console.log("");
}

if(parser.semanticErrors.length > 0){
    console.error("Semantic Errors found:");

    for(const error of parser.semanticErrors){
        console.error(`\x1b[31m- ${error}\x1b[0m`);
    }

    process.exit(1);
} else {
    console.log("Code is semantically correct!");
}

console.log("\n====== Syntactic Tree ======\n")
Printer.print(ast);

console.log("\n====== Generated Assembly Code ======\n");
console.log(parser.generator.getCode());