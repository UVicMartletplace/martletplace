import { Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

const getListingsByUser = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  const userID = req.user.userId;

  try {
    const listings = await db.any(
      `SELECT
         listing_id AS "listingID",
         title,
         description,
         price,
         location,
         status,
         created_at AS "dateCreated",
         modified_at AS "dateModified",
         image_urls AS "images"
       FROM
         listings
       WHERE
         seller_id = $1`,
      [userID],
    );
    if (!listings.length) {
      console.error("no listings found for this user");
      return res.status(404).json({ error: "No listings found for this user" });
    }

    const responseListings = listings.map((listing) => ({
      listingID: String(listing.listingID),
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      // location: {
      //   lat: listing.location.latitude,
      //   lon: listing.location.longitude,
      // },
      status: listing.status,
      dateCreated: listing.dateCreated,
      dateModified: listing.dateModified,
      images: listing.images.map((url: string) => ({ url })),
    }));
    return res.status(200).json(responseListings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { getListingsByUser };
