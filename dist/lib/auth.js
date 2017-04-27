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
var axios_1 = require("axios");
var Config = require("./config");
var Core = require("./core");
var LITERALS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var RESOURCEINDEX_SUFFIX = "/api/resourceIndex";
var USER_PROFILE = "/api/people/@me/lists/@self";
// tslint:disable-next-line:variable-name
var _isAuthenticated = false;
// tslint:disable-next-line:variable-name
var _isAuthenticationInProgress = false;
var identityToken;
// tslint:disable-next-line:variable-name
var _userName;
// tslint:disable-next-line:variable-name
var _password;
// tslint:disable-next-line:variable-name
var resourceIndex;
var uToken;
var authHeader;
var authPromise;
function encode(input) {
    var output = "";
    // tslint:disable-next-line:one-variable-per-declaration
    var chr1, chr2, chr3 = -1;
    // tslint:disable-next-line:one-variable-per-declaration
    var enc1, enc2, enc3, enc4 = -1;
    var i = 0;
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
        }
        else if (isNaN(chr3)) {
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
function decode(input) {
    var output = "";
    // tslint:disable-next-line:one-variable-per-declaration
    var chr1, chr2, chr3 = -1;
    // tslint:disable-next-line:one-variable-per-declaration
    var enc1, enc2, enc3, enc4 = -1;
    var i = 0;
    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    var base64test = /[^A-Za-z0-9\+\/\=]/g;
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
function setOIT(oit) {
    identityToken = "OIT " + oit;
}
exports.setOIT = setOIT;
/**
 * sets BASIC Auth Token for authorization
 * @param basicAuth auth identity token
 * that is generated from base64(['username',':','password].join('')).
 * Refer to [Wiki](https://en.wikipedia.org/wiki/Basic_access_authentication)
 */
function setBasicAuth(basicAuth) {
    identityToken = "Basic " + basicAuth;
}
exports.setBasicAuth = setBasicAuth;
/**
 * sets username for authorization
 * @param userName Username
 */
function setUserName(userName) {
    _userName = userName;
}
exports.setUserName = setUserName;
/**
 * sets password for authorization
 * @param password Username
 */
function setPassword(password) {
    _password = password;
}
exports.setPassword = setPassword;
/**
 * Method to get
  * [Resource Index](https://docs.oracle.com/cd/E21764_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABHCDIH)
 * @returns [Resource Index](https://docs.oracle.com/cd/E21764_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABHCDIH).
*/
function getResourceIndex() {
    return login().then(function (resIndex) {
        return resIndex;
    });
}
exports.getResourceIndex = getResourceIndex;
/**
 * Method to get uToken. This token is obtain from response header **x-oracle-rf-token** post Resource Index call.
 * @returns       uToken for the user.
 */
function getUToken() {
    return uToken;
}
exports.getUToken = getUToken;
function getAuthorizationHeader() {
    return authHeader;
}
exports.getAuthorizationHeader = getAuthorizationHeader;
function isAuthenticated() {
    return _isAuthenticated;
}
exports.isAuthenticated = isAuthenticated;
function getCurrentUser() {
    return Core.doGet(USER_PROFILE);
}
exports.getCurrentUser = getCurrentUser;
function restLogin(authorization) {
    var headers = authorization ? { Authorization: authorization } : {};
    var restBaseUrl = Config.getRestBaseUrl();
    return axios_1.default.get(restBaseUrl + RESOURCEINDEX_SUFFIX, {
        headers: headers,
    }).then(function (response) {
        uToken = response.headers["x-oracle-rf-token"];
        authHeader = authorization;
        resourceIndex = response.data;
        return resourceIndex;
    });
}
function csLogin(userName, password) {
    var csBaseUrl = Config.getCsBaseUrl();
    // tslint:disable-next-line:max-line-length
    var url = csBaseUrl + "/j_security_check?success_url=" + csBaseUrl + "/idcplg?IdcService=GET_DOC_PAGE&Action=GetTemplatePage&Page=HOME_PAGE";
    return axios_1.default.post(url, {
        j_password: password,
        j_username: userName,
    }, {
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml",
            "Content-Type": "application/x-www-form-urlencoded",
        }, transformRequest: function (obj) {
            var str = [];
            for (var p in obj) {
                if (obj[p]) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            }
            return str.join("&");
        },
    }).then(function (response) {
        return response.data;
    }, function (error) {
        return axios_1.default.get(csBaseUrl).then(function (resp) {
            return resp.data;
        });
    });
}
function wcLogin(userName, password) {
    var wcBaseUrl = Config.getWcBaseUrl();
    var url = wcBaseUrl + "/wcAuthentication?success_url=" + wcBaseUrl + "/portal";
    return axios_1.default.post(url, {
        j_password: password,
        j_username: userName,
    }, {
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml",
            "Content-Type": "application/x-www-form-urlencoded",
        }, transformRequest: function (obj) {
            var str = [];
            for (var p in obj) {
                if (obj[p]) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            }
            return str.join("&");
        },
    }).then(function (response) {
        return response.data;
    });
}
function logout() {
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
exports.logout = logout;
function login(userNameOrIdentityToken, password) {
    if (_isAuthenticated) {
        return authPromise;
    }
    else {
        if (_isAuthenticationInProgress) {
            return authPromise;
        }
        else {
            _isAuthenticationInProgress = true;
            _isAuthenticated = false;
            _userName = userNameOrIdentityToken ? userNameOrIdentityToken : _userName;
            _password = password ? password : _password;
            if (_password) {
                var words = _userName + ":" + _password;
                var base64 = encode(words);
                var authorization = "Basic " + base64;
                var restBaseUrl = Config.getRestBaseUrl();
                var wcBaseUrl = Config.getWcBaseUrl();
                var csBaseUrl = Config.getCsBaseUrl();
                var promiseArr = void 0;
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
                    authPromise = promiseArr[0].then(function (resIndex) {
                        _isAuthenticationInProgress = false;
                        _isAuthenticated = true;
                        return resIndex;
                    }, function (error) {
                        _isAuthenticationInProgress = false;
                        _isAuthenticated = false;
                        throw error;
                    });
                }
                else {
                    authPromise = axios_1.default.all(promiseArr).then(function (responses) {
                        _isAuthenticationInProgress = false;
                        _isAuthenticated = true;
                        return responses[0];
                    }, function (error) {
                        _isAuthenticationInProgress = false;
                        _isAuthenticated = false;
                        throw error;
                    });
                }
                return authPromise;
            }
            else {
                authPromise = restLogin(_userName).then(function (resIndex) {
                    _isAuthenticationInProgress = false;
                    _isAuthenticated = true;
                    return resIndex;
                }, function (error) {
                    _isAuthenticationInProgress = false;
                    _isAuthenticated = false;
                    throw error;
                });
                return authPromise;
            }
        }
    }
}
exports.login = login;
function recover(config) {
    return login().then(function (resIdx) {
        if (config.url.indexOf("utoken") === -1) {
            if (config.params) {
                config.params.utoken = getUToken();
            }
            else {
                config.params = {
                    utoken: getUToken(),
                };
            }
        }
        var authHdr = getAuthorizationHeader();
        if (authHdr) {
            if (config.headers) {
                config.headers.Authorization = authHdr;
            }
            else {
                config.headers = {
                    Authorization: authHdr,
                };
            }
        }
        return config;
    });
}
axios_1.default.interceptors.request.use(function (config) {
    var url = config.url;
    var restBaseUrl = Config.getRestBaseUrl();
    var idxPort80 = url.indexOf(":80/");
    if (idxPort80 > 0) {
        url = [url.substr(0, idxPort80), url.substr(idxPort80 + 3)].join("");
    }
    config.url = url;
    if (url.indexOf(restBaseUrl + "/api") >= 0) {
        if (isAuthenticated()) {
            if (url.indexOf("utoken") < 0) {
                if (config.params) {
                    config.params.utoken = getUToken();
                }
                else {
                    config.params = { utoken: getUToken() };
                }
            }
            var authHdr = getAuthorizationHeader();
            if (authHdr) {
                config.headers.Authorization = authHdr;
            }
            return config;
        }
        else {
            if (url.indexOf(restBaseUrl + "/api/resourceIndex") >= 0) {
                return config;
            }
            else {
                var promise = recover(config);
                return promise;
            }
        }
    }
    else {
        return config;
    }
}, function (error) {
    throw error;
});
//# sourceMappingURL=auth.js.map