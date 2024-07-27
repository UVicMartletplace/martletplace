import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import bcrypt from "bcryptjs";
import { encode } from "hi-base32";
import crypto from "crypto";

// createUser route
const createUser = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  const { username, password, email, name } = req.body;

  if (!username || !password || !email || !name) {
    return res
      .status(400)
      .json({ error: "Username, password, name and email are required" });
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

  // Create MFA token prior to returning user
  const totp_secret = await totpSecretGen();

  const query = `
    INSERT INTO users (username, email, password, totp_secret, name, verified)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING user_id, username, email, totp_secret, name, bio, profile_pic_url;
  `;

  const values = [username, email, hashedPassword, totp_secret, name, false];

  // Insert user into database
  try {
    const user = await db.oneOrNone(query, values);

    if (!user) {
      return res.status(500).json({ error: "User not created" });
    }

    return res.status(201).send(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const totpSecretGen = async () => {
  // Generate secret key for user
  const secret_key = generateBase32Secret();

  // Return secret key
  return secret_key;
};

const generateBase32Secret = () => {
  const buffer = crypto.randomBytes(15);
  const base32secret = encode(buffer).toString().replace(/=/g, "");
  return base32secret.substring(0, 24);
};

export { createUser };
