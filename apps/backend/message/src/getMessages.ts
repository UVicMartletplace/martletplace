import { Response, NextFunction } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

export const useValidateGetMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const sender_id = req.user.userId;
  const { listing_id, receiver_id } = req.params;
  if (!sender_id || !listing_id || !receiver_id) {
    return res.status(400).json({ error: "Missing required fields" });
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
    const { num_items, offset } = req.query;
    const user_id = req.user.userId;

    const totalCount = await db.query(
      `SELECT COUNT(*) FROM messages 
      WHERE listing_id = $1 AND (receiver_id = $2 AND sender_id = $3) OR (receiver_id = $3 AND sender_id = $2)`,
      [listing_id, receiver_id, user_id],
    );

    const count = totalCount[0].count;

    const messages = await db.query(
      `SELECT message_id, sender_id, receiver_id, listing_id, message_body, created_at FROM messages 
      WHERE listing_id = $1 AND ((receiver_id = $2 AND sender_id = $3) OR (receiver_id = $3 AND sender_id = $2))
      ORDER BY created_at DESC, message_id DESC
      LIMIT $4 OFFSET $5`,
      [listing_id, receiver_id, user_id, num_items, offset],
    );

    res.json({ messages, totalCount: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while getting messages" });
  }
};
