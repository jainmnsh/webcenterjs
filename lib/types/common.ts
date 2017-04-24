export interface Cloneable {
}

export interface Comparable<T> {
}


export interface ProjectionParam {
    details: boolean;
    summary: boolean;
    unspecified: boolean;
}

export interface PersonReference extends Linked {
    id: string;
    displayName: string;
    guid: string;
}

export interface Catalog extends Linked {
    entries: string;
}

export interface FaultInfo {
    message: string;
    code: string;
    subCode: string;
    field: string;
    stackTrace: string;
    hint: string;
}

export interface Form extends Linked {
    username: string;
    password: string;
}

export interface GrantAllPermission extends IPermission {
}

export interface JSecurityForm extends Form {
}

export interface LinkElement {
    contentType: string;
    href: string;
    rel: string;
    title: string;
    type: string;
    resourceType: string;
    capabilities: string;
    template: string;
}

export interface LinkElementState {
    resourceType: string;
    resourceClass: Class<any>;
    resourceMethod: Method;
    supportedMethods: Annotation[];
    supportedQueryParams: QueryParam[];
    pathLinkValues: string[];
    pathLinkWildcards: string[];
    path: string;
    template: boolean;
    href: boolean;
    root: boolean;
}

export interface LinkElementStateFactory {
    classToModelLinksMap: { [index: string]: ModelLinks };
    allLinkElementStates: LinkElementState[];
}

export interface Linked extends LinkedInterface {
}

export interface LinkedInterface {
    resourceType?: string;
    links?: LinkElement[];
}

export interface LinkedItem<T> {
    items: T[];
}

export interface LinkedItems<T> extends Linked, LinkedItem<T> {
}

export interface ModelLinks {
    referencedModelClass: Class<any>;
    pathUrnToLesMap: { [index: string]: LinkElementState };
}

export interface NullModelObject extends Linked {
}

export interface PaginatedLinked extends Linked {
    startIndex: number;
    itemsPerPage: number;
    totalResults: number;
}

export interface Queries extends Linked, LinkedItem<Query> {
    query: Query[];
}

export interface Query extends Linked {
    role: string;
    title: string;
    searchTerms: string;
    cqlSearchTerms: SortedQuery;
    totalResults: number;
    count: number;
    startIndex: number;
    startPage: number;
    language: string;
    inputEncoding: string;
    outputEncoding: string;
}

export interface ResourceIndex extends Linked {
    version: string;
}

export interface SubTest extends Test {
    parentId: string;
}

export interface SubTests extends PaginatedLinked, LinkedItem<SubTest> {
    subtest: SubTest[];
}

export interface Test extends Linked {
    id: string;
    name: string;
    rating: number;
    lastModified: Date;
    subTests: SubTests;
}

export interface Tests extends LinkedItems<Test> {
    test: Test[];
}

export interface Who extends Linked {
    name: string;
}

export interface AbstractElement extends IVisitable {
    name: string;
    isRequired: boolean;
    isReadOnly: boolean;
    defaultValue: string;
}

export interface AbstractMultiElement extends AbstractElement {
    value: Value;
}

export interface Collection extends AbstractMultiElement {
}

export interface Element extends AbstractElement {
    type: SimpleType;
    isId: boolean;
    resourceTypeUrn: ResourceTypeUrn;
}

export interface Map extends AbstractMultiElement {
    key: SimpleType;
}

export interface WCMethod {
    name: string;
    request: Request;
}

export interface Param {
    style: string;
    name: string;
    isRequired: boolean;
}

export interface Related {
    rel: string;
    resourceType: string;
}

export interface Representation extends Linked {
    type: string;
    example: Linked;
}

export interface Request {
    param: Param[];
    representation: Representation;
}

export interface ResourceType extends Linked, IVisitable {
    isCollection: boolean;
    method: WCMethod[];
    related: Related[];
    elements: AbstractElement[];
    isRoot: boolean;
    instanceResourceType: string;
    path: string;
}

export interface ResourceTypeUrn extends IVisitable {
    value: string;
    asLink: boolean;
}

export interface ResourceTypes extends LinkedItems<ResourceType> {
}

export interface Response extends Request {
    status: number;
}

export interface Value extends IVisitable {
    type: SimpleType;
    resourceTypeUrn: ResourceTypeUrn;
}

export interface IPermission {
}

export interface Class<T> extends Serializable, GenericDeclaration, Type, AnnotatedElement {
}

export interface Method extends AccessibleObject, GenericDeclaration, MethodMember {
    returnType: Class<any>;
    parameterTypes: any;
    exceptionTypes: any;
    parameterAnnotations: Annotation[][];
    genericReturnType: Type;
    genericParameterTypes: Type[];
    genericExceptionTypes: Type[];
    bridge: boolean;
    varArgs: boolean;
    defaultValue: any;
}

export interface Annotation {
}

export interface QueryParam extends Annotation {
}

export interface SortedQuery {
    prefixAssignment: PrefixAssignment;
    scopedClause: ScopedClause;
    sortedSpecList: SingleSpec[];
}

export interface IVisitable {
}

export interface Serializable {
}

export interface GenericDeclaration {
    typeParameters: any;
}

export interface Type {
}

export interface AnnotatedElement {
    annotations: Annotation[];
    declaredAnnotations: Annotation[];
}

export interface AccessibleObject extends AnnotatedElement {
    accessible: boolean;
}

export interface MethodMember {
    modifiers: number;
    name: string;
    synthetic: boolean;
    declaringClass: Class<any>;
}

export interface PrefixAssignment {
    prefix: string;
    uri: string;
}

export interface ScopedClause {
    searchClause: SearchClause;
    scopedClauseTail: ScopedClauseTail;
}

export interface SingleSpec {
    index: string;
    modifierList: Modifier[];
}

export interface SearchClause {
    cqlQuery: CqlQuery;
    index: string;
    relation: Relation;
    searchTerm: string;
}

export interface ScopedClauseTail {
    booleanGroup: BooleanGroup;
    searchClause: SearchClause;
    scopedClauseTail: ScopedClauseTail;
}

export interface Modifier {
    name: string;
    comparitor: string;
    value: string;
}

export interface CqlQuery {
    scopedClause: ScopedClause;
    prefixAssignments: PrefixAssignment[];
}

export interface Relation {
    comparitor: string;
    modifierList: Modifier[];
}

export interface BooleanGroup {
    bool: string;
    modifierList: Modifier[];
}

export type PERMISSION = "create" | "read" | "update" | "delete";

export type SimpleType = "STRING" | "BOOLEAN" | "NUMBER" | "DATE";