import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

const confirmEmail = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  const code = req.body.code;
  console.log(code); // here so code is not an unused variable
  const userId = 2; // get from code (jwt token)

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
