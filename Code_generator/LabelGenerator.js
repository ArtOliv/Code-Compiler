export class LabelGenerator{
    constructor(){
        this.counter = 0;
    }

    generate(prefix = "L"){
        return `${prefix}${this.counter++}`;
    }
}