import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";

const PORT = 8214;

const app = express();
app.use(morgan("dev"));
app.use(express.json());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

app.get("/api/message", (req: Request, res: Response) => {
  res.send("Hello world");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
