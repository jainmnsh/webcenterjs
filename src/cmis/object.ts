import CmisBase from "./base";
import * as Util from "./util";

export default class CmisObject extends CmisBase {
    public id: string;
    public author: string;
    public publishedDate: string;
    public contributor: string;
    public updatedDate: string;
    public editedDate: string;
    public summaryHTML: string;
    public cmisProps: {};

    constructor(objNode: Node) {
        super(objNode);
        this.processMetadata();
        this.cmisProps = Util.processCmisProps(objNode);
    }

    private processMetadata(): void {
        const idNode: Node = Util.select("./atom:id", this.node, true);
        const authNameNode: Node = Util.select("./atom:author/atom:name", this.node, true);
        const publishedNode: Node = Util.select("./atom:published", this.node, true);
        const contributorNameNode: Node = Util.select("./atom:contributor/atom:name", this.node, true);
        const updateNode: Node = Util.select("./atom:updated", this.node, true);
        const editedNode: Node = Util.select("./app:edited", this.node, true);
        const summaryNode: Node = Util.select("./atom:summary", this.node, true);

        this.id = idNode ? idNode.textContent : null;
        this.author = authNameNode ? authNameNode.textContent : null;
        this.publishedDate = publishedNode ? publishedNode.textContent : null;
        this.contributor = contributorNameNode ? contributorNameNode.textContent : null;
        this.updatedDate = updateNode ? updateNode.textContent : null;
        this.editedDate = editedNode ? editedNode.textContent : null;
        this.summaryHTML = summaryNode ? summaryNode.textContent : null; 
    }

}
