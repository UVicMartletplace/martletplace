import { Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

interface Charity {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  image_url: string;
  organizations: Organization[];
  funds: number;
  listingsCount: number;
}

interface Organization {
  name: string;
  logoUrl: string;
  donated: number;
  receiving: boolean;
}

export const getCharities = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  try {
    const charities = await db.task((t) =>
      t
        .manyOrNone<Charity>(
          `
      SELECT c.charity_id AS id, c.name, c.description, c.start_date, c.end_date, c.image_url,
             jsonb_agg(jsonb_build_object('name', o.name, 'logoUrl', o.logo_url, 'donated', o.donated, 'receiving', o.receiving)) FILTER (WHERE o.organization_id IS NOT NULL) AS organizations,
             COALESCE(SUM(l.price), 0) AS funds
      FROM charities c
      LEFT JOIN organizations o ON o.charity_id = c.charity_id
      LEFT JOIN listings l ON l.charity_id = c.charity_id AND l.status = 'SOLD'
      GROUP BY c.charity_id;
    `,
        )
        .then((charities) =>
          Promise.all(
            charities.map(async (charity) => {
              const donationFunds = await t.one(
                `SELECT COALESCE(SUM(donated), 0) AS donation_funds
                FROM organizations
                WHERE charity_id = $1;`,
                [charity.id],
              );
              const listingStats = await t.one(
                `SELECT
                COALESCE(SUM(price), 0) AS listing_funds,
                COUNT(*) AS listings_count
              FROM listings
              WHERE charity_id = $1
              AND status = 'SOLD';`,
                [charity.id],
              );
              charity.funds =
                parseFloat(donationFunds.donation_funds) +
                parseFloat(listingStats.listing_funds);
              charity.listingsCount = parseInt(listingStats.listings_count);
              return charity;
            }),
          ),
        ),
    );

    res.json(charities);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while getting the charities",
    });
  }
};
