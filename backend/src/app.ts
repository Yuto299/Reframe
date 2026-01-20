import express from "express";
import type { Express, Request, Response } from "express";

const port = 8000;
const app: Express = express();

app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
