/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
