import { Chance } from "chance";
import WebCenter from "../lib";

import {init, logout } from "./common";

import {
  Attribute,
  Attributes,
  Member,
  Members,
  Roles,
  Space,
  Spaces,
  SpacesList,
  Template,
  Templates,
  WallMessageItem,
  WallMessageList,
} from "../lib";

const chance: any = new Chance();

let listName: string;
let status: string;
let portalName: string;
let attrName: string;
let message: string;
let messageId: string;
let spaceGuid: string;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

beforeAll(init);
afterAll(logout);

describe("Portal", () => {

    it("Get Portal Templates", (done: any) => {
        WebCenter.Spaces.getTemplates().then((portalTemplates: Templates) => {
            expect(portalTemplates.resourceType).toBe("urn:oracle:webcenter:spaces:resource:templates");
            done();
        }, (error: any) => {
            fail("Failed to Get Portal Templates.");
            done();
        });
    }, 20000);

    it("Get Portal Template By Name", (done: any) => {
        WebCenter.Spaces.getTemplate("Portal").then((portalTemplate: Template) => {
            expect(portalTemplate.resourceType).toBe("urn:oracle:webcenter:spaces:resource:template");
            expect(portalTemplate.creator).toBe("system");
            expect(portalTemplate.name).toBe("Portal");
            done();
        }, (error: any) => {
            fail("Failed to Get Portal Template By Name.");
            done();
        });
    }, 10000);

    it("Get Portal Template Roles", (done: any) => {
        WebCenter.Spaces.getTemplateRoles("Portal").then((roles: Roles) => {
            expect(roles.resourceType).toBe("urn:oracle:webcenter:space:roles");
            done();
        }, (error: any) => {
            fail("Failed to Get Portal Template Roles.");
            done();
        });
    }, 10000);

    it("Get Portal Template Attributes", (done: any) => {
        WebCenter.Spaces.getTemplateAttributes("Portal").then((attrs: Attributes) => {
            expect(attrs.resourceType).toBe("urn:oracle:webcenter:space:attributes");
            done();
        }, (error: any) => {
            fail("Failed to Get Portal Attributes.");
            done();
        });
    }, 10000);

    it("Create Portal", (done: any) => {
        portalName = chance.word();
        let portalDesc: string = chance.sentence();
        WebCenter.Spaces.createSpace(portalName, "Portal", portalDesc).then((space: Space) => {
            spaceGuid = space.guid;
            expect(space.displayName).toBe(portalName);
            expect(space.description).toBe(portalDesc);
            expect(space.templateName).toBe("Portal");
            done();
        }, (error: any) => {
            fail("Failed to Create Portal.");
            done();
        });
    }, 40000);

    it("Get Portal By Name", (done: any) => {
        WebCenter.Spaces.getSpace(portalName).then((space: Space) => {
            expect(space.displayName).toBe(portalName);
            done();
        }, (error: any) => {
            fail("Failed to Get Portal By Name.");
            done();
        });
    }, 10000);

    it("Get Portal Members", (done: any) => {
        WebCenter.Spaces.getMembers(portalName).then((members: Members) => {
            expect(members.items.length).toBe(1);
            done();
        }, (error: any) => {
            fail("Failed to Get Portal Members.");
            done();
        });
    }, 10000);

    it("Create Portal Attribute", (done: any) => {
        attrName = chance.word();
        const attrDesc: string = chance.sentence();
        const attrVal: string = chance.word();
        WebCenter.Spaces.createAttribute(portalName, attrName, attrVal, attrDesc).then(
            (attr: Attribute) => {
            expect(attr.resourceType).toBe("urn:oracle:webcenter:space:attribute");
            expect(attr.name).toBe(attrName);
            expect(attr.value).toBe(attrVal);
            done();
        }, (error: any) => {
            fail("Failed to Create Portal Attribute.");
            done();
        });
    }, 10000);

    it("Post to Portal Message Board", (done: any) => {
        message = chance.sentence();
        WebCenter.Wall.postToPortal(message, spaceGuid).then((messageItem: WallMessageItem) => {
        messageId = messageItem.id;
        expect(messageId).toBeDefined();
        expect(messageItem.body).toBe(message);
        done();
    }, (error: any) => {
        fail("Failed to Post to Portal message board");
        done();
        });
    }, 10000);

    it("Get Portal Message Board", (done: any) => {
        WebCenter.Wall.getPortalMessages(
            spaceGuid).then((messageList: WallMessageList) => {
        let messageItem: WallMessageItem = messageList.items[0];
        expect(messageItem.id).toBe(messageId);
        done();
    }, (error: any) => {
        console.log(error);
        fail("Failed to get Portal Message Board");
        done();
        });
    }, 10000);

    it("Get Portal Message by ID", (done: any) => {
        WebCenter.Wall.getPortalMessage(messageId, spaceGuid).then((messageItem: WallMessageItem) => {
        expect(messageItem.id).toBe(messageId);
        expect(messageItem.body).toBe(message);
        done();
        }, (error: any) => {
        fail("Failed to get Portal Message by ID");
        done();
        });
    }, 10000);

    it("Delete Portal Message by ID", (done: any) => {
        WebCenter.Wall.deletePortalMessage(messageId, spaceGuid).then((res: any) => {
        done();
        }, (error: any) => {
        fail("Failed to Delete Portal Message by ID");
        done();
        });
    }, 10000);

    xit("Get Portal Attribute", (done: any) => {
        WebCenter.Spaces.getAttribute(portalName, attrName).then(
            (attr: Attribute) => {
            expect(attr.resourceType).toBe("urn:oracle:webcenter:space:attribute");
            expect(attr.name).toBe(attrName);
            done();
        }, (error: any) => {
            fail("Failed to Get Portal Attribute.");
            done();
        });
    }, 10000);

    it("Get Portal Attributes", (done: any) => {
        WebCenter.Spaces.getAttributes(portalName).then((attrs: Attributes) => {
            expect(attrs.resourceType).toBe("urn:oracle:webcenter:space:attributes");
            done();
        }, (error: any) => {
            fail("Failed to Get Portal Attributes.");
            done();
        });
    }, 10000);

    it("Get Portal Site Resources", (done: any) => {
        WebCenter.Spaces.getSiteResources(portalName).then((resources: any) => {
            expect(resources.resourceType).toBe("urn:oracle:webcenter:spaces:siteresources");
            done();
        }, (error: any) => {
            fail("Failed to Get Portal Site Resources.");
            done();
        });
    }, 10000);

    it("Delete Portal By Name", (done: any) => {
        WebCenter.Spaces.deleteSpace(portalName).then((res: any) => {
            done();
        }, (error: any) => {
            fail("Failed to Get Portal Attributes.");
            done();
        });
    }, 10000);

});
