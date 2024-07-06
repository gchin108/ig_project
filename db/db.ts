// import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });
// const client = postgres(process.env.DATABASE_URL as string);
// export const db = drizzle(client, { schema, logger: false });
export const db = drizzle(sql, { schema, logger: false });
