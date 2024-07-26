import axios from "axios";
import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { create_token } from "../../lib/src/auth";

const resetPassword = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const query = "SELECT user_id FROM users WHERE email = $1";

  let userId;

  try {
    userId = await db.oneOrNone(query, [email]);
    if (!userId) {
      return res.status(200).json({ error: "User not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }

  const subject = "MartletPlace - Reset your password";
  const token = create_token({ userId: userId }, "/api/user/update-password");
  const body = `
    <p>Please click the link below to reset your password</p>
    <a href="http://localhost/create-new-password/${token}"> Reset Password </a>   
  `;

  try {
    await axios.post(`${process.env.EMAIL_ENDPOINT}`, {
      to: email,
      subject,
      body,
    });

    return res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Reset password email could not be sent, please try again",
    });
  }
};

export { resetPassword };
