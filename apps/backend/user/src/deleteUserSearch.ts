import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

const deleteUserSearch = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  const { searchID } = req.params;

  if (!searchID) {
    console.error("missing search id parameter in request");
    return res.status(400).json({ error: "Search ID is required" });
  }

  const query = `
        DELETE FROM user_searches
        WHERE search_id = $1
      `;

  try {
    const result = await db.oneOrNone(query, [searchID]);

    if (!result) {
      console.error("search not found");
      return res.status(404).json({ error: "Search entry not found" });
    }

    return res
      .status(200)
      .json({ message: "Search entry deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { deleteUserSearch };
