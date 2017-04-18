///<reference path="./common.d.ts" />

declare namespace WebCenter {
    export namespace SiteStructure {

        interface RESTSiteStructure extends Common.Linked {
            siteStructure: { [index: string]: any };
            metadataPath: string;
            rootResource: RESTSiteStructureResource;
            curentSelection: RESTSiteStructureResource;
        }

        interface RESTSiteStructureAttribute {
            name: string;
            value: string;
        }

        interface RESTSiteStructureContext extends Common.Linked {
            metadataPath: string;
            currentResource: RESTSiteStructureResourceV2;
            siteStructureList: string[];
            defaultSiteStructurePath?: string;
        }

        interface RESTSiteStructureParameter {
            name: string;
            value: string;
        }

        interface RESTSiteStructureProperties extends Common.Linked {
            name: string;
            propertyValue: string;
            propertyName: string;
        }

        interface RESTSiteStructureResource extends Common.Linked {
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

        interface RESTSiteStructureResourceV2 extends Common.Linked {
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

    }
}
