import { Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

export const createCharity = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>
) => {
  try {
    const charity = req.body;
    const { name, description, start_date, end_date, image_url } = charity;

    const result = await db.oneOrNone(
      `INSERT INTO charities (name, description, start_date, end_date, image_url) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING name, description, start_date, end_date, image_url;`,
      [name, description, start_date, end_date, image_url]
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the message" });
  }
};
