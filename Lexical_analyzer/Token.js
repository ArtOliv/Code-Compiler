export const tokenType = {
    KEYWORD: "KEYWORD",
    IDENTIFIER: "IDENTIFIER",
    LITER_INT: "LITER_INT",
    LITER_FLOAT: "LITER_FLOAT",
    LITER_STRING: "LITER_STRING",
    LITER_CHAR: "LITER_CHAR",
    OP_ASSIGNMENT: "OP_ASSIGNMENT",
    OP_RELATIONAL: "OP_RELATIONAL",
    OP_ARITHMETIC: "OP_ARITHMETIC",
    DELIMITER: "DELIMITER",
    ERROR: "ERROR",
};

export const tokenSpecs = [
    // Ignored
    [/^\s+/, null], // Whitespaces
    [/^\/\/.*/, null], // Comments
    [/^\/\*[\s\S]*?\*\//, null], // Block comments

    // Keywords and Identifiers
    [/^\b(int|float|char|if|else|while|for|return|void)\b/, tokenType.KEYWORD],
    [/^[a-zA-Z_][a-zA-Z0-9_]*/, tokenType.IDENTIFIER],

    // Literals
    [/^(0|[1-9]\d*)\.\d+/, tokenType.LITER_FLOAT],
    [/^(0|[1-9]\d*)/, tokenType.LITER_INT],
    [/^"(?:[^"\\]|\\.)*"/, tokenType.LITER_STRING],
    [/^'(?:[^\\']|\\.)'/, tokenType.LITER_CHAR],

    // Operators
    [/^(==|!=|<=|>=|<|>)/, tokenType.OP_RELATIONAL],
    [/^(=)/, tokenType.OP_ASSIGNMENT],
    [/^(\+|-|\*|\/)/, tokenType.OP_ARITHMETIC],

    // Delimiters
    [/^(\(|\)|\{|\}|\[|\]|;|,)/, tokenType.DELIMITER],
];

export class Token{
    constructor(type, value, line, column){
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }
}