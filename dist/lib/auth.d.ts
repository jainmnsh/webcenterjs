import * as Common from "./types/common";
/**
 * sets OIT Token for authorization
 * @param oit oracle identity token that is generated from call to WCSecurityUtility.issueTrustServiceSecurityToken()
 */
export declare function setOIT(oit: string): void;
/**
 * sets BASIC Auth Token for authorization
 * @param basicAuth auth identity token
 * that is generated from base64(['username',':','password].join('')).
 * Refer to [Wiki](https://en.wikipedia.org/wiki/Basic_access_authentication)
 */
export declare function setBasicAuth(basicAuth: string): void;
/**
 * sets username for authorization
 * @param userName Username
 */
export declare function setUserName(userName: string): void;
/**
 * sets password for authorization
 * @param password Username
 */
export declare function setPassword(password: string): void;
/**
 * Method to get
  * [Resource Index](https://docs.oracle.com/cd/E21764_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABHCDIH)
 * @returns [Resource Index](https://docs.oracle.com/cd/E21764_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABHCDIH).
*/
export declare function getResourceIndex(): Promise<Common.ResourceIndex>;
/**
 * Method to get uToken. This token is obtain from response header **x-oracle-rf-token** post Resource Index call.
 * @returns       uToken for the user.
 */
export declare function getUToken(): string;
export declare function getAuthorizationHeader(): string;
export declare function isAuthenticated(): boolean;
export declare function getCurrentUser(): Promise<Common.PersonReference>;
export declare function logout(): void;
export declare function login(userNameOrIdentityToken?: string, password?: string): Promise<Common.ResourceIndex>;
