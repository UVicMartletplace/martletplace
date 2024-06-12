import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";

import { run } from "../../lib/example";

const PORT = 8211;

const app = express();
app.use(morgan("dev"));
app.use(express.json());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

app.get("/api/user", (req: Request, res: Response) => {
  run();
  res.send("Hello world");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
