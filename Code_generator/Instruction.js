export class Instruction{
    constructor(opcode, ...operands){
        this.opcode = opcode;
        this.operands = operands;
    }

    toString(){
        if(this.operands.length === 0){
            return this.opcode;
        }

        return `${this.opcode} ${this.operands.join(", ")}`;
    }
}