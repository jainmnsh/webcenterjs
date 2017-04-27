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
var Util = require("./util");
var CmisBase = (function () {
    function CmisBase(node) {
        this.node = node;
        this.title = Util.select("./atom:title/text()", this.node, true).data;
        this.links = Util.processLinks(this.node);
    }
    CmisBase.prototype.getLink = function (rel, type) {
        var lnks = this.links[rel];
        if (lnks) {
            if (lnks.length > 1) {
                var url = void 0;
                for (var _i = 0, lnks_1 = lnks; _i < lnks_1.length; _i++) {
                    var lnk = lnks_1[_i];
                    if (lnk.type === type) {
                        url = lnk.href;
                        break;
                    }
                }
                return url;
            }
            else {
                return lnks[0].href;
            }
        }
    };
    return CmisBase;
}());
exports.default = CmisBase;
//# sourceMappingURL=base.js.map