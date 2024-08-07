import { connectDB, setupTracing } from "../../lib/src/otel";
setupTracing("review");

import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import { getReview } from "./getReview";
import { createReview } from "./createReview";
import { updateReview } from "./updateReview";
import { deleteReview } from "./deleteReview";
import cookieParser from "cookie-parser";
import { AuthenticatedRequest, authenticate_request } from "../../lib/src/auth";

const PORT = 8213;
const app = express();

app.use(
  morgan("dev", {
    skip: function (req: Request, res: Response) {
      return res.statusCode < 400;
    },
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(authenticate_request);

const DB_ENDPOINT = process.env.DB_ENDPOINT;

if (!DB_ENDPOINT) {
  console.error("DB_ENDPOINT environment variable is not set");
  process.exit(1);
}

const db = connectDB(DB_ENDPOINT);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

app.get("/api/review/:id", (req, res) => getReview(req, res, db));
app.post("/api/review", (req, res) =>
  createReview(req as AuthenticatedRequest, res, db),
);
app.patch("/api/review/:id", (req, res) =>
  // @ts-expect-error cant coercse Req -> AuthReq
  updateReview(req as AuthenticatedRequest, res, db),
);
app.delete("/api/review/:id", (req, res) =>
  // @ts-expect-error cant coercse Req -> AuthReq
  deleteReview(req as AuthenticatedRequest, res, db),
);

// Healthcheck
app.get("/.well-known/health", (_: Request, res: Response) => {
  return res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

export { app, db };
