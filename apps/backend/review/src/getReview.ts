import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

// GET /api/review/:id - Get a review's details
const getReview = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  return res.status(201).json({ message: "getReview" });
};

export { getReview };
