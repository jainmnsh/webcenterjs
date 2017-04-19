import { Chance } from "chance";
import WebCenter from "../lib";

const chance: any = new Chance();

let listName: string;
let status: string;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

beforeAll(() => {
    const restBaseUrl: string = "http://krowddev.darden.com/rest";
    const wcBaseUrl: string = "http://krowddev.darden.com/webcenter";
    const csBaseUrl: string = "http://krowddev.darden.com/cs";

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
            fail("Failed to Get Portal Templates.");
            done();
        });
    }, 10000);

});
