import { Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

export const getCurrentCharity = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>
) => {
  try {
    const userID = req.user.userId;

    const result = await db.oneOrNone(
      `SELECT c.name AS charity_name, c.description, c.start_date, c.end_date, c.image_url, 
        jsonb_agg(jsonb_build_object('name', o.name, 'logoUrl', o.logo_url, 'donated', o.donated, 'receiving', o.receiving)) AS organizations
       FROM charities c
       JOIN organizations o ON c.charity_id = o.charity_id
       WHERE user_id = $1
       GROUP BY c.charity_id;`,
      [userID]
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while getting the current charity" });
  }
};
