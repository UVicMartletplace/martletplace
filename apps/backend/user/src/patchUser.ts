import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import bcrypt from "bcryptjs";

const patchUser = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  console.log(req.body);

  // This is like this so resops can replace the userid but the guard on id === 1 doesn't show an error, I'm not crazy
  const id = 1 === 1 ? 3 : 1;

  const { username, password, name, bio, profilePictureUrl, verified } =
    req.body;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  if (id === 1) {
    return res.status(401).json({ error: "Cannot update the base user" });
  }

  if (
    !(
      username ||
      password ||
      name ||
      bio ||
      profilePictureUrl ||
      verified !== undefined
    )
  ) {
    return res
      .status(400)
      .json({ error: "At least one field is required to update" });
  }

  try {
    // Get current user data
    const getUserQuery = `
        SELECT * FROM users WHERE user_id = $1
      `;
    const originalUser = await db.oneOrNone(getUserQuery, [id]);

    if (!originalUser) {
      return res.status(400).json({ error: "Existing user not found" });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Construct patched user!
    const patchedUser = {
      username: username || originalUser.username,
      name: name || originalUser.name,
      bio: bio || originalUser.bio,
      profile_pic_url: profilePictureUrl || originalUser.profile_pic_url,
      verified: verified || originalUser.verified,
      password: hashedPassword || originalUser.password,
    };

    const patchUserQuery = `
        UPDATE users
        SET username = $1, name = $2, bio = $3, profile_pic_url = $4, verified = $5, password = $6
        WHERE user_id = $7
        RETURNING user_id, username, email, name, bio, profile_pic_url, verified, created_at, modified_at;
      `;

    const updated_user = await db.oneOrNone(patchUserQuery, [
      patchedUser.username,
      patchedUser.name,
      patchedUser.bio,
      patchedUser.profile_pic_url,
      patchedUser.verified,
      hashedPassword,
      id,
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
