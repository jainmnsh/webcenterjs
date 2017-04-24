import * as Common from "./common";
export interface Attribute extends Common.Linked {
    name: string;
    description: string;
    type: string;
    value: string;
}

export interface Attributes extends Common.Linked, Common.LinkedItem<Attribute> {
    attributes: Attribute[];
    attribute: Attribute[];
}

export interface GeneralPreferences extends Common.Linked, Common.LinkedItem<Preference> {
    preference: Preference[];
}

export interface GroupSpaceAttributeMap {
    serviceId: string;
    serviceAttributes: { [index: string]: any };
}

export interface GroupSpaceAttributeMapImpl extends GroupSpaceAttributeMap {
}

export interface GroupSpaceAttributes extends ServiceData {
    name: string;
    public: boolean;
    members: GroupSpaceMember[];
    displayName: string;
    description: string;
    limitedView: boolean;
    createdBy: string;
    customAttributes: GroupSpaceCustomAttribute[];
    docFolderNodeID: string;
    docRepoName: string;
    groupSpaceOffline: boolean;
    guid: string;
    iconURL: string;
    keywords: string;
    lastUpdated: Calendar;
    logoURL: string;
    mailingList: string;
    parentName: string;
    parentDisplayName: string;
    templateName: string;
    serviceDataCopied: string;
    defaultLanguage: string;
    landingPage: string;
    discoverable: boolean;
    template: boolean;
    unsubscriptionApprovalRequired: boolean;
    publishRss: boolean;
    closed: boolean;
    blockAllAccess: boolean;
    inheritFromParent: boolean;
    provisionedServices: string[];
}

export interface GroupSpaceAttributesImpl extends GroupSpaceAttributes {
}

export interface GroupSpaceCommon {
}

export interface GroupSpaceCommonImpl extends GroupSpaceCommon {
}

export interface GroupSpaceCustomAttribute {
    name: string;
    value: string;
    type: string;
    description: string;
}

export interface GroupSpaceCustomAttributeImpl extends GroupSpaceCustomAttribute {
}

export interface GroupSpaceMember {
    displayName: string;
    roles: string[];
    guid: string;
    member: string;
}

export interface GroupSpaceMemberImpl extends GroupSpaceMember {
}

export interface GroupSpaceReference extends Common.Linked {
    name: string;
    displayName: string;
    guid: string;
}

export interface Member extends Common.Linked {
    name: string;
    role: string[];
    guid: string;
    status: string;
    displayName: string;
}

export interface Members extends Common.PaginatedLinked, Common.LinkedItem<Member> {
    member: Member[];
}

export interface PagedGroupSpaces {
    pagedGroupSpaces: GSMetadata[];
    pagedStartIndex: number;
    pagedTotal: number;
    groupSpaceTotal: number;
}

export interface PagedGroupSpacesImpl extends PagedGroupSpaces {
}

export interface PagedMembers {
    pagedStartIndex: number;
    pagedMembers: GroupSpaceMember[];
    pagedTotal: number;
    membersTotal: number;
}

export interface PagedMembersImpl extends PagedMembers {
}

export interface Preference extends Common.Linked {
    name: string;
    value: string;
}

export interface Role extends Common.Linked {
    name: string;
}

export interface Roles extends Common.Linked, Common.LinkedItem<Role> {
    role: Role[];
}

export interface SiteResource extends Common.Linked {
    guid: string;
    displayName: string;
    name: string;
    description: string;
    siteResourceType: string;
    scopeName: string;
    category: string;
    contentDirectory: string;
    metadataFile: string;
    jspx: string;
    pageDef: string;
    iconURI: string;
    excludeFrom: string;
    seeded: boolean;
    visible: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    resourceBundle: string;
    logoUrl: string;
    version: string;
}

export interface SiteResources extends Common.PaginatedLinked, Common.LinkedItem<SiteResource> {
    siteresource: SiteResource[];
}

export interface Space extends Common.Linked {
    creator: string;
    author: Common.PersonReference;
    description: string;
    displayName: string;
    templateName: string;
    guid: string;
    iconUrl: string;
    keywords: string;
    lastUpdate: Date;
    logoUrl: string;
    mailingList: string;
    name: string;
    parentDisplayName: string;
    serviceDataCopied: string;
    defaultLanguage: string;
    landingPage: string;
    isDiscoverable: boolean;
    isPublic: boolean;
    isOffline: boolean;
    isTemplate: boolean;
    isUnsubscriptionApprovalRequired: boolean;
    isPublishRss: boolean;
    isClosed: boolean;
    isBlockAllAccess: boolean;
    isInheritFromParent: boolean;
    members: Members;
    attributes: Attributes;
    docRepoName: string;
    docFolderNodeID: string;
}

export interface Spaces extends Common.PaginatedLinked, Common.LinkedItem<Space> {
    items: Space[];
}

export interface Template extends Common.Linked {
    creator: string;
    author: Common.PersonReference;
    description: string;
    displayName: string;
    templateName: string;
    guid: string;
    iconUrl: string;
    keywords: string;
    lastUpdate: Date;
    logoUrl: string;
    mailingList: string;
    name: string;
    serviceDataCopied: string;
    defaultLanguage: string;
    landingPage: string;
    isDiscoverable: string;
    isPublic: string;
    isOffline: boolean;
    isTemplate: boolean;
    isUnsubscriptionApprovalRequired: boolean;
    isPublishRss: boolean;
    isClosed: boolean;
    isBlockAllAccess: boolean;
    members: Members;
    attributes: Attributes;
    docRepoName: string;
    docFolderNodeID: string;
}

export interface Templates extends Common.PaginatedLinked, Common.LinkedItem<Template> {
    template: Template[];
}


export interface Calendar extends Common.Serializable, Common.Cloneable, Common.Comparable<Calendar> {
}

export interface ServiceData {
}


export interface GSMetadata extends Common.Serializable {
    name: string;
    public: boolean;
    displayName: string;
    description: string;
    groupSpaceURI: string;
    offline: boolean;
    iconURI: string;
    logoURI: string;
    provisionedServicesId: string[];
    seeded: boolean;
    createdDate: Calendar;
    securityParentGuid: string;
    lastUpdatedDate: Calendar;
    childGSCount: number;
    selfSubEnabled: boolean;
    memberCount: number;
    lastActivityTime: Calendar;
    selfRegPage: string;
    footerHidden: boolean;
    copyRightMessage: string;
    privacyURL: string;
    selfSubscriptionEnabledRoles: string[];
    parentGuid: string;
    createdBy: string;
    customAttributes: GSCustomAttribute[];
    guid: string;
    keywords: string;
    mailingList: string;
    discoverable: boolean;
    closed: boolean;
}


export interface GSCustomAttribute extends Common.Serializable {
    name: string;
    value: string;
    type: string;
    description: string;
}
