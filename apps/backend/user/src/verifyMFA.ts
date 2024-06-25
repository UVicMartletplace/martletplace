import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { User } from "./models/user";

import OTPAuth from "otpauth";

const verifyMFA = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  const { email, token } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = await db.oneOrNone<User>(
    "SELECT user_id, username, email, password, secret, name, bio, profile_pic_url, verified FROM users WHERE email = $1",
    [email],
  );

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Verify totp token
  const totp = new OTPAuth.TOTP({
    label: "Martletplace",
    algorithm: "SHA1",
    digits: 6,
    secret: user.secret!,
  });

  const invalid = totp.validate({ token });

  if (!invalid) {
    return res
      .status(200)
      .json({ message: "Valid token, authentication success" });
  } else {
    return res
      .status(401)
      .json({ error: "Invalid token, authentication failed" });
  }
};

export { verifyMFA };
