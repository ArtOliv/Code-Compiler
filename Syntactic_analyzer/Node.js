export class Node{
    constructor(type, value = null){
        this.type = type;
        this.value = value;
        this.children = [];
    }

    addChild(node){
        this.children.push(node);
    }
}