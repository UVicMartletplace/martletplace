import { Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

interface Organization {
  name: string;
  logoUrl: string;
  donated: number;
  receiving: boolean;
}

export const createCharity = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  try {
    const charity = req.body;
    const { name, description, startDate, endDate, imageUrl, organizations } =
      charity;

    if (
      !name ||
      !description ||
      !startDate ||
      !endDate ||
      !imageUrl ||
      !organizations
    ) {
      console.error("missing parameter in request");
      return res.status(400).json({ error: "missing parameter in request" });
    }

    for (const org of organizations) {
      if (
        !org.name ||
        !org.logoUrl ||
        org?.donated === null ||
        org?.donated === undefined ||
        org?.receiving === null ||
        org?.receiving === undefined
      ) {
        console.error("missing parameter in request");
        return res.status(400).json({ error: "missing parameter in request" });
      }
    }

    const createdCharity = await db.oneOrNone(
      `INSERT INTO charities (name, description, start_date, end_date, image_url) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING charity_id, name, description, start_date, end_date, image_url`,
      [name, description, startDate, endDate, imageUrl],
    );

    const results = await db.task((t) => {
      const queries = organizations.map((org: Organization) =>
        t.oneOrNone<Organization>(
          `INSERT INTO organizations (name, logo_url, donated, receiving, charity_id)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING name, logo_url, donated, receiving;`,
          [
            org.name,
            org.logoUrl,
            org.donated,
            org.receiving,
            createdCharity.charity_id,
          ],
        ),
      );

      return t.batch(queries);
    });

    const createdOrganizations: Organization[] = results.filter(
      (result) => result !== null,
    ) as Organization[];

    let totalFunds = 0;
    createdOrganizations.forEach((org) => {
      totalFunds += parseFloat(org.donated.toString());
    });

    const charityResponse = {
      id: createdCharity.charity_id,
      name: createdCharity.name,
      description: createdCharity.description,
      startDate: createdCharity.start_date,
      endDate: createdCharity.end_date,
      imageUrl: createdCharity.image_url,
      organizations: createdOrganizations,
      funds: totalFunds,
      listingsCount: 0,
    };

    res.status(201).json(charityResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
