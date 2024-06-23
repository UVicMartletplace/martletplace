import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

const deleteUser = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  // Change to use auth/JWT
  // if (!authorization) {
  //   return res.status(401).send("Unauthorized");
  // }
  const { id } = req.params;

  if (id == "1") {
    return res.status(401).json({ error: "Cannot delete the default user" });
  }

  const query = `
  BEGIN;

  -- Update messages table to display deleted user
  UPDATE messages
  SET sender_id = 1
  WHERE sender_id = $1;

  UPDATE messages
  SET receiver_id = 1
  WHERE receiver_id = $1;

  -- Update reviews table to display deleted user
  UPDATE reviews
  SET user_id = 1
  WHERE user_id = $1;

  -- Update listings table buyer_id to deleted user
  UPDATE listings
  SET buyer_id = 1
  WHERE buyer_id = $1;

  COMMIT;
`;

  const query2 = `    
-- Delete user
  DELETE FROM users
  WHERE user_id = $1
  RETURNING *;    
  `;

  try {
    await db.none(query, [id]);

    await db.oneOrNone(query2, [id]).then((deletedUser) => {
      if (!deletedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ message: "User deleted successfully" });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: (err as Error).message });
  }
};

export { deleteUser };
