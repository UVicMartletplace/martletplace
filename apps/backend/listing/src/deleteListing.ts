import { Request, Response} from "express";
import { IDatabase } from "pg-promise";

// DELETE /api/listing/:id - Delete a listing
const deleteListing = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  //TODO: AUTHENTICATION
  const { id } = req.params;

  if (!id) {
    console.log("request body empty");
    return res.status(400).json({ error: "missing parameter in request" });
  }

  try {
    const result = await db.result(
      `DELETE FROM listings
       WHERE listing_id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      console.log("listing not found");
      return res.status(404).json({ error: "Listing not found" });
    }

    return res.status(200).json({ message: "Listing deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { deleteListing };
