import { Request, Response, NextFunction } from "express";
import { IDatabase } from "pg-promise";
import { getDistance } from "geolib";

// GET /api/listing/:id - Get a listing's details
const getListingById = async (
  req: Request,
  res: Response,
  next: NextFunction,
  db: IDatabase<object>,
) => {
  // TODO: AUTHENTICATION
  const { id } = req.params;
  const { user_location } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Listing ID is required" });
  }

  if (!user_location || !user_location.latitude || !user_location.longitude) {
    return res.status(400).json({ error: "User location is required" });
  }

  try {
    const listingQuery = `
      SELECT 
        l.listing_id AS "listingID",
        jsonb_build_object(
          'userID', u.user_id,
          'username', u.username,
          'name', u.name,
          'bio', u.bio,
          'profilePictureUrl', u.profile_pic_url
        ) AS seller_profile,
        l.title,
        l.description,
        l.price,
        l.location,
        l.status,
        l.created_at AS "dateCreated",
        l.modified_at AS "dateModified"
      FROM 
        listings l
      JOIN 
        users u ON l.seller_id = u.user_id
      WHERE 
        l.listing_id = $1
    `;

    const listing = await db.oneOrNone(listingQuery, [id]);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    console.log(listing.location);
    const listingLocationStr = listing.location;

    const [latitudeStr, longitudeStr] = listingLocationStr
      .slice(1, -1)
      .split(",");
    const listingLocation = {
      latitude: parseFloat(latitudeStr),
      longitude: parseFloat(longitudeStr),
    };

    const distance =
      getDistance(
        {
          latitude: user_location.latitude,
          longitude: user_location.longitude,
        },
        {
          latitude: listingLocation.latitude,
          longitude: listingLocation.longitude,
        },
      ) / 1000;

    const reviewsQuery = `
      SELECT 
        r.review_id AS "listing_review_id",
        ru.username AS "reviewerName",
        r.rating_value AS "stars",
        r.review AS "comment",
        r.user_id AS "userID",
        r.listing_id AS "listingID",
        r.created_at AS "dateCreated",
        r.modified_at AS "dateModified"
      FROM 
        reviews r
      JOIN 
        users ru ON r.user_id = ru.user_id
      WHERE 
        r.listing_id = $1
    `;

    const imagesQuery = `
      SELECT 
        unnest(l.image_urls) AS "url"
      FROM 
        listings l
      WHERE 
        l.listing_id = $1
    `;

    const [reviews, images] = await Promise.all([
      db.any(reviewsQuery, [id]),
      db.any(imagesQuery, [id]),
    ]);

    listing.reviews = reviews;
    listing.images = images.map((image) => ({ url: image.url }));
    listing.distance = distance;

    return res.status(200).json(listing);
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { getListingById };
