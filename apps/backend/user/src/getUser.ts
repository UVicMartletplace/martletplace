import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { User } from "./models/user";

const getUser = async (req: Request, res: Response, db: IDatabase<object>) => {
  // TODO add JWT auth

  const { id } = req.params;

  const query = `
        SELECT * from users where user_id = ${id}
      `;

  try {
    await db.oneOrNone(query).then((data: User) => {
      if (!data) {
        return res.status(404).json({ error: "User not found" });
      }

      const returnObject = {
        name: data.name,
        username: data.username,
        email: data.email,
        bio: data.bio,
        profileUrl: data.profile_pic_url,
      };

      return res.status(200).send(returnObject);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: (err as Error).message });
  }
};

export { getUser };
