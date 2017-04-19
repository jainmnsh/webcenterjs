import { Chance } from "chance";
import WebCenter from "../lib";

const chance: any = new Chance();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

beforeAll(() => {
    const restBaseUrl: string = "http://krowdtest.darden.com/rest";
    const wcBaseUrl: string = "http://krowdtest.darden.com/webcenter";
    const csBaseUrl: string = "http://krowdtest.darden.com/cs";

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

describe("Discussions", () => {

  it("Get Forums", (done: any) => {
    WebCenter.Discussions.getForums().then((forums: WebCenter.Discussions.Forums) => {
        expect(forums).toBeDefined();
        done();
    }, (error: any) => {
      fail("Failed to Get Forums.");
      done();
    });
  }, 10000);

  it("Create Forum", (done: any) => {
    const forumName: string = chance.word();
    const description: string = chance.sentence();
    WebCenter.Discussions.createForum(forumName, `${forumName} Display`, description).then(
      (forum: WebCenter.Discussions.Forum) => {
        expect(forum).toBeDefined();
        done();
    }, (error: any) => {
      fail("Failed to Create Forum.");
      done();
    });
  }, 10000);


});
