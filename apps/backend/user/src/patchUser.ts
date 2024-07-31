import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import bcrypt from "bcryptjs";
import { AuthenticatedRequest } from "../../lib/src/auth";

const patchUser = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  const id = req.user.userId;

  const {
    username,
    password,
    name,
    bio,
    profilePictureUrl,
    ignoreCharityListings,
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  if (id === 1) {
    return res.status(401).json({ error: "Cannot update the base user" });
  }

  if (!(username || password || name || bio || profilePictureUrl)) {
    return res
      .status(400)
      .json({ error: "At least one field is required to update" });
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

    const patchedUser = {
      username: username || originalUser.username,
      name: name || originalUser.name,
      bio: bio || originalUser.bio,
      profile_pic_url: profilePictureUrl || originalUser.profile_pic_url,
      password: hashedPassword || originalUser.password,
      ignore_charity_listings:
        ignoreCharityListings || originalUser.ignore_charity_listings,
    };

    const patchUserQuery = `
        UPDATE users
        SET username = $1, name = $2, bio = $3, profile_pic_url = $4, password = $5, ignore_charity_listings = $7
        WHERE user_id = $6
        RETURNING user_id, username, email, name, bio, profile_pic_url, ignore_charity_listings;
      `;

    const updated_user = await db.oneOrNone(patchUserQuery, [
      patchedUser.username,
      patchedUser.name,
      patchedUser.bio,
      patchedUser.profile_pic_url,
      patchedUser.password,
      id,
      patchedUser.ignore_charity_listings,
    ]);

    if (!updated_user) {
      return res.status(500).json({ error: "User not updated" });
    }

    const returnObject = {
      username: updated_user.username,
      email: updated_user.email,
      name: updated_user.name,
      bio: updated_user.bio,
      profileUrl: updated_user.profile_pic_url,
      id: updated_user.user_id,
      ignoreCharityListings: updated_user.ignore_charity_listings,
    };

    return res
      .status(200)
      .json({ message: "User updated successfully", user: returnObject });
  } catch (err: any) {
    if (
      err?.message.includes("duplicate key value violates unique constraint")
    ) {
      return res.status(400).json({ error: "Username already exists" });
    }
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { patchUser };
