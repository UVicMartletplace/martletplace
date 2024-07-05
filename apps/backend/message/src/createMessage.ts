import { Response, NextFunction } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

export const useValidateCreateMessage = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const sender_id = req.user.userId;
  const { receiver_id, listing_id, content } = req.body;

  if (!sender_id || !receiver_id || !listing_id || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (sender_id === receiver_id) {
    return res
      .status(400)
      .json({ error: "Sender and receiver cannot be the same" });
  }

  next();
};

export const createMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  try {
    const sender_id = req.user.userId;
    const { receiver_id, listing_id, content } = req.body;

    const result = await db.oneOrNone(
      "INSERT INTO messages (sender_id, receiver_id, listing_id, message_body) VALUES ($1, $2, $3, $4) RETURNING *",
      [sender_id, receiver_id, listing_id, content],
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the message" });
  }
};
