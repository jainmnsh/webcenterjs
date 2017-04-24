import { Chance } from "chance";
import WebCenter from "../lib";

import {
  Forum,
  Forums} from "../lib";

import {init, logout } from "./common";

const chance: any = new Chance();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

beforeAll(init);
afterAll(logout);

afterAll(() => {
    WebCenter.Auth.logout();
    expect(true).toBe(true);
});

describe("Discussions", () => {

  it("Get Forums", (done: any) => {
     WebCenter.Discussions.getForums().then((forums: Forums) => {
        expect(forums).toBeDefined();
        done();
    }, (error: any) => {
      fail("Failed to Get Forums.");
      done();
    });
  }, 10000);

  xit("Create Forum", (done: any) => {
      const forumName: string = chance.word();
      const description: string = chance.sentence();
      WebCenter.Discussions.createForum(forumName, `${forumName} Display`, description).then(
        (forum: Forum) => {
          expect(forum).toBeDefined();
          done();
      }, (error: any) => {
        fail("Failed to Create Forum.");
        done();
      });
    }, 10000);

});
