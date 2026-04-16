import { Database } from "bun:sqlite";

export const db = new Database("/data/database.sqlite");

db.run(`PRAGMA foreign_keys = ON;`);