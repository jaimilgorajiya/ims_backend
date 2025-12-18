import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./db/db.js";
import stockInRoutes from "./routes/StockIn.Route.js";
import stockOutRoutes from "./routes/StockOut.Route.js";
import stockRoutes from "./routes/Stock.Route.js";
import recordsRoutes from "./routes/Records.Route.js";
import authRoutes from "./routes/Auth.Route.js";

// Load environment variables (Railway compatible)
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "*"
}));
app.use(express.json());

// Remove trailing slashes
app.use((req, res, next) => {
  if (req.path.length > 1 && req.path.endsWith("/")) {
    req.url = req.url.slice(0, -1);
  }
  next();
});

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect Database
connectDB();

// Routes
app.use("/api/stock-in", stockInRoutes);
app.use("/api/stock-out", stockOutRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/auth", authRoutes);

// Static folders
app.use("/uploads/StockIn", express.static(path.join(__dirname, "uploads/StockIn")));
app.use("/uploads/StockOut", express.static(path.join(__dirname, "uploads/StockOut")));

// Health check
app.get("/", (req, res) => {
  res.send("Inventory Management System API is running 🚀");
});

// Start server (Railway uses its own PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
