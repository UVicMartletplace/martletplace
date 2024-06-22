import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { User } from "./models/user";

const createUser = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  const { username, password, email, name, bio, profile_pic_url } = req.body.user;

  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ error: "Username, password, and email are required" });
  }

  const query = `
        INSERT INTO users (username, email, password, name, bio, profile_pic_url, verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING user_id, username, email, name, bio, profile_pic_url, verified, created_at, modified_at;
      `;

  const values = [username, password, email, name, bio, profile_pic_url, false];

  try {
    await db.oneOrNone(query, values).then((data: User) => {
      if (!data) {
        return res.status(500).json({ error: "User not created" });
      }

      return res.status(201).send(data);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: (err as Error).message });
  }
};

export { createUser };
