import { describe, it, expect } from "vitest";
import { detectType } from "./CheckScam";

describe("detectType", () => {
  describe("phone numbers", () => {
    it("detects a bare 10-digit Indian number", () => {
      expect(detectType("9876543210")).toBe("phone");
    });

    it("detects a number with a +91 country code", () => {
      expect(detectType("+919876543210")).toBe("phone");
    });

    it("detects a number with dashes", () => {
      expect(detectType("98765-43210")).toBe("phone");
    });

    it("detects a number with parentheses", () => {
      expect(detectType("(022) 1234 5678")).toBe("phone");
    });

    it("detects a space-separated number with a +91 country code", () => {
      expect(detectType("+91 98765 43210")).toBe("phone");
    });

    it("treats too-few digits as a message", () => {
      expect(detectType("12345")).toBe("message");
    });

    it("treats too-many digits as a message", () => {
      expect(detectType("1234567890123456")).toBe("message");
    });
  });

  describe("URLs", () => {
    it("detects an explicit http scheme", () => {
      expect(detectType("http://example.com")).toBe("url");
    });

    it("detects an explicit https scheme", () => {
      expect(detectType("https://bit.ly/xyz")).toBe("url");
    });

    it("detects a www-prefixed host", () => {
      expect(detectType("www.example.com")).toBe("url");
    });

    it("detects a bare host.tld", () => {
      expect(detectType("example.com")).toBe("url");
    });

    it("detects a host with a path", () => {
      expect(detectType("bit.ly/xyz")).toBe("url");
    });

    it("detects a host with a query string", () => {
      expect(detectType("example.com?ref=1")).toBe("url");
    });
  });

  describe("UPI handles", () => {
    it("detects a name@bank handle", () => {
      expect(detectType("name@okbank")).toBe("upi");
    });

    it("detects a numeric@bank handle", () => {
      expect(detectType("9876543210@ybl")).toBe("upi");
    });

    it("detects a handle with a dot in the username", () => {
      expect(detectType("john.doe@oksbi")).toBe("upi");
    });

    it("does not treat an email as a UPI handle", () => {
      expect(detectType("a@b.com")).toBe("message");
    });
  });

  describe("free-text messages", () => {
    it("treats text with spaces as a message", () => {
      expect(detectType("Your KYC will expire today")).toBe("message");
    });

    it("treats empty input as a message", () => {
      expect(detectType("")).toBe("message");
    });

    it("treats whitespace-only input as a message", () => {
      expect(detectType("   ")).toBe("message");
    });

    it("treats very long input (>80 chars) as a message", () => {
      expect(detectType("a".repeat(81))).toBe("message");
    });

    it("trims surrounding whitespace before detecting", () => {
      expect(detectType("  9876543210  ")).toBe("phone");
    });
  });
});
