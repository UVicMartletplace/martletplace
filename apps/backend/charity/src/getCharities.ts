import { Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

export const getCharities = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  try {
    const userID = req.user.userId;

    const result = await db.oneOrNone(
      `SELECT name, description, start_date, end_date, image_url
       FROM charities 
       WHERE user_id = $1;`,
      [userID],
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while getting the charities" });
  }
};
