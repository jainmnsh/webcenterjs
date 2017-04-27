/**
 * sets WebCenter REST Base URL.
 * @param url  URL prefix for WebCenter REST eg. http://webcenter-host/rest.
 */
export declare function setRestBaseUrl(url: string): void;
/**
 * sets WebCenter Content (UCM) Base URL.
 * @param url  URL prefix for WebCenter Content (UCM) eg. http://webcenter-content-host/cs.
 */
export declare function setCsBaseUrl(url: string): void;
/**
 * sets WebCenter Base URL.
 * @param url  URL prefix for WebCenter eg. http://webcenter-host/webcenter.
 */
export declare function setWcBaseUrl(url: string): void;
/**
 * Method to get configured WebCenter REST Base URL.
 * @returns       configured WebCenter REST Base URL.
 */
export declare function getRestBaseUrl(): string;
/**
 * Method to get configured WebCenter Content (UCM) Base URL.
 * @returns       configured WebCenter Content (UCM) Base URL.
 */
export declare function getCsBaseUrl(): string;
/**
 * Method to get configured WebCenter Base URL.
 * @returns       configured WebCenter Base URL.
 */
export declare function getWcBaseUrl(): string;
