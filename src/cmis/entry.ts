import axios, {AxiosResponse} from "axios";
import CmisFeed from "./feed";
import CmisObject from "./object";
import * as Util from "./util";

export default class CmisEntry extends CmisObject {
    public content: string;
    public baseType: string;
    public cmisObjectId: string;

    public downTreeUrl: string;

    constructor(node: Node) {
        super(node);
        this.processEntry(node);
    }

    public delete(comments?: string): Promise<any> {
        let url: string = [this.getLink("self", "application/atom+xml;type=entry"), "&_method=delete"].join("");
        url = comments ? [url, "comments=" + comments].join("") : url;
        const headers: {} = {
            Accept: "application/atom+xml;type=entry",
        };
        return axios.delete(url, {
            headers,
            withCredentials: true,
        }).then((response: AxiosResponse) => {
            return response.data;
        });
    }

    public getSelfEntry(): Promise<CmisEntry> {
        const url: string = this.getLink("self", "application/atom+xml;type=entry");
        return this.getResource(url, "application/atom+xml;type=entry", "ENTRY");
    }
    public getUpEntry(): Promise<CmisEntry> {
        const url: string = this.getLink("up", "application/atom+xml;type=entry");
        return this.getResource(url, "application/atom+xml;type=entry", "ENTRY");
    }
    public getEditEntry(): Promise<CmisEntry> {
        const url: string = this.getLink("edit", "application/atom+xml;type=entry");
        return this.getResource(url, "application/atom+xml;type=entry", "ENTRY");
    }
    public getDownFeed(): Promise<CmisFeed> {
        const url: string = this.getLink("down", "application/atom+xml;type=feed");
        return this.getResource(url, "application/atom+xml;type=feed", "FEED");
    }

    public getUpFeed(): Promise<CmisFeed> {
        const url: string = this.getLink("up", "application/atom+xml;type=feed");
        return this.getResource(url, "application/atom+xml;type=feed", "FEED");
    }

    private processEntry(node: Node) {
        this.content = Util.select("./atom:content/text()", node, true).data;

        if (this.cmisProps) {
            this.baseType = this.cmisProps["cmis:baseTypeId"].value;
            this.cmisObjectId = this.cmisProps["cmis:objectId"].value;
        }

        this.downTreeUrl = this.getLink("down", "application/cmistree+xml");
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
