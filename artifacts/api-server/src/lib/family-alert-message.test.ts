import { describe, expect, it } from "vitest";
import { buildFamilyAlertMessage, formatPhoneForAlert, isAlertableRisk } from "./family-alert-message";

describe("family alert message", () => {
  it("only alerts on medium and high risk", () => {
    expect(isAlertableRisk("high")).toBe(true);
    expect(isAlertableRisk("medium")).toBe(true);
    expect(isAlertableRisk("low")).toBe(false);
    expect(isAlertableRisk("unknown")).toBe(false);
  });

  it("formats Indian numbers", () => {
    expect(formatPhoneForAlert("+919876543210")).toBe("+91 98765 43210");
    expect(formatPhoneForAlert("140123")).toBe("140123");
  });

  it("builds a high-risk message with the category", () => {
    const m = buildFamilyAlertMessage({
      memberName: "Papa",
      callerPhone: "+919876543210",
      riskLevel: "high",
      reportCount: 7,
      category: "digital_arrest",
    });
    expect(m.title).toBe("Papa is getting a call from a reported scam number");
    expect(m.body).toBe(
      "+91 98765 43210 (digital arrest, 7 reports). Call Papa now and remind them never to share an OTP or send money.",
    );
  });

  it("handles a medium risk caller with no category", () => {
    const m = buildFamilyAlertMessage({
      memberName: " ",
      callerPhone: "+919876543210",
      riskLevel: "medium",
      reportCount: 1,
      category: null,
    });
    expect(m.title).toBe("Your family member is getting a call from a suspicious number");
    expect(m.body.startsWith("+91 98765 43210 (1 report).")).toBe(true);
  });
});
