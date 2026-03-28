import fs from "fs";
import { Scanner } from "./Lexical_analyzer/Scanner.js";

const filePath = process.argv[2];

if(!filePath){
    process.exit(1);
}

const code = fs.readFileSync(filePath, "utf-8");

const scanner = new Scanner(code);

let token;

while((token = scanner.nextToken()) !== null){
    console.log(token);
}