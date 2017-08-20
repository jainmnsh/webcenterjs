"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var entry_1 = require("./entry");
var object_1 = require("./object");
var Util = require("./util");
var CmisFeed = (function (_super) {
    tslib_1.__extends(CmisFeed, _super);
    // self link is the upload post action url
    function CmisFeed(node) {
        var _this = _super.call(this, node) || this;
        // this.collectionUrl = this.node('atom\\:collection,collection').eq(0).attr('href');
        _this.processEntries();
        return _this;
    }
    CmisFeed.prototype.getSelfFeed = function () {
        var url = this.getLink("self", "application/atom+xml;type=feed");
        return this.getResource(url, "application/atom+xml;type=feed", "FEED");
    };
    CmisFeed.prototype.getUpEntry = function () {
        var url = this.getLink("up", "application/atom+xml;type=entry");
        return this.getResource(url, "application/atom+xml;type=entry", "ENTRY");
    };
    CmisFeed.prototype.getViaEntry = function () {
        var url = this.getLink("via", "application/atom+xml;type=entry");
        return this.getResource(url, "application/atom+xml;type=entry", "ENTRY");
    };
    CmisFeed.prototype.getNextFeed = function () {
        var url = this.getLink("next", "application/atom+xml;type=feed");
        return this.getResource(url, "application/atom+xml;type=feed", "FEED");
    };
    CmisFeed.prototype.getPreviosFeed = function () {
        var url = this.getLink("previous", "application/atom+xml;type=feed");
        return this.getResource(url, "application/atom+xml;type=feed", "FEED");
    };
    CmisFeed.prototype.removeEntry = function (cmisObjectId) {
        this.entries = this.entries.filter(function (entry, index, entries) {
            return entry.cmisObjectId !== cmisObjectId;
        });
        return this.entries;
    };
    CmisFeed.prototype.deleteEntry = function (entry) {
        var _this = this;
        var cmisObjectId = entry.cmisObjectId;
        return entry.delete().then(function (data) {
            for (var _i = 0, _a = _this.entries; _i < _a.length; _i++) {
                var ele = _a[_i];
                var eleObjId = ele.cmisObjectId;
                if (eleObjId === cmisObjectId) {
                    _this.removeEntry(eleObjId);
                    break;
                }
            }
            return cmisObjectId;
        });
    };
    CmisFeed.prototype.processEntries = function () {
        this.entries = [];
        var entryArr = Util.select("./atom:entry", this.node);
        var entryNode;
        for (var idx = 0; idx < entryArr.length; idx++) {
            entryNode = entryArr[idx];
            this.entries.push(new entry_1.default(entryNode));
        }
    };
    CmisFeed.prototype.getResource = function (url, accept, type) {
        if (url) {
            return Util.getCmisResource(url, accept).then(function (doc) {
                if (type === "ENTRY") {
                    return new entry_1.default(Util.select("./atom:entry", doc, true));
                }
                if (type === "FEED") {
                    return new CmisFeed(Util.select("./atom:feed", doc, true));
                }
            });
        }
    };
    return CmisFeed;
}(object_1.default));
exports.default = CmisFeed;
//# sourceMappingURL=feed.js.map