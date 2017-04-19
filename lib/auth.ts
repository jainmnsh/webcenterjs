import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import * as Config from "./config";
import * as Core from "./core";

const LITERALS: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const RESOURCEINDEX_SUFFIX: string = "/api/resourceIndex";
const USER_PROFILE: string = "/api/people/@me/lists/@self";

// tslint:disable-next-line:variable-name
let _isAuthenticated: boolean = false;
// tslint:disable-next-line:variable-name
let _isAuthenticationInProgress: boolean = false;
let identityToken: string;
// tslint:disable-next-line:variable-name
let _userName: string;
// tslint:disable-next-line:variable-name
let _password: string;
// tslint:disable-next-line:variable-name
let resourceIndex: WebCenter.Common.ResourceIndex;
let uToken: string;
let authHeader: string;
let authPromise: Promise<WebCenter.Common.ResourceIndex>;

function encode(input: string): string {
    let output: string = "";
    // tslint:disable-next-line:one-variable-per-declaration
    let chr1: number, chr2: number, chr3: number = -1;
    // tslint:disable-next-line:one-variable-per-declaration
    let enc1: number, enc2: number, enc3: number, enc4: number = -1;
    let i: number = 0;

    do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        // tslint:disable-next-line:no-bitwise
        enc1 = chr1 >> 2;
        // tslint:disable-next-line:no-bitwise
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        // tslint:disable-next-line:no-bitwise
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        // tslint:disable-next-line:no-bitwise
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
            LITERALS.charAt(enc1) +
            LITERALS.charAt(enc2) +
            LITERALS.charAt(enc3) +
            LITERALS.charAt(enc4);
        chr1 = chr2 = chr3 = -1;
        enc1 = enc2 = enc3 = enc4 = -1;
    } while (i < input.length);

    return output;
}

function decode(input: string) {
    let output: string = "";
    // tslint:disable-next-line:one-variable-per-declaration
    let chr1: number, chr2: number, chr3: number = -1;
    // tslint:disable-next-line:one-variable-per-declaration
    let enc1: number, enc2: number, enc3: number, enc4: number = -1;
    let i: number = 0;

    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    const base64test: RegExp = /[^A-Za-z0-9\+\/\=]/g;
    if (base64test.exec(input)) {
        return null;
    }
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    do {
        enc1 = LITERALS.indexOf(input.charAt(i++));
        enc2 = LITERALS.indexOf(input.charAt(i++));
        enc3 = LITERALS.indexOf(input.charAt(i++));
        enc4 = LITERALS.indexOf(input.charAt(i++));

        // tslint:disable-next-line:no-bitwise
        chr1 = (enc1 << 2) | (enc2 >> 4);
        // tslint:disable-next-line:no-bitwise
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        // tslint:disable-next-line:no-bitwise
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 !== 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 !== 64) {
            output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = -1;
        enc1 = enc2 = enc3 = enc4 = -1;

    } while (i < input.length);

    return output;
}

/**
 * sets OIT Token for authorization
 * @param oit oracle identity token that is generated from call to WCSecurityUtility.issueTrustServiceSecurityToken()
 */
export function setOIT(oit: string): void {
    identityToken = "OIT " + oit;
}

/**
 * sets BASIC Auth Token for authorization
 * @param basicAuth auth identity token
 * that is generated from base64(['username',':','password].join('')).
 * Refer to [Wiki](https://en.wikipedia.org/wiki/Basic_access_authentication)
 */
export function setBasicAuth(basicAuth: string): void {
    identityToken = "Basic " + basicAuth;
}

/**
 * sets username for authorization
 * @param userName Username
 */
export function setUserName(userName: string): void {
    _userName = userName;
}

/**
 * sets password for authorization
 * @param password Username
 */
export function setPassword(password: string): void {
    _password = password;
}

/**
 * Method to get
 * [Resource Index](https://docs.oracle.com/cd/E21764_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABHCDIH)
 * @returns [Resource Index](https://docs.oracle.com/cd/E21764_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABHCDIH).
 */
export function getResourceIndex(): Promise<WebCenter.Common.ResourceIndex> {
    return login().then((resIndex: WebCenter.Common.ResourceIndex) => {
        return resIndex;
    });
}

/**
 * Method to get uToken. This token is obtain from response header **x-oracle-rf-token** post Resource Index call.
 * @returns       uToken for the user.
 */
export function getUToken(): string {
    return uToken;
}

export function getAuthorizationHeader(): string {
    return authHeader;
}

export function isAuthenticated(): boolean {
    return _isAuthenticated;
}

export function getCurrentUser(): Promise<WebCenter.Common.PersonReference> {
    return Core.doGet(USER_PROFILE);
}

function restLogin(authorization?: string): Promise<WebCenter.Common.ResourceIndex> {
    const headers: any = authorization ? { Authorization: authorization } : {};
    const restBaseUrl: string = Config.getRestBaseUrl();

    return axios.get(restBaseUrl + RESOURCEINDEX_SUFFIX, {
        headers,
    }).then((response: AxiosResponse) => {
        uToken = response.headers["x-oracle-rf-token"];
        authHeader = authorization;
        resourceIndex = response.data;
        return resourceIndex;
    });
}

function csLogin(userName: string, password: string): Promise<string> {
    const csBaseUrl: string = Config.getCsBaseUrl();
    // tslint:disable-next-line:max-line-length
    const url: string = `${csBaseUrl}/j_security_check?success_url=${csBaseUrl}/idcplg?IdcService=GET_DOC_PAGE&Action=GetTemplatePage&Page=HOME_PAGE`;
    return axios.post(url, {
        j_password: password,
        j_username: userName,
    }, {
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml",
                "Content-Type": "application/x-www-form-urlencoded",
            }, transformRequest: (obj) => {
                const str: string[] = [];
                for (const p in obj) {
                    if (obj[p]) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                }
                return str.join("&");
            },
        }).then((response: AxiosResponse) => {
            return response.data;
        }, (error: AxiosError) => {
            return axios.get(csBaseUrl).then((resp: AxiosResponse) => {
                return resp.data;
            });
        });
}

function wcLogin(userName: string, password: string): Promise<string> {
    const wcBaseUrl: string = Config.getWcBaseUrl();
    const url: string = wcBaseUrl + "/wcAuthentication?success_url=" + wcBaseUrl + "/portal";
    return axios.post(url, {
        j_password: password,
        j_username: userName,
    }, {
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml",
                "Content-Type": "application/x-www-form-urlencoded",
            }, transformRequest: (obj) => {
                const str: string[] = [];
                for (const p in obj) {
                    if (obj[p]) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                }
                return str.join("&");
            },
        }).then((response: AxiosResponse) => {
            return response.data;
        });
}

export function logout(): void {
    _isAuthenticated = false;
    authPromise = null;
    _userName = null;
    _password = null;
    identityToken = null;
    resourceIndex = null;
    uToken = null;
    authHeader = null;
    _isAuthenticationInProgress = false;
}

export function login(userNameOrIdentityToken?: string, password?: string): Promise<WebCenter.Common.ResourceIndex> {

    if (_isAuthenticated) {
        return authPromise;
    } else {
        if (_isAuthenticationInProgress) {
            return authPromise;
        } else {
            _isAuthenticationInProgress = true;
            _isAuthenticated = false;

            _userName = userNameOrIdentityToken ? userNameOrIdentityToken : _userName;
            _password = password ? password : _password;

            if (_password) {
                const words: string = _userName + ":" + _password;
                const base64: string = encode(words);
                const authorization: string = "Basic " + base64;

                const restBaseUrl: string = Config.getRestBaseUrl();
                const wcBaseUrl: string = Config.getWcBaseUrl();
                const csBaseUrl: string = Config.getCsBaseUrl();

                let promiseArr: any;

                if (restBaseUrl) {
                    promiseArr = [restLogin(authorization)];
                }

                if (wcBaseUrl) {
                    promiseArr.push(wcLogin(_userName, _password));
                }

                if (csBaseUrl) {
                    promiseArr.push(csLogin(_userName, _password));
                }

                if (!wcBaseUrl && !csBaseUrl) {
                    authPromise = promiseArr[0].then((resIndex: WebCenter.Common.ResourceIndex) => {
                        _isAuthenticationInProgress = false;
                        _isAuthenticated = true;
                        return resIndex;
                    }, (error: any) => {
                        _isAuthenticationInProgress = false;
                        _isAuthenticated = false;
                        throw error;
                    });
                } else {
                    authPromise = axios.all(promiseArr).then(
                        (responses: [WebCenter.Common.ResourceIndex, string, string]) => {
                        _isAuthenticationInProgress = false;
                        _isAuthenticated = true;
                        return responses[0];
                    }, (error: any) => {
                        _isAuthenticationInProgress = false;
                        _isAuthenticated = false;
                        throw error;
                    });
                }
                return authPromise;
            } else {
                authPromise = restLogin(_userName).then((resIndex: WebCenter.Common.ResourceIndex) => {
                    _isAuthenticationInProgress = false;
                    _isAuthenticated = true;
                    return resIndex;
                }, (error: any) => {
                    _isAuthenticationInProgress = false;
                    _isAuthenticated = false;
                    throw error;
                });
                return authPromise;
            }
        }
    }
}

function recover(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    return login().then((resIdx: WebCenter.Common.ResourceIndex) => {

        if (config.url.indexOf("utoken") === -1) {
            if (config.params) {
                config.params.utoken = getUToken();
            } else {
                config.params = {
                    utoken: getUToken(),
                };
            }
        }

        const authHdr: string = getAuthorizationHeader();

        if (authHdr) {
            if (config.headers) {
                config.headers.Authorization = authHdr;
            } else {
                config.headers = {
                    Authorization: authHdr,
                };
            }
        }
        return config;
    });
}

axios.interceptors.request.use((config: AxiosRequestConfig) => {
    const url: string = config.url;
    const restBaseUrl: string = Config.getRestBaseUrl();
    if (url.indexOf(restBaseUrl + "/api") >= 0 || url.indexOf("utoken") > 0 ) {
        if (isAuthenticated()) {
            if (url.indexOf("utoken") < 0) {
                if (config.params) {
                    config.params.utoken = getUToken();
                } else {
                    config.params = { utoken: getUToken() };
                }
            }
            const authHdr: string = getAuthorizationHeader();
            if (authHdr) {
                config.headers.Authorization = authHdr;
            }
            return config;
        } else {
            if (url.indexOf(restBaseUrl + "/api/resourceIndex") >= 0) {
                return config;
            } else {
                const promise: any = recover(config);
                return promise;
            }
        }
    } else {
        return config;
    }
}, (error: any) => {
    throw error;
});
