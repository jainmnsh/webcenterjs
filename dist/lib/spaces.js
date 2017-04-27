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
var Core = require("./core");
var SPACE_API = "/api/spaces/{spacename}";
var MEMBERS_API = "/api/spaces/{spacename}/members";
var ATTRIBUTES_API = "/api/spaces/{spacename}/attributes";
var ATTRIBUTE_API = "/api/spaces/{spacename}/attributes/{attribute}";
var CHILDREN_API = "/api/spaces/{spacename}/children";
var ROLES_API = "/api/spaces/{spacename}/roles";
var TEMPLATES_API = "/api/spaces/resource/templates?search={search}";
var TEMPLATE_API = "/api/spaces/resource/templates/{templatename}";
var TEMPLATE_ROLES_API = "/api/spaces/resource/templates/{templatename}/roles";
var TEMPLATE_ATTRIBUTES_API = "/api/spaces/resource/templates/{templatename}/attributes";
var SITERESOURCES_API = "/api/spaces/{spacename}/siteresources";
var LISTS_API = "/api/spaces/{spacename}/lists";
var ITEMS_PER_PAGE = 40;
/**
 * Get [Lists](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#BABJGCBJ) for Portal
 * @param portalName portal name (This is not same as Portal Display Name nor is it the Portal Scope ID)
 * @param query of the format `attribute:operator:value`. Listed below are further properties for attribute,operator and value
 * + **attribute :** Valid attributes are name, title, description, creator, created, modifier, and modified of which name, title, description, creator, and modifier are strings and created, modified are dates
 * + **operator :**
 *  - strings : "equals", "not.equals", "contains", "starts.with", "reg.exp.match"
 *  - dates : "equals", "not.equals", "greater.than", "greater.than.or.equals", "less.than", "less.than.or.equals"
 *
 * date example: `created:greater.than:10-SEP-2009`
 * string example : `title:starts.with:xyz`
 * @param projection  valid values are `summary`, `details`
 * @param startIndex pagination
 * @param itemsPerPage pagination
 * @returns Http Promise that resolves to SpacesLists
 */
function getSpaceLists(spaceName, query, projection, startIndex, itemsPerPage) {
    if (projection === void 0) { projection = "summary"; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        itemsPerPage: itemsPerPage,
        projection: projection,
        q: query,
        spacename: spaceName,
        startIndex: startIndex,
    };
    return Core.doGet(LISTS_API, params);
}
exports.getSpaceLists = getSpaceLists;
/**
 * Create a portal [List](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#BABGHFAH)
 *
 * @param portalName Portal Name (This is not same as portal display name)
 * @param spaceList  Parameter [List](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#BABGHFAH) Object
 * @returns Http Promise that resolves to SpacesList
 */
function createSpaceList(spaceName, spaceList) {
    var params = {
        spacename: spaceName,
    };
    return Core.doPost(LISTS_API, spaceList, params);
}
exports.createSpaceList = createSpaceList;
/**
 * Create [Portal](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADJIDH)
 * @param name Portal name
 * @param baseTemplate template on which portal will be based of response from [[getPortalTemplates]]
 * @param description  optional description of the portal
 * @returns a Http Promise that resolves to Created Portal Object
 */
function createSpace(name, baseTemplate, description) {
    return Core.getResourceUrl("urn:oracle:webcenter:spaces").then(function (spacesURL) {
        var resPromise = axios_1.default.post(spacesURL, {
            name: name,
            description: description,
            templateName: baseTemplate,
        });
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.createSpace = createSpace;
/**
 * Get list of available Portal [Templates](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI)
 * @param search search term
 * @param projection valid values are summary, details
 * @param startIndex pagination
 * @param itemsPerPage pagination
 * @returns a Http Promise that resolves to a Portal Templates
 */
function getTemplates(search, projection, startIndex, itemsPerPage) {
    if (projection === void 0) { projection = "summary"; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    return Core.getResourceUrl("urn:oracle:webcenter:spaces:resource:templates", null).then(function (url) {
        var resPromise = axios_1.default.get(url, {
            params: {
                search: search,
                projection: projection,
                startIndex: startIndex,
                itemsPerPage: itemsPerPage,
            }
        });
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getTemplates = getTemplates;
/**
 * Get Portal [Template](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI)
 * @param templateName Template name
 * @param projection valid values are summary, details
 */
function getTemplate(templateName, projection) {
    var params = {
        templatename: templateName,
    };
    if (projection) {
        params.projection = projection;
    }
    return Core.doGet(TEMPLATE_API, params);
}
exports.getTemplate = getTemplate;
/**
 * Get [Template](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI) Roles
 * @param templateName Template name
 * @param projection valid values are summary, details
 */
function getTemplateRoles(templatename, projection, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        templatename: templatename,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    if (projection) {
        params.projection = projection;
    }
    return Core.doGet(TEMPLATE_ROLES_API, params);
}
exports.getTemplateRoles = getTemplateRoles;
/**
 * Get [Template](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI) Attributes
 * @param templateName Template name
 */
function getTemplateAttributes(templatename, projection, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        itemsPerPage: itemsPerPage,
        startIndex: startIndex,
        templatename: templatename,
    };
    if (projection) {
        params.projection = projection;
    }
    return Core.doGet(TEMPLATE_ATTRIBUTES_API, params);
}
exports.getTemplateAttributes = getTemplateAttributes;
/**
 * Search [Site Resources](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_view_comps.htm#CIHHHFEJ)
 *
 * @param search this is in the format of attribute:equals:value where attribute is one of siteResourceType,seeded
 * for example `siteResourceType:equals:xyz` or `seeded:equals:abc`
 * @param spaceName optional parameter that provide search of site resources at portal level
 * @param projection valid values are summary,details
 */
function getSiteResources(spaceName, searchQuery, projection, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    if (spaceName) {
        var params = {
            itemsPerPage: itemsPerPage,
            q: searchQuery,
            spacename: spaceName,
            startIndex: startIndex,
        };
        if (projection) {
            params.projection = projection;
        }
        return Core.doGet(SITERESOURCES_API, params);
    }
    else {
        return Core.getResourceUrl("urn:oracle:webcenter:spaces:siteresources", null).then(function (url) {
            return axios_1.default.get(url, {
                params: {
                    q: searchQuery,
                    projection: projection,
                    startIndex: startIndex,
                    itemsPerPage: itemsPerPage,
                }
            }).then(function (response) {
                return response.data;
            });
        });
    }
}
exports.getSiteResources = getSiteResources;
/**
 * Search Portals
 *
 * @param search search term
 * @param visibility valid values are public,joined,discoverable,moderated,all
 * @param projection valid values are summary,details
 * @param startIndex pagination
 * @param perPage pagination
 * @returns a Http Promise that resolves to PortalList
 */
function getSpaces(search, visibility, projection, startIndex, itemsPerPage) {
    if (visibility === void 0) { visibility = "joined"; }
    if (projection === void 0) { projection = "summary"; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    return Core.getResourceUrl("urn:oracle:webcenter:spaces", null).then(function (url) {
        var resPromise = axios_1.default.get(url, {
            params: {
                search: search,
                visibility: visibility,
                projection: projection,
                startIndex: startIndex,
                itemsPerPage: itemsPerPage,
            }
        });
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getSpaces = getSpaces;
/**
 * Get a Portal by name
 *
 * @param spacesName portal name
 * @param projection valid values are summary,details
 * @returns a Http Promise that resolves to Portal
 */
function getSpace(spaceName, projection) {
    var params = {
        spacename: spaceName,
    };
    if (projection) {
        params.projection = projection;
    }
    return Core.doGet(SPACE_API, params);
}
exports.getSpace = getSpace;
/**
 * Get Portal Children
 * @param spacesName portal name
 * @param projection valid values are summary,details
 * @returns a Http Promise that resolves to Portals List
 */
function getChildren(spaceName, projection, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        spacename: spaceName,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    if (projection) {
        params.projection = projection;
    }
    return Core.doGet(CHILDREN_API, params);
}
exports.getChildren = getChildren;
/**
 * Delete Portal
 * @param spaceName portal name
 */
function deleteSpace(spaceName) {
    var params = {
        spacename: spaceName,
    };
    return Core.doDelete(SPACE_API, params);
}
exports.deleteSpace = deleteSpace;
/**
 * Get Portal Attributes
 * @param spaceName portal name
 */
function getAttributes(spaceName, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        spacename: spaceName,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    return Core.doGet(ATTRIBUTES_API, params);
}
exports.getAttributes = getAttributes;
/**
 * Create a Portal Attribute
 *
 * @param spaceName portal name
 * @param attrName Portal attribute name
 * @param attrValue Portal attribute value
 * @param attrDesc Portal attribute description
 */
function createAttribute(spaceName, attrName, attrValue, attrDesc) {
    var attribute = {
        description: attrDesc,
        links: null,
        name: attrName,
        resourceType: null,
        type: null,
        value: attrValue,
    };
    var params = {
        spacename: spaceName,
    };
    return Core.doPost(ATTRIBUTES_API, attribute, params);
}
exports.createAttribute = createAttribute;
/**
 * Get a specific Portal Attriute
 * @param spaceName portal name
 * @param attributeName Portal attribute name
 */
function getAttribute(spaceName, attributeName) {
    var params = {
        attribute: attributeName,
        spacename: spaceName,
    };
    return Core.doGet(ATTRIBUTE_API, params);
}
exports.getAttribute = getAttribute;
/**
 * Get Portal Members
 * @param spaceName portal name
 * @param startIndex Start Index
 * @param itemsPerPage Items Per Page
 * @returns a Http Promise that resolves to Members of Portal
 */
function getMembers(spaceName, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        spacename: spaceName,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    return Core.doGet(MEMBERS_API, params);
}
exports.getMembers = getMembers;
/**
 * Add Member to Portal
 * @param spaceName portal name
 * @param member member information
 * @returns a Http Promise that resolves to Members of Portal
 */
function addMember(spaceName, member) {
    var params = {
        spacename: spaceName,
    };
    return Core.doPost(MEMBERS_API, member, params);
}
exports.addMember = addMember;
/**
 * Get Portal Roles
 * @param spaceName portal name
 */
function getSpaceRoles(spaceName) {
    var params = {
        spacename: spaceName,
    };
    return Core.doGet(ROLES_API, params);
}
exports.getSpaceRoles = getSpaceRoles;
//# sourceMappingURL=spaces.js.map