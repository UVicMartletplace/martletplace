import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

const getUserSearchHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  const id = req.user.userId;

  const query = `
        SELECT search_id, search_term, created_at
        FROM user_searches
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 5
      `;

  try {
    const data = await db.any(query, [id]);

    const response = {
      searches: data.map((search) => ({
        searchTerm: search.search_term,
        searchID: search.search_id,
      })),
    };

    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { getUserSearchHistory };
