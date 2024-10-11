import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Hello from TypeScript and Express server!" });
  res.end();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
