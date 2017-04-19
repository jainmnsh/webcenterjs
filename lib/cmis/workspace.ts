import * as _ from "lodash";
import CmisBase from "./base";
import CmisEntry from "./entry";
import CmisFeed from "./feed";
import * as Util from "./util";

export default class CmisWorkspace extends CmisBase {
    public collections: {};
    public uriTemplates: {};

    constructor(node: Node) {
        super(node);
        this.collections = Util.processCollections(node);
        this.uriTemplates = Util.processUriTemplates(node);
    }

    public getQueryResults(query: string, options: {}): Promise<CmisFeed> {
        if (this.uriTemplates) {
            let url: string = this.uriTemplates["query"].template;
            let mediaType: string = this.uriTemplates["query"].mediaType;

            let params: {} = { q: query };

            if (options) {
                _.extend(params, options);
            }

            for (let key in params) {
                if (key) {
                    const value: string = params[key];
                    if (value) {
                        url = url.replace(["{", key, "}"].join(""), value);
                    }
                }
            }

            url = url.replace(/\{(.+?)\}/gi, "");

            if (url) {
                return Util.getCmisResource(url, mediaType).then((doc: Document) => {
                    return new CmisFeed(Util.select("./atom:feed", doc, true));
                });
            }
        }
    }

    public getCmisEntryById(id: string, options?: {}): Promise<CmisEntry> {
        if (this.uriTemplates) {
            let url: string = this.uriTemplates["objectbyid"].template;
            let mediaType: string = this.uriTemplates["objectbyid"].mediaType;

            let params: {} = { id };

            if (options) {
                _.extend(params, options);
            }

            for (let key in params) {
                if (key) {
                    const value: string = params[key];
                    if (value) {
                        url = url.replace(["{", key, "}"].join(""), value);
                    }
                }
            }

            url = url.replace(/\{(.+?)\}/gi, "");

            if (url) {
                return Util.getCmisResource(url, mediaType).then((doc: Document) => {
                    return new CmisEntry(Util.select("./atom:entry", doc, true));
                });
            }
        }
    }


    public getCmisEntryByPath(path: string, options: {}): Promise<CmisEntry> {

        if (this.uriTemplates) {
            let url: string = this.uriTemplates["objectbypath"].template;
            let mediaType: string = this.uriTemplates["objectbypath"].mediaType;

            let params: {} = { path };

            if (options) {
                _.extend(params, options);
            }

            for (let key in params) {
                if (key) {
                    const value: string = params[key];
                    if (value) {
                        url = url.replace(["{", key, "}"].join(""), value);
                    }
                }
            }

            url = url.replace(/\{(.+?)\}/gi, "");

            if (url) {
                return Util.getCmisResource(url, mediaType).then((doc: Document) => {
                    return new CmisEntry(Util.select("./atom:entry", doc, true));
                });
            }
        }
    }

}
