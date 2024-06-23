import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

// PATCH /api/reviews/:id - Update an existing review
const updateReview = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  //TODO: AUTHENTICATION
  const { id } = req.params;
  const { stars, comment, listingID } = req.body;

  if (!stars || !comment || !listingID) {
    console.log("missing parameter in request");
    return res.status(400).json({ error: "missing parameter in request" });
  }

  try {
    const updatedReview = await db.oneOrNone(
      `UPDATE reviews
       SET review = $1,
           rating_value = $2,
           modified_at = NOW(),
            listing_id = $3
       WHERE review_id = $4
       RETURNING *`,
      [comment, stars, listingID, id],
    );

    if (!updatedReview) {
      console.log("review not found");
      return res.status(404).json({ error: "Review not found" });
    }

    const responseReview = {
      review_id: updatedReview.review_id,
      stars: updatedReview.rating_value,
      comment: updatedReview.review,
      listingID: updatedReview.listing_id,
      dateModified: updatedReview.modified_at,
    };

    return res.status(200).json(responseReview);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { updateReview };
