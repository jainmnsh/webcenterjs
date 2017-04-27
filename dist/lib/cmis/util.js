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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var xmldom = require("xmldom");
var xpath = require("xpath");
exports.CMIS_NAMESPACES = {
    app: "http://www.w3.org/2007/app",
    atom: "http://www.w3.org/2005/Atom",
    cmis: "http://docs.oasis-open.org/ns/cmis/core/200908/",
    cmisra: "http://docs.oasis-open.org/ns/cmis/restatom/200908/",
};
exports.select = xpath.useNamespaces(exports.CMIS_NAMESPACES);
function processCmisProps(node) {
    var objectNode = exports.select("./cmisra:object", node, true);
    var cmisProps;
    if (objectNode) {
        var prop = exports.select("./cmis:properties", objectNode, true);
        var attrs = void 0;
        var children = prop.childNodes;
        var child = void 0;
        var propDefId = void 0;
        var localName = void 0;
        var displayName = void 0;
        var queryName = void 0;
        var value = void 0;
        cmisProps = {};
        for (var idx = 0; idx < children.length; idx++) {
            child = children.item(idx);
            attrs = child.attributes;
            propDefId = attrs.getNamedItem("propertyDefinitionId").value;
            localName = attrs.getNamedItem("localName").value;
            displayName = attrs.getNamedItem("displayName").value;
            queryName = attrs.getNamedItem("queryName").value;
            if (child.firstChild) {
                value = exports.select("./text()", child.firstChild, true).data;
            }
            cmisProps[localName] = {
                displayName: displayName,
                value: value,
                propDefId: propDefId,
                queryName: queryName,
            };
        }
    }
    return cmisProps;
}
exports.processCmisProps = processCmisProps;
function processLinks(node) {
    var linksArr = exports.select("./atom:link", node);
    var nde;
    var attributes;
    var rel;
    var href;
    var type;
    var id;
    var idAttr;
    var links;
    for (var i = 0; i < linksArr.length; i++) {
        nde = linksArr[i];
        attributes = nde.attributes;
        rel = attributes.getNamedItem("rel").value;
        href = attributes.getNamedItem("href").value;
        type = attributes.getNamedItem("type").value;
        idAttr = attributes.getNamedItemNS(exports.CMIS_NAMESPACES.cmisra, "id");
        id = idAttr ? idAttr.value : null;
        var obj = { href: href, type: type };
        if (id) {
            obj["cmisra:id"] = id;
        }
        var existing = links ? links[rel] : null;
        if (existing) {
            existing.push(obj);
        }
        else {
            if (!links) {
                links = {};
            }
            links[rel] = [obj];
        }
    }
    return links;
}
exports.processLinks = processLinks;
function getChildrenByName(node, name) {
    var resultChildren = [];
    if (node) {
        var childNodes = node.childNodes;
        var child = void 0;
        for (var i = 0; i < childNodes.length; i++) {
            child = childNodes.item(i);
            if (child.nodeName === name) {
                resultChildren.push(child);
            }
        }
    }
    return resultChildren;
}
exports.getChildrenByName = getChildrenByName;
function getCmisResourceHttp(url, accept) {
    var accHeader = accept ? accept : "application/xml, text/xml";
    return axios_1.default.get(url, {
        headers: { Accept: accHeader },
    }).then(function (response) {
        var doc = new xmldom.DOMParser().parseFromString(response.data);
        return doc;
    });
}
exports.getCmisResourceHttp = getCmisResourceHttp;
function getCmisResource(url, accept, retry) {
    var accHeader = accept ? accept : "application/xml, text/xml";
    return axios_1.default.get(url, {
        headers: {
            Accept: accHeader,
        },
        withCredentials: true,
    }).then(function (response) {
        var doc = new xmldom.DOMParser().parseFromString(response.data);
        return doc;
    }, function (error) {
        if (retry && retry.count > 0 && retry.frequency > 0) {
            retry = retry.count - 1;
            return getCmisResource(url, retry);
        }
        else {
            return error;
        }
    });
}
exports.getCmisResource = getCmisResource;
function processUriTemplates(node) {
    var nodeArr = exports.select("cmisra:uritemplate", node);
    var uriTemplates;
    for (var _i = 0, nodeArr_1 = nodeArr; _i < nodeArr_1.length; _i++) {
        var nde = nodeArr_1[_i];
        var type = exports.select("./cmisra:type/text()", nde, true).data;
        var template = exports.select("./cmisra:template/text()", nde, true).data;
        var mediaType = exports.select("./cmisra:mediatype/text()", nde, true).data;
        if (!uriTemplates) {
            uriTemplates = {};
        }
        uriTemplates[type] = {
            template: template,
            mediaType: mediaType,
        };
    }
    return uriTemplates;
}
exports.processUriTemplates = processUriTemplates;
function processCollections(node) {
    var collections;
    var collectionArr = exports.select("./app:collection", node);
    for (var _i = 0, collectionArr_1 = collectionArr; _i < collectionArr_1.length; _i++) {
        var nde = collectionArr_1[_i];
        var attrs = nde.attributes;
        var href = attrs.getNamedItem("href").value;
        var collectionType = exports.select("./cmisra:collectionType/text()", nde, true).data;
        var accept = exports.select("./app:accept/text()", nde, true).data;
        var title = exports.select("./atom:title/text()", nde, true).data;
        var existing = collections ? collections[collectionType] : null;
        if (existing && existing.length > 0) {
            existing.push({
                title: title,
                href: href,
                accept: accept,
            });
        }
        else {
            if (!collections) {
                collections = {};
            }
            collections[collectionType] = [{
                    title: title,
                    href: href,
                    accept: accept,
                }];
        }
    }
    return collections;
}
exports.processCollections = processCollections;
//# sourceMappingURL=util.js.map