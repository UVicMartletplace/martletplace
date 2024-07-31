import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { User } from "./models/user";
import bcrypt from "bcryptjs";
import { TOTP } from "otpauth";
import { create_token } from "../../lib/src/auth";

const login = async (req: Request, res: Response, db: IDatabase<object>) => {
  const { email, password, totpCode } = req.body;

  if (!email || !password || !totpCode) {
    return res
      .status(400)
      .json({ error: "Email, password and TOTP code are required" });
  }

  try {
    const user = await db.oneOrNone<User>(
      "SELECT user_id, username, email, password, totp_secret, name, bio, profile_pic_url, verified, ignore_charity_listings FROM users WHERE email = $1",
      [email],
    );

    if (process.env.SKIP_USER_VERIFICATION !== "TRUE") {
      const maybePassword = user?.password || "";
      const isPasswordValid = await bcrypt.compare(password, maybePassword);

      if (!isPasswordValid || !user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (!user.verified) {
        return res.status(401).json({ error: "User is not verified" });
      }

      // Verify MFA totp token
      const isValid = await verifyMFA(user, totpCode);
      if (!isValid) {
        return res
          .status(401)
          .json({ error: "Invalid token, authentication failed" });
      }
    }

    // This is needed because the previous user check is conditional on the skip auth flag
    if (!user) {
      return res.status(400).json({ error: "User could not be found" });
    }

    const token = create_token({ userId: user.user_id });
    res.cookie("authorization", token, { httpOnly: true, sameSite: "strict" });

    return res.status(200).json({
      userID: user.user_id,
      username: user.username,
      name: user.name,
      email: user.email,
      bio: user.bio,
      profileUrl: user.profile_pic_url,
      ignoreCharityListings: user.ignore_charity_listings,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const verifyMFA = async (user: User, totp_secret: string) => {
  // Create TOTP from stored secret
  const totp = new TOTP({
    label: "MartletPlace",
    algorithm: "SHA1",
    digits: 6,
    secret: user.totp_secret,
  });

  const tokenDelta = totp.validate({ token: totp_secret });

  return tokenDelta === 0;
};

export { login };
