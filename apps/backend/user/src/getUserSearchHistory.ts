import { Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

const getUserSearchHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  const id = req.user.userId;

  const query = `
        SELECT search_term, search_id
        FROM user_searches
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 15
      `;

  try {
    const data = await db.any(query, [id]);

    const response = {
      searches: Array.from(new Set(data.map((search) => search.search_term)))
        .slice(0, 5)
        .map((term) => ({
          searchTerm: term,
          searchID: data.find((search) => search.search_term === term)
            .search_id,
        })),
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { getUserSearchHistory };
