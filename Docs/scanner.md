# Analisador Léxico (Scanner)

**Languages:** [Portuguese](scanner.md) | [English](scanner.en.md)

---

## Visão Geral

O analisador léxico (ou scanner) é responsável por transformar o código fonte em uma sequência de tokens.

Exemplo:

### Entrada

```c
int x = 10;
```

### Saída

```
KEYWORD        "int"
IDENTIFIER     "x"
OP_ASSIGNMENT  "="
LITER_INT      "10"
DELIMITER      ";"
```

---

## Funcionamento

O lexer percorre o código caractere por caractere utilizando:

* Um **cursor**
* Expressões regulares (RegEx)
* Estratégia de **maximal munch** (maior casamento possível):
    * Ordem define o comportamento do scanner
    * Regra:
        * tokens mais específicos -> antes
        * tokens mais genéricos -> depois

    Exemplo: `==` antes de `=` ou `FLOAT` antes de `INT`
* Tratamento de erro e controle de posição:
    * `line` → linha atual
    * `column` → coluna atual

Se nenhum padrão casar com o caracter atual, permite mensagens de erro como:

```
Token { type: 'ERROR', value: '@', line: 1, column: 12 }
```

---

## Fluxo do Scanner

1. Pega o restante da string (`slice`)
2. Testa cada RegEx em ordem
3. Encontra o primeiro match válido
4. Cria um token
5. Avança o cursor
6. Repete até o fim

---

## Tipos de Tokens

### Palavras-chave

```
int, float, char, if, else, while, for, return, void
```



### Identificadores

```regex
^[a-zA-Z_][a-zA-Z0-9_]*
```

### Literais

* Inteiros: `^(0|[1-9]\d*)`
* Float: `^(0|[1-9]\d*)\.\d+`
* String: `^"(?:[^"\\]|\\.)*"`
* Char: `^'(?:[^\\']|\\.)'`

### Operadores

* Aritméticos: `+ - * /`
* Relacionais: `== != <= >= < >`
* Atribuição: `=`

### Delimitadores

```
( ) { } [ ] ; ,
```

### Tokens ignorados

* Comentários de linha: `//`
* Comentários de bloco: `/* ... */`
* Espaços em branco

---

## Como testar

Clone o repositório nesse ponto:

```bash
git clone --branch Scanner https://github.com/ArtOliv/Code-Compiler.git
cd Code-Compiler
```

Altere o arquivo `program.c` como desejar e execute:

```bash
# Com Makefile
make run

# Ou pelo comando
node index.js program.c 
```

Saída esperada no terminal:

```
Token { type: 'INT', value: 'int', line: 1, column: 1 } 
Token { type: 'IDENTIFIER', value: 'x', line: 1, column: 5 } 
Token { type: 'OP_ASSIGNMENT', value: '=', line: 1, column: 7 } 
Token { type: 'LITER_INT', value: '10', line: 1, column: 9 } 
Token { type: 'ERROR', value: '@', line: 1, column: 12 }
Token { type: 'DELIMITER', value: ';', line: 1, column: 13 }
```
