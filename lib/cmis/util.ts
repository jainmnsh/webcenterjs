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

import axios, {AxiosResponse } from "axios";
import * as xmldom from "xmldom";
import * as xpath from "xpath";

export const CMIS_NAMESPACES: { [name: string]: string } = {
    app: "http://www.w3.org/2007/app",
    atom: "http://www.w3.org/2005/Atom",
    cmis: "http://docs.oasis-open.org/ns/cmis/core/200908/",
    cmisra: "http://docs.oasis-open.org/ns/cmis/restatom/200908/",
};

export const select: any = xpath.useNamespaces(CMIS_NAMESPACES);

export function processCmisProps(node: Node): {} {
    const objectNode: Node = select("./cmisra:object", node, true);
    let cmisProps: {};
    if (objectNode) {
        const prop: Node = select("./cmis:properties", objectNode, true);
        let attrs: NamedNodeMap;
        const children: NodeList = prop.childNodes;
        let child: Node;

        let propDefId: string;
        let localName: string;
        let displayName: string;
        let queryName: string;
        let value: string;

        cmisProps = {};

        for (let idx: number = 0; idx < children.length; idx++) {
            child = children.item(idx);
            attrs = child.attributes;

            propDefId = attrs.getNamedItem("propertyDefinitionId").value;
            localName = attrs.getNamedItem("localName").value;
            displayName = attrs.getNamedItem("displayName").value;
            queryName = attrs.getNamedItem("queryName").value;
            if (child.firstChild) {
                value = select("./text()", child.firstChild, true).data;
            }

            cmisProps[localName] = {
                displayName,
                value,
                propDefId,
                queryName,
            };
        }
    }
    return cmisProps;
}

export function processLinks(node: Node): {} {
    const linksArr: Node[] = select("./atom:link", node);
    let nde: Node;
    let attributes: NamedNodeMap;

    let rel: string;
    let href: string;
    let type: string;
    let id: string;

    let idAttr: Attr;

    let links: {};

    for (let i: number = 0; i < linksArr.length; i++) {
        nde = linksArr[i];
        attributes = nde.attributes;
        rel = attributes.getNamedItem("rel").value;
        href = attributes.getNamedItem("href").value;
        type = attributes.getNamedItem("type").value;
        idAttr = attributes.getNamedItemNS(CMIS_NAMESPACES.cmisra, "id");
        id = idAttr ? idAttr.value : null;
        const obj: any = { href, type };
        if (id) {
            obj["cmisra:id"] = id;
        }

        const existing: any[] = links ? links[rel] : null;

        if (existing) {
            existing.push(obj);
        } else {
            if (!links) {
                links = {};
            }
            links[rel] = [obj];
        }
    }
    return links;
}

export function getChildrenByName(node: Element, name: string): Node[] {
    const resultChildren: Node[] = [];

    if (node) {
        const childNodes: NodeList = node.childNodes;
        let child: Node;
        for (let i: number = 0; i < childNodes.length; i++) {
            child = childNodes.item(i);
            if (child.nodeName === name) {
                resultChildren.push(child);
            }
        }
    }
    return resultChildren;
}

export function getCmisResourceHttp(url: string, accept?: string): Promise<Document> {
    const accHeader: string = accept ? accept : "application/xml, text/xml";
    return axios.get(url, {
        headers: { Accept: accHeader },
    }).then((response: AxiosResponse) => {
        const doc: Document = new xmldom.DOMParser().parseFromString(response.data);
        return doc;
    });
}

export function getCmisResource(url: string, accept?: string, retry?: any): Promise<Document> {
    const accHeader: string = accept ? accept : "application/xml, text/xml";

    return axios.get(url, {
        headers: {
            Accept: accHeader,
        },
        withCredentials: true,
    }).then((response: AxiosResponse) => {
        const doc: Document = new xmldom.DOMParser().parseFromString(response.data);
        return doc;
    }, (error) => {
        if (retry && retry.count > 0 && retry.frequency > 0) {
            retry = retry.count - 1;
            return getCmisResource(url, retry);
        } else {
            return error;
        }
    });
}

export function processUriTemplates(node: Node): {} {
    const nodeArr: Node[] = select("cmisra:uritemplate", node);
    let uriTemplates: {};
    for (const nde of nodeArr) {
        const type: string = select("./cmisra:type/text()", nde, true).data;
        const template: string = select("./cmisra:template/text()", nde, true).data;
        const mediaType: string = select("./cmisra:mediatype/text()", nde, true).data;

        if (!uriTemplates) {
            uriTemplates = {};
        }

        uriTemplates[type] = {
            template,
            mediaType,
        };
    }
    return uriTemplates;
}

export function processCollections(node: Node): {} {
    let collections: {};
    const collectionArr: Node[] = select("./app:collection", node);
    for (const nde of collectionArr) {
        const attrs: NamedNodeMap = nde.attributes;
        const href: string = attrs.getNamedItem("href").value;
        const collectionType: string = select("./cmisra:collectionType/text()", nde, true).data;
        const accept: string = select("./app:accept/text()", nde, true).data;
        const title: string = select("./atom:title/text()", nde, true).data;

        const existing: any[] = collections ? collections[collectionType] : null;
        if (existing && existing.length > 0) {
            existing.push({
                title,
                href,
                accept,
            });
        } else {
            if (!collections) {
                collections = {};
            }
            collections[collectionType] = [{
                title,
                href,
                accept,
            }];
        }
    }
    return collections;
}
