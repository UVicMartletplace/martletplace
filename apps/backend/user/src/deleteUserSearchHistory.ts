import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

const deleteUserSearchHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  const id = req.user.userId;

  const query = `
        DELETE FROM user_searches
        WHERE user_id = $1
      `;

  try {
    await db.result(query, [id]);

    return res
      .status(200)
      .json({ message: "All search history deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { deleteUserSearchHistory };
