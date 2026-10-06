import { describe, expect, it } from "vitest";
import { parseWaitlistContact } from "./waitlist-contact";

describe("parseWaitlistContact", () => {
  it("accepts and lower-cases emails", () => {
    expect(parseWaitlistContact("  Ravi@Example.COM ")).toEqual({ contact: "ravi@example.com", contactType: "email" });
  });
  it("normalizes Indian mobile numbers", () => {
    expect(parseWaitlistContact("098765 43210")).toEqual({ contact: "+919876543210", contactType: "phone" });
    expect(parseWaitlistContact("+91 98765-43210")).toEqual({ contact: "+919876543210", contactType: "phone" });
  });
  it("rejects junk", () => {
    for (const v of ["", "abc", "12345", "not@an", "5876543210", 42, null, undefined, "a".repeat(300) + "@x.com"]) {
      expect(parseWaitlistContact(v)).toBeNull();
    }
  });
});
