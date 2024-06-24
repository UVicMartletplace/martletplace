import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { User } from "./models/user";
import bcrypt from "bcryptjs";

// createUser route
const createUser = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  const { username, password, email, name, bio, profile_pic_url } = req.body;

  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ error: "Username, password, and email are required" });
  }

  const hasDigit = /(?=.*\d)/.test(password);
  const hasLowercase = /(?=.*[a-z])/.test(password);
  const hasUppercase = /(?=.*[A-Z])/.test(password);
  const hasSpecialChar = /(?=.*\W)/.test(password);
  const hasMinLength = password.length >= 8;

  if (
    !hasDigit ||
    !hasLowercase ||
    !hasUppercase ||
    !hasSpecialChar ||
    !hasMinLength
  ) {
    return res
      .status(400)
      .json({ error: "Password does not meet constraints" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO users (username, email, password, name, bio, profile_pic_url, verified)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING user_id, username, email, name, bio, profile_pic_url, verified, created_at, modified_at;
  `;

  const values = [
    username,
    email,
    hashedPassword,
    name,
    bio,
    profile_pic_url,
    false,
  ];

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
