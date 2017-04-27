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
// import * as _ from "lodash";
var Auth = require("./auth");
var Config = require("./config");
var ITEMS_PER_PAGE = 40;
function getResourceUrlFromLinks(links, resourceType, rel) {
    var linkElements = links.filter(function (link, idx) {
        return (rel ?
            (link.resourceType === rel && link.rel === resourceType) :
            (link.resourceType === resourceType || link.rel === resourceType));
    });
    var linkEle;
    if (linkElements.length > 0) {
        if (linkElements.length === 1) {
            linkEle = linkElements[0];
        }
        else {
            for (var _i = 0, linkElements_1 = linkElements; _i < linkElements_1.length; _i++) {
                var link = linkElements_1[_i];
                if (link.rel === "alternate") {
                    linkEle = link;
                    break;
                }
            }
            if (!linkEle) {
                linkEle = linkElements[0];
            }
        }
        return linkEle.template ? linkEle.template : linkEle.href;
    }
    else {
        return null;
    }
}
exports.getResourceUrlFromLinks = getResourceUrlFromLinks;
/**
 * Gets the ResourceUrl based on the following params.
 * This method is specifically designed to work with Webcenter REST API [Link Model](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABDHGHA)
 * @param resourceType Parameter [Resource Type](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABGIABJ)
 * @param rel Parameter [Relationship](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABDJBBJ)
 * @param parameters key/value pairs to replace query parameter placeholders in [Templates](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABCEBGB)
 * @param projection One of the **Common Request Query Parameters** defined [Here](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm)
 * @param startIndex One of the **Common Request Query Parameters** defined [Here](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm)
 * @param itemsPerPage One of the **Common Request Query Parameters** defined [Here](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm)
 */
function getResourceUrl(resourceType, rel) {
    return Auth.getResourceIndex().then(function (resourceIndex) {
        return getResourceUrlFromLinks(resourceIndex.links, resourceType, rel);
    });
}
exports.getResourceUrl = getResourceUrl;
function getPersonResourceUrl(person, resourceType, rel) {
    return getResourceUrlFromLinks(person.links, resourceType, rel);
}
exports.getPersonResourceUrl = getPersonResourceUrl;
function getTemplateItem(items, type) {
    var item;
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var it_1 = items_1[_i];
        if (it_1.type === type) {
            item = it_1;
            break;
        }
    }
    return item;
}
exports.getTemplateItem = getTemplateItem;
function removeEmpty(obj) {
    Object.keys(obj).forEach(function (key) {
        return (obj[key] && typeof obj[key] === "object") && removeEmpty(obj[key]) ||
            (obj[key] === undefined || obj[key] === null) && delete obj[key];
    });
    return obj;
}
function doGet(serviceUrlSuffix, params, httpOptions) {
    httpOptions = httpOptions ? httpOptions : {};
    httpOptions.params = params;
    return axios_1.default.get(serviceUrlSuffix, httpOptions).then(function (response) {
        return response.data;
    });
}
exports.doGet = doGet;
function doPut(serviceUrlSuffix, data, params, httpOptions) {
    httpOptions = httpOptions ? httpOptions : {};
    httpOptions.params = params;
    // data = data ? _.omitBy(data, _.isNil) : data;
    return axios_1.default.put(serviceUrlSuffix, removeEmpty(data), httpOptions).then(function (response) {
        return response.data;
    });
}
exports.doPut = doPut;
function doPost(serviceUrlSuffix, data, params, httpOptions) {
    httpOptions = httpOptions ? httpOptions : {};
    httpOptions.params = params;
    // data = data ? _.omitBy(data, _.isNil) : data;
    return axios_1.default.post(serviceUrlSuffix, removeEmpty(data), httpOptions).then(function (response) {
        return response.data;
    });
}
exports.doPost = doPost;
function doDelete(serviceUrlSuffix, params, httpOptions) {
    httpOptions = httpOptions ? httpOptions : {};
    httpOptions.params = params;
    return axios_1.default.delete(serviceUrlSuffix, httpOptions).then(function (response) {
        return response.data;
    });
}
exports.doDelete = doDelete;
function getNavigations() {
    return getResourceUrl("urn:oracle:webcenter:navigations").then(function (url) {
        var resPromise = axios_1.default.get(url);
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getNavigations = getNavigations;
function getResourceTypes() {
    return getResourceUrl("urn:oracle:webcenter:resourcetypes").then(function (url) {
        var resPromise = axios_1.default.get(url);
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getResourceTypes = getResourceTypes;
function determineFunctionName(link) {
    var rel;
    var functionName;
    var resourceType;
    if (link.rel) {
        rel = "-" + link.rel.split(":")[link.rel.split(":").length - 1];
        rel = rel.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
        functionName = rel;
    }
    if (link.resourceType) {
        resourceType = "-" + link.resourceType.split(":")[link.resourceType.split(":").length - 1];
        resourceType = resourceType.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
        functionName = resourceType;
    }
    if (link.rel && link.resourceType) {
        if (rel === "Self") {
            functionName = "";
        }
        else {
            if (rel === resourceType) {
                functionName = rel;
            }
            else {
                functionName = rel + resourceType;
            }
        }
    }
    if (link.type) {
        functionName = functionName + "Url";
    }
    return functionName;
}
function traverse(data) {
    if (data) {
        for (var key in data) {
            if (key !== null && key === "links") {
                var links = data.links;
                var _loop_1 = function (link) {
                    var capabilitiesStr = link.capabilities;
                    var functionName = determineFunctionName(link);
                    if (capabilitiesStr) {
                        var capabilities = link.capabilities.split(" ");
                        for (var _i = 0, capabilities_1 = capabilities; _i < capabilities_1.length; _i++) {
                            var capability = capabilities_1[_i];
                            if (capability === "urn:oracle:webcenter:read") {
                                data["get" + functionName] = function (parameters, projection, startIndex, itemsPerPage) {
                                    if (startIndex === void 0) { startIndex = 0; }
                                    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
                                    var url = link.template ? link.template : link.href;
                                    if (url) {
                                        return axios_1.default.get(url, {
                                            params: {
                                                projection: projection,
                                                startIndex: startIndex,
                                                itemsPerPage: itemsPerPage,
                                            },
                                        }).then(function (response) {
                                            return response.data;
                                        });
                                    }
                                };
                            }
                            if (capability === "urn:oracle:webcenter:create") {
                                data["create" + functionName] = function (createData, parameters, projection, startIndex, itemsPerPage) {
                                    if (startIndex === void 0) { startIndex = 0; }
                                    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
                                    var url = link.template ? link.template : link.href;
                                    if (url) {
                                        return axios_1.default.post(url, createData, {
                                            params: {
                                                projection: projection,
                                                startIndex: startIndex,
                                                itemsPerPage: itemsPerPage,
                                            },
                                        }).then(function (response) {
                                            return response.data;
                                        });
                                    }
                                };
                            }
                            if (capability === "urn:oracle:webcenter:update") {
                                data["update" + functionName] = function (updateData, parameters, projection, startIndex, itemsPerPage) {
                                    if (startIndex === void 0) { startIndex = 0; }
                                    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
                                    var url = link.template ? link.template : link.href;
                                    if (url) {
                                        return axios_1.default.put(url, updateData, {
                                            params: {
                                                projection: projection,
                                                startIndex: startIndex,
                                                itemsPerPage: itemsPerPage,
                                            },
                                        }).then(function (response) {
                                            return response.data;
                                        });
                                    }
                                };
                            }
                            if (capability === "urn:oracle:webcenter:delete") {
                                data["delete" + functionName] = function (parameters, projection, startIndex, itemsPerPage) {
                                    if (startIndex === void 0) { startIndex = 0; }
                                    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
                                    var url = link.template ? link.template : link.href;
                                    if (url) {
                                        return axios_1.default.delete(url, {
                                            params: {
                                                projection: projection,
                                                startIndex: startIndex,
                                                itemsPerPage: itemsPerPage,
                                            },
                                        }).then(function (response) {
                                            return response.data;
                                        });
                                    }
                                };
                            }
                        }
                    }
                };
                for (var _i = 0, links_1 = links; _i < links_1.length; _i++) {
                    var link = links_1[_i];
                    _loop_1(link);
                }
            }
            else {
                if (key !== null && typeof (data[key]) === "object") {
                    traverse(data[key]);
                }
            }
        }
    }
}
axios_1.default.interceptors.response.use(function (response) {
    var config = response.config;
    var url = config.url;
    var restBaseUrl = Config.getRestBaseUrl();
    if (url.indexOf(restBaseUrl) >= 0) {
        if (response.data) {
            var data = response.data;
            traverse(data);
            response.data = data;
        }
    }
    return response;
}, function (error) {
    throw error;
});
function getUrlParams(url) {
    var obj = {};
    if (url) {
        var queryString = url.split("?")[1];
        if (queryString) {
            queryString = queryString.split("#")[0];
            var arr = queryString.split("&");
            var _loop_2 = function (itm) {
                var a = itm.split("=");
                var paramNum = undefined;
                var paramName = a[0].replace(/\[\d*\]/, function (v) {
                    paramNum = v.slice(1, -1);
                    return "";
                });
                var paramValue = typeof (a[1]) === "undefined" ? "" : a[1];
                paramName = decodeURIComponent(paramName);
                paramValue = decodeURIComponent(paramValue);
                if (obj[paramName]) {
                    if (typeof obj[paramName] === "string") {
                        obj[paramName] = [obj[paramName]];
                    }
                    if (typeof paramNum === "undefined") {
                        obj[paramName].push(paramValue);
                    }
                    else {
                        obj[paramName][paramNum] = paramValue;
                    }
                }
                else {
                    obj[paramName] = paramValue;
                }
            };
            for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                var itm = arr_1[_i];
                _loop_2(itm);
            }
        }
    }
    return obj;
}
axios_1.default.interceptors.request.use(function (config) {
    var url = config.url;
    var restBaseUrl = Config.getRestBaseUrl();
    var isApiReq = false;
    if (url[0] === "/") {
        url = [restBaseUrl, url].join("");
        isApiReq = true;
    }
    else {
        var idxPort80 = url.indexOf(":80/");
        if (idxPort80 > 0) {
            url = [url.substr(0, idxPort80), url.substr(idxPort80 + 3)].join("");
        }
        if (url.startsWith(restBaseUrl)) {
            isApiReq = true;
        }
    }
    if (isApiReq) {
        var urlNoParams = url.split("?")[0];
        var urlParams = getUrlParams(url);
        var resParams = {
            data: "data",
            itemsPerPage: ITEMS_PER_PAGE,
            projection: "summary",
            startIndex: 0,
        };
        resParams = tslib_1.__assign({}, resParams, urlParams, config.params);
        // _.extend(resParams, urlParams, config.params);
        for (var par in resParams) {
            if (par) {
                var paramVal = resParams[par];
                if (paramVal && paramVal[0] !== "{") {
                    urlNoParams = urlNoParams.replace(["{", par, "}"].join(""), paramVal ? paramVal : "");
                }
                else {
                    delete resParams[par];
                }
            }
        }
        config.url = encodeURI(urlNoParams);
        config.params = resParams;
        // console.log("---------- URL ---------------", config.url);
        // console.log("---------- Params ---------------", config.params);
    }
    return config;
}, function (error) {
    throw error;
});
//# sourceMappingURL=core.js.map