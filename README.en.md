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
* Optimization

---

## Architecture

The compiler follows the classic pipeline:

```
Source Code -> Scanner -> Parser -> Semantic Analysis -> Code Generator -> Optimizer -> Machine Code
```

---

## Project Structure

```
Code-Compiler/
|
├── Lexical_analyzer/
│   ├── Scanner.js
│   └── Token.js
├── Docs/
│   └── lexer.md
├── index.js
├── program.c
├── Makefile
└── README.md
```

---

## Documentation

Detailed documentation for each stage of the compiler is available in the `docs/` directory:

* [Scanner (Lexical Analyzer)](docs/scanner.md)

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
