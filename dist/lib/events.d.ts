import * as Events from "./types/events";
export declare function getPortalEvents(portalGuid: string, startDate: string, endDate: string): Promise<Events.GSEventList>;
export declare function createPortalEvent(portalGuid: string, eventSummary: string, startTime: string, endTime: string, priority?: number, location?: string, category?: string, details?: string): Promise<Events.GSEventItem>;
export declare function getPortalEvent(portalGuid: string, eventId: string): Promise<Events.GSEventItem>;
export declare function updatePortalEvent(portalGuid: string, event: Events.GSEventItem): Promise<Events.GSEventItem>;
export declare function deletePortalEvent(portalGuid: string, eventId: string): Promise<void>;
export declare function getPortalEventCategories(portalGuid: string): Promise<Events.GSCategoryItem>;
export declare function createPortalEventCategory(portalGuid: string, categoryName: string): Promise<Events.GSCategoryItem>;
