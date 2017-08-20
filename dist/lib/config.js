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
/**
 * Config allows to specify REST , WebCenter & CS Prefix URLs. This information is used in rest of the modules
 */
/*rsciispr11 and rscisspr12*/
// import * as _ from "lodash";
var restUrl = "/rest";
var csUrl;
var wcUrl;
if (typeof (window) !== "undefined" && window.location) {
    restUrl = [window.location.protocol, "//", window.location.host, restUrl].join("");
}
function removeLastSlash(url) {
    if (!url) {
        return url;
    }
    if (url.endsWith("/")) {
        return url.substring(0, url.length - 1);
    }
    else {
        return url;
    }
}
/**
 * sets WebCenter REST Base URL.
 * @param url  URL prefix for WebCenter REST eg. http://webcenter-host/rest.
 */
function setRestBaseUrl(url) {
    restUrl = removeLastSlash(url);
}
exports.setRestBaseUrl = setRestBaseUrl;
/**
 * sets WebCenter Content (UCM) Base URL.
 * @param url  URL prefix for WebCenter Content (UCM) eg. http://webcenter-content-host/cs.
 */
function setCsBaseUrl(url) {
    csUrl = removeLastSlash(url);
}
exports.setCsBaseUrl = setCsBaseUrl;
/**
 * sets WebCenter Base URL.
 * @param url  URL prefix for WebCenter eg. http://webcenter-host/webcenter.
 */
function setWcBaseUrl(url) {
    wcUrl = removeLastSlash(url);
}
exports.setWcBaseUrl = setWcBaseUrl;
/**
 * Method to get configured WebCenter REST Base URL.
 * @returns       configured WebCenter REST Base URL.
 */
function getRestBaseUrl() {
    return restUrl;
}
exports.getRestBaseUrl = getRestBaseUrl;
/**
 * Method to get configured WebCenter Content (UCM) Base URL.
 * @returns       configured WebCenter Content (UCM) Base URL.
 */
function getCsBaseUrl() {
    return csUrl;
}
exports.getCsBaseUrl = getCsBaseUrl;
/**
 * Method to get configured WebCenter Base URL.
 * @returns       configured WebCenter Base URL.
 */
function getWcBaseUrl() {
    return wcUrl;
}
exports.getWcBaseUrl = getWcBaseUrl;
//# sourceMappingURL=config.js.map