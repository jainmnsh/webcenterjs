import { Chance } from "chance";
import WebCenter from "../lib";

const chance: any = new Chance();

let listName: string;
let status: string;
let portalName: string;
let attrName: string;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

beforeAll(() => {
    const restBaseUrl: string = "http://krowdstage.darden.com/rest";
    const wcBaseUrl: string = "http://krowdstage.darden.com/webcenter";
    const csBaseUrl: string = "http://krowdstage.darden.com/cs";

    WebCenter.Config.setRestBaseUrl(restBaseUrl);
    WebCenter.Config.setWcBaseUrl(wcBaseUrl);
    WebCenter.Config.setCsBaseUrl(csBaseUrl);

    const username: string = "880690388";
    const password: string = "Darden88";

    WebCenter.Auth.setUserName(username);
    WebCenter.Auth.setPassword(password);

    expect(restBaseUrl).toBe(WebCenter.Config.getRestBaseUrl());
});

afterAll(() => {
    WebCenter.Auth.logout();
    expect(true).toBe(true);
});

describe("Portal", () => {

    it("Get Portal Templates", (done: any) => {
        WebCenter.Portal.getPortalTemplates().then((portalTemplates: WebCenter.Spaces.Templates) => {
            expect(portalTemplates.resourceType).toBe("urn:oracle:webcenter:spaces:resource:templates");
            done();
        }, (error: any) => {
            fail("Failed to Get Portal Templates.");
            done();
        });
    }, 20000);

    it("Get Portal Template By Name", (done: any) => {
        WebCenter.Portal.getTemplate("Portal").then((portalTemplate: WebCenter.Spaces.Template) => {
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
        WebCenter.Portal.getTemplateRoles("Portal").then((roles: WebCenter.Spaces.Roles) => {
            expect(roles.resourceType).toBe("urn:oracle:webcenter:space:roles");
            done();
        }, (error: any) => {
            fail("Failed to Get Portal Template Roles.");
            done();
        });
    }, 10000);

    it("Get Portal Template Attributes", (done: any) => {
        WebCenter.Portal.getTemplateAttributes("Portal").then((attrs: WebCenter.Spaces.Attributes) => {
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
        WebCenter.Portal.createPortal(portalName, "Portal", portalDesc).then((space: WebCenter.Spaces.Space) => {
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
        WebCenter.Portal.getPortal(portalName).then((space: WebCenter.Spaces.Space) => {
            expect(space.displayName).toBe(portalName);
            done();
        }, (error: any) => {
            fail("Failed to Get Portal By Name.");
            done();
        });
    }, 10000);

    it("Get Portal Members", (done: any) => {
        WebCenter.Portal.getPortalMembers(portalName).then((members: WebCenter.Spaces.Members) => {
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
        WebCenter.Portal.createPortalAttribute(portalName, attrName, attrVal, attrDesc).then(
            (attr: WebCenter.Spaces.Attribute) => {
            expect(attr.resourceType).toBe("urn:oracle:webcenter:space:attribute");
            expect(attr.name).toBe(attrName);
            expect(attr.value).toBe(attrVal);
            done();
        }, (error: any) => {
            fail("Failed to Create Portal Attribute.");
            done();
        });
    }, 10000);

    it("Get Portal Attribute", (done: any) => {
        WebCenter.Portal.getPortalAttribute(portalName, attrName).then(
            (attr: WebCenter.Spaces.Attribute) => {
            expect(attr.resourceType).toBe("urn:oracle:webcenter:space:attribute");
            expect(attr.name).toBe(attrName);
            done();
        }, (error: any) => {
            fail("Failed to Get Portal Attribute.");
            done();
        });
    }, 10000);

    it("Get Portal Attributes", (done: any) => {
        WebCenter.Portal.getPortalAttributes(portalName).then((attrs: WebCenter.Spaces.Attributes) => {
            expect(attrs.resourceType).toBe("urn:oracle:webcenter:space:attributes");
            done();
        }, (error: any) => {
            fail("Failed to Get Portal Attributes.");
            done();
        });
    }, 10000);

    it("Get Portal Site Resources", (done: any) => {
        WebCenter.Portal.getSiteResources(portalName).then((resources: any) => {
            expect(resources.resourceType).toBe("urn:oracle:webcenter:spaces:siteresources");
            done();
        }, (error: any) => {
            fail("Failed to Get Portal Site Resources.");
            done();
        });
    }, 10000);

    it("Delete Portal By Name", (done: any) => {
        WebCenter.Portal.deletePortal(portalName).then((res: any) => {
            done();
        }, (error: any) => {
            fail("Failed to Get Portal Attributes.");
            done();
        });
    }, 10000);

});
