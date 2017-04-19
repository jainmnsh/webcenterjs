/**
 * Config allows to specify REST , WebCenter & CS Prefix URLs. This information is used in rest of the modules
 */
import * as _ from "lodash";

let restUrl: string = "/rest";
let csUrl: string;
let wcUrl: string;

function removeLastSlash(url: string): string {
    if (!url) {
        return url;
    }

    if (_.endsWith(url, "/")) {
         return url.substring(0, url.length - 1);
    }else {
        return url;
    }
}

/**
 * sets WebCenter REST Base URL.
 * @param url  URL prefix for WebCenter REST eg. http://webcenter-host/rest.
 */
export function setRestBaseUrl(url: string): void {
    restUrl = removeLastSlash(url);
}

/**
 * sets WebCenter Content (UCM) Base URL.
 * @param url  URL prefix for WebCenter Content (UCM) eg. http://webcenter-content-host/cs.
 */
export function setCsBaseUrl(url: string): void {
    csUrl = removeLastSlash(url);
}

/**
 * sets WebCenter Base URL.
 * @param url  URL prefix for WebCenter eg. http://webcenter-host/webcenter.
 */
export function setWcBaseUrl(url: string): void {
    wcUrl = removeLastSlash(url);
}

/**
 * Method to get configured WebCenter REST Base URL.
 * @returns       configured WebCenter REST Base URL.
 */
export function getRestBaseUrl(): string {
    return restUrl;
}

/**
 * Method to get configured WebCenter Content (UCM) Base URL.
 * @returns       configured WebCenter Content (UCM) Base URL.
 */
export function getCsBaseUrl(): string {
    return csUrl;
}

/**
 * Method to get configured WebCenter Base URL.
 * @returns       configured WebCenter Base URL.
 */
export function getWcBaseUrl(): string {
    return wcUrl;
}
