export interface OtherAttributes {
}

export interface AllowableActionsType {
    canDeleteObject: boolean;
    canUpdateProperties: boolean;
    canGetFolderTree: boolean;
    canGetProperties: boolean;
    canGetObjectRelationships: boolean;
    canGetObjectParents: boolean;
    canGetFolderParent: boolean;
    canGetDescendants: boolean;
    canMoveObject: boolean;
    canDeleteContentStream: boolean;
    canCheckOut: boolean;
    canCancelCheckOut: boolean;
    canCheckIn: boolean;
    canSetContentStream: boolean;
    canGetAllVersions: boolean;
    canAddObjectToFolder: boolean;
    canRemoveObjectFromFolder: boolean;
    canGetContentStream: boolean;
    canApplyPolicy: boolean;
    canGetAppliedPolicies: boolean;
    canRemovePolicy: boolean;
    canGetChildren: boolean;
    canCreateDocument: boolean;
    canCreateFolder: boolean;
    canCreateRelationship: boolean;
    canDeleteTree: boolean;
    canGetRenditions: boolean;
    canGetACL: boolean;
    canApplyACL: boolean;
    any: any[];
    otherAttributes: OtherAttributes;
}
