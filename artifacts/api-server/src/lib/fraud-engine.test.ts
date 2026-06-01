import { describe, expect, it } from "vitest";
import { analyzeUrlHeuristics, parseUrl } from "./url-analysis";
import { analyzeUpi } from "./upi";

describe("analyzeUrlHeuristics", () => {
  it("flags brand impersonation on a non-official domain", () => {
    const { signals } = analyzeUrlHeuristics("http://hdfcbank.secure-login.tk/verify");
    const sources = signals.map((s) => s.label);
    expect(signals.some((s) => s.severity === "high")).toBe(true);
    expect(sources.join(" ")).toMatch(/imitates a known brand/i);
  });

  it("does not flag the official brand domain", () => {
    const { signals } = analyzeUrlHeuristics("https://www.hdfcbank.com/personal");
    expect(signals.some((s) => /imitates a known brand/i.test(s.label))).toBe(false);
  });

  it("flags a suspicious TLD and missing HTTPS", () => {
    const { signals } = analyzeUrlHeuristics("http://win-prize.xyz");
    expect(signals.some((s) => /\.xyz/.test(s.label))).toBe(true);
    expect(signals.some((s) => /HTTPS/i.test(s.label))).toBe(true);
  });

  it("flags a raw IP-address host", () => {
    const { signals } = analyzeUrlHeuristics("http://203.0.113.5/login");
    expect(signals.some((s) => s.severity === "high" && /IP address/i.test(s.label))).toBe(true);
  });

  it("returns no risk signals for a clean HTTPS domain", () => {
    const { signals } = analyzeUrlHeuristics("https://www.google.com");
    expect(signals.filter((s) => s.severity !== "info")).toHaveLength(0);
  });

  it("returns null url for unparseable input", () => {
    const { url } = analyzeUrlHeuristics("not a url at all !!!");
    expect(url).toBeNull();
  });
});

describe("parseUrl", () => {
  it("prepends http:// when no scheme is present", () => {
    expect(parseUrl("example.com")?.protocol).toBe("http:");
  });
});

describe("analyzeUpi", () => {
  it("rejects malformed UPI ids", () => {
    const { upiId } = analyzeUpi("not-a-upi");
    expect(upiId).toBeNull();
  });

  it("extracts an embedded phone from a numeric VPA", () => {
    const { embeddedPhone } = analyzeUpi("9876543210@ybl");
    expect(embeddedPhone).toBe("9876543210");
  });

  it("flags an unknown payment handle", () => {
    const { signals } = analyzeUpi("scammer@randomhandle");
    expect(signals.some((s) => s.severity === "low")).toBe(true);
  });

  it("does not flag a known handle", () => {
    const { signals } = analyzeUpi("merchant@oksbi");
    expect(signals.some((s) => /not a widely recognized/i.test(s.label))).toBe(false);
  });
});
