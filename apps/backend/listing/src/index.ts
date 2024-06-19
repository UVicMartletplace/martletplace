import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import pgPromise from "pg-promise";
import { getListingById } from "./getListingById";
import { createListing } from "./createListing";
import { updateListing } from "./updateListing";
import { deleteListing } from "./deleteListing";

const PORT = 8212;

const app = express();

app.use(morgan("dev"));
app.use(express.json());

const pgp = pgPromise();
const DB_ENDPOINT = process.env.DB_ENDPOINT || "";

const db = pgp(DB_ENDPOINT);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

app.get("/api/listing/:id", (req, res, next) =>
  getListingById(req, res, next, db),
);
app.post("/api/listing", (req, res, next) => createListing(req, res, next, db));
app.patch("/api/listing/:id", (req, res, next) =>
  updateListing(req, res, next, db),
);
app.delete("/api/listing/:id", (req, res, next) =>
  deleteListing(req, res, next, db),
);

app.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

export { app, db };
