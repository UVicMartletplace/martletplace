import axios from "axios";
import { Request, Response } from "express";

const sendConfirmationEmail = async (req: Request, res: Response) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
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
    return res
      .status(500)
      .json({
        error: "Verification email could not be sent, please try again",
      });
  }
};

export { sendConfirmationEmail };
