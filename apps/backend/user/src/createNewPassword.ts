import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { verify, JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";

const createNewPassword = async (
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

  const id = decoded?.userId?.user_id;

  const password = req.body.password;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  if (id === 1) {
    return res.status(401).json({ error: "Cannot update the base user" });
  }

  const hasDigit = /(?=.*\d)/.test(password);
  const hasLowercase = /(?=.*[a-z])/.test(password);
  const hasUppercase = /(?=.*[A-Z])/.test(password);
  const hasSpecialChar = /(?=.*\W)/.test(password);
  const hasMinLength = password.length >= 8;

  if (
    password !== "" &&
    (!hasDigit ||
      !hasLowercase ||
      !hasUppercase ||
      !hasSpecialChar ||
      !hasMinLength)
  ) {
    return res
      .status(400)
      .json({ error: "Password does not meet constraints" });
  }

  try {
    const getUserQuery = `
        SELECT * FROM users WHERE user_id = $1
      `;
    const originalUser = await db.oneOrNone(getUserQuery, [id]);

    if (!originalUser) {
      return res.status(400).json({ error: "Existing user not found" });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const patchUserQuery = `
        UPDATE users
        SET password = $1
        WHERE user_id = $2
        RETURNING user_id
      `;

    const updated_user = await db.oneOrNone(patchUserQuery, [
      hashedPassword,
      id,
    ]);

    if (!updated_user) {
      return res.status(500).json({ error: "User not updated" });
    }

    return res
      .status(200)
      .json({ message: "User updated successfully"});
  } catch (err: any) {
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { createNewPassword };
