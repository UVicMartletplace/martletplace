import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

const getUserSearchHistory = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  const { id } = req.params;

  if (!id) {
    console.error("missing user id parameter in request");
    return res.status(400).json({ error: "User ID is required" });
  }
  
  const query = `
        SELECT search_id, search_term
        FROM user_searches
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;

  try {
    const data = await db.any(query, [id]);

    if (data.length === 0) {
      console.error("no user found in database");
      return res.status(200).json({
        searches: []
      });
    }

    if (data[0].search_id === null) {
      console.error("no search history found for this user");
      return res
        .status(200)
        .json({
          searches: []
        });
    }

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
