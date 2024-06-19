import { Request, Response, NextFunction } from "express";
import { IDatabase } from "pg-promise";

// POST /api/listing - Create a new listing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createListing = async (
  req: Request,
  res: Response,
  next: NextFunction,
  db: IDatabase<any>
) => {
  const { listing } = req.body;

  if (!listing) {
    return res.status(400).json({ error: "missing parameter in request" });
  }

  const { title, description, price, location, images } = listing;

  if (!location || !location.latitude || !location.longitude) {
    return res.status(400).json({ error: "missing parameter in request" });
  }

  const formattedLocation = `(${location.latitude},${location.longitude})`;

  try {
    const createdListing = await db.one(
      `INSERT INTO listings (title, description, price, location, image_urls, status, created_at, modified_at, seller_id)
       VALUES ($1, $2, $3, $4, $5, 'AVAILABLE', NOW(), NOW(), 1)
       RETURNING *`,
      [
        title,
        description,
        price,
        formattedLocation,
        images.map((image: { url: string }) => image.url)
      ]
    );

    const responseListing = {
      listingID: createdListing.listing_id,
      seller_profile: {
        userID: 1, // assuming seller ID is 1 for now
        username: "hubert123", // example username
        name: "Bartholomew Hubert", // example name
        bio: "I love stuff", // example bio
        profilePictureUrl: "https://example.com/image.png" // example profile picture URL
      },
      title: createdListing.title,
      description: createdListing.description,
      price: createdListing.price,
      location: {
        latitude: parseFloat(createdListing.location.split(',')[0].replace('(', '')),
        longitude: parseFloat(createdListing.location.split(',')[1].replace(')', ''))
      },
      status: createdListing.status,
      dateCreated: createdListing.created_at,
      dateModified: createdListing.modified_at,
      reviews: [], // assuming no reviews on new listing  
      images: createdListing.image_urls.map((url: string) => ({ url }))
    };

    return res.status(201).json({ listing: responseListing });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { createListing };
