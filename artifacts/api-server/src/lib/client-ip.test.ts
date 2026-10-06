import { describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";
import { clientIp } from "./client-ip";

function makeApp(trustProxyHops: number) {
  const app = express();
  app.set("trust proxy", trustProxyHops);
  app.get("/ip", (req, res) => {
    res.json({ ip: clientIp(req) });
  });
  return app;
}

describe("clientIp", () => {
  it("prefers the edge-provided do-connecting-ip header", async () => {
    const res = await request(makeApp(1))
      .get("/ip")
      .set("X-Forwarded-For", "6.6.6.6, 203.0.113.9")
      .set("do-connecting-ip", "198.51.100.7");
    expect(res.body.ip).toBe("198.51.100.7");
  });

  it("ignores spoofed leftmost X-Forwarded-For entries", async () => {
    const res = await request(makeApp(1))
      .get("/ip")
      .set("X-Forwarded-For", "6.6.6.6, 203.0.113.9");
    expect(res.body.ip).toBe("203.0.113.9");
  });

  it("rotating a fake X-Forwarded-For prefix does not change the key", async () => {
    const app = makeApp(1);
    const ips = await Promise.all(
      ["1.1.1.1", "2.2.2.2", "3.3.3.3"].map(async (fake) => {
        const res = await request(app)
          .get("/ip")
          .set("X-Forwarded-For", `${fake}, 203.0.113.9`);
        return res.body.ip;
      }),
    );
    expect(new Set(ips)).toEqual(new Set(["203.0.113.9"]));
  });
});
