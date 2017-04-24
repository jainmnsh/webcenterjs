import * as Common from "./common";
export interface DataColumn {
    id: string;
    name: string;
    value: string;
}

export interface Lists extends Common.PaginatedLinked, Common.LinkedItem<SpacesList> {
    list: SpacesList[];
}

export interface MetaColumn extends Common.Linked {
    id?: string;
    name: string;
    dataType: string;
    required: boolean;
    defaultValue: string;
    maxLength: number;
    rangeLow: number;
    rangeHigh: number;
    displayLength: number;
    format: string;
    allowLinks: boolean;
    linkTarget: string;
    editLines: number;
    peopleScope: string;
    displayWidth: number;
    hint: string;
}

export interface MetaColumns extends Common.Linked, Common.LinkedItem<MetaColumn> {
    // metaColumn: MetaColumn[];
}

export interface Row extends Common.Linked {
    id: string;
    listId: string;
    scope: string;
    creator: string;
    author: Common.PersonReference;
    created: Date;
    modifier: string;
    modifiedByUser: Common.PersonReference;
    modified: Date;
    column: DataColumn[];
}

export interface Rows extends Common.PaginatedLinked, Common.LinkedItem<Row> {
    row: Row[];
}

export interface Scope {
    name: string;
    guid: string;
}

export interface SpacesList extends Common.Linked {
    id?: string;
    name: string;
    description?: string;
    scope?: Scope;
    creator?: string;
    author?: Common.PersonReference;
    created?: Date;
    modifier?: string;
    modifiedByUser?: Common.PersonReference;
    modified?: Date;
    columns: MetaColumns;
}