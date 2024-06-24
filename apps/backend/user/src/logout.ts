import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

const logout = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  const userId = 2;


  return res.status(200).json({ message: "Logged out" });
};

export { logout };
