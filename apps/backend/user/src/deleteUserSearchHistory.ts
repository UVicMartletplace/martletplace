import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

const deleteUserSearchHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  const { userID } = req.params;
  const id = req.user.userId;

  if (!userID) {
    console.error("missing user id parameter in request");
    return res.status(400).json({ error: "User ID is required" });
  }

  if (userID !== id.toString()) {
    console.error("user id does not match authenticated user");
    return res.status(403).json({ error: "Unauthorized action" });
  }

  const query = `
        DELETE FROM user_searches
        WHERE user_id = $1
      `;

  try {
    const result = await db.result(query, [userID], r => r.rowCount);

    if (result === 0) {
      console.error("no search history found for this user");
      return res.status(404).json({ error: "No search history found for this user" });
    }

    return res
      .status(200)
      .json({ message: "All search history deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { deleteUserSearchHistory };
