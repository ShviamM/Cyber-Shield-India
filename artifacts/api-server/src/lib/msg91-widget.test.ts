import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Unit-test the real verifyAccessToken logic (the route test mocks the whole
 * module). Mock config so MSG91 looks configured, and capture logger calls so
 * we can assert no token/OTP ever lands in the logs.
 */
vi.mock("../config", () => ({
  config: { msg91AuthKey: "test-auth-key", msg91WidgetId: "test-widget-id" },
}));

const logWarn = vi.fn();
const logInfo = vi.fn();
const logError = vi.fn();
vi.mock("./logger", () => ({
  logger: {
    warn: (...args: unknown[]) => logWarn(...args),
    info: (...args: unknown[]) => logInfo(...args),
    error: (...args: unknown[]) => logError(...args),
  },
}));

const { verifyAccessToken } = await import("./msg91-widget");

function mockFetchOnce(status: number, body: unknown) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  logWarn.mockClear();
  logInfo.mockClear();
  logError.mockClear();
});

describe("verifyAccessToken", () => {
  it("rejects an HTTP 200 response that carries type:error (MSG91 logical failure)", async () => {
    mockFetchOnce(200, { type: "error", code: 701, message: "invalid access-token" });

    await expect(verifyAccessToken("bad-token")).rejects.toMatchObject({
      status: 401,
      code: "verification_failed",
    });
    // The MSG91 diagnostic code is logged for triage.
    expect(logWarn).toHaveBeenCalled();
    expect(JSON.stringify(logWarn.mock.calls)).toContain("701");
  });

  it("returns the verified phone taken from `message` on success", async () => {
    mockFetchOnce(200, { type: "success", message: "919876543210" });

    await expect(verifyAccessToken("good-token")).resolves.toEqual({
      phone: "+919876543210",
    });
  });

  it("never logs the access token or a full phone number", async () => {
    const token = "super-secret-access-token-value";

    mockFetchOnce(200, { type: "success", message: "919876543210" });
    await verifyAccessToken(token);

    const allLogs = JSON.stringify([
      ...logWarn.mock.calls,
      ...logInfo.mock.calls,
      ...logError.mock.calls,
    ]);
    expect(allLogs).not.toContain(token);
    // Full phone must not appear; only the masked last-4 form should.
    expect(allLogs).not.toContain("919876543210");
    expect(allLogs).toContain("***3210");
  });
});
