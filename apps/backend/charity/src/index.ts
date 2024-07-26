import { connectDB, setupTracing } from "../../lib/src/otel";
setupTracing("charity");

import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { AuthenticatedRequest, authenticate_request } from "../../lib/src/auth";
import { createCharity } from "./createCharity";
import { getCharities } from "./getCharities";
import { getCurrentCharity } from "./getCurrentCharity";
import { deleteCharity } from "./deleteCharity";

const PORT = 8225;

const app = express();

app.use(morgan("dev"));
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

app.post("/api/charities", (req, res) =>
  createCharity(req as unknown as AuthenticatedRequest, res, db),
);

app.get("/api/charities", (req, res) =>
  getCharities(req as unknown as AuthenticatedRequest, res, db),
);

app.get("/api/charities/current", (req, res) =>
  getCurrentCharity(req as unknown as AuthenticatedRequest, res, db),
);

app.delete("/api/charities/:id", (req, res) =>
  deleteCharity(req as unknown as AuthenticatedRequest, res, db),
);

// Healthcheck
app.get("/.well-known/health", (_: Request, res: Response) => {
  return res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

export { app, db };
