import type { User as DbUser } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      user?: DbUser;
      /** Raw request body bytes, captured for webhook signature verification. */
      rawBody?: Buffer;
    }
  }
}

export {};
