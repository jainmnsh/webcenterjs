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
// import * as _ from "lodash";
var base_1 = require("./base");
var entry_1 = require("./entry");
var feed_1 = require("./feed");
var Util = require("./util");
var CmisWorkspace = (function (_super) {
    tslib_1.__extends(CmisWorkspace, _super);
    function CmisWorkspace(node) {
        var _this = _super.call(this, node) || this;
        _this.collections = Util.processCollections(node);
        _this.uriTemplates = Util.processUriTemplates(node);
        return _this;
    }
    CmisWorkspace.prototype.getQueryResults = function (query, options) {
        if (this.uriTemplates) {
            var url = this.uriTemplates["query"].template;
            var mediaType = this.uriTemplates["query"].mediaType;
            var params = { q: query };
            if (options) {
                params = tslib_1.__assign({}, params, options);
                // _.extend(params, options);
            }
            for (var key in params) {
                if (key) {
                    var value = params[key];
                    if (value) {
                        url = url.replace(["{", key, "}"].join(""), value);
                    }
                }
            }
            url = url.replace(/\{(.+?)\}/gi, "");
            if (url) {
                return Util.getCmisResource(url, mediaType).then(function (doc) {
                    return new feed_1.default(Util.select("./atom:feed", doc, true));
                });
            }
        }
    };
    CmisWorkspace.prototype.getCmisEntryById = function (id, options) {
        if (this.uriTemplates) {
            var url = this.uriTemplates["objectbyid"].template;
            var mediaType = this.uriTemplates["objectbyid"].mediaType;
            var params = { id: id };
            if (options) {
                params = tslib_1.__assign({}, params, options);
                // _.extend(params, options);
            }
            for (var key in params) {
                if (key) {
                    var value = params[key];
                    if (value) {
                        url = url.replace(["{", key, "}"].join(""), value);
                    }
                }
            }
            url = url.replace(/\{(.+?)\}/gi, "");
            if (url) {
                return Util.getCmisResource(url, mediaType).then(function (doc) {
                    return new entry_1.default(Util.select("./atom:entry", doc, true));
                });
            }
        }
    };
    CmisWorkspace.prototype.getCmisEntryByPath = function (path, options) {
        if (this.uriTemplates) {
            var url = this.uriTemplates["objectbypath"].template;
            var mediaType = this.uriTemplates["objectbypath"].mediaType;
            var params = { path: path };
            if (options) {
                params = tslib_1.__assign({}, params, options);
                // _.extend(params, options);
            }
            for (var key in params) {
                if (key) {
                    var value = params[key];
                    if (value) {
                        url = url.replace(["{", key, "}"].join(""), value);
                    }
                }
            }
            url = url.replace(/\{(.+?)\}/gi, "");
            if (url) {
                return Util.getCmisResource(url, mediaType).then(function (doc) {
                    return new entry_1.default(Util.select("./atom:entry", doc, true));
                });
            }
        }
    };
    return CmisWorkspace;
}(base_1.default));
exports.default = CmisWorkspace;
//# sourceMappingURL=workspace.js.map