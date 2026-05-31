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

console.log("\n===== Syntactic Tree =====\n")
Printer.print(ast);