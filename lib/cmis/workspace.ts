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

// import * as _ from "lodash";
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
                params = {
                    ...params,
                    ...options,
                };
                // _.extend(params, options);
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
                params = {
                    ...params,
                    ...options,
                };
                // _.extend(params, options);
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
                params = {
                    ...params,
                    ...options,
                };
                // _.extend(params, options);
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
