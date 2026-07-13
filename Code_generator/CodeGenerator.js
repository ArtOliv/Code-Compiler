import { RegisterAllocator } from "./RegisterAllocator.js";
import { LabelGenerator } from "./LabelGenerator.js";
import { Instruction } from "./Instruction.js";

export class CodeGenerator{

    constructor(){
        this.instructions = [];
        this.data = [];
        this.buffer = [];
        this.buffering = false;
        this.registers = new RegisterAllocator();
        this.labels = new LabelGenerator();
        this.variables = new Map();
    }

    beginBuffer(){
        this.buffer = [];
        this.buffering = true;
    }

    endBuffer(){
        this.buffering = false;

        const code = [...this.buffer];
        this.buffer = [];

        return code;
    }

    emit(opcode, ...operands){
        const inst = new Instruction(opcode, ...operands);

        if(this.buffering){
            this.buffer.push(inst);
        } else {
            this.instructions.push(inst);
        }
    }

    emitRaw(text){
        const inst = {toString(){return text;}};

        if(this.buffering){
            this.buffer.push(inst);
        }else{
            this.instructions.push(inst);
        }
    }

    declareVariable(name, type){
        if(this.variables.has(name))
            return;

        this.variables.set(name, name);

        if(type === "float"){
            this.data.push(`${name}: .float 0.0`);
        }
        else{
            this.data.push(`${name}: .word 0`);
        }
    }

    loadImmediate(value, type = "int"){
        const reg = this.registers.allocate(type);

        if(type==="float"){
            this.emit("li.s",reg,value);
        }else{
            this.emit("li",reg,value);
        }

        return reg;
    }

    loadVariable(name, type = "int"){
        const reg = this.registers.allocate(type);

        if(type==="float"){
            this.emit("l.s",reg,name);
        }else{
            this.emit("lw",reg,name);
        }

        return reg;
    }

    storeVariable(name, register, type = "int"){
        if(type==="float"){
            this.emit("s.s",register,name);
        }else{
            this.emit("sw",register,name);
        }
    }

    add(left, right, type = "int"){
        const result = this.registers.allocate();

        if(type === "float"){
            this.emit("add.s", result, left, right);
        }else{
            this.emit("add", result, left, right);
        }

        return result;
    }

    sub(left, right, type = "int"){
        const result = this.registers.allocate();

        if(type === "float"){
            this.emit("sub.s", result, left, right);
        }else{
            this.emit("sub", result, left, right);
        }

        return result;
    }

    mul(left, right, type = "int"){
        const result = this.registers.allocate();

        if(type === "float"){
            this.emit("mul.s", result, left, right);
        }else{
            this.emit("mul", result, left, right);
        }

        return result;
    }

    div(left, right, type = "int"){
        const result = this.registers.allocate();

        if(type === "float"){
            this.emit("div.s", result, left, right);
        }else{
            this.emit("div", left, right);
            this.emit("mflo", result);
        }

        return result;
    }

    beq(r1,r2,label){
        this.emit("beq",r1,r2,label);
    }

    bne(r1,r2,label){
        this.emit("bne",r1,r2,label);
    }

    blt(r1,r2,label){
        this.emit("blt",r1,r2,label);
    }

    bgt(r1,r2,label){
        this.emit("bgt",r1,r2,label);
    }

    ble(r1,r2,label){
        this.emit("ble",r1,r2,label);
    }

    bge(r1,r2,label){
        this.emit("bge",r1,r2,label);
    }

    label(name){
        this.emitRaw(`${name}:`);
    }

    jump(label){
        this.emit("j",label);
    }

    finish(){
        this.emit("li","$v0",10);
        this.emit("syscall");
    }

    getCode(){
        let code="";

        code+=".data\n";

        for(const d of this.data){
            code+=d+"\n";
        }

        code+="\n.text\n";
        code+="main:\n";

        for(const inst of this.instructions){
            const text = inst.toString();

            if(text.endsWith(":")){
                code += text + "\n";
            }else{
                code += "    " + text + "\n";
            }
        }

        return code;
    }
}