"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
const port = process.env.PORT || 4000;
const DData = [];
app.use((0, cors_1.default)());
async function connectToDatabase() {
    const dbFilePath = "./trades.db"; // Path to the SQLite database in the root directory
    try {
        const db = await (0, sqlite_1.open)({
            filename: dbFilePath,
            driver: sqlite3_1.default.Database,
        });
        console.log("Connected to the SQLite database successfully.");
        return db;
    }
    catch (error) {
        console.error("Error connecting to the SQLite database:", error);
        throw error;
    }
}
app.get("/api", (req, res) => {
    res.send({ message: "Hello from TypeScript and Express server!" });
    res.end();
});
app.get("/admin", async (req, res) => {
    console.log("Request arrived");
    let db;
    try {
        db = await connectToDatabase();
        // Promisified query for better async/await handling
        const rows = await db.all("SELECT * FROM trades");
        res.json(rows);
    }
    catch (error) {
        console.error("Error fetching data from database:", error);
        res.status(500).json({ error: "Error fetching data from database" });
    }
    finally {
        if (db) {
            try {
                await db.close();
                console.log("Database connection closed.");
            }
            catch (closeError) {
                console.error("Error closing the database connection:", closeError);
            }
        }
    }
});
app.post("/trade", async (req, res) => {
    console.log("Received trade request:");
    const { action, type, stock, price, amount, currency } = req.body;
    const db = await connectToDatabase();
    try {
        await db.run("INSERT INTO trades (action, type, stock, price, amount, currency) VALUES (?, ?, ?, ?, ?, ?)", [action, type, stock, price, amount, currency]);
        console.log(req.body);
        res.status(201).end();
    }
    catch (err) {
        console.error("Error saving trade to database:", err);
        res.status(500).json({ error: "Error saving trade to database" });
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
