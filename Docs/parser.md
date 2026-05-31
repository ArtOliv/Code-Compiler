# Analisador Sintático (Parser)

**Languages:** [Portuguese](parser.md) | [English](parser.en.md)

---

## Visão Geral

O analisador sintático (ou parser) é responsável por receber a sequência de tokens gerada pelo Scanner e verificar se eles formam estruturas válidas de acordo com as regras da linguagem C. Caso o código esteja correto, ele constrói e retorna uma **Árvore Sintática Abstrata (AST - Abstract Syntax Tree)**.

Exemplo:

### Entrada (Tokens do Scanner)

```text
INT            "int"
IDENTIFIER     "x"
ASSIGN         "="
LITER_INT      "10"
SEMICOLON      ";"
```

### Saída (AST)

```text
Declaration
    Type (int)
    Variable (x)
        Assignment (=)
            Identifier (x)
            Literal (10)
```

---

## Funcionamento

O parser foi construído utilizando a arquitetura Top-Down Descendente Recursivo (Recursive Descent Parser). Ele começa pela regra principal do programa e desce pelas sub-regras da gramática.

Para percorrer os tokens, o parser utiliza os seguintes métodos de controle:

* `peek()` -> Olha o token atual sem consumi-lo.

* `advance()` → Consome o token atual e move para o próximo.

* `check(type)` → Retorna verdadeiro se o token atual for do tipo esperado.

* `match(type)` → Verifica o tipo e, se for o correto, avança automaticamente.

* `consume(type, message)` → Exige obrigatoriamente um tipo de token. Se não encontrar, lança um erro sintático.

A precedência de operadores matemáticos é garantida pelo aninhamento das chamadas na própria gramática (Ex: Operações de multiplicação em term() são agrupadas antes de somas em arithmeticExpression()).

### Tratamento de erros

Para evitar que o compilador pare a execução no primeiro erro encontrado, o parser implementa a técnica de Recuperação de Erros em Modo Pânico (Panic Mode Error Recovery).

* Quando um erro sintático é encontrado, ele é registrado na lista de erros.

* O parser aciona a função `synchronize()`.

* Essa função descarta tokens cegamente até encontrar um ponto seguro para retomar a análise (como um `;` fechando o comando quebrado ou um `}` fechando o bloco).

* Isso permite que o compilador encontre e reporte múltiplos erros de sintaxe em uma única execução.

Exemplo de saída de erro:

```text
Syntactic errors found:

- Expected ')' at line 1, column 10
- Expected ';' at line 4, column 5
- Expected '(' at line 8, column 8
```

---

## Gramática Livre de Contexto (GLC)

A sintaxe da linguagem reconhecida por este compilador segue a gramática abaixo:

```text
Program              -> int main ( ) Block

Block                -> { CommandList }

CommandList          -> Command CommandList | ε

Command              -> Declaration ;
                        | Assignment ;
                        | IfStatement
                        | WhileStatement
                        | ForStatement
                        | ReturnStatement

Declaration          -> Type Variable ( , Variable )*

Variable             -> IDENTIFIER ( = RelationalExpression )?

Type                 -> int | float | char

Assignment           -> IDENTIFIER = RelationalExpression

IfStatement          -> if ( RelationalExpression ) Block ( else Block )?

WhileStatement       -> while ( RelationalExpression ) Block

ForStatement         -> for ( ForInit ; ForCond ; ForIter ) Block

ForInit              -> Declaration | Assignment | ε
ForCond              -> RelationalExpression | ε
ForIter              -> Assignment | ε

ReturnStatement      -> return RelationalExpression ;

RelationalExpression -> ArithmeticExpression ( RelationalOperator ArithmeticExpression )?

RelationalOperator   -> == | != | < | > | <= | >=

ArithmeticExpression -> Term ( (+ | -) Term )*

Term                 -> Factor ( (* | /) Factor )*

Factor               -> ( RelationalExpression )
                        | IDENTIFIER
                        | LITER_INT
                        | LITER_FLOAT
                        | LITER_CHAR
                        | LITER_STRING
```

---

## Como testar

Clone o repositório nesse ponto:

```bash
git clone --branch Parser https://github.com/ArtOliv/Code-Compiler.git
cd Code-Compiler
```

Altere o arquivo `program.c` como desejar e execute:

```bash
node index.js program.c 
```

A saída no terminal exibirá primeiro a lista de Tokens gerada pelo Scanner e, em seguida, a Árvore Sintática impressa (ou os erros sintáticos recuperados, caso existam).