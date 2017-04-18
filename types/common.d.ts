declare namespace WebCenter {
    export namespace Common {

        interface Cloneable {
        }

        interface Comparable<T> {
        }


        interface ProjectionParam {
            details: boolean;
            summary: boolean;
            unspecified: boolean;
        }

        interface PersonReference extends Linked {
            id: string;
            displayName: string;
            guid: string;
        }

        interface GroupSpaceReference extends Linked {
            name: string;
            displayName: string;
            guid: string;
        }


        interface Catalog extends Linked {
            entries: string;
        }

        interface FaultInfo {
            message: string;
            code: string;
            subCode: string;
            field: string;
            stackTrace: string;
            hint: string;
        }

        interface Form extends Linked {
            username: string;
            password: string;
        }

        interface GrantAllPermission extends IPermission {
        }

        interface JSecurityForm extends Form {
        }

        interface LinkElement {
            contentType: string;
            href: string;
            rel: string;
            title: string;
            type: string;
            resourceType: string;
            capabilities: string;
            template: string;
        }

        interface LinkElementState {
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

        interface LinkElementStateFactory {
            classToModelLinksMap: { [index: string]: ModelLinks };
            allLinkElementStates: LinkElementState[];
        }

        interface Linked extends LinkedInterface {
        }

        interface LinkedInterface {
            resourceType?: string;
            links?: LinkElement[];
        }

        interface LinkedItem<T> {
            items: T[];
        }

        interface LinkedItems<T> extends Linked, LinkedItem<T> {
        }

        interface ModelLinks {
            referencedModelClass: Class<any>;
            pathUrnToLesMap: { [index: string]: LinkElementState };
        }

        interface NullModelObject extends Linked {
        }

        interface PaginatedLinked extends Linked {
            startIndex: number;
            itemsPerPage: number;
            totalResults: number;
        }

        interface Queries extends Linked, LinkedItem<Query> {
            query: Query[];
        }

        interface Query extends Linked {
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

        interface ResourceIndex extends Linked {
            version: string;
        }

        interface SubTest extends Test {
            parentId: string;
        }

        interface SubTests extends PaginatedLinked, LinkedItem<SubTest> {
            subtest: SubTest[];
        }

        interface Test extends Linked {
            id: string;
            name: string;
            rating: number;
            lastModified: Date;
            subTests: SubTests;
        }

        interface Tests extends LinkedItems<Test> {
            test: Test[];
        }

        interface Who extends Linked {
            name: string;
        }

        interface AbstractElement extends IVisitable {
            name: string;
            isRequired: boolean;
            isReadOnly: boolean;
            defaultValue: string;
        }

        interface AbstractMultiElement extends AbstractElement {
            value: Value;
        }

        interface Collection extends AbstractMultiElement {
        }

        interface Element extends AbstractElement {
            type: SimpleType;
            isId: boolean;
            resourceTypeUrn: ResourceTypeUrn;
        }

        interface Map extends AbstractMultiElement {
            key: SimpleType;
        }

        interface WCMethod {
            name: string;
            request: Request;
        }

        interface Param {
            style: string;
            name: string;
            isRequired: boolean;
        }

        interface Related {
            rel: string;
            resourceType: string;
        }

        interface Representation extends Linked {
            type: string;
            example: Linked;
        }

        interface Request {
            param: Param[];
            representation: Representation;
        }

        interface ResourceType extends Linked, IVisitable {
            isCollection: boolean;
            method: WCMethod[];
            related: Related[];
            elements: AbstractElement[];
            isRoot: boolean;
            instanceResourceType: string;
            path: string;
        }

        interface ResourceTypeUrn extends IVisitable {
            value: string;
            asLink: boolean;
        }

        interface ResourceTypes extends LinkedItems<ResourceType> {
        }

        interface Response extends Request {
            status: number;
        }

        interface Value extends IVisitable {
            type: SimpleType;
            resourceTypeUrn: ResourceTypeUrn;
        }

        interface IPermission {
        }

        interface Class<T> extends Serializable, GenericDeclaration, Type, AnnotatedElement {
        }

        interface Method extends AccessibleObject, GenericDeclaration, Member {
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

        interface Annotation {
        }

        interface QueryParam extends Annotation {
        }

        interface SortedQuery {
            prefixAssignment: PrefixAssignment;
            scopedClause: ScopedClause;
            sortedSpecList: SingleSpec[];
        }

        interface IVisitable {
        }

        interface Serializable {
        }

        interface GenericDeclaration {
            typeParameters: any;
        }

        interface Type {
        }

        interface AnnotatedElement {
            annotations: Annotation[];
            declaredAnnotations: Annotation[];
        }

        interface AccessibleObject extends AnnotatedElement {
            accessible: boolean;
        }

        interface Member {
            modifiers: number;
            name: string;
            synthetic: boolean;
            declaringClass: Class<any>;
        }

        interface PrefixAssignment {
            prefix: string;
            uri: string;
        }

        interface ScopedClause {
            searchClause: SearchClause;
            scopedClauseTail: ScopedClauseTail;
        }

        interface SingleSpec {
            index: string;
            modifierList: Modifier[];
        }

        interface SearchClause {
            cqlQuery: CqlQuery;
            index: string;
            relation: Relation;
            searchTerm: string;
        }

        interface ScopedClauseTail {
            booleanGroup: BooleanGroup;
            searchClause: SearchClause;
            scopedClauseTail: ScopedClauseTail;
        }

        interface Modifier {
            name: string;
            comparitor: string;
            value: string;
        }

        interface CqlQuery {
            scopedClause: ScopedClause;
            prefixAssignments: PrefixAssignment[];
        }

        interface Relation {
            comparitor: string;
            modifierList: Modifier[];
        }

        interface BooleanGroup {
            bool: string;
            modifierList: Modifier[];
        }

        type PERMISSION = "create" | "read" | "update" | "delete";

        type SimpleType = "STRING" | "BOOLEAN" | "NUMBER" | "DATE";
    }

}
