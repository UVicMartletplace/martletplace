import { Response, NextFunction } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

export const useValidateGetMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  db: IDatabase<object>,
) => {
  const sender_id = req.user.userId;
  const { listing_id, receiver_id } = req.params;

  if (!sender_id || !listing_id || !receiver_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check that either the user_id or receiver_id is the user id of the listing
  const listing = await db.oneOrNone(
    `SELECT seller_id FROM listings WHERE listing_id = $1`,
    [listing_id],
  );
  if (!listing) {
    return res.status(400).json({ error: "Listing not found" });
  }
  if (sender_id != listing.seller_id && receiver_id != listing.seller_id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

export const getMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  try {
    const { listing_id, receiver_id } = req.params;
    const { num_items, offset } = req.body;
    const user_id = req.user.userId;

    const messages = await db.query(
      `SELECT message_id, sender_id, receiver_id, listing_id, message_body, created_at FROM messages 
      WHERE listing_id = $1 AND ((receiver_id = $2 AND sender_id = $3) OR (receiver_id = $3 AND sender_id = $2))
      ORDER BY created_at DESC, message_id DESC
      LIMIT $4 OFFSET $5`,
      [listing_id, receiver_id, user_id, num_items, offset],
    );

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while getting messages" });
  }
};
