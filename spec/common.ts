import WebCenter from "../lib";
export function init(): void {

    const restBaseUrl: string = "http://192.168.1.49:8888/rest";
    const wcBaseUrl: string = "http://192.168.1.49:8888/webcenter";
    const csBaseUrl: string = "http://192.168.1.49:16200/cs";

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
