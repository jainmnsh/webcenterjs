import * as Util from "./util";

export default class CmisBase {
    public node: Node;
    public title: string;
    public links: {};

    constructor(node: Node) {
        this.node = node;
        this.title = Util.select("./atom:title/text()", this.node, true).data;
        this.links = Util.processLinks(this.node);
    }

    public getLink(rel: string, type: string): string {
        const lnks: any[] = this.links[rel];
        if (lnks) {
            if (lnks.length > 1) {
                let url: string;
                for (const lnk of lnks) {
                    if (lnk.type === type) {
                        url = lnk.href;
                        break;
                    }
                }
                return url;
            } else {
                return lnks[0].href;
            }
        }
    }
}
