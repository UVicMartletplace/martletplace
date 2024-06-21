import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

// DELETE /api/review/:id - Delete a review
const deleteReview = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  return res.status(201).json({ message: "deleteReview" });
};

export { deleteReview };
