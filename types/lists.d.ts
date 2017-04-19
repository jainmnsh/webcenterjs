///<reference path="./common.d.ts" />

declare namespace WebCenter {
    export namespace Lists {
        interface DataColumn {
            id: string;
            name: string;
            value: string;
        }

        interface Lists extends Common.PaginatedLinked, Common.LinkedItem<SpacesList> {
            list: SpacesList[];
        }

        interface MetaColumn extends Common.Linked {
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

        interface MetaColumns extends Common.Linked, Common.LinkedItem<MetaColumn> {
            // metaColumn: MetaColumn[];
        }

        interface Row extends Common.Linked {
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

        interface Rows extends Common.PaginatedLinked, Common.LinkedItem<Row> {
            row: Row[];
        }

        interface Scope {
            name: string;
            guid: string;
        }

        interface SpacesList extends Common.Linked {
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

    }
}
