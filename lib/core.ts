import axios, {AxiosRequestConfig, AxiosResponse } from "axios";
import * as _ from "lodash";
import * as Auth from "./auth";
import * as Config from "./config";

const ITEMS_PER_PAGE: number = 40;

export function getResourceUrlFromLinks(
    links: WebCenter.Common.LinkElement[],
    resourceType: string,
    rel: string,
    parameters: {},
    projection: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): string {
    const projectParam: string = projection ? (["&projection=", projection].join("")) : "";
    const linkElements: WebCenter.Common.LinkElement[] = links.filter(
        (link: WebCenter.Common.LinkElement, idx: number) => {
        return (
                rel ?
                (link.resourceType === rel && link.rel === resourceType) :
                (link.resourceType === resourceType || link.rel === resourceType));
    });

    let linkEle: WebCenter.Common.LinkElement;
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
        let url: string;
        if (linkEle.template) {
            linkEle.template = linkEle.template.replace("%40", "@");
            url = linkEle.template;
            url = url.replace("{itemsPerPage}", itemsPerPage + "");
            url = url.replace("{startIndex}", startIndex + "");
            if (parameters) {
                for (const y in parameters) {
                    if (y) {
                        const paramVal: string = parameters[y];
                        url = url.replace(["{", y, "}"].join(""), paramVal ? paramVal : "");
                    }
                }
            }
            url = url.replace(/[{]\w*[}]/g, "");
            return encodeURI([url, projectParam].join(""));
        } else {
            url = linkEle.href;
            return encodeURI([url, projectParam].join(""));
        }
    } else {
        return null;
    }
}

function getResourceUrlFromLinkElement(
    link: WebCenter.Common.LinkElement,
    parameters: {},
    projection: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): string {
    if (link) {
        const projectParam: string = projection ? (["&projection=", projection].join("")) : "";
        let url: string;
        if (link.template) {
            link.template = link.template.replace("%40", "@");
            url = link.template;
            url = url.replace("{itemsPerPage}", itemsPerPage + "");
            url = url.replace("{startIndex}", startIndex + "");
            if (parameters) {
                for (const y in parameters) {
                    if (y) {
                        const paramVal: string = parameters[y];
                        url = url.replace(["{", y, "}"].join(""), paramVal ? paramVal : "");
                    }
                }
            }
            url = url.replace(/[{]\w*[}]/g, "");
            return encodeURI([url, projectParam].join(""));
        } else {
            // url = link.href;
            // return encodeURI([url, projectParam].join(''));
            return ([link.href, projectParam].join(""));
        }
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
    rel?: string,
    parameters?: {},
    projection?: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<string> {
    return Auth.getResourceIndex().then((resourceIndex: WebCenter.Common.ResourceIndex) => {
        return getResourceUrlFromLinks(
            resourceIndex.links,
            resourceType,
            rel,
            parameters,
            projection,
            startIndex,
            itemsPerPage);
    });
}

export function getPersonResourceUrl(
    person: WebCenter.Common.PersonReference,
    resourceType: string,
    rel: string,
    parameters: string[],
    projection: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): string {
    return getResourceUrlFromLinks(person.links, resourceType, rel, parameters, projection, startIndex, itemsPerPage);
}

export function getTemplateItem(items: WebCenter.Common.LinkElement[], type: string): WebCenter.Common.LinkElement {
    let item: WebCenter.Common.LinkElement;

    for (const it of items) {
        if (it.type === type) {
            item = it;
            break;
        }
    }
    return item;
}

export function getUrlParams(url: string): {} {
    const params: {} = {};
    if (url) {
        const pairs: string[] = url.split("?")[1].split("&");
        pairs.forEach((pair: string) => {
            const pairParts: string[] = pair.split("=");
            if (pairParts[1] !== null) {
                const key: string = decodeURIComponent(pairParts[0]);
                let val: string = decodeURIComponent(pairParts[1]);
                val = val ? val.replace(/\++/g, " ").trim() : "";
                // val = val.replace('#', '%23');
                if (key.length === 0) {
                    return;
                }
                if (!params[key]) {
                    params[key] = val;
                } else {
                    if ("function" !== typeof params[key].push) {
                        params[key] = [params[key]];
                    }
                    params[key].push(val);
                }
            }
        });
    }
    return params;
}

export function getServiceUrlParams(serviceUrlSuffix: string, params?: {}): {} {
    let url: string = serviceUrlSuffix;
    let urlParams: {} = {};
    const resParams: {} = {
        data: "data",
        itemsPerPage: ITEMS_PER_PAGE,
        projection: "summary",
        startIndex: 0,
    };

    if (url.indexOf("?") > 1) {
        url = url.replace(/[{]\w*[}]/g, "");
        urlParams = getUrlParams(url);
        url = url.split("?")[0];
    }

    _.extend(resParams, urlParams);

    if (params) {
        _.extend(resParams, params);
    }

    for (const urlParamKey in urlParams) {
        if (typeof resParams[urlParamKey] !== "boolean") {
            if (!resParams[urlParamKey]) {
                delete resParams[urlParamKey];
            }
        }
    }
    return resParams;
}

export function getServiceUrl(serviceUrlSuffix: string, params?: {}): string {
    const urlParams: {} = getServiceUrlParams(serviceUrlSuffix, params);
    let url: string = serviceUrlSuffix.split("?")[0];

    url = Config.getRestBaseUrl() + url;
    for (const y in urlParams) {
        if (y) {
            const paramVal: string = urlParams[y];
            url = url.replace(["{", y, "}"].join(""), paramVal ? paramVal : "");
        }
    }
    return encodeURI(url);
}

export function toUrlParams(obj: {}): string {
    const str: string[] = [];
    for (const p in obj) {
        if (obj[p]) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    }
    return str.join("&");
}

export function doGet(serviceUrlSuffix: string, params?: {}, httpOptions?: AxiosRequestConfig): Promise<any> {
    const urlParams: {} = getServiceUrlParams(serviceUrlSuffix, params);
    const url: string = getServiceUrl(serviceUrlSuffix, params);
    httpOptions = httpOptions ? httpOptions : {};
    httpOptions.params = urlParams;
    return axios.get(url, httpOptions).then((response) => {
        return response.data;
    });
}

export function doPut(
    serviceUrlSuffix: string,
    data: any,
    params?: {},
    httpOptions?: AxiosRequestConfig): Promise<any> {
    const urlParams: {} = getServiceUrlParams(serviceUrlSuffix, params);
    const url: string = getServiceUrl(serviceUrlSuffix, params);
    httpOptions = httpOptions ? httpOptions : {};
    httpOptions.params = urlParams;
    return axios.put(url, data, httpOptions).then((response) => {
        return response.data;
    });
}

export function doPost(
    serviceUrlSuffix: string,
    data: any,
    params?: {},
    httpOptions?: AxiosRequestConfig): Promise<any> {
    const urlParams: {} = getServiceUrlParams(serviceUrlSuffix, params);
    const url: string = getServiceUrl(serviceUrlSuffix, params);
    httpOptions = httpOptions ? httpOptions : {};
    httpOptions.params = urlParams;
    return axios.post(url, data, httpOptions).then((response) => {
        return response.data;
    });
}

export function doDelete(
    serviceUrlSuffix: string,
    params?: {},
    httpOptions?: AxiosRequestConfig): Promise<any> {
    const urlParams: {} = getServiceUrlParams(serviceUrlSuffix, params);
    const url: string = getServiceUrl(serviceUrlSuffix, params);
    httpOptions = httpOptions ? httpOptions : {};
    httpOptions.params = urlParams;
    return axios.delete(url, httpOptions).then((response) => {
        return response.data;
    });
}

export function getNavigations(): Promise<WebCenter.SiteStructure.RESTSiteStructureContext> {
    return getResourceUrl("urn:oracle:webcenter:navigations").then((url: string) => {
        const resPromise: any = axios.get(url);
        return resPromise.then((response: AxiosResponse) => {
            return response.data;
        });
    });
}

export function getResourceTypes(): Promise<WebCenter.Common.ResourceTypes> {
    return getResourceUrl("urn:oracle:webcenter:resourcetypes").then((url: string) => {
        const resPromise: any = axios.get(url);
        return resPromise.then((response: AxiosResponse) => {
            return response.data;
        });
    });
}

function determineFunctionName(link: WebCenter.Common.LinkElement): string {
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
                const links: WebCenter.Common.LinkElement[] = data.links;
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
                                    const url: string = getResourceUrlFromLinkElement(  link,
                                                                                        parameters,
                                                                                        projection,
                                                                                        startIndex,
                                                                                        itemsPerPage);
                                    if (url) {
                                        return axios.get(url).then((response: AxiosResponse) => {
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
                                    const url: string = getResourceUrlFromLinkElement(  link,
                                                                                        parameters,
                                                                                        projection,
                                                                                        startIndex,
                                                                                        itemsPerPage);
                                    if (url) {
                                        return axios.post(url, createData).then((response: AxiosResponse) => {
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
                                    const url: string = getResourceUrlFromLinkElement(  link,
                                                                                        parameters,
                                                                                        projection,
                                                                                        startIndex,
                                                                                        itemsPerPage);
                                    if (url) {
                                        return axios.put(url, updateData).then((response: AxiosResponse) => {
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
                                    const url: string = getResourceUrlFromLinkElement(  link,
                                                                                        parameters,
                                                                                        projection,
                                                                                        startIndex,
                                                                                        itemsPerPage);
                                    if (url) {
                                        return axios.delete(url).then((response: AxiosResponse) => {
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
