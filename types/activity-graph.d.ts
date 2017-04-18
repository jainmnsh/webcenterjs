///<reference path="./common.d.ts" />

declare namespace WebCenter {
     namespace ActivityGraph {
        interface ComponentScore extends Common.Linked {
            similarityURN: string;
            primary: boolean;
            score: number;
            numerator: number;
            denominator: number;
            weight: number;
            reason: string;
        }

        interface Recommendation extends Common.Linked {
            score: number;
            item: ResultItem;
            componentScore: ComponentScore[];
        }

        interface Recommendations extends Common.PaginatedLinked {
            recommendation: Recommendation[];
        }

        interface ResultItem extends Common.Linked {
            classURN: string;
            objectURN: string;
            serviceId: string;
            name: string;
            description: string;
            status: string;
            modified: string;
            creator: string;
            author: Common.PersonReference;
            modifier: string;
            modifiedByUser: Common.PersonReference;
        }

        interface ResultItemList extends Common.PaginatedLinked {
            item: ResultItem[];
        }
    }

}
