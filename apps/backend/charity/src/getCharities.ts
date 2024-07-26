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
    // Looks good. charity 1 is the only which shows funds bc listing 2 is the only sold one
    const charities =
      await db.manyOrNone<Charity>(` // Use the Charity interface here
      SELECT c.charity_id, c.name, c.description, c.start_date, c.end_date, c.image_url,
             jsonb_agg(jsonb_build_object('name', o.name, 'logoUrl', o.logo_url, 'donated', o.donated, 'receiving', o.receiving)) FILTER (WHERE o.organization_id IS NOT NULL) AS organizations,
             COALESCE(SUM(l.price), 0) AS funds,
             COUNT(l.listing_id) AS listingsCount
      FROM charities c
      LEFT JOIN organizations o ON o.charity_id = c.charity_id
      LEFT JOIN listings l ON l.charity_id = c.charity_id AND l.status = 'SOLD'
      GROUP BY c.charity_id;
    `);

    res.json(charities);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while getting the charities",
    });
  }
};