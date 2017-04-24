import * as Common from "./common";

export interface ResultRefinement<T> extends Common.Linked {
    name: string;
    value: string;
    type: string;
    count: number;
}

export interface ResultRefiner<T> extends Common.Linked {
    column: string;
    refinement: ResultRefinement<T>[];
}

export interface ResultRow extends Common.Linked {
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

export interface ResultRowGroup extends Common.PaginatedLinked, Common.LinkedItem<ResultRow> {
    groupAttributeValue: string;
    row: ResultRow[];
    groupAttribute: QName;
}

export interface SearchResultGroups extends Common.PaginatedLinked {
    rowGroup: ResultRowGroup[];
    refiner: ResultRefiner<any>[];
}

export interface SearchResults extends Common.PaginatedLinked {
    estimatedCount: number;
    result: ResultRow[];
    refiner: ResultRefiner<any>[];
}

export interface AbstractCommonObject extends AbstractWCObject, WCObject {
    icon: string;
    resourceType: string;
    description: string;
    language: string;
    size: string;
    type: string;
}

export interface AbstractLinkedObject {
    links: Links;
}

export interface AbstractWCObject extends AbstractLinkedObject, WCObject {
}

export interface CommonObject extends AbstractCommonObject {
    author: Person2;
    snippet: string;
    scope: string;
    scopeName: string;
    created: Date;
    modifier: string;
    modified: Date;
}

export interface CustomAttribute2 {
    name: string;
    value: string;
    dateValue: Date;
}

export interface CustomAttributes {
    attribute: CustomAttribute2[];
}

export interface Document extends AbstractCommonObject {
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

export interface Experts extends AbstractLinkedObject {
    totalResults: number;
    items: Items;
}

export interface Facets extends AbstractLinkedObject {
    totalResults: number;
    items: Items;
}

export interface FacetValue {
    name: string;
    count: number;
    links: Links;
}

export interface Items {
    "search-result": SearchResult[];
    "search-expert": SearchExpert[];
    "search-facet": SearchFacet[];
}

export interface Link2 {
    capabilities: string;
    href: string;
    rel: string;
    resourceType: string;
    template: string;
    type: string;
}

export interface Links {
    link: Link2[];
}

export interface Mashups extends AbstractLinkedObject {
    totalResults: number;
    items: any;
}

export interface ObjectFactory {
}

export interface Person2 extends AbstractCommonObject {
    displayName: string;
    guid: string;
    id: string;
}

export interface Results extends AbstractLinkedObject {
    itemsPerPage: number;
    startIndex: number;
    totalResults: number;
    items: Items;
}

export interface SearchCollection extends AbstractLinkedObject {
    results: Results;
    experts: Experts;
    mashups: Mashups;
    facets: Facets;
}

export interface SearchExpert extends AbstractLinkedObject {
    name: string;
}

export interface SearchFacet extends AbstractLinkedObject {
    name: string;
    displayName: string;
    resultCount: number;
    childFacet: SearchFacet[];
}

export interface SearchResult extends AbstractLinkedObject {
    name: string;
    person: Person2;
    document: Document;
    object: CommonObject;
}

export interface WCObject {
    id: string;
    resourceId: string;
    customAttributes: CustomAttributes;
    scopeName: string;
    scope: string;
    serviceId: string;
    url: string;
    author: Person2;
}

export interface CustomAttribute extends Common.Serializable {
    name: string;
    value: string;
    type: string;
    dateValue: CalendarValue;
    nameType: string;
    label: string;
}

export interface QName extends Common.Serializable {
    string: string;
    name: string;
    qualifier: string;
}


export interface CalendarValue extends Common.Serializable, Common.Cloneable, Common.Comparable<CalendarValue> {
}

export type DocumentAttribute = "DOCID" | "ICON" | "URL" | "SNIPPET" | "RESOURCETYPE" | "DESCRIPTION" | "AUTHOR" | "MIMETYPE" | "SCOPE" | "SCOPENAME" | "CREATED" | "MODIFIER" | "LASTMODIFIED" | "LANGUAGE" | "CONTENTLENGTH" | "TYPE" | "SCORE" | "wc_serviceId" | "wc_resourceId";

export type PersonAttribute = "ID" | "GUID" | "DISPLAYNAME" | "URL" | "ICON" | "RESOURCETYPE" | "wc_serviceId" | "wc_resourceId";