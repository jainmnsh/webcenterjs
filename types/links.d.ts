declare namespace WebCenter {
    export namespace Links {
        interface Link {
            target: TargetObject;
            source: SourceObject;
        }

        interface LinkObject {
            serviceId: string;
            resourceId: string;
            resourceScope: string;
            resourceName: string;
            resourceUrl: string;
        }

        interface SourceObject extends LinkObject {
        }

        interface TargetObject extends LinkObject {
        }

    }
}
