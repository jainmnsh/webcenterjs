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
var tslib_1 = require("tslib");
var axios_1 = require("axios");
var feed_1 = require("./feed");
var object_1 = require("./object");
var Util = require("./util");
var CmisEntry = (function (_super) {
    tslib_1.__extends(CmisEntry, _super);
    function CmisEntry(node) {
        var _this = _super.call(this, node) || this;
        _this.processEntry(node);
        return _this;
    }
    CmisEntry.prototype.delete = function (comments) {
        var url = [this.getLink("self", "application/atom+xml;type=entry"), "&_method=delete"].join("");
        url = comments ? [url, "comments=" + comments].join("") : url;
        var headers = {
            Accept: "application/atom+xml;type=entry",
        };
        return axios_1.default.delete(url, {
            headers: headers,
            withCredentials: true,
        }).then(function (response) {
            return response.data;
        });
    };
    CmisEntry.prototype.getSelfEntry = function () {
        var url = this.getLink("self", "application/atom+xml;type=entry");
        return this.getResource(url, "application/atom+xml;type=entry", "ENTRY");
    };
    CmisEntry.prototype.getUpEntry = function () {
        var url = this.getLink("up", "application/atom+xml;type=entry");
        return this.getResource(url, "application/atom+xml;type=entry", "ENTRY");
    };
    CmisEntry.prototype.getEditEntry = function () {
        var url = this.getLink("edit", "application/atom+xml;type=entry");
        return this.getResource(url, "application/atom+xml;type=entry", "ENTRY");
    };
    CmisEntry.prototype.getDownFeed = function () {
        var url = this.getLink("down", "application/atom+xml;type=feed");
        return this.getResource(url, "application/atom+xml;type=feed", "FEED");
    };
    CmisEntry.prototype.getUpFeed = function () {
        var url = this.getLink("up", "application/atom+xml;type=feed");
        return this.getResource(url, "application/atom+xml;type=feed", "FEED");
    };
    CmisEntry.prototype.processEntry = function (node) {
        this.content = Util.select("./atom:content/text()", node, true).data;
        if (this.cmisProps) {
            this.baseType = this.cmisProps["cmis:baseTypeId"].value;
            this.cmisObjectId = this.cmisProps["cmis:objectId"].value;
        }
        this.downTreeUrl = this.getLink("down", "application/cmistree+xml");
    };
    CmisEntry.prototype.getResource = function (url, accept, type) {
        if (url) {
            return Util.getCmisResource(url, accept).then(function (doc) {
                if (type === "ENTRY") {
                    return new CmisEntry(Util.select("./atom:entry", doc, true));
                }
                if (type === "FEED") {
                    return new feed_1.default(Util.select("./atom:feed", doc, true));
                }
            });
        }
    };
    return CmisEntry;
}(object_1.default));
exports.default = CmisEntry;
//# sourceMappingURL=entry.js.map