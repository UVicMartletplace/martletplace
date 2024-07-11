import { connectDB, setupTracing } from "../../lib/src/otel";
setupTracing("listing");

import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import { getListingById } from "./getListingById";
import { getListingsByUser } from "./getListingsByUser";
import { createListing } from "./createListing";
import { updateListing } from "./updateListing";
import { deleteListing } from "./deleteListing";
import cookieParser from "cookie-parser";
import { AuthenticatedRequest, authenticate_request } from "../../lib/src/auth";

const PORT = 8212;

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

app.get("/api/listing/:id", (req, res) =>
  // @ts-expect-error cant coercse Req -> AuthReq
  getListingById(req as AuthenticatedRequest, res, db),
);
app.get("/api/listings", (req, res) => getListingsByUser(req, res, db));
app.post("/api/listing", (req, res) =>
  createListing(req as AuthenticatedRequest, res, db),
);
app.patch("/api/listing/:id", (req, res) =>
  // @ts-expect-error cant coercse Req -> AuthReq
  updateListing(req as AuthenticatedRequest, res, db),
);
app.delete("/api/listing/:id", (req, res) =>
  // @ts-expect-error cant coercse Req -> AuthReq
  deleteListing(req as AuthenticatedRequest, res, db),
);

// Healthcheck
app.get("/.well-known/health", (_: Request, res: Response) => {
  return res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

export { app, db };
