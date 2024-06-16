import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import pgPromise from "pg-promise";
import { User } from "./models/user";

const PORT = 8211;

const app = express();
const pgp = pgPromise();
const DB_ENDPOINT = process.env.DB_ENDPOINT;

if (!DB_ENDPOINT) {
  console.error("DB_ENDPOINT environment variable is not set");
  process.exit(1);
}

const db = pgp(DB_ENDPOINT);

app.use(morgan("dev"));
app.use(express.json());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password, email, name, bio, profile_pic_url } = req.body;

  if (!username || !password || !email) {
    return res.status(400).send("Username, password, and email are required");
  }

  const query = `
      INSERT INTO users (username, email, password, name, bio, profile_pic_url, verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id, username, email, name, bio, profile_pic_url, verified, created_at, modified_at;
    `;

  const values = [username, password, email, name, bio, profile_pic_url, false];

  await db
    .oneOrNone(query, values)
    .then((data: User) => {
      if (!data) {
        throw new Error("User not created");
      }

      return res.status(201).send(data);
    })
    .catch((err: Error) => {
      return next(err);
    });
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  // TODO add JWT auth

  const { id } = req.params;

  const query = `
      SELECT * from users where user_id = ${id}
    `;

  await db
    .oneOrNone(query)
    .then((data: User) => {
      if (!data) {
        return res.status(400).send("User not found");
      }

      return res.status(200).send(data);
    })
    .catch((err: Error) => {
      return next(err);
    });
};

const patchUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // TODO add JWT auth

  const { id } = req.params;
  const { username, email, name, bio, profile_pic_url, verified } = req.body;

  try {
    // Get current user data
    const getUserQuery = `
      SELECT * FROM users WHERE user_id = $1
    `;
    const originalUser = await db.oneOrNone(getUserQuery, [id]);

    if (!originalUser) {
      return res.status(400).send("User not found");
    }

    // Construct patched user!
    const patchedUser = {
      username: username || originalUser.username,
      email: email || originalUser.email,
      name: name || originalUser.name,
      bio: bio || originalUser.bio,
      profile_pic_url: profile_pic_url || originalUser.profile_pic_url,
      verified: verified || originalUser.verified,
    };

    const patchUserQuery = `
      UPDATE users
      SET username = $1, email = $2, name = $3, bio = $4, profile_pic_url = $5, verified = $6
      WHERE user_id = $7
      RETURNING user_id, username, email, name, bio, profile_pic_url, verified, created_at, modified_at;
    `;

    const updatedUser = await db.oneOrNone(patchUserQuery, [
      patchedUser.username,
      patchedUser.email,
      patchedUser.name,
      patchedUser.bio,
      patchedUser.profile_pic_url,
      patchedUser.verified,
      id,
    ]);

    if (!updatedUser) {
      return res.status(400).send("User not updated");
    }

    return res.status(200).send(updatedUser);
  } catch (err) {
    return next(err);
  }
};

const deleteUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization;
  // Change to use auth/JWT
  // if (!authorization) {
  //   return res.status(401).send("Unauthorized");
  // }
  const { id } = req.params;

  const query = `
    DELETE FROM users
    WHERE user_id = $1
    RETURNING *;
  `;

  await db
    .oneOrNone(query, [id])
    .then((data) => {
      if (!data) {
        return res.status(404).send("User not found");
      }
      return res.status(200).send("User deleted successfully");
    })
    .catch((err) => {
      return next(err);
    });
};

// Create user
app.post("/api/user", createUser);

// Get user
app.get("/api/user/:id", getUserById);

// Patch user
app.patch("/api/user/:id", patchUserById);

// Delete user
app.delete("/api/user/:id", deleteUserById);

app.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

export { app, createUser, getUserById, patchUserById, deleteUserById };
