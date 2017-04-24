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

import axios, {AxiosResponse } from "axios";
import * as Core from "./core";
import * as Lists from "./types/lists";
import * as Spaces from "./types/spaces";

const SPACE_API: string = "/api/spaces/{spacename}";
const MEMBERS_API: string = "/api/spaces/{spacename}/members";
const ATTRIBUTES_API: string = "/api/spaces/{spacename}/attributes";
const ATTRIBUTE_API: string = "/api/spaces/{spacename}/attributes/{attribute}";
const CHILDREN_API: string = "/api/spaces/{spacename}/children";
const ROLES_API: string = "/api/spaces/{spacename}/roles";
const TEMPLATES_API: string = "/api/spaces/resource/templates?search={search}";
const TEMPLATE_API: string = "/api/spaces/resource/templates/{templatename}";
const TEMPLATE_ROLES_API: string = "/api/spaces/resource/templates/{templatename}/roles";
const TEMPLATE_ATTRIBUTES_API: string = "/api/spaces/resource/templates/{templatename}/attributes";
const SITERESOURCES_API: string = "/api/spaces/{spacename}/siteresources";
const LISTS_API: string = "/api/spaces/{spacename}/lists";

const ITEMS_PER_PAGE: number = 40;

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
export function getSpaceLists(
    spaceName: string,
    query: string,
    projection: string = "summary",
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<Lists.SpacesList> {
    const params: {} = {
        itemsPerPage,
        projection,
        q: query,
        spacename: spaceName,
        startIndex,
    };
    return Core.doGet(LISTS_API, params);
}

/**
 * Create a portal [List](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#BABGHFAH)
 *
 * @param portalName Portal Name (This is not same as portal display name)
 * @param spaceList  Parameter [List](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#BABGHFAH) Object
 * @returns Http Promise that resolves to SpacesList
 */
export function createSpaceList(
    spaceName: string,
    spaceList: Lists.SpacesList,
    ): Promise<Lists.SpacesList> {
    const params: {} = {
        spacename: spaceName,
    };
    return Core.doPost(LISTS_API, spaceList, params);
}

/**
 * Create [Portal](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADJIDH)
 * @param name Portal name
 * @param baseTemplate template on which portal will be based of response from [[getPortalTemplates]]
 * @param description  optional description of the portal
 * @returns a Http Promise that resolves to Created Portal Object
 */
export function createSpace(
    name: string,
    baseTemplate: string,
    description?: string): Promise<Spaces.Space> {
    return Core.getResourceUrl("urn:oracle:webcenter:spaces").then((spacesURL: string) => {
        const resPromise: any = axios.post(spacesURL, {
            name,
            description,
            templateName: baseTemplate,
        });
        return resPromise.then((response: AxiosResponse) => {
            return response.data;
        });
    });
}

/**
 * Get list of available Portal [Templates](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI)
 * @param search search term
 * @param projection valid values are summary, details
 * @param startIndex pagination
 * @param itemsPerPage pagination
 * @returns a Http Promise that resolves to a Portal Templates
 */
export function getTemplates(
    search?: string,
    projection: string = "summary",
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<Spaces.Templates> {
    return Core.getResourceUrl(
        "urn:oracle:webcenter:spaces:resource:templates",
        null).then((url: string) => {
        const resPromise: any = axios.get(url, {
            params : {
                search,
                projection,
                startIndex,
                itemsPerPage,
            }
        });
        return resPromise.then((response: AxiosResponse) => {
            return response.data;
        });
    });
}

/**
 * Get Portal [Template](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI)
 * @param templateName Template name
 * @param projection valid values are summary, details
 */
export function getTemplate(templateName: string, projection?: string): Promise<Spaces.Template> {
    const params: {templatename: string, projection?: string} = {
        templatename: templateName,
    };

    if (projection) {
        params.projection = projection;
    }
    return Core.doGet(TEMPLATE_API, params);
}

/**
 * Get [Template](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI) Roles
 * @param templateName Template name
 * @param projection valid values are summary, details
 */
export function getTemplateRoles(
    templatename: string,
    projection?: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE,
    ): Promise<Spaces.Roles> {
    const params: any = {
        templatename,
        startIndex,
        itemsPerPage,
    };
    if (projection) {
        params.projection = projection;
    }
    return Core.doGet(TEMPLATE_ROLES_API, params);
}

/**
 * Get [Template](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI) Attributes
 * @param templateName Template name
 */
export function getTemplateAttributes(
    templatename: string,
    projection?: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE,
    ): Promise<Spaces.Attributes> {
    const params: {templatename: string, projection?: string, startIndex: number, itemsPerPage: number} = {
        itemsPerPage,
        startIndex,
        templatename,
    };

    if (projection) {
        params.projection = projection;
    }

    return Core.doGet(TEMPLATE_ATTRIBUTES_API, params);
}

/**
 * Search [Site Resources](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_view_comps.htm#CIHHHFEJ)
 *
 * @param search this is in the format of attribute:equals:value where attribute is one of siteResourceType,seeded
 * for example `siteResourceType:equals:xyz` or `seeded:equals:abc`
 * @param spaceName optional parameter that provide search of site resources at portal level
 * @param projection valid values are summary,details
 */
export function getSiteResources(
    spaceName?: string,
    searchQuery?: string,
    projection?: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE,
    ): Promise<any> {
    if (spaceName) {
        const params: any = {
            itemsPerPage,
            q: searchQuery,
            spacename: spaceName,
            startIndex,
        };
        if (projection) {
            params.projection = projection;
        }
        return Core.doGet(SITERESOURCES_API, params);
    } else {
        return Core.getResourceUrl(
            "urn:oracle:webcenter:spaces:siteresources",
            null).then((url: string) => {
            return axios.get(url,{
                params: {
                    q : searchQuery,
                    projection,
                    startIndex,
                    itemsPerPage,
                }
            }).then((response: AxiosResponse) => {
                return response.data;
            });
        });
    }
}

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
export function getSpaces(
    search?: string,
    visibility: string = "joined",
    projection: string = "summary",
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<Spaces.Spaces> {

    return Core.getResourceUrl(
        "urn:oracle:webcenter:spaces",
        null).then((url: string) => {
        const resPromise: any = axios.get(url, {
            params : {
                search,
                visibility,
                projection,
                startIndex,
                itemsPerPage,
            }
        });
        return resPromise.then((response: AxiosResponse) => {
            return response.data;
        });
    });
}

/**
 * Get a Portal by name
 *
 * @param spacesName portal name
 * @param projection valid values are summary,details
 * @returns a Http Promise that resolves to Portal
 */
export function getSpace(spaceName: string, projection?: string): Promise<Spaces.Space> {
    const params: any = {
        spacename: spaceName,
    };
    if (projection) {
        params.projection = projection;
    }
    return Core.doGet(SPACE_API, params);
}

/**
 * Get Portal Children
 * @param spacesName portal name
 * @param projection valid values are summary,details
 * @returns a Http Promise that resolves to Portals List
 */
export function getChildren(
    spaceName: string,
    projection?: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE,
    ): Promise<Spaces.Spaces> {
    const params: any = {
        spacename: spaceName,
        startIndex,
        itemsPerPage,
    };
    if (projection) {
        params.projection = projection;
    }
    return Core.doGet(CHILDREN_API, params);
}

/**
 * Delete Portal
 * @param spaceName portal name
 */
export function deleteSpace(spaceName: string): Promise<any> {
    const params: {} = {
        spacename: spaceName,
    };
    return Core.doDelete(SPACE_API, params);
}

/**
 * Get Portal Attributes
 * @param spaceName portal name
 */
export function getAttributes(
    spaceName: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<Spaces.Attributes> {
    const params: any = {
        spacename: spaceName,
        startIndex,
        itemsPerPage,
    };
    return Core.doGet(ATTRIBUTES_API, params);
}

/**
 * Create a Portal Attribute
 *
 * @param spaceName portal name
 * @param attrName Portal attribute name
 * @param attrValue Portal attribute value
 * @param attrDesc Portal attribute description
 */
export function createAttribute(
    spaceName: string,
    attrName: string,
    attrValue: any,
    attrDesc?: string): Promise<Spaces.Attribute> {
    const attribute: Spaces.Attribute = {
        description: attrDesc,
        links: null,
        name: attrName,
        resourceType: null,
        type: null,
        value: attrValue,
    };
    const params: {} = {
        spacename: spaceName,
    };
    return Core.doPost(ATTRIBUTES_API, attribute, params);
}

/**
 * Get a specific Portal Attriute
 * @param spaceName portal name
 * @param attributeName Portal attribute name
 */
export function getAttribute(spaceName: string, attributeName: string): Promise<Spaces.Attribute> {
    const params: {} = {
        attribute: attributeName,
        spacename: spaceName,
    };
    return Core.doGet(ATTRIBUTE_API, params);
}

/**
 * Get Portal Members
 * @param spaceName portal name
 * @param startIndex Start Index
 * @param itemsPerPage Items Per Page
 * @returns a Http Promise that resolves to Members of Portal
 */
export function getMembers(
    spaceName: string,
    startIndex: number = 0,
    itemsPerPage: number = ITEMS_PER_PAGE): Promise<Spaces.Members> {
    const params: {} = {
        spacename: spaceName,
        startIndex,
        itemsPerPage,
    };
    return Core.doGet(MEMBERS_API, params);
}

/**
 * Add Member to Portal
 * @param spaceName portal name
 * @param member member information
 * @returns a Http Promise that resolves to Members of Portal
 */
export function addMember(
    spaceName: string,
    member: Spaces.Member): Promise<Spaces.Members> {
    const params: {} = {
        spacename: spaceName,
    };
    return Core.doPost(MEMBERS_API, member, params);
}

/**
 * Get Portal Roles
 * @param spaceName portal name
 */
export function getSpaceRoles(spaceName: string): Promise<Spaces.Roles> {
    const params: {} = {
        spacename: spaceName,
    };
    return Core.doGet(ROLES_API, params);
}
