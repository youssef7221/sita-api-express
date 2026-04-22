import app from "./app";
import dotenv from "dotenv";
import { db } from "./db";
import { sql } from "drizzle-orm";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Check DB connection
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1); 
  }
};

startServer();