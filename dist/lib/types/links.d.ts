export interface Link {
    target: TargetObject;
    source: SourceObject;
}
export interface LinkObject {
    serviceId: string;
    resourceId: string;
    resourceScope: string;
    resourceName: string;
    resourceUrl: string;
}
export interface SourceObject extends LinkObject {
}
export interface TargetObject extends LinkObject {
}
