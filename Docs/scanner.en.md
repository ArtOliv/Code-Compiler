# Lexical Analyzer (Scanner)

**Languages:** [Portuguese](scanner.md) | [English](scanner.en.md)

---

## Overview

The lexical analyzer (or scanner) is responsible for transforming source code into a sequence of tokens.

Example:

### Input

```c
int x = 10;
```

### Output

```
KEYWORD        "int"
IDENTIFIER     "x"
OP_ASSIGNMENT  "="
LITER_INT      "10"
DELIMITER      ";"
```

---

## How it Works

The lexer scans the source code character by character using:

* A **cursor**

* Regular Expressions (RegEx)

* The **maximal munch** strategy (longest possible match):

  * Order defines the scanner behavior
  * Rule:

    * more specific tokens -> first
    * more generic tokens -> later

  Example: `==` before `=` or `FLOAT` before `INT`

* Error handling and position tracking:

  * `line` → current line
  * `column` → current column

If no pattern matches the current character, it allows error messages such as:

```
Invalid token '@' at line 1, column 10
```

---

## Scanner Flow

1. Takes the remaining input (`slice`)
2. Tests each RegEx in order
3. Finds the first valid match
4. Creates a token
5. Advances the cursor
6. Repeats until the end

---

## Token Types

### Keywords

```
int, float, char, if, else, while, for, return, void
```

---

### Identifiers

```regex
^[a-zA-Z_][a-zA-Z0-9_]*
```

---

### Literals

* Integers: `^(0|[1-9]\d*)`
* Float: `^(0|[1-9]\d*)\.\d+`
* String: `^"(?:[^"\\]|\\.)*"`
* Char: `^'(?:[^\\']|\\.)'`

---

### Operators

* Arithmetic: `+ - * /`
* Relational: `== != <= >= < >`
* Assignment: `=`

---

### Delimiters

```
( ) { } [ ] ; ,
```

---

### Ignored Tokens

* Line comments: `//`
* Block comments: `/* ... */`
* Whitespace

---

## How to Test

Clone the repository at this stage:

```bash
git clone --branch Scanner https://github.com/ArtOliv/Code-Compiler.git
cd Code-Compiler
```

Modify the `program.c` file as desired and run:

```bash
# Using Makefile
make run

# Or directly
node index.js program.c 
```

Expected output in the terminal:

```
{ type: 'INT', value: 'int', line: 1, column: 1 } 
{ type: 'IDENTIFIER', value: 'x', line: 1, column: 5 } 
{ type: 'OP_ASSIGNMENT', value: '=', line: 1, column: 7 } 
{ type: 'LITER_INT', value: '10', line: 1, column: 9 } 
{ type: 'DELIMITER', value: ';', line: 1, column: 11 }
```
