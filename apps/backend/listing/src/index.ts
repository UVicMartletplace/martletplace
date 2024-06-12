import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import pgPromise from "pg-promise";

import { run } from "../../lib/src/example";

const PORT = 8212;

const app = express();
const pgp = pgPromise();
const DB_ENDPOINT = process.env.DB_ENDPOINT;

if (!DB_ENDPOINT) {
  console.error("DB_ENDPOINT environment variable is not set");
  process.exit(1);
}

const db = pgp(DB_ENDPOINT);

app.use(morgan("dev"));
app.use(express.json());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

// GET /api/listing/:id - Get a listing's details
const getListingById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO: AUTH
  const { id } = req.params;
  //TODO: make subquery
  await db
    .oneOrNone("SELECT * FROM listings WHERE listing_id = $1", [id])
    .then(function (data) {
      if (!data) {
        return res.status(404).json({
          error: "Listing not found",
        });
      }

      return res.status(200).send(data);
    })
    .catch(function (err) {
      return next(err);
    });
};

app.get("/api/listing/:id", getListingById);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

export { app, getListingById };
