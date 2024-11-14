import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { TradeDataType } from "./types/TradeDataType";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

interface TradeData {
  id: number;
  action: string;
  type: string;
  stock: string;
  price: number;
  amount: number;
  currency: string;
}

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 4000;
const DData: TradeDataType[] = [];
app.use(cors());

export async function connectToDatabase() {
  const dbFilePath = "./trades.db"; // Path to the SQLite database in the root directory

  try {
    const db = await open({
      filename: dbFilePath,
      driver: sqlite3.Database,
    });

    console.log("Connected to the SQLite database successfully.");
    return db;
  } catch (error) {
    console.error("Error connecting to the SQLite database:", error);
    throw error;
  }
}

app.get("/api", (req: Request, res: Response) => {
  res.send({ message: "Hello from TypeScript and Express server!" });
  res.end();
});
app.get("/admin", async (req: Request, res: Response) => {
  console.log("Request arrived");
  let db;
  try {
    db = await connectToDatabase();

    // Promisified query for better async/await handling
    const rows: TradeData[] = await db.all<TradeData[]>("SELECT * FROM trades");

    res.json(rows);
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).json({ error: "Error fetching data from database" });
  } finally {
    if (db) {
      try {
        await db.close();
        console.log("Database connection closed.");
      } catch (closeError) {
        console.error("Error closing the database connection:", closeError);
      }
    }
  }
});
app.post("/trade", async (req: Request, res: Response) => {
  console.log("Received trade request:");
  const { action, type, stock, price, amount, currency } = req.body;
  const db = await connectToDatabase();

  try {
    await db.run(
      "INSERT INTO trades (action, type, stock, price, amount, currency) VALUES (?, ?, ?, ?, ?, ?)",
      [action, type, stock, price, amount, currency]
    );

    console.log(req.body);
    res.status(201).end();
  } catch (err) {
    console.error("Error saving trade to database:", err);
    res.status(500).json({ error: "Error saving trade to database" });
  }
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
