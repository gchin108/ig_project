import * as dotenv from "dotenv";
import * as schema from "./schema";

// //----------------------------------------------prod  ----------------------------------------------
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";

dotenv.config({ path: ".env" });
export const db = drizzle(sql, { schema, logger: false });
//----------------------------------------------dev  ----------------------------------------------
//dev
// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
// dotenv.config({ path: ".env.local" });

// const client = postgres(process.env.DATABASE_URL as string);
// export const db = drizzle(client, { schema, logger: false });
