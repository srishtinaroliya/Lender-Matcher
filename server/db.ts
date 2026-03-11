import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

// Load environment variables from .env file
dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, using fallback SQLite for development");
  // For development without PostgreSQL, you could use SQLite here
  throw new Error(
    "DATABASE_URL must be set. Please configure your PostgreSQL connection in .env file",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
