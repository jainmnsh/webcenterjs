import WebCenter from "../lib";
import {init, logout } from "./common";

import {
  PersonReference,
  ResourceIndex,
  } from "../lib";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

beforeAll(init);
afterAll(logout);

describe("Authentication", () => {
  it("Perform Login", (done: any) => {
    WebCenter.Auth.login().then((resourceIndex: ResourceIndex) => {
      done();
      expect(resourceIndex.version).toBeDefined();
    }, (error: any) => {
      fail("Login failed");
      done();
    });
  }, 3000);

  it("Get Resource Index", (done: any) => {
    WebCenter.Auth.getResourceIndex().then((resourceIndex: ResourceIndex) => {
      expect(resourceIndex.version).toBeDefined();
      done();
    }, (error: any) => {
      fail("Failed to get Resource Index");
      done();
    });
  }, 3000);

  it("Get uToken", () => {
    const uToken: string = WebCenter.Auth.getUToken();
    expect(uToken).toBeDefined();
  }, 3000);

  it("Get Current User Profile", (done: any) => {
    WebCenter.Auth.getCurrentUser().then((user: PersonReference) => {
      expect(user.guid).toBeDefined();
      done();
    }, (error: any) => {
      fail("Failed to get WC User Profile");
      done();
    });
  }, 3000);

});
