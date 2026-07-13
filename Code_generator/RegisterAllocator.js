export class RegisterAllocator{
    constructor(){
        this.freeIntRegisters = [
            "$t0", "$t1", "$t2", "$t3", "$t4",
            "$t5", "$t6", "$t7", "$t8", "$t9"
        ];

        this.freeFloatRegisters = [
            "$f0", "$f2", "$f4", "$f6", "$f8",
            "$f10", "$f12", "$f14", "$f16", "$f18"
        ];
    }

    allocate(type = "int"){
        if(type === "float"){
            if(this.freeFloatRegisters.length === 0){
                throw new Error("No float registers available.");
            }

            return this.freeFloatRegisters.shift();
        }

        if(this.freeIntRegisters.length === 0){
            throw new Error("No temporary registers available.");
        }

        return this.freeIntRegisters.shift();
    }

    free(register){
        if(!register) return;

        if(register.startsWith("$f")){
            if(!this.freeFloatRegisters.includes(register)){
                this.freeFloatRegisters.push(register);
            }

            return;
        }

        if(register !== "$zero"){
            if(!this.freeIntRegisters.includes(register)){
                this.freeIntRegisters.push(register);
            }
        }
    }

    reset(){
        this.freeIntRegisters = [
            "$t0", "$t1", "$t2", "$t3", "$t4",
            "$t5", "$t6", "$t7", "$t8", "$t9"
        ];

        this.freeFloatRegisters = [
            "$f0", "$f2", "$f4", "$f6", "$f8",
            "$f10", "$f12", "$f14", "$f16", "$f18"
        ];
    }
}