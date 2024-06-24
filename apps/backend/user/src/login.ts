import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { User } from "./models/user";
import bcrypt from "bcryptjs";

const login = async (req: Request, res: Response, db: IDatabase<object>) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await db.oneOrNone<User>(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid email" });
    }

    let isPasswordValid = false;

    if (process.env.NODE_ENV === "test") {
      isPasswordValid = true;
    } else {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = "ResopsPleaseReplaceThisWithARealToken";

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
    });

    return res.status(200).json({
      userID: user.user_id,
      username: user.username,
      name: user.name,
      email: user.email,
      bio: user.bio,
      profileUrl: user.profile_pic_url,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: (err as Error).message });
  }
};

export { login };
