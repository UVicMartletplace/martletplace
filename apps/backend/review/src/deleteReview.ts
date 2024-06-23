import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

// DELETE /api/reviews/:id - Delete a review
const deleteReview = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  // TODO: AUTHENTICATION
  const { id } = req.params;

  if (!id) {
    console.log("no review_id in request");
    return res.status(400).json({ error: "missing parameter in request" });
  }

  try {
    const result = await db.result(
      `DELETE FROM reviews
       WHERE review_id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      console.log("review not found");
      return res.status(404).json({ error: "Review not found" });
    }

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { deleteReview };
