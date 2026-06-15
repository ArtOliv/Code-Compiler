export class Node{
    constructor(type, value = null, evalType = null){
        this.type = type;
        this.evalType = evalType; // Used for semantic analysis
        this.value = value;
        this.children = [];
    }

    addChild(node){
        this.children.push(node);
    }
}