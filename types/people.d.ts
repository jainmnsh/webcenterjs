///<reference path="./common.d.ts" />

declare namespace WebCenter {
    export namespace People {
        interface InvitationItem extends Common.Linked {
            message: string;
            id: string;
            status: string;
            invitor: Common.PersonReference;
            invitee: Common.PersonReference;
            sentDate: Date;
        }

        interface InvitationList extends Common.PaginatedLinked {
            invitation: InvitationItem[];
        }

        interface ListMember extends Common.Linked {
            message: string;
            guid: string;
        }

        interface ListName extends Common.Linked {
            name: string;
        }

        interface ListNames extends Common.PaginatedLinked {
            items: ListName[];
        }

        interface Person extends Common.Linked {
            name: PersonName;
            language: string;
            status: StatusItem;
            guid: string;
            connected: string;
            birthday: string;
            invalid: boolean;
            timeZone: string;
            id: string;
            displayName: string;
            addresses: PersonAddress[];
            organizations: PersonOrganization;
            emails: PersonValue;
            phoneNumbers: PersonValue[];
            manager: Common.PersonReference;
            reportees: Common.PersonReference[];
            photos: PersonValue;
        }

        interface PersonAddress {
            formatted: string;
            streetAddress: string;
            locality: string;
            region: string;
            postalCode: string;
            country: string;
            type: string;
            empty: boolean;
            pobox: string;
        }

        interface PersonList extends Common.PaginatedLinked {
            person: Person[];
        }

        interface PersonName {
            formatted: string;
            familyName: string;
            givenName: string;
            honorificSuffix: string;
            initials: string;
            maidenName: string;
        }

        interface PersonOrganization {
            name: string;
            department: string;
            title: string;
            employeeNumber: string;
            employeeType: string;
            startDate: string;
            description: string;
            expertise: string;
            defaultGroup: string;
            empty: boolean;
        }

        interface PersonValue {
            empty: boolean;
            value: string;
            type: string;
            primary: string;
        }

        interface StatusItem extends Common.Linked {
            note: string;
        }

    }
}
