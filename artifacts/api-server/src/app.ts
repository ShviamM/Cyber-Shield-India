import express, { type Express } from "express";
import cors, { type CorsOptions } from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { errorHandler } from "./middlewares/error";
import { config } from "./config";
import { logger } from "./lib/logger";

const app: Express = express();

// Lock CORS to the admin web console origin(s). Requests with no Origin header
// (mobile app, native screening service, curl, server-to-server) are always
// allowed since CORS only governs browsers. When no allowlist is configured we
// fall back to permitting all origins so a misconfigured deploy never silently
// breaks the console — set ADMIN_ORIGINS in production to lock it down.
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (config.allowedOrigins.length === 0) return callback(null, true);
    if (config.allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  },
};

// Behind Replit's managed proxy the real client IP arrives via X-Forwarded-For.
// Trust it so req.ip reflects the actual client for per-IP rate limiting.
app.set("trust proxy", true);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors(corsOptions));
app.use(
  express.json({
    // Capture the raw bytes so webhook handlers can verify HMAC signatures
    // against the exact payload (re-serializing would change the bytes).
    verify: (req, _res, buf) => {
      (req as unknown as { rawBody?: Buffer }).rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use(errorHandler);

export default app;
