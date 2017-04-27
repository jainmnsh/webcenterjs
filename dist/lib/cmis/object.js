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
var base_1 = require("./base");
var Util = require("./util");
var CmisObject = (function (_super) {
    tslib_1.__extends(CmisObject, _super);
    function CmisObject(objNode) {
        var _this = _super.call(this, objNode) || this;
        _this.processMetadata();
        _this.cmisProps = Util.processCmisProps(objNode);
        return _this;
    }
    CmisObject.prototype.processMetadata = function () {
        var idNode = Util.select("./atom:id", this.node, true);
        var authNameNode = Util.select("./atom:author/atom:name", this.node, true);
        var publishedNode = Util.select("./atom:published", this.node, true);
        var contributorNameNode = Util.select("./atom:contributor/atom:name", this.node, true);
        var updateNode = Util.select("./atom:updated", this.node, true);
        var editedNode = Util.select("./app:edited", this.node, true);
        var summaryNode = Util.select("./atom:summary", this.node, true);
        this.id = idNode ? idNode.textContent : null;
        this.author = authNameNode ? authNameNode.textContent : null;
        this.publishedDate = publishedNode ? publishedNode.textContent : null;
        this.contributor = contributorNameNode ? contributorNameNode.textContent : null;
        this.updatedDate = updateNode ? updateNode.textContent : null;
        this.editedDate = editedNode ? editedNode.textContent : null;
        this.summaryHTML = summaryNode ? summaryNode.textContent : null;
    };
    return CmisObject;
}(base_1.default));
exports.default = CmisObject;
//# sourceMappingURL=object.js.map