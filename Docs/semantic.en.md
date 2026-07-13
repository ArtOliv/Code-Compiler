# Semantic Analyzer

**Languages:** [Portuguese](semantic.md) | [English](semantic.en.md)

---

## Overview

The semantic analyzer is responsible for verifying whether a program is not only syntactically correct, but also semantically valid.

During this stage, the compiler performs semantic checks while constructing the Abstract Syntax Tree (AST). To achieve this, it uses a Symbol Table to store information about declared variables and their corresponding scopes.

Unlike the Parser, which only verifies the program's structure, the semantic analyzer validates the meaning of language constructs.

Example:

### Input

```c
int x;
x = 10;
```

Result:

```
Semantically valid program
```

---

Another example:

### Input

```c
y = 10;
```

Result:

```
Semantic Error:
Undeclared variable 'y'.
```

---

## How It Works

Semantic analysis is performed during AST construction by the Parser.

Whenever a declaration, assignment, or expression is recognized, the compiler performs the corresponding semantic checks and records or retrieves information from the Symbol Table.

The main structures involved are:

- AST (Abstract Syntax Tree)
- Symbol Table
- Nested Scopes

Each `{ ... }` block creates a new scope.

When leaving a block, its scope is removed and the compiler performs the final checks for variables declared within that scope, such as detecting variables that were never used.

---

## Symbol Table

Each declared variable is stored together with information such as:

- Name
- Type
- Scope
- Declaration line
- Declaration column
- Initialization status
- Usage status

Example:

| Name | Type | Initialized | Used |
|------|------|-------------|------|
| num | int | Yes | Yes |
| x | float | No | No |

---

## Performed Checks

The semantic analyzer performs the following validations.

### Duplicate Declaration

A variable cannot be declared more than once within the same scope.

Input:

```c
int x;
int x;
```

Output:

```
Semantic Error:
Redeclaration of variable 'x'.
```

### Use of Undeclared Variables

Every variable must be declared before it can be used.

Input

```c
x = 5;
```

Output

```
Semantic Error:
Undeclared variable 'x'.
```

### Type Compatibility

The compiler verifies whether the type of an expression can be assigned to a variable.

Valid example

```c
float x;
x = 10;
```

Accepted implicit conversion:

```
int → float
```

---

Valid example

```c
char c;
c = 65;
```

Accepted implicit conversion:

```
int → char
```

---

Invalid example

```c
int x;
x = "text";
```

Output

```
Semantic Error:
Incompatible types.
Cannot assign 'string' to 'int'.
```

### Operation Compatibility

Before generating the AST node for an expression, the compiler verifies whether both operands are compatible with the requested operation.

Example

```c
10 + 2
```

Result

```
Expression type → int
```

---

Example

```c
2.5 + 4
```

Result

```
Expression type → float
```

---

Invalid example

```c
"abc" + 10
```

Output

```
Semantic Error:
Operator '+' cannot be applied to types 'string' and 'int'.
```

### Uninitialized Variables

Whenever a variable is used, the compiler verifies whether it has previously received a value.

Input

```c
int x;
int y;

y = x;
```

Output

```
Warning:
Variable 'x' is used uninitialized.
```

Compilation continues normally.

### Unused Variables

When leaving a scope, the compiler checks whether any declared variable was never used.

Input

```c
int x;
```

Output

```
Warning:
Variable 'x' was declared but never used.
```

---

## Scopes

Each `{}` block creates a new scope.

Example

```c
int x = 10;

{
    int x = 20;
}
```

The second variable is valid because it belongs to a different scope.

---

## Semantic Analysis Flow

During AST construction, the compiler performs the following steps:

1. Finds a declaration.
2. Registers the variable in the Symbol Table.
3. Stores its type.
4. If an assignment exists, checks type compatibility.
5. Marks the variable as initialized.
6. Whenever a variable is used, it verifies:
   - whether it has been declared;
   - whether it has been initialized;
   - marks it as used.
7. When leaving a scope, checks for declared variables that were never used.

---

## Generated Messages

The semantic analyzer can produce two kinds of messages.

### Semantic Errors

These indicate violations of the language's semantic rules.

Example

```
Semantic Error (Line 4, Column 8):
Undeclared variable 'value'.
```

---

```
Semantic Error (Line 10, Column 15):
Redeclaration of variable 'count'.
```

---

```
Semantic Error (Line 7, Column 12):
Incompatible types.
Cannot assign 'string' to 'int'.
```

### Warnings

Warnings do not prevent compilation, but indicate potential issues in the source code.

Example

```
Warning:
Variable 'x' is used uninitialized.
```

---

```
Warning:
Variable 'temp' was declared but never used.
```

---

## How to Test

Clone the repository at this stage:

```bash
git clone --branch Semantic https://github.com/ArtOliv/Code-Compiler.git
cd Code-Compiler
```

Modify the `program.c` file as desired and run:

```bash
node index.js program.c
```

The output will display:

- Tokens generated by the Scanner;
- Recovered syntax errors (if any);
- Generated Symbol Table;
- Warnings produced during semantic analysis;
- Semantic errors;
- AST generated by the Parser.
```