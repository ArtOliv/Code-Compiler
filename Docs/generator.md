# Gerador de Código

**Languages:** [Portuguese](generator.md) | [English](generator.en.md)

---

## Visão Geral

O gerador de código é responsável por percorrer as estruturas reconhecidas pelo Parser e produzir código Assembly MIPS equivalente ao programa escrito em C.

Durante a análise sintática, sempre que uma declaração, atribuição, expressão ou estrutura de controle é reconhecida, instruções Assembly são emitidas e armazenadas em uma lista, que posteriormente é utilizada para gerar o código final.

Exemplo:

### Entrada

```c
int x = 10;
```

### Saída

```assembly
.data
x: .word 0

.text
main:
    li $t0, 10
    sw $t0, x
```

---

## Funcionamento

A geração de código é executada durante a construção da AST pelo Parser.

Cada regra da gramática é responsável tanto por construir seu respectivo nó da AST quanto por emitir as instruções Assembly correspondentes.

As principais estruturas utilizadas são:

- Lista de instruções (Instruction List)
- Gerenciador de Registradores (Register Allocator)
- Gerador de Labels (Label Generator)
- Seção de dados (.data)

Ao final da compilação, todas as instruções emitidas são organizadas nas seções `.data` e `.text`, formando o programa Assembly completo.

---

## Componentes

### Instruction

Cada instrução Assembly é representada por um objeto contendo:

- Opcode
- Operandos

Exemplo:

```text
Instruction
├── opcode: add
└── operands:
    ├── $t2
    ├── $t0
    └── $t1
```

---

### Register Allocator

O gerenciador de registradores controla automaticamente quais registradores temporários estão livres durante a geração de código.

Atualmente são utilizados:

Registradores inteiros

```
$t0 ... $t9
```

Registradores de ponto flutuante

```
$f0 ... $f18
```

Sempre que uma expressão necessita de um registrador, ele é reservado.

Quando esse valor não é mais necessário, o registrador retorna para a lista de registradores livres.

---

### Label Generator

Estruturas de controle necessitam de labels únicos.

O Label Generator cria automaticamente identificadores como:

```
ELSE0
ENDIF1
WHILE2
ENDWHILE3
FOR4
ENDFOR5
```

Esses labels são utilizados para implementar desvios condicionais e laços de repetição.

---

## Geração de código

O compilador gera código para as seguintes construções da linguagem.

### Declarações

Entrada

```c
int x;
float y;
char c;
```

Saída

```assembly
.data
x: .word 0
y: .float 0.0
c: .word 0
```

---

### Atribuições

Entrada

```c
x = 10;
```

Saída

```assembly
li $t0, 10
sw $t0, x
```

---

### Expressões aritméticas

Entrada

```c
x = a + b * 2;
```

Saída

```assembly
lw $t0, a
lw $t1, b
li $t2, 2
mul $t3, $t1, $t2
add $t4, $t0, $t3
sw $t4, x
```

A precedência dos operadores é preservada pela estrutura da gramática implementada no Parser.

---

### Expressões relacionais

Entrada

```c
x == 10
```

Saída

```assembly
lw $t0, x
li $t1, 10
seq $t2, $t0, $t1
```

São suportados os operadores:

```
==
!=
<
>
<=
>=
```

---

### Estrutura if

Entrada

```c
if(x == 10){
    x = 0;
}
```

Saída

```assembly
lw $t0, x
li $t1, 10
seq $t2, $t0, $t1
beq $t2, $zero, ELSE0

li $t3, 0
sw $t3, x

j ENDIF1

ELSE0:

ENDIF1:
```

---

### Estrutura while

Entrada

```c
while(x < 10){
    x = x + 1;
}
```

Saída

```assembly
WHILE0:

lw $t0, x
li $t1, 10
slt $t2, $t0, $t1
beq $t2, $zero, ENDWHILE1

lw $t3, x
li $t4, 1
add $t5, $t3, $t4
sw $t5, x

j WHILE0

ENDWHILE1:
```

---

### Estrutura for

Entrada

```c
for(i = 0; i < 10; i = i + 1){
}
```

Saída

```assembly
li $t0, 0
sw $t0, i

FOR0:

lw $t1, i
li $t2, 10
slt $t3, $t1, $t2
beq $t3, $zero, ENDFOR1

lw $t4, i
li $t5, 1
add $t6, $t4, $t5
sw $t6, i

j FOR0

ENDFOR1:
```

---

### Return

Entrada

```c
return 0;
```

Saída

```assembly
li $t0, 0
move $v0, $t0
```

Ao final do programa, o compilador gera automaticamente:

```assembly
li $v0, 10
syscall
```

---

## Organização do código gerado

O código Assembly é dividido em duas seções.

### Seção de dados

Responsável por armazenar as variáveis globais.

```assembly
.data
num: .word 0
decimal: .float 0.0
letter: .word 0
```

---

### Seção de texto

Contém as instruções executáveis do programa.

```assembly
.text
main:

    ...

    li $v0, 10
    syscall
```

---

## Fluxo da geração de código

Durante a construção da AST, o compilador executa a seguinte sequência:

1. Reconhece uma construção da linguagem.
2. Cria o nó correspondente na AST.
3. Reserva registradores temporários quando necessário.
4. Emite as instruções Assembly correspondentes.
5. Libera os registradores que não serão mais utilizados.
6. Gera labels para estruturas de controle.
7. Armazena todas as instruções emitidas.
8. Organiza o código nas seções `.data` e `.text`.

---

## Como testar

Clone o repositório nesse ponto:

```bash
git clone --branch Generator https://github.com/ArtOliv/Code-Compiler.git
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
- Warnings produzidos pela análise semântica;
- Erros semânticos;
- AST produzida pelo Parser;
- Código Assembly MIPS gerado.