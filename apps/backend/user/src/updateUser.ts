import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

const patchUser = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  // TODO add JWT auth

  const { id } = req.params;
  // const { username, email, name, bio, profile_pic_url, verified } = req.body;
  const { user } = req.body;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  if (
    !user?.username &&
    !user?.email &&
    !user?.name &&
    !user?.bio &&
    !user?.profile_pic_url &&
    !user?.verified
  ) {
    return res
      .status(400)
      .json({ error: "At least one field is required to update" });
  }
  if (id == "1") {
    return res.status(401).json({ error: "Cannot update the default user" });
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

    // Construct patched user!
    const patchedUser = {
      username: user.username || originalUser.username,
      email: user.email || originalUser.email,
      name: user.name || originalUser.name,
      bio: user.bio || originalUser.bio,
      profile_pic_url: user.profile_pic_url || originalUser.profile_pic_url,
      verified: user.verified || originalUser.verified,
    };

    const patchUserQuery = `
        UPDATE users
        SET username = $1, email = $2, name = $3, bio = $4, profile_pic_url = $5, verified = $6
        WHERE user_id = $7
        RETURNING user_id, username, email, name, bio, profile_pic_url, verified, created_at, modified_at;
      `;

    const updated_user = await db.oneOrNone(patchUserQuery, [
      patchedUser.username,
      patchedUser.email,
      patchedUser.name,
      patchedUser.bio,
      patchedUser.profile_pic_url,
      patchedUser.verified,
      id,
    ]);

    if (!user) {
      return res.status(500).json({ error: "User not updated" });
    }

    return res
      .status(200)
      .json({ message: "User updated successfully", updated_user });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
};

export { patchUser };
