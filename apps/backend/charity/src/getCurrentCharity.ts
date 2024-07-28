import { Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

export const getCurrentCharity = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  try {
    const charityResult = await db.oneOrNone(
      `SELECT c.charity_id AS id, c.name, c.description, c.start_date AS "startDate", c.end_date AS "endDate", c.image_url AS "imageUrl", 
        jsonb_agg(jsonb_build_object('name', o.name, 'logoUrl', o.logo_url, 'donated', o.donated, 'receiving', o.receiving)) AS organizations
       FROM charities c
       LEFT JOIN organizations o ON c.charity_id = o.charity_id
       WHERE NOW() BETWEEN c.start_date AND c.end_date
       GROUP BY c.charity_id;`,
    );

    if (!charityResult) {
      return res.status(200).json({ message: "No active charity" });
    }

    const [donationFunds, listingStats] = await Promise.all([
      db.one(
        `SELECT COALESCE(SUM(donated), 0) AS donation_funds
        FROM organizations
        WHERE charity_id = $1;`,
        [charityResult.id],
      ),
      db.one(
        `SELECT 
          COALESCE(SUM(price), 0) AS listing_funds, 
          COUNT(*) AS listings_count
        FROM listings
        WHERE charity_id = $1;`,
        [charityResult.id],
      ),
    ]);

    charityResult.funds =
      parseFloat(donationFunds.donation_funds) +
      parseFloat(listingStats.listing_funds);
    charityResult.listingsCount = parseInt(listingStats.listings_count);

    res.json(charityResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
