import { Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

export const deleteCharity = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  try {
    const charityID = req.params.id;

    const result = await db.oneOrNone(
      `DELETE FROM charities 
      WHERE id = $1;`,
      [charityID],
    );
    if (result) {
      res.status(204).json({ message: "Charity deleted successfully" });
    } else {
      res.status(400).json({ error: "Charity not found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the charity" });
  }
};
