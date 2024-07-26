import { Response, Request } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

export const getCurrentCharity = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  try {
    const userID = req.user.userId;

    const charityResult = await db.oneOrNone(
      `SELECT c.charity_id AS id, c.name, c.description, c.start_date AS "startDate", c.end_date AS "endDate", c.image_url AS "imageUrl", 
        jsonb_agg(jsonb_build_object('name', o.name, 'logoUrl', o.logo_url, 'donated', o.donated, 'receiving', o.receiving)) AS organizations
       FROM charities c
       LEFT JOIN organizations o ON c.charity_id = o.charity_id
       WHERE $1 BETWEEN c.start_date AND c.end_date
       GROUP BY c.charity_id;`,
      [new Date()],
    );

    if (charityResult) {
      const donationFunds = await db.one(
        `SELECT COALESCE(SUM(donated), 0) AS donationFunds
         FROM organizations
         WHERE charity_id = $1;`,
        [charityResult.id],
      );

      const listingStats = await db.one(
        `SELECT 
           COALESCE(SUM(price), 0) AS listingFunds, 
           COUNT(*) AS listingsCount
         FROM listings
         WHERE charity_id = $1;`,
        [charityResult.id],
      );

      charityResult.funds =
        donationFunds.donationFunds + listingStats.listingFunds;
      charityResult.listingsCount = listingStats.listingsCount;
    }

    res.json(charityResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
