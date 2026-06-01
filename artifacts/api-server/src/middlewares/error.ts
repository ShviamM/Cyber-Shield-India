import type { ErrorRequestHandler } from "express";
import { HttpError } from "../lib/http-error";
import { logger } from "../lib/logger";

interface ZodLikeError {
  name: string;
  issues: Array<{ path: Array<string | number>; message: string }>;
}

function isZodError(err: unknown): err is ZodLikeError {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { name?: unknown }).name === "ZodError" &&
    Array.isArray((err as { issues?: unknown }).issues)
  );
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (isZodError(err)) {
    const message = err.issues
      .map((i) => {
        const path = i.path.join(".");
        return path ? `${path}: ${i.message}` : i.message;
      })
      .join("; ");
    res.status(400).json({ error: "validation_error", message });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.code, message: err.message });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res
    .status(500)
    .json({ error: "internal_error", message: "Something went wrong" });
};
