"use strict";
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var axios_1 = require("axios");
var xmldom = require("xmldom");
var xpath = require("xpath");
var Core = require("../core");
var workspace_1 = require("./workspace");
var ALLOWABLE_ACTIONS_API = "/api/cmis/allowableActions/{repositoryId}?uid={uid}";
// tslint:disable-next-line:max-line-length
var GET_CHILDREN_API = "/api/cmis/children/{repositoryId}?uid={uid}&filter={filter}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&renditionFilter={renditionFilter}&orderBy={orderBy}&maxItems={maxItems}&skipCount={skipCount}&includePathSegment={includePathSegment}";
var CREATE_MOVE_ENTRY_API = "/api/cmis/children/{repositoryId}?uid={uid}&sourceFolderId={sourceFolderId}&versioningState={versioningState}";
// tslint:disable-next-line:max-line-length
var POST_BINARY_API = "/api/cmis/children/{repositoryId}?uid={uid}&fileName={fileName}&contentId={contentId}&comments={comments}&simpleResponse={simpleResponse}";
var UPLOAD_MULTIPART_FORM_API = "/api/cmis/children/{repositoryId}?uid={uid}";
var GET_CONTENT_STREAM_API = "/api/cmis/stream/{repositoryId}?uid={uid}&streamId={streamId}";
var PUT_CONTENT_STREAM_API = "/api/cmis/stream/{repositoryId}?uid={uid}&overwriteFlag={overwriteFlag}";
// tslint:disable-next-line:max-line-length
var DELETE_DESCENDANTS_API = "/api/cmis/descendants/{repositoryId}?uid={uid}&allVersions={allVersions}&continueOnFailure={continueOnFailure}&unfileObjects={unfileObjects}";
// tslint:disable-next-line:max-line-length
var GET_DOCUMENT_PROPS_API = "/api/cmis/document/{repositoryId}?uid={uid}&filter={filter}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&includePolicyIds={includePolicyIds}&includeACL={includeACL}&renditionFilter={renditionFilter}&returnVersion={returnVersion}";
var PUT_DOCUMENT_PROPS_API = "/api/cmis/document/{repositoryId}?uid={uid}";
var DELETE_DOCUMENT_API = "/api/cmis/document/{repositoryId}?uid={uid}";
var DELETE_DOCUMENT_POST_API = "/api/cmis/document/{repositoryId}?uid={uid}&_method=delete";
// tslint:disable-next-line:max-line-length
var GET_FOLDER_PROPS_API = "/api/cmis/folder/{repositoryId}?uid={uid}&filter={filter}&includeAllowableActions={includeAllowableActions}&renditionFilter={renditionFilter}";
var PUT_FOLDER_PROPS_API = "/api/cmis/folder/{repositoryId}?uid={uid}";
var DELETE_FOLDER_API = "/api/cmis/folder/{repositoryId}?uid={uid}";
var DELETE_FOLDER_POST_API = "/api/cmis/folder/{repositoryId}?uid={uid}&_method=delete";
// tslint:disable-next-line:max-line-length
var GET_OBJECT_BY_ID_API = "/api/cmis/objectbyid?id={id}&filter={filter}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&includePolicyIds={includePolicyIds}&includeACL={includeACL}&renditionFilter={renditionFilter}";
// tslint:disable-next-line:max-line-length
var GET_OBJECT_BY_PATH_API = "/api/cmis/objectbypath/{repositoryId}?path={path}&filter={filter}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&includePolicyIds={includePolicyIds}&includeACL={includeACL}&renditionFilter={renditionFilter}";
// tslint:disable-next-line:max-line-length
var GET_PARENTS_API = "/api/cmis/parents/{repositoryId}?uid={uid}&filter={filter}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&renditionFilter={renditionFilter}&includeRelativePathSegment={includeRelativePathSegment}";
var POST_QUERY_API = "/api/cmis/query/{repositoryId}?uid={uid}";
// tslint:disable-next-line:max-line-length
var GET_QUERY_API = "/api/cmis/query/{repositoryId}?q={q}&searchAllVersions={searchAllVersions}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&maxItems={maxItems}&skipCount={skipCount}";
var GET_REPOSITORY_INFO_API = "/api/cmis/repository/{repositoryId}";
exports.CMIS_NAMESPACES = {
    app: "http://www.w3.org/2007/app",
    atom: "http://www.w3.org/2005/Atom",
    cmis: "http://docs.oasis-open.org/ns/cmis/core/200908/",
    cmisra: "http://docs.oasis-open.org/ns/cmis/restatom/200908/",
};
var select = xpath.useNamespaces(exports.CMIS_NAMESPACES);
var workspaces;
function getAllowableActions(repositoryId, nodeUid) {
    if (nodeUid === void 0) { nodeUid = "ora:syst:rootfolder"; }
    var params = {
        repositoryId: repositoryId,
        uid: nodeUid,
    };
    return Core.doGet(ALLOWABLE_ACTIONS_API, params);
}
exports.getAllowableActions = getAllowableActions;
function getWorkspaces() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            if (workspaces) {
                return [2 /*return*/, workspaces];
            }
            else {
                return [2 /*return*/, Core.getResourceUrl("urn:oracle:webcenter:cmis").then(function (cmisResourceUrl) {
                        workspaces = {};
                        var headers = {
                            Accept: "application/xml, text/xml, */*",
                        };
                        return axios_1.default.get(cmisResourceUrl, {
                            headers: headers,
                            withCredentials: true,
                        }).then(function (response) {
                            var respText = response.data;
                            var doc = new xmldom.DOMParser().parseFromString(respText);
                            var nodes = select("./app:service/app:workspace", doc);
                            for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                                var node = nodes_1[_i];
                                var titleNode = select("./atom:title/text()", node, true);
                                workspaces[titleNode.data] = new workspace_1.default(node);
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
                    })];
            }
            return [2 /*return*/];
        });
    });
}
exports.getWorkspaces = getWorkspaces;
function getWorkspace(repositoryId) {
    if (repositoryId === void 0) { repositoryId = "UCM"; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var wrkSpace;
        return tslib_1.__generator(this, function (_a) {
            wrkSpace = workspaces ? (repositoryId ? workspaces[repositoryId] : workspaces[0]) : null;
            if (wrkSpace) {
                return [2 /*return*/, wrkSpace];
            }
            else {
                return [2 /*return*/, getWorkspaces().then(function (wrkspaces) {
                        return wrkspaces ? (repositoryId ? wrkspaces[repositoryId] : wrkspaces[0]) : null;
                    })];
            }
            return [2 /*return*/];
        });
    });
}
exports.getWorkspace = getWorkspace;
//# sourceMappingURL=index.js.map