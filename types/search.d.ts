///<reference path="./common.d.ts" />

declare namespace WebCenter {
    export namespace Search {
        interface ResultRefinement<T> extends Common.Linked {
            name: string;
            value: string;
            type: string;
            count: number;
        }

        interface ResultRefiner<T> extends Common.Linked {
            column: string;
            refinement: ResultRefinement<T>[];
        }

        interface ResultRow extends Common.Linked {
            language: string;
            id: string;
            type: string;
            size: string;
            scopeName: string;
            scope: string;
            created: Date;
            modifier: string;
            modified: Date;
            title: string;
            serviceId: string;
            description: string;
            author: Common.PersonReference;
            customattribute: CustomAttribute[];
        }

        interface ResultRowGroup extends Common.PaginatedLinked, Common.LinkedItem<ResultRow> {
            groupAttributeValue: string;
            row: ResultRow[];
            groupAttribute: QName;
        }

        interface SearchResultGroups extends Common.PaginatedLinked {
            rowGroup: ResultRowGroup[];
            refiner: ResultRefiner<any>[];
        }

        interface SearchResults extends Common.PaginatedLinked {
            estimatedCount: number;
            result: ResultRow[];
            refiner: ResultRefiner<any>[];
        }

        interface AbstractCommonObject extends AbstractWCObject, WCObject {
            icon: string;
            resourceType: string;
            description: string;
            language: string;
            size: string;
            type: string;
        }

        interface AbstractLinkedObject {
            links: Links;
        }

        interface AbstractWCObject extends AbstractLinkedObject, WCObject {
        }

        interface CommonObject extends AbstractCommonObject {
            author: Person2;
            snippet: string;
            scope: string;
            scopeName: string;
            created: Date;
            modifier: string;
            modified: Date;
        }

        interface CustomAttribute2 {
            name: string;
            value: string;
            dateValue: Date;
        }

        interface CustomAttributes {
            attribute: CustomAttribute2[];
        }

        interface Document extends AbstractCommonObject {
            docid: string;
            mimeType: string;
            author: Person2;
            snippet: string;
            scope: string;
            scopeName: string;
            created: Date;
            modifier: string;
            modified: Date;
        }

        interface Experts extends AbstractLinkedObject {
            totalResults: number;
            items: Items;
        }

        interface Facets extends AbstractLinkedObject {
            totalResults: number;
            items: Items;
        }

        interface FacetValue {
            name: string;
            count: number;
            links: Links;
        }

        interface Items {
            "search-result": SearchResult[];
            "search-expert": SearchExpert[];
            "search-facet": SearchFacet[];
        }

        interface Link2 {
            capabilities: string;
            href: string;
            rel: string;
            resourceType: string;
            template: string;
            type: string;
        }

        interface Links {
            link: Link2[];
        }

        interface Mashups extends AbstractLinkedObject {
            totalResults: number;
            items: any;
        }

        interface ObjectFactory {
        }

        interface Person2 extends AbstractCommonObject {
            displayName: string;
            guid: string;
            id: string;
        }

        interface Results extends AbstractLinkedObject {
            itemsPerPage: number;
            startIndex: number;
            totalResults: number;
            items: Items;
        }

        interface SearchCollection extends AbstractLinkedObject {
            results: Results;
            experts: Experts;
            mashups: Mashups;
            facets: Facets;
        }

        interface SearchExpert extends AbstractLinkedObject {
            name: string;
        }

        interface SearchFacet extends AbstractLinkedObject {
            name: string;
            displayName: string;
            resultCount: number;
            childFacet: SearchFacet[];
        }

        interface SearchResult extends AbstractLinkedObject {
            name: string;
            person: Person2;
            document: Document;
            object: CommonObject;
        }

        interface WCObject {
            id: string;
            resourceId: string;
            customAttributes: CustomAttributes;
            scopeName: string;
            scope: string;
            serviceId: string;
            url: string;
            author: Person2;
        }

        interface CustomAttribute extends Common.Serializable {
            name: string;
            value: string;
            type: string;
            dateValue: Calendar;
            nameType: string;
            label: string;
        }

        interface QName extends Common.Serializable {
            string: string;
            name: string;
            qualifier: string;
        }


        interface Calendar extends Common.Serializable, Common.Cloneable, Common.Comparable<Calendar> {
        }

        type DocumentAttribute = "DOCID" | "ICON" | "URL" | "SNIPPET" | "RESOURCETYPE" | "DESCRIPTION" | "AUTHOR" | "MIMETYPE" | "SCOPE" | "SCOPENAME" | "CREATED" | "MODIFIER" | "LASTMODIFIED" | "LANGUAGE" | "CONTENTLENGTH" | "TYPE" | "SCORE" | "wc_serviceId" | "wc_resourceId";

        type PersonAttribute = "ID" | "GUID" | "DISPLAYNAME" | "URL" | "ICON" | "RESOURCETYPE" | "wc_serviceId" | "wc_resourceId";
    }
}
