export default class CmisBase {
    node: Node;
    title: string;
    links: {};
    constructor(node: Node);
    getLink(rel: string, type: string): string;
}
