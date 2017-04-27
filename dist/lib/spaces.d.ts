import * as Lists from "./types/lists";
import * as Spaces from "./types/spaces";
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
export declare function getSpaceLists(spaceName: string, query: string, projection?: string, startIndex?: number, itemsPerPage?: number): Promise<Lists.SpacesList>;
/**
 * Create a portal [List](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#BABGHFAH)
 *
 * @param portalName Portal Name (This is not same as portal display name)
 * @param spaceList  Parameter [List](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#BABGHFAH) Object
 * @returns Http Promise that resolves to SpacesList
 */
export declare function createSpaceList(spaceName: string, spaceList: Lists.SpacesList): Promise<Lists.SpacesList>;
/**
 * Create [Portal](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADJIDH)
 * @param name Portal name
 * @param baseTemplate template on which portal will be based of response from [[getPortalTemplates]]
 * @param description  optional description of the portal
 * @returns a Http Promise that resolves to Created Portal Object
 */
export declare function createSpace(name: string, baseTemplate: string, description?: string): Promise<Spaces.Space>;
/**
 * Get list of available Portal [Templates](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI)
 * @param search search term
 * @param projection valid values are summary, details
 * @param startIndex pagination
 * @param itemsPerPage pagination
 * @returns a Http Promise that resolves to a Portal Templates
 */
export declare function getTemplates(search?: string, projection?: string, startIndex?: number, itemsPerPage?: number): Promise<Spaces.Templates>;
/**
 * Get Portal [Template](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI)
 * @param templateName Template name
 * @param projection valid values are summary, details
 */
export declare function getTemplate(templateName: string, projection?: string): Promise<Spaces.Template>;
/**
 * Get [Template](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI) Roles
 * @param templateName Template name
 * @param projection valid values are summary, details
 */
export declare function getTemplateRoles(templatename: string, projection?: string, startIndex?: number, itemsPerPage?: number): Promise<Spaces.Roles>;
/**
 * Get [Template](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI) Attributes
 * @param templateName Template name
 */
export declare function getTemplateAttributes(templatename: string, projection?: string, startIndex?: number, itemsPerPage?: number): Promise<Spaces.Attributes>;
/**
 * Search [Site Resources](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_view_comps.htm#CIHHHFEJ)
 *
 * @param search this is in the format of attribute:equals:value where attribute is one of siteResourceType,seeded
 * for example `siteResourceType:equals:xyz` or `seeded:equals:abc`
 * @param spaceName optional parameter that provide search of site resources at portal level
 * @param projection valid values are summary,details
 */
export declare function getSiteResources(spaceName?: string, searchQuery?: string, projection?: string, startIndex?: number, itemsPerPage?: number): Promise<any>;
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
export declare function getSpaces(search?: string, visibility?: string, projection?: string, startIndex?: number, itemsPerPage?: number): Promise<Spaces.Spaces>;
/**
 * Get a Portal by name
 *
 * @param spacesName portal name
 * @param projection valid values are summary,details
 * @returns a Http Promise that resolves to Portal
 */
export declare function getSpace(spaceName: string, projection?: string): Promise<Spaces.Space>;
/**
 * Get Portal Children
 * @param spacesName portal name
 * @param projection valid values are summary,details
 * @returns a Http Promise that resolves to Portals List
 */
export declare function getChildren(spaceName: string, projection?: string, startIndex?: number, itemsPerPage?: number): Promise<Spaces.Spaces>;
/**
 * Delete Portal
 * @param spaceName portal name
 */
export declare function deleteSpace(spaceName: string): Promise<any>;
/**
 * Get Portal Attributes
 * @param spaceName portal name
 */
export declare function getAttributes(spaceName: string, startIndex?: number, itemsPerPage?: number): Promise<Spaces.Attributes>;
/**
 * Create a Portal Attribute
 *
 * @param spaceName portal name
 * @param attrName Portal attribute name
 * @param attrValue Portal attribute value
 * @param attrDesc Portal attribute description
 */
export declare function createAttribute(spaceName: string, attrName: string, attrValue: any, attrDesc?: string): Promise<Spaces.Attribute>;
/**
 * Get a specific Portal Attriute
 * @param spaceName portal name
 * @param attributeName Portal attribute name
 */
export declare function getAttribute(spaceName: string, attributeName: string): Promise<Spaces.Attribute>;
/**
 * Get Portal Members
 * @param spaceName portal name
 * @param startIndex Start Index
 * @param itemsPerPage Items Per Page
 * @returns a Http Promise that resolves to Members of Portal
 */
export declare function getMembers(spaceName: string, startIndex?: number, itemsPerPage?: number): Promise<Spaces.Members>;
/**
 * Add Member to Portal
 * @param spaceName portal name
 * @param member member information
 * @returns a Http Promise that resolves to Members of Portal
 */
export declare function addMember(spaceName: string, member: Spaces.Member): Promise<Spaces.Members>;
/**
 * Get Portal Roles
 * @param spaceName portal name
 */
export declare function getSpaceRoles(spaceName: string): Promise<Spaces.Roles>;
