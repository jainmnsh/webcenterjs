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

import axios, {AxiosRequestConfig, AxiosResponse } from "axios";
// import * as _ from "lodash";
import * as Auth from "./auth";
import * as Config from "./config";
import * as Common from "./types/common";
import * as SiteStructure from "./types/sitestructure";

const ITEMS_PER_PAGE: number = 40;

export function getResourceUrlFromLinks(
    links: Common.LinkElement[],
    resourceType: string,
    rel: string): string {

    const linkElements: Common.LinkElement[] = links.filter(
        (link: Common.LinkElement, idx: number) => {
        return (
                rel ?
                (link.resourceType === rel && link.rel === resourceType) :
                (link.resourceType === resourceType || link.rel === resourceType));
    });

    let linkEle: Common.LinkElement;
    if (linkElements.length > 0) {
        if (linkElements.length === 1) {
            linkEle = linkElements[0];
        } else {
            for (const link of linkElements) {
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
    } else {
        return null;
    }
}


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

export function getResourceUrl(
    resourceType: string,
    rel?: string
): Promise<string> {
    return Auth.getResourceIndex().then((resourceIndex: Common.ResourceIndex) => {
        return getResourceUrlFromLinks(
            resourceIndex.links,
            resourceType,
            rel);
    });
}

export function getPersonResourceUrl(
    person: Common.PersonReference,
    resourceType: string,
    rel: string): string {
    return getResourceUrlFromLinks(person.links, resourceType, rel);
}

export function getTemplateItem(items: Common.LinkElement[], type: string): Common.LinkElement {
    let item: Common.LinkElement;

    for (const it of items) {
        if (it.type === type) {
            item = it;
            break;
        }
    }
    return item;
}

function removeEmpty(obj: any): any {
  Object.keys(obj).forEach((key) =>
    (obj[key] && typeof obj[key] === "object") && removeEmpty(obj[key]) ||
    (obj[key] === undefined || obj[key] === null) && delete obj[key],
  );
  return obj;
}

export function doGet(serviceUrlSuffix: string, params?: {}, httpOptions?: AxiosRequestConfig): Promise<any> {
    httpOptions = httpOptions ? httpOptions : {};
    httpOptions.params = params;
    return axios.get(serviceUrlSuffix, httpOptions).then((response) => {
        return response.data;
    });
}

export function doPut(
    serviceUrlSuffix: string,
    data: any,
    params?: {},
    httpOptions?: AxiosRequestConfig): Promise<any> {
    httpOptions = httpOptions ? httpOptions : {};
    httpOptions.params = params;
    // data = data ? _.omitBy(data, _.isNil) : data;
    return axios.put(serviceUrlSuffix, removeEmpty(data), httpOptions).then((response) => {
        return response.data;
    });
}

export function doPost(
    serviceUrlSuffix: string,
    data: any,
    params?: {},
    httpOptions?: AxiosRequestConfig): Promise<any> {
        httpOptions = httpOptions ? httpOptions : {};
        httpOptions.params = params;
        // data = data ? _.omitBy(data, _.isNil) : data;
        return axios.post(serviceUrlSuffix, removeEmpty(data), httpOptions).then((response) => {
            return response.data;
        });
}

export function doDelete(
    serviceUrlSuffix: string,
    params?: {},
    httpOptions?: AxiosRequestConfig): Promise<any> {
    httpOptions = httpOptions ? httpOptions : {};
    httpOptions.params = params;
    return axios.delete(serviceUrlSuffix, httpOptions).then((response) => {
        return response.data;
    });
}

export function getNavigations(): Promise<SiteStructure.RESTSiteStructureContext> {
    return getResourceUrl("urn:oracle:webcenter:navigations").then((url: string) => {
        const resPromise: any = axios.get(url);
        return resPromise.then((response: AxiosResponse) => {
            return response.data;
        });
    });
}

export function getResourceTypes(): Promise<Common.ResourceTypes> {
    return getResourceUrl("urn:oracle:webcenter:resourcetypes").then((url: string) => {
        const resPromise: any = axios.get(url);
        return resPromise.then((response: AxiosResponse) => {
            return response.data;
        });
    });
}

function determineFunctionName(link: Common.LinkElement): string {
    let rel: string;
    let functionName: string;
    let resourceType: string;
    if (link.rel) {
        rel = "-" + link.rel.split(":")[link.rel.split(":").length - 1];
        rel = rel.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        functionName = rel;
    }
    if (link.resourceType) {
        resourceType = "-" + link.resourceType.split(":")[link.resourceType.split(":").length - 1];
        resourceType = resourceType.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        functionName = resourceType;
    }
    if (link.rel && link.resourceType) {
        if (rel === "Self") {
            functionName = "";
        } else {
            if (rel === resourceType) {
                functionName = rel;
            } else {
                functionName = rel + resourceType;
            }
        }
    }
    if (link.type) {
        functionName = functionName + "Url";
    }
    return functionName;
}

function traverse(data: any): any {
    if (data) {
        for (const key in data) {
            if (key !== null && key === "links") {
                const links: Common.LinkElement[] = data.links;
                for (const link of links) {
                    const capabilitiesStr: string = link.capabilities;
                    const functionName: string = determineFunctionName(link);
                    if (capabilitiesStr) {
                        const capabilities: string[] = link.capabilities.split(" ");
                        for (const capability of capabilities) {
                            if (capability === "urn:oracle:webcenter:read") {
                                data["get" + functionName] = (  parameters: {},
                                                                projection: string,
                                                                startIndex: number = 0,
                                                                itemsPerPage: number = ITEMS_PER_PAGE,
                                                                ): Promise<any> => {
                                    const url: string = link.template ? link.template : link.href;
                                    if (url) {
                                        return axios.get(url, {
                                            params: {
                                                projection,
                                                startIndex,
                                                itemsPerPage,
                                            },
                                        }).then((response: AxiosResponse) => {
                                            return response.data;
                                        });
                                    }
                                };
                            }
                            if (capability === "urn:oracle:webcenter:create") {
                                data["create" + functionName] = (   createData: any,
                                                                    parameters: {},
                                                                    projection: string,
                                                                    startIndex: number = 0,
                                                                    itemsPerPage: number = ITEMS_PER_PAGE,
                                                                    ): Promise<any> => {
                                    const url: string = link.template ? link.template : link.href;
                                    if (url) {
                                        return axios.post(url, createData, {
                                            params: {
                                                projection,
                                                startIndex,
                                                itemsPerPage,
                                            },
                                        }).then((response: AxiosResponse) => {
                                            return response.data;
                                        });
                                    }
                                };
                            }
                            if (capability === "urn:oracle:webcenter:update") {
                                data["update" + functionName] = (   updateData: any,
                                                                    parameters: {},
                                                                    projection: string,
                                                                    startIndex: number = 0,
                                                                    itemsPerPage: number = ITEMS_PER_PAGE,
                                                                    ): Promise<any> => {
                                    const url: string = link.template ? link.template : link.href;
                                    if (url) {
                                        return axios.put(url, updateData, {
                                            params: {
                                                projection,
                                                startIndex,
                                                itemsPerPage,
                                            },
                                        }).then((response: AxiosResponse) => {
                                            return response.data;
                                        });
                                    }
                                };
                            }
                            if (capability === "urn:oracle:webcenter:delete") {
                                data["delete" + functionName] = (   parameters: {},
                                                                    projection: string,
                                                                    startIndex: number = 0,
                                                                    itemsPerPage: number = ITEMS_PER_PAGE,
                                                                    ): Promise<any> => {
                                    const url: string = link.template ? link.template : link.href;
                                    if (url) {
                                        return axios.delete(url, {
                                            params: {
                                                projection,
                                                startIndex,
                                                itemsPerPage,
                                            },
                                        }).then((response: AxiosResponse) => {
                                            return response.data;
                                        });
                                    }
                                };
                            }
                        }
                    }
                }
            } else {
                if (key !== null && typeof (data[key]) === "object") {
                    traverse(data[key]);
                }
            }
        }
    }
}

axios.interceptors.response.use((response: AxiosResponse) => {
    const config: AxiosRequestConfig = response.config;
    const url: string = config.url;
    const restBaseUrl: string = Config.getRestBaseUrl();
    if (url.indexOf(restBaseUrl) >= 0) {
        if (response.data) {
            const data: {} = response.data;
            traverse(data);
            response.data = data;
        }
    }
    return response;
}, (error: any) => {
    throw error;
});

function getUrlParams(url: string): {} {
    const obj: {} = {};
    if (url) {
        let queryString: string = url.split("?")[1];
        if (queryString) {
            queryString = queryString.split("#")[0];
            const arr: string[] = queryString.split("&");
            for (const itm of arr) {
                const a: string[] = itm.split("=");
                let paramNum: string;
                let paramName: string = a[0].replace(/\[\d*\]/, (v: string) => {
                    paramNum = v.slice(1, -1);
                    return "";
                });
                let paramValue: string = typeof(a[1]) === "undefined" ? "" : a[1];
                paramName = decodeURIComponent(paramName);
                paramValue = decodeURIComponent(paramValue);
                if (obj[paramName]) {
                    if (typeof obj[paramName] === "string") {
                        obj[paramName] = [obj[paramName]];
                    }
                    if (typeof paramNum === "undefined") {
                        obj[paramName].push(paramValue);
                    }else {
                        obj[paramName][paramNum] = paramValue;
                    }
                }else {
                    obj[paramName] = paramValue;
                }
            }
        }
    }
    return obj;
}

export function registerRequestInterceptor(
    onFulfilled: (value: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
    onRejected?: (error: any) => any): number {
        return axios.interceptors.request.use(onFulfilled, onRejected);
}

export function registerResponseInterceptor(
    onFulfilled: (value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
    onRejected?: (error: any) => any): number {
        return axios.interceptors.response.use(onFulfilled, onRejected);
}

axios.interceptors.request.use((config: AxiosRequestConfig) => {
    let url: string = config.url;
    const restBaseUrl: string = Config.getRestBaseUrl();
    let isApiReq: boolean = false;
    if (url[0] === "/") {
        url = [restBaseUrl, url].join("");
        isApiReq = true;
    }else {
        const idxPort80: number = url.indexOf(":80/");
        if (idxPort80 > 0) {
            url = [url.substr(0, idxPort80 ), url.substr(idxPort80 + 3)].join("");
        }
        if (url.startsWith(restBaseUrl)) {
            isApiReq = true;
        }
    }

    if (isApiReq) {
        let urlNoParams: string = url.split("?")[0];
        const urlParams: {} = getUrlParams(url);
        let resParams: {} = {
            data: "data",
            itemsPerPage: ITEMS_PER_PAGE,
            projection: "summary",
            startIndex: 0,
        };
        resParams = {
            ...resParams,
            ...urlParams,
            ...config.params,
        };
        // _.extend(resParams, urlParams, config.params);

        for (const par in resParams) {
            if (par) {
                const paramVal: string = resParams[par];
                if (paramVal && paramVal[0] !== "{") {
                    urlNoParams = urlNoParams.replace(["{", par, "}"].join(""), paramVal ? paramVal : "");
                }else {
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
}, (error: any) => {
    throw error;
});
