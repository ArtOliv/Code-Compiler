# Code Compiler

**Languages:** [Portuguese](README.md) | [English](README.en.md)

---

Este projeto é uma implementação de um compilador simplificado da linguagem C, desenvolvido com o objetivo de estudo de um pipeline de um compilador convencional.

---

## Objetivo

O objetivo deste projeto é implementar um compilador completo, cobrindo:

* Análise léxica
* Análise sintática
* Análise semântica
* Geração de código
* Otimizador

---

## Arquitetura

O compilador segue a pipeline clássica:

```
Código fonte -> Scanner -> Parser -> Semântica -> Gerador de Código -> Otimizador -> Código de Máquina
```

---

## Estrutura do projeto

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

## Documentação

A documentação detalhada de cada etapa do compilador está disponível na pasta `docs/`:

* [Scanner (Analisador Léxico)](docs/scanner.md)

---

## Tecnologias

* JavaScript (Node.js)
* Expressões Regulares (RegEx)

---

## Autor

`Arthur Carvalho Rodrigues Oliveira`

Projeto desenvolvido para estudo em compiladores.

---

## Licença

Este projeto está licenciado sob a MIT License — Sinta-se à vontade para utilizar, modificar e adaptar.
