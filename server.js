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

dotenv.config({ path: './.env' });

// Verify environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not defined in .env file!');
  console.error('Please add JWT_SECRET to your .env file');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('ERROR: MONGO_URI is not defined in .env file!');
  console.error('Please add MONGO_URI to your .env file');
  process.exit(1);
}

console.log('Environment variables loaded successfully');
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to remove trailing slashes
app.use((req, res, next) => {
  if (req.path.length > 1 && req.path.endsWith('/')) {
    req.url = req.url.slice(0, -1);
  }
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/api/stock-in", stockInRoutes);
app.use("/api/stock-out", stockOutRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/auth", authRoutes);

app.use("/uploads/StockIn", express.static(path.join(__dirname, "uploads/StockIn")));
app.use("/uploads/StockOut", express.static(path.join(__dirname, "uploads/StockOut")));

app.get("/", (req, res) => {
  res.send("Inventory Management System API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
