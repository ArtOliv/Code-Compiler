# Analisador Semântico

**Languages:** [Portuguese](parser.md) | [English](parser.en.md)

---

## Visão Geral

O analisador semântico é responsável por verificar se o programa, além de sintaticamente correto, também é semanticamente válido.

Durante essa etapa o compilador realiza verificações semânticas enquanto constrói a Árvore Sintática Abstrata (AST). Para isso, utiliza uma Tabela de Símbolos para armazenar informações sobre as variáveis declaradas e seus respectivos escopos.

Diferentemente do Parser, que verifica apenas a estrutura do programa, o analisador semântico verifica o significado das construções da linguagem.

Exemplo:

### Entrada

```c
int x;
x = 10;
```

Resultado:

```
Programa semanticamente válido
```

---

Outro exemplo:

### Entrada

```c
y = 10;
```

Resultado:

```
Semantic Error:
Undeclared variable 'y'.
```

---

## Funcionamento

A análise semântica é executada durante a construção da AST pelo Parser.

Sempre que uma declaração, atribuição ou expressão é reconhecida, o compilador realiza as verificações semânticas correspondentes e registra ou consulta informações na Tabela de Símbolos.

As principais estruturas utilizadas são:

- AST (Abstract Syntax Tree)
- Symbol Table
- Escopos aninhados (Nested Scopes)

Cada bloco `{ ... }` cria um novo escopo.

Ao sair do bloco, o escopo é removido e o compilador realiza as verificações finais referentes às variáveis declaradas naquele escopo, como a detecção de variáveis nunca utilizadas.

---

## Tabela de Símbolos

Cada variável declarada é armazenada contendo informações como:

- Nome
- Tipo
- Escopo
- Linha da declaração
- Coluna da declaração
- Se foi inicializada
- Se foi utilizada

Exemplo:

| Nome | Tipo | Inicializada | Utilizada |
|------|------|--------------|-----------|
| num | int | Sim | Sim |
| x | float | Não | Não |

---

## Verificações realizadas

O analisador implementa as seguintes verificações.

### Declaração duplicada:

Uma variável não pode ser declarada duas vezes dentro do mesmo escopo.

Entrada:

```c
int x;
int x;
```

Saída:

```
Semantic Error:
Redeclaration of variable 'x'.
```

### Uso de variável não declarada:

Toda variável utilizada deve existir na Tabela de Símbolos.

Entrada

```c
x = 5;
```

Saída

```
Semantic Error:
Undeclared variable 'x'.
```

### Compatibilidade de tipos:

O compilador verifica se o tipo da expressão pode ser atribuído à variável.

Exemplo válido

```c
float x;
x = 10;
```

Conversão implícita aceita:

```
int → float
```

---

Exemplo válido

```c
char c;
c = 65;
```

Conversão implícita aceita:

```
int → char
```

---

Exemplo inválido

```c
int x;
x = "texto";
```

Saída

```
Semantic Error:
Incompatible types.
Cannot assign 'string' to 'int'.
```

### Compatibilidade de operações:

Antes de gerar a AST da expressão, o compilador verifica se os operandos podem participar da operação.

Exemplo

```c
10 + 2
```

Resultado

```
Tipo da expressão → int
```

---

Exemplo

```c
2.5 + 4
```

Resultado

```
Tipo da expressão → float
```

---

Exemplo inválido

```c
"abc" + 10
```

Saída

```
Semantic Error:
Operator '+' cannot be applied to types 'string' and 'int'.
```

### Variáveis não inicializadas:

Sempre que uma variável é utilizada, o compilador verifica se ela recebeu algum valor anteriormente.

Entrada

```c
int x;
int y;

y = x;
```

Saída

```
Warning:
Variable 'x' is used uninitialized.
```

A compilação continua normalmente.

### Variáveis não utilizadas:

Ao sair de um escopo, o compilador verifica se alguma variável declarada nunca foi utilizada.

Entrada

```c
int x;
```

Saída

```
Warning:
Variable 'x' was declared but never used.
```

---

## Escopos

Cada bloco `{}` cria um novo escopo.

Exemplo

```c
int x = 10;

{
    int x = 20;
}
```

A segunda variável é válida, pois pertence a um escopo diferente.

---

## Fluxo da análise semântica

Durante a construção da AST, o compilador executa a seguinte sequência:

1. Encontra uma declaração.
2. Registra a variável na Tabela de Símbolos.
3. Armazena seu tipo.
4. Caso exista uma atribuição, verifica a compatibilidade de tipos.
5. Marca a variável como inicializada.
6. Quando uma variável é utilizada, verifica:
   - se foi declarada;
   - se foi inicializada;
   - marca-a como utilizada.
7. Ao sair de um escopo, verifica se existem variáveis declaradas que nunca foram utilizadas.

---

## Mensagens produzidas

O analisador pode produzir dois tipos de mensagens.

### Semantic Errors

Indicam violações das regras semânticas da linguagem.

Exemplo

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

São avisos que não impedem a compilação, mas indicam possíveis problemas no código.

Exemplo

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

## Como testar

Clone o repositório nesse ponto:

```bash
git clone --branch Semantic https://github.com/ArtOliv/Code-Compiler.git
cd Code-Compiler
```

Altere o arquivo `program.c` como desejar e execute:

```bash
node index.js program.c
```

A saída exibirá:

- Tokens gerados pelo Scanner;
- Erros sintáticos recuperados (caso existam);
- Tabela de símbolos gerada;
- Warnings produzidos pela análise semântica.
- Erros semânticos;
- AST produzida pelo Parser;