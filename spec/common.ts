import WebCenter from "../lib";
export function init(): void {

    const restBaseUrl: string = "http://wchost.lan/rest";
    const wcBaseUrl: string = "http://wchost.lan/webcenter";
    const csBaseUrl: string = "http://wchost.lan/cs";

    WebCenter.Config.setRestBaseUrl(restBaseUrl);
    WebCenter.Config.setWcBaseUrl(wcBaseUrl);
    WebCenter.Config.setCsBaseUrl(csBaseUrl);

    const username: string = "abarnes";
    const password: string = "welcome1";

    WebCenter.Auth.setUserName(username);
    WebCenter.Auth.setPassword(password);

    expect(restBaseUrl).toBe(WebCenter.Config.getRestBaseUrl());
}

export function logout(): void {
    WebCenter.Auth.logout();
    expect(true).toBe(true);
}
