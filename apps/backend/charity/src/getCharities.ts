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
    const charities = await db.manyOrNone<Charity>(` // Use the Charity interface here
      SELECT c.id, c.name, c.description, c.start_date, c.end_date, c.image_url,
             jsonb_agg(jsonb_build_object('name', o.name, 'logoUrl', o.logo_url, 'donated', o.donated, 'receiving', o.receiving)) FILTER (WHERE o.id IS NOT NULL) AS organizations,
             COALESCE(SUM(l.price), 0) AS funds,
             COUNT(l.id) AS listingsCount
      FROM charities c
      LEFT JOIN organizations o ON o.charity_id = c.id
      LEFT JOIN listings l ON l.charity_id = c.id AND l.status = 'SOLD'
      GROUP BY c.id;
    `);

    res.json(charities);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while getting the charities"
    });
  }
};

