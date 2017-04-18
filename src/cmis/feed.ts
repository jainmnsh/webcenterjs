import CmisEntry from "./entry";
import CmisObject from "./object";
import * as Util from "./util";

export default class CmisFeed extends CmisObject {
    public collectionUrl: string;
    public entries: CmisEntry[];

    // self link is the upload post action url
    constructor(node: Node) {
        super(node);
        // this.collectionUrl = this.node('atom\\:collection,collection').eq(0).attr('href');
        this.processEntries();
    }

    public getSelfFeed(): Promise<CmisFeed> {
        const url: string = this.getLink("self", "application/atom+xml;type=feed");
        return this.getResource(url, "application/atom+xml;type=feed", "FEED");
    }

    public getUpEntry(): Promise<CmisEntry> {
        const url: string = this.getLink("up", "application/atom+xml;type=entry");
        return this.getResource(url, "application/atom+xml;type=entry", "ENTRY");
    }

    public getViaEntry(): Promise<CmisEntry> {
        const url: string = this.getLink("via", "application/atom+xml;type=entry");
        return this.getResource(url, "application/atom+xml;type=entry", "ENTRY");
    }

    public getNextFeed(): Promise<CmisFeed> {
        const url: string = this.getLink("next", "application/atom+xml;type=feed");
        return this.getResource(url, "application/atom+xml;type=feed", "FEED");
    }

    public getPreviosFeed(): Promise<CmisFeed> {
        const url: string = this.getLink("previous", "application/atom+xml;type=feed");
        return this.getResource(url, "application/atom+xml;type=feed", "FEED");
    }

    public removeEntry(cmisObjectId: string) {
        this.entries = this.entries.filter((entry, index, entries) => {
            return entry.cmisObjectId !== cmisObjectId;
        });
        return this.entries;
    }

    public deleteEntry(entry: CmisEntry) {
        const cmisObjectId: string = entry.cmisObjectId;
        return entry.delete().then((data: any) => {
            for (const ele of this.entries) {
                const eleObjId: string = ele.cmisObjectId;
                if (eleObjId === cmisObjectId) {
                    this.removeEntry(eleObjId);
                    break;
                }
            }
            return cmisObjectId;
        });
    }

    private processEntries(): void {
        this.entries = [];
        const entryArr: Node[] = Util.select("./atom:entry", this.node);
        let entryNode: Node;
        for (let idx: number = 0; idx < entryArr.length; idx++) {
            entryNode = entryArr[idx];
            this.entries.push(new CmisEntry(entryNode));
        }
    }

    private getResource(url: string, accept: string, type: string): Promise<any> {
        if (url) {
            return Util.getCmisResource(url, accept).then((doc: Document) => {
                if (type === "ENTRY") {
                    return new CmisEntry(Util.select("./atom:entry", doc, true));
                }

                if (type === "FEED") {
                    return new CmisFeed(Util.select("./atom:feed", doc, true));
                }
            });
        }
    }
}
