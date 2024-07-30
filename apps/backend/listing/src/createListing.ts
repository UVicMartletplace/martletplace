import { Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

// POST /api/listing - Create a new listing
const createListing = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  const userID = req.user.userId;
  const { listing } = req.body;

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
    const createdListing = await db.one(
      `INSERT INTO listings (title, description, price, location, image_urls, status, created_at, modified_at, seller_id, charity_id)
       VALUES ($1, $2, $3, $4, $5, 'AVAILABLE', NOW(), NOW(), $6, $7)
       RETURNING listing_id, title, price, location, status, description, image_urls, created_at, modified_at, charity_id`,
      [
        title,
        description,
        price,
        formattedLocation,
        images.map((image: { url: string }) => image.url),
        userID,
        charity_id,
      ],
    );

    const sellerProfile = await db.one(
      `SELECT user_id AS "userID", username, name, bio, profile_pic_url AS "profilePictureUrl"
       FROM users
       WHERE user_id = $1`,
      [userID],
    );

    const responseListing = {
      listingID: createdListing.listing_id,
      seller_profile: sellerProfile,
      title: createdListing.title,
      description: createdListing.description,
      price: createdListing.price,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      status: createdListing.status,
      dateCreated: createdListing.created_at,
      dateModified: createdListing.modified_at,
      reviews: [],
      images: createdListing.image_urls.map((url: string) => ({ url })),
      charityId: charity_id,
    };

    return res.status(201).json({ listing: responseListing });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { createListing };
