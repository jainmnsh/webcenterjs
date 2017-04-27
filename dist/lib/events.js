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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Core = require("./core");
var EVENTS_API = "/api/spaces/{guid}/events?startDate={startDate}&endDate={endDate}";
var EVENT_API = "/api/spaces/{guid}/events/{id}";
var EVENT_CATEGORIES_API = "/api/spaces/{guid}/eventCategories";
var DEFAULT_SCOPE_ID = "s8bba98ff_4cbb_40b8_beee_296c916a23ed";
/*
 * Valid date formats are
 * yyyy-MM-dd
 * yyyy-MM-ddZ
 * yyyy-MM-dd'T'HH:mm:ss
 * yyyy-MM-dd'T'HH:mm:ssZ
 */
/*
 * Events are not applicable for defaultScope yet.
 */
function getPortalEvents(portalGuid, startDate, endDate) {
    var params = {
        guid: portalGuid,
        startDate: startDate,
        endDate: endDate,
    };
    return Core.doGet(EVENTS_API, params);
}
exports.getPortalEvents = getPortalEvents;
function createPortalEvent(portalGuid, eventSummary, startTime, endTime, priority, location, category, details) {
    if (priority === void 0) { priority = 3; }
    var eventItem = {
        author: null,
        category: category,
        created: null,
        details: details,
        duration: null,
        endTime: endTime,
        groupSpace: null,
        id: null,
        isAllDayEvent: false,
        links: null,
        location: location,
        modified: null,
        modifiedByUser: null,
        priority: priority,
        resourceType: null,
        startTime: startTime,
        summary: eventSummary,
    };
    var params = {
        guid: portalGuid,
    };
    return Core.doPost(EVENTS_API, eventItem, params);
}
exports.createPortalEvent = createPortalEvent;
function getPortalEvent(portalGuid, eventId) {
    var params = {
        guid: portalGuid,
        id: eventId,
    };
    return Core.doGet(EVENT_API, params);
}
exports.getPortalEvent = getPortalEvent;
function updatePortalEvent(portalGuid, event) {
    var params = {
        guid: portalGuid,
        id: event.id,
    };
    return Core.doPut(EVENT_API, event, params);
}
exports.updatePortalEvent = updatePortalEvent;
function deletePortalEvent(portalGuid, eventId) {
    var params = {
        guid: portalGuid,
        id: eventId,
    };
    return Core.doDelete(EVENT_API, params);
}
exports.deletePortalEvent = deletePortalEvent;
function getPortalEventCategories(portalGuid) {
    var params = {
        guid: portalGuid,
    };
    return Core.doGet(EVENT_CATEGORIES_API, params);
}
exports.getPortalEventCategories = getPortalEventCategories;
function createPortalEventCategory(portalGuid, categoryName) {
    var category = {
        links: null,
        name: categoryName,
        resourceType: null,
    };
    var params = {
        guid: portalGuid,
    };
    return Core.doPost(EVENT_CATEGORIES_API, category, params);
}
exports.createPortalEventCategory = createPortalEventCategory;
//# sourceMappingURL=events.js.map