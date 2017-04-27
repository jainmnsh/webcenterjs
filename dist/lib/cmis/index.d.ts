import * as Cmis from "../types/cmis";
export declare const CMIS_NAMESPACES: {
    [name: string]: string;
};
export declare function getAllowableActions(repositoryId: string, nodeUid?: string): Promise<Cmis.AllowableActionsType>;
export declare function getWorkspaces(): Promise<{}>;
export declare function getWorkspace(repositoryId?: string): Promise<Element>;
