export declare const CMIS_NAMESPACES: {
    [name: string]: string;
};
export declare const select: any;
export declare function processCmisProps(node: Node): {};
export declare function processLinks(node: Node): {};
export declare function getChildrenByName(node: Element, name: string): Node[];
export declare function getCmisResourceHttp(url: string, accept?: string): Promise<Document>;
export declare function getCmisResource(url: string, accept?: string, retry?: any): Promise<Document>;
export declare function processUriTemplates(node: Node): {};
export declare function processCollections(node: Node): {};
