import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

// POST /api/review - Create a new review
const createReview = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  return res.status(201).json({ message: "createReview" });
};

export { createReview };
