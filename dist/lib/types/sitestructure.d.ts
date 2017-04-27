import * as Common from "./common";
export interface RESTSiteStructure extends Common.Linked {
    siteStructure: {
        [index: string]: any;
    };
    metadataPath: string;
    rootResource: RESTSiteStructureResource;
    curentSelection: RESTSiteStructureResource;
}
export interface RESTSiteStructureAttribute {
    name: string;
    value: string;
}
export interface RESTSiteStructureContext extends Common.Linked {
    metadataPath: string;
    currentResource: RESTSiteStructureResourceV2;
    siteStructureList: string[];
    defaultSiteStructurePath?: string;
}
export interface RESTSiteStructureParameter {
    name: string;
    value: string;
}
export interface RESTSiteStructureProperties extends Common.Linked {
    name: string;
    propertyValue: string;
    propertyName: string;
}
export interface RESTSiteStructureResource extends Common.Linked {
    id: string;
    title: string;
    path: string;
    prettyUrl: string;
    attrSize: number;
    attributeKey: any[];
    attributes: RESTSiteStructureAttribute[];
    paramSize: number;
    parameterKeySet: any[];
    parameters: RESTSiteStructureParameter[];
    childrenSize: number;
    children: RESTSiteStructureResource[];
}
export interface RESTSiteStructureResourceV2 extends Common.Linked {
    title: string;
    path: string;
    prettyUrl: string;
    childrenSize: number;
    paramSize: number;
    attrSize: number;
    attributes: RESTSiteStructureAttribute[];
    parameters: RESTSiteStructureParameter[];
    attributeKey: any[];
    parameterKey: any[];
    children: RESTSiteStructureResourceV2[];
    property: RESTSiteStructureProperties[];
    id: string;
}
