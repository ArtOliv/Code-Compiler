export class Printer{
    static print(node, indent = ""){
        console.log(indent + node.type + (node.value ? ` (${node.value})` : ""));

        for(const child of node.children){
            this.print(child, indent + "    ");
        }
    }
}