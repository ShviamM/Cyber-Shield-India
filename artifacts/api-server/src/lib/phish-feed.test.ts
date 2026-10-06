import { describe, expect, it } from "vitest";
import { checkPhishFeed, findPhishDomain, setPhishDomains } from "./phish-feed";

describe("phishunt feed matching", () => {
  setPhishDomains(["evil-bank.example", "WWW.Fake-KYC.in", "login.pay.example"]);

  it("matches the listed domain and its subdomains", () => {
    expect(findPhishDomain("evil-bank.example")).toBe("evil-bank.example");
    expect(findPhishDomain("secure.evil-bank.example")).toBe("evil-bank.example");
    expect(findPhishDomain("www.fake-kyc.in")).toBe("fake-kyc.in");
  });

  it("does not match parents of a listed subdomain or look-alikes", () => {
    expect(findPhishDomain("pay.example")).toBeNull();
    expect(findPhishDomain("notevil-bank.example")).toBeNull();
    expect(findPhishDomain("example")).toBeNull();
  });

  it("emits a high signal for listed URLs and info otherwise", () => {
    expect(checkPhishFeed(new URL("https://secure.evil-bank.example/login")).severity).toBe("high");
    expect(checkPhishFeed(new URL("https://netraksh.com")).severity).toBe("info");
  });
});
