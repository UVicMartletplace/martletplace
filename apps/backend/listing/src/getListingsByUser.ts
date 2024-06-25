import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

const getListingsByUser = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  // TODO: AUTHENTICATION
  const userID = 1; // for now assuming userID is 1 until we implement authentication

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
      return res.status(404).json({ error: "No listings found for this user" });
    }

    const responseListings = listings.map((listing) => ({
      listingID: listing.listingID,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      status: listing.status,
      dateCreated: listing.dateCreated,
      dateModified: listing.dateModified,
      images: listing.images.map((url: string) => ({ url })),
    }));

    return res.status(200).json(responseListings);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { getListingsByUser };
