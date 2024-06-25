import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

// POST /api/reviews - Create a new review
const createReview = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  // TODO: AUTHENTICATION
  const userID = 1; // placeholder for authenticated user ID
  const { stars, comment, listingID } = req.body;

  if (!stars || !comment || !listingID) {
    console.error("missing parameter in request");
    return res.status(400).json({ error: "missing parameter in request" });
  }

  if (stars < 1 || stars > 5 ){
    console.error("invalid rating value");
    return res.status(400).json({ error: "invalid rating value" });
  }

  try {
    const createdReview = await db.one(
      `INSERT INTO reviews (listing_id, user_id, review, rating_value)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [listingID, userID, comment, stars],
    );

    const reviewerProfile = await db.one(
      `SELECT user_id AS "userID", username, name
       FROM users
       WHERE user_id = $1`,
      [userID],
    );

    const responseReview = {
      review_id: createdReview.review_id,
      reviewerName: reviewerProfile.name,
      stars: createdReview.rating_value,
      comment: createdReview.review,
      userID: reviewerProfile.userID,
      listingID: createdReview.listing_id,
      dateCreated: createdReview.created_at,
      dateModified: createdReview.modified_at,
    };

    return res.status(201).json(responseReview);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { createReview };
