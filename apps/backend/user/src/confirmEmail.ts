import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { verify, JwtPayload } from "jsonwebtoken";

const confirmEmail = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  const code = req.body.code;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  const JWT_PUBLIC_KEY =
    process.env.JWT_PUBLIC_KEY ||
    (() => {
      throw new Error("JWT_PUBLIC_KEY is not set");
    })();

  let decoded: JwtPayload & { user_id: number };

  try {
    decoded = verify(code, JWT_PUBLIC_KEY, {
      algorithms: ["RS256"],
    }) as JwtPayload & { user_id: number };
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Invalid code" });
  }

  // The userId is currently stored incorrectly in the jwt as structured: userId = { user_id: number }
  // This should be updated at some point
  const userId = decoded?.userId?.user_id;

  if (!userId) {
    return res.status(400).json({ error: "Invalid user ID in code" });
  }

  const confirmEmailQuery = `
    UPDATE users
    SET verified = true
    WHERE user_id = $1
  `;

  try {
    await db.none(confirmEmailQuery, [userId]);
    return res.status(200).json({ message: "Email verified" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Email could not be confirmed" });
  }
};

export { confirmEmail };
