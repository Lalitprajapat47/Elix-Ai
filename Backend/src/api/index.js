import "dotenv/config";
import app from "../src/app.js";
import connectDB from "../src/config/database.js";

export default async function handler(req, res) {
    try {
        await connectDB();
    } catch (err) {
        console.error("MongoDB connection failed:", err);
        return res.status(500).json({ message: "Database connection failed" });
    }

    return app(req, res);
}