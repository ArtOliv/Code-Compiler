export const tokenType = {
    // Keywords
    INT: "INT",
    FLOAT: "FLOAT",
    CHAR: "CHAR",
    IF: "IF",
    ELSE: "ELSE",
    WHILE: "WHILE",
    FOR: "FOR",
    RETURN: "RETURN",

    // Identifier
    IDENTIFIER: "IDENTIFIER",

    // Literals
    LITER_INT: "LITER_INT",
    LITER_FLOAT: "LITER_FLOAT",
    LITER_STRING: "LITER_STRING",
    LITER_CHAR: "LITER_CHAR",

    // Assignment
    ASSIGN: "ASSIGN",

    // Relational operators
    EQ: "EQ",
    NE: "NE",
    LT: "LT",
    GT: "GT",
    LE: "LE",
    GE: "GE",

    // Arithmetic operators
    PLUS: "PLUS",
    MINUS: "MINUS",
    MULT: "MULT",
    DIV: "DIV",

    // Delimiters
    LPAREN: "LPAREN",
    RPAREN: "RPAREN",
    LBRACE: "LBRACE",
    RBRACE: "RBRACE",
    LBRACKET: "LBRACKET",
    RBRACKET: "RBRACKET",
    SEMICOLON: "SEMICOLON",
    COMMA: "COMMA",

    // Error
    ERROR: "ERROR",

    // End of File
    EOF: "EOF",
};

export const tokenSpecs = [
    // Ignored
    [/^\s+/, null], // Whitespaces
    [/^\/\/.*/, null], // Comments
    [/^\/\*[\s\S]*?\*\//, null], // Block comments

    // Keywords
    [/^int\b/, tokenType.INT],
    [/^float\b/, tokenType.FLOAT],
    [/^char\b/, tokenType.CHAR],
    [/^if\b/, tokenType.IF],
    [/^else\b/, tokenType.ELSE],
    [/^while\b/, tokenType.WHILE],
    [/^for\b/, tokenType.FOR],
    [/^return\b/, tokenType.RETURN],
    
    // Identifier
    [/^[a-zA-Z_][a-zA-Z0-9_]*/, tokenType.IDENTIFIER],

    // Literals
    [/^(0|[1-9]\d*)\.\d+/, tokenType.LITER_FLOAT],
    [/^(0|[1-9]\d*)/, tokenType.LITER_INT],
    [/^"(?:[^"\\]|\\.)*"/, tokenType.LITER_STRING],
    [/^'(?:[^\\']|\\.)'/, tokenType.LITER_CHAR],

    // Relational operators
    [/^==/, tokenType.EQ],
    [/^!=/, tokenType.NE],
    [/^<=/, tokenType.LE],
    [/^>=/, tokenType.GE],
    [/^</, tokenType.LT],
    [/^>/, tokenType.GT],

    // Assignment
    [/^(=)/, tokenType.ASSIGN],

    // Arithmetic operators
    [/^\+/, tokenType.PLUS],
    [/^-/, tokenType.MINUS],
    [/^\*/, tokenType.MULT],
    [/^\//, tokenType.DIV],

    // Delimiters
    [/^\(/, tokenType.LPAREN],
    [/^\)/, tokenType.RPAREN],
    [/^\{/, tokenType.LBRACE],
    [/^\}/, tokenType.RBRACE],
    [/^\[/, tokenType.LBRACKET],
    [/^\]/, tokenType.RBRACKET],
    [/^;/, tokenType.SEMICOLON],
    [/^,/, tokenType.COMMA],
];

export class Token{
    constructor(type, value, line, column){
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }
}