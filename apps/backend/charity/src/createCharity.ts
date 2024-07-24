import { Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

export const createCharity = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  try {
    const charity = req.body;
    const {
      name,
      description,
      start_date,
      end_date,
      image_url,
      organizations,
    } = charity;

    if (
      !name ||
      !description ||
      !start_date ||
      !end_date ||
      !image_url ||
      !organizations
    ) {
      console.error("missing parameter in request");
      return res.status(400).json({ error: "missing parameter in request" });
    }

    for (const org of organizations) {
      if (!org.name || !org.logoUrl || !org.donated || !org.receiving) {
        console.error("missing parameter in request");
        return res.status(400).json({ error: "missing parameter in request" });
      }
    }

    const createdCharity = await db.oneOrNone(
      `INSERT INTO charities (name, description, start_date, end_date, image_url) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING charity_id, name, description, start_date, end_date, image_url`,
      [name, description, start_date, end_date, image_url],
    );

    const createdOrganizations: Array<{
      name: string;
      logo_url: string;
      donated: number;
      receiving: number;
    }> = [];
    let totalFunds = 0;

    for (const org of organizations) {
      const org_result = await db.oneOrNone(
        `INSERT INTO organizations (name, logo_url, donated, receiving, charity_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING name, logo_url, donated, receiving;`,
        [org.name, org.logoUrl, org.donated, org.receiving, org.charity_id],
      );

      if (org_result) {
        createdOrganizations.push(org_result);
        totalFunds += parseFloat(org.donated);
      }
    }

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
