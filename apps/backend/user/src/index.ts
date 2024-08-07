import { setupTracing, connectDB } from "../../lib/src/otel";
setupTracing("user");

import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import { createUser } from "./createUser";
import { getUser } from "./getUser";
import { patchUser } from "./patchUser";
import { deleteUser } from "./deleteUser";
import { getUserSearchHistory } from "./getUserSearchHistory";
import { deleteUserSearchHistory } from "./deleteUserSearchHistory";
import { login } from "./login";
import { logout } from "./logout";
import { sendConfirmationEmail } from "./sendConfirmationEmail";
import { confirmEmail } from "./confirmEmail";
import { AuthenticatedRequest, authenticate_request } from "../../lib/src/auth";
import cookieParser from "cookie-parser";
import { resetPassword } from "./resetPassword";
import { createNewPassword } from "./createNewPassword";

const PORT = 8211;

const app = express();
const DB_ENDPOINT = process.env.DB_ENDPOINT;

if (!DB_ENDPOINT) {
  console.error("DB_ENDPOINT environment variable is not set");
  process.exit(1);
}

const db = connectDB(DB_ENDPOINT);

app.use(
  morgan("dev", {
    skip: function (req: Request, res: Response) {
      return res.statusCode < 400;
    },
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(authenticate_request);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

// Define endpoints

// Get user search history
app.get("/api/user/search-history", (req: Request, res: Response) =>
  getUserSearchHistory(req as unknown as AuthenticatedRequest, res, db),
);

// Delete user
app.delete("/api/user/search-history", (req: Request, res: Response) =>
  deleteUserSearchHistory(req as unknown as AuthenticatedRequest, res, db),
);

// Send Password reset Email
app.post("/api/user/reset-password", (req: Request, res: Response) =>
  resetPassword(req, res, db),
);

// Update forgotten password
app.patch("/api/user/update-password", (req: Request, res: Response) =>
  createNewPassword(req, res, db),
);

// Login
app.post("/api/user/login", (req: Request, res: Response) =>
  login(req, res, db),
);

// Logout
app.post("/api/user/logout", (req: Request, res: Response) =>
  logout(req, res, db),
);

// Create user
app.post("/api/user", (req: Request, res: Response) =>
  createUser(req, res, db),
);

// Get user
app.get("/api/user/:id", (req: Request, res: Response) =>
  getUser(req, res, db),
);

// Patch user
app.patch("/api/user", (req: Request, res: Response) =>
  patchUser(req as unknown as AuthenticatedRequest, res, db),
);

// Delete user
app.delete("/api/user", (req: Request, res: Response) =>
  deleteUser(req as unknown as AuthenticatedRequest, res, db),
);

// Send Confirmation Email
app.post("/api/user/send-confirmation-email", (req: Request, res: Response) =>
  sendConfirmationEmail(req, res, db),
);

// Confirm Email
app.post("/api/user/confirm-email", (req: Request, res: Response) =>
  confirmEmail(req, res, db),
);

// Healthcheck
app.get("/.well-known/health", (_: Request, res: Response) => {
  return res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

export { app, createUser, getUser, patchUser, deleteUser };
