import { Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

// PATCH /api/listing/:id - Update an existing listing
const updateListing = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  const { id } = req.params;
  const { listing, status } = req.body;

  if (!listing) {
    console.error("request body empty");
    return res.status(400).json({ error: "missing parameter in request" });
  }

  const { title, description, price, location, images, markedForCharity } =
    listing;

  if (
    !title ||
    typeof description !== "string" ||
    price < 0 ||
    !location ||
    !images ||
    !location.latitude ||
    !location.longitude ||
    typeof markedForCharity !== "boolean"
  ) {
    console.error("missing parameter in request");
    return res.status(400).json({ error: "missing parameter in request" });
  }

  const formattedLocation = `(${location.latitude},${location.longitude})`;

  try {
    let charity_id: number | null = null;
    if (markedForCharity) {
      const currentCharity = await db.oneOrNone(
        `SELECT c.charity_id AS id, c.name, c.description, c.start_date AS "startDate", c.end_date AS "endDate", c.image_url AS "imageUrl", 
          jsonb_agg(jsonb_build_object('name', o.name, 'logoUrl', o.logo_url, 'donated', o.donated, 'receiving', o.receiving)) AS organizations
        FROM charities c
        LEFT JOIN organizations o ON c.charity_id = o.charity_id
        WHERE NOW() BETWEEN c.start_date AND c.end_date
        GROUP BY c.charity_id
        ORDER BY c.start_date DESC
        LIMIT 1
        `,
      );

      if (currentCharity) {
        charity_id = currentCharity.charity_id;
      }
    }

    const updatedListing = await db.oneOrNone(
      `UPDATE listings
       SET title = $1,
           description = $2,
           price = $3,
           location = $4,
           image_urls = $5,
           status = $6,
           charity_id = $7
       WHERE listing_id = $8 AND seller_id = $9
       RETURNING listing_id, seller_id, buyer_id, title, price, location, status, description, image_urls, created_at, modified_at, charity_id;`,
      [
        title,
        description,
        price,
        formattedLocation,
        images.map((image: { url: string }) => image.url),
        status,
        charity_id,
        id,
        req.user.userId,
      ],
    );

    if (!updatedListing) {
      console.error("listing not found");
      return res.status(200).json({ error: "Listing not found" });
    }

    const responseListing = {
      listingID: updatedListing.listing_id,
      title: updatedListing.title,
      description: updatedListing.description,
      price: updatedListing.price,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      status: updatedListing.status,
      dateCreated: updatedListing.created_at,
      dateModified: updatedListing.modified_at,
      images: updatedListing.image_urls.map((url: string) => ({ url })),
      charityId: charity_id,
    };

    return res.status(200).json(responseListing);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { updateListing };
