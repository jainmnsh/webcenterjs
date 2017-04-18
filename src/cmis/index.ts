import axios, {AxiosResponse} from "axios";
import * as xmldom from "xmldom";
import * as xpath from "xpath";
import * as Core from "../core";
import CmisWorkspace from "./workspace";

const ALLOWABLE_ACTIONS_API: string = "/api/cmis/allowableActions/{repositoryId}?uid={uid}";
// tslint:disable-next-line:max-line-length
const GET_CHILDREN_API: string = "/api/cmis/children/{repositoryId}?uid={uid}&filter={filter}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&renditionFilter={renditionFilter}&orderBy={orderBy}&maxItems={maxItems}&skipCount={skipCount}&includePathSegment={includePathSegment}";
const CREATE_MOVE_ENTRY_API: string = "/api/cmis/children/{repositoryId}?uid={uid}&sourceFolderId={sourceFolderId}&versioningState={versioningState}";
// tslint:disable-next-line:max-line-length
const POST_BINARY_API: string = "/api/cmis/children/{repositoryId}?uid={uid}&fileName={fileName}&contentId={contentId}&comments={comments}&simpleResponse={simpleResponse}";
const UPLOAD_MULTIPART_FORM_API: string = "/api/cmis/children/{repositoryId}?uid={uid}";
const GET_CONTENT_STREAM_API: string = "/api/cmis/stream/{repositoryId}?uid={uid}&streamId={streamId}";
const PUT_CONTENT_STREAM_API: string = "/api/cmis/stream/{repositoryId}?uid={uid}&overwriteFlag={overwriteFlag}";
// tslint:disable-next-line:max-line-length
const DELETE_DESCENDANTS_API: string = "/api/cmis/descendants/{repositoryId}?uid={uid}&allVersions={allVersions}&continueOnFailure={continueOnFailure}&unfileObjects={unfileObjects}";
// tslint:disable-next-line:max-line-length
const GET_DOCUMENT_PROPS_API: string = "/api/cmis/document/{repositoryId}?uid={uid}&filter={filter}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&includePolicyIds={includePolicyIds}&includeACL={includeACL}&renditionFilter={renditionFilter}&returnVersion={returnVersion}";
const PUT_DOCUMENT_PROPS_API: string = "/api/cmis/document/{repositoryId}?uid={uid}";
const DELETE_DOCUMENT_API: string = "/api/cmis/document/{repositoryId}?uid={uid}";
const DELETE_DOCUMENT_POST_API: string = "/api/cmis/document/{repositoryId}?uid={uid}&_method=delete";
// tslint:disable-next-line:max-line-length
const GET_FOLDER_PROPS_API: string = "/api/cmis/folder/{repositoryId}?uid={uid}&filter={filter}&includeAllowableActions={includeAllowableActions}&renditionFilter={renditionFilter}";
const PUT_FOLDER_PROPS_API: string = "/api/cmis/folder/{repositoryId}?uid={uid}";
const DELETE_FOLDER_API: string = "/api/cmis/folder/{repositoryId}?uid={uid}";
const DELETE_FOLDER_POST_API: string = "/api/cmis/folder/{repositoryId}?uid={uid}&_method=delete";
// tslint:disable-next-line:max-line-length
const GET_OBJECT_BY_ID_API: string = "/api/cmis/objectbyid?id={id}&filter={filter}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&includePolicyIds={includePolicyIds}&includeACL={includeACL}&renditionFilter={renditionFilter}";
// tslint:disable-next-line:max-line-length
const GET_OBJECT_BY_PATH_API: string = "/api/cmis/objectbypath/{repositoryId}?path={path}&filter={filter}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&includePolicyIds={includePolicyIds}&includeACL={includeACL}&renditionFilter={renditionFilter}";
// tslint:disable-next-line:max-line-length
const GET_PARENTS_API: string = "/api/cmis/parents/{repositoryId}?uid={uid}&filter={filter}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&renditionFilter={renditionFilter}&includeRelativePathSegment={includeRelativePathSegment}";
const POST_QUERY_API: string = "/api/cmis/query/{repositoryId}?uid={uid}";
// tslint:disable-next-line:max-line-length
const GET_QUERY_API: string = "/api/cmis/query/{repositoryId}?q={q}&searchAllVersions={searchAllVersions}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&maxItems={maxItems}&skipCount={skipCount}";
const GET_REPOSITORY_INFO_API: string = "/api/cmis/repository/{repositoryId}";

export const CMIS_NAMESPACES: { [name: string]: string } = {
    app: "http://www.w3.org/2007/app",
    atom: "http://www.w3.org/2005/Atom",
    cmis: "http://docs.oasis-open.org/ns/cmis/core/200908/",
    cmisra: "http://docs.oasis-open.org/ns/cmis/restatom/200908/",
};

const select: any = xpath.useNamespaces(CMIS_NAMESPACES);

let workspaces: {};

export function getAllowableActions(
    repositoryId: string,
    nodeUid: string = "ora:syst:rootfolder"): Promise<WebCenter.Cmis.AllowableActionsType> {
    const params: {} = {
        repositoryId,
        uid: nodeUid,
    };
    return Core.doGet(ALLOWABLE_ACTIONS_API, params);
}

export async function getWorkspaces(): Promise<{}> {
    if (workspaces) {
        return workspaces;
    } else {
        return Core.getResourceUrl("urn:oracle:webcenter:cmis").then((cmisResourceUrl: string) => {
            workspaces = {};
            const headers: {} = {
                Accept: "application/xml, text/xml, */*",
            };
            return axios.get(cmisResourceUrl, {
                headers,
                withCredentials: true,
            }).then((response: AxiosResponse) => {
                const respText: string = response.data;
                const doc: Document = new xmldom.DOMParser().parseFromString(respText);
                const nodes: Element[] = select("./app:service/app:workspace", doc);
                for (const node of nodes) {
                    const titleNode: Text = select("./atom:title/text()", node, true);
                    workspaces[titleNode.data] = new CmisWorkspace(node);
                    /*let titleNode: Text = select('./atom:title/text()', node, true);
                    workspaces[titleNode.data] = node;

                    let node1: Node = select('./atom:link', node)[2];
                    let attrs: NamedNodeMap = node1.attributes;

                    console.log(attrs.getNamedItemNS(CMIS_NAMESPACES['cmisra'], 'id'));*/

                    // let nde: Node = select('./atom:title', node, true);
                    // console.log(select('./text()', nde, true).data);
                }
                return workspaces;
            });
        });
    }
}

export async function getWorkspace(repositoryId: string = "UCM"): Promise<Element> {
    const wrkSpace: Element = workspaces ? (repositoryId ? workspaces[repositoryId] : workspaces[0]) : null;
    if (wrkSpace) {
        return wrkSpace;
    } else {
        return getWorkspaces().then((wrkspaces: {}) => {
            return wrkspaces ? (repositoryId ? wrkspaces[repositoryId] : wrkspaces[0]) : null;
        });
    }
}
