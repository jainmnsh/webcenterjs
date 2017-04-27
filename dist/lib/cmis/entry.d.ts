import CmisFeed from "./feed";
import CmisObject from "./object";
export default class CmisEntry extends CmisObject {
    content: string;
    baseType: string;
    cmisObjectId: string;
    downTreeUrl: string;
    constructor(node: Node);
    delete(comments?: string): Promise<any>;
    getSelfEntry(): Promise<CmisEntry>;
    getUpEntry(): Promise<CmisEntry>;
    getEditEntry(): Promise<CmisEntry>;
    getDownFeed(): Promise<CmisFeed>;
    getUpFeed(): Promise<CmisFeed>;
    private processEntry(node);
    private getResource(url, accept, type);
}
