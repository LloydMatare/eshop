import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { Agent, setGlobalDispatcher } from "undici";
import * as schema from "./schema";

setGlobalDispatcher(new Agent({ connect: { port: 443, family: 4 } }));

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
