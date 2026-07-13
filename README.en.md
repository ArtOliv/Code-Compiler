# Code Compiler

**Languages:** [Portuguese](README.md) | [English](README.en.md)

---

This project is an implementation of a simplified C language compiler, developed with the goal of studying a conventional compiler pipeline.

---

## Objective

The goal of this project is to implement a complete compiler, covering:

* Lexical Analysis
* Syntax Analysis
* Semantic Analysis
* Code Generation

---

## Architecture

The compiler follows the classic pipeline:

```
Source Code -> Scanner -> Parser -> Semantic Analysis -> Code Generator -> Machine Code
```

---

## Project Structure

```
Code-Compiler/
├── Lexical_analyzer/
│   ├── Scanner.js
│   └── Token.js
├── Syntactic_analyzer/
│   ├── Parser.js
│   ├── Printer.js
│   └── Node.js
├── Semantic_analyzer/
│   └── SymbolTable.js
├── Code_generator/
│   ├── CodeGenerator.js
│   ├── Instructions.js
│   ├── LabelGenerator.js
│   └── RegisterAllocator.js
├── Docs/
│   ├── parser.md
│   ├── semantic.md
│   ├── generator.md
│   └── scanner.md
├── index.js
├── program.c
└── README.md
```

---

## Documentation

Detailed documentation for each stage of the compiler is available in the `Docs/` directory:

* [Scanner (Lexical Analyzer)](Docs/scanner.en.md)
* [Parser (Syntactic Analyzer)](Docs/parser.en.md)
* [Semantic Analyzer](Docs/semantic.en.md)
* [Code Generator](Docs/generator.en.md)

---

## Technologies

* JavaScript (Node.js)
* Regular Expressions (RegEx)

---

## Author

`Arthur Carvalho Rodrigues Oliveira`

Project developed for compiler studies.

---

## License

This project is licensed under the MIT License — feel free to use, modify, and adapt it.
