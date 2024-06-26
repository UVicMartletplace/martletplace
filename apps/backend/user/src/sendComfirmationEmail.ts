import axios from "axios";
import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

const sendConfirmationEmail = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const query = `
    SELECT user_id FROM users WHERE email = $1
  `;

  let userId;

  try {
    userId = await db.oneOrNone(query, [email]);
    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }

  const subject = "MartletPlace - Please confirm your email";
  const token = "jwttoken";
  const body = `
    <p>Please click the link below to confirm your email</p>
    <a href="http://localhost/confirm/${token}"> Confirm Email </a>   
  `;

  try {
    await axios.post("http://localhost/api/email", {
      to: email,
      subject,
      body,
    });

    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    return res.status(500).json({
      error: "Verification email could not be sent, please try again",
    });
  }
};

export { sendConfirmationEmail };
