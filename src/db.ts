import { Database } from "bun:sqlite";

export const db = new Database("/data/database.sqlite");

db.exec(`
    PRAGMA foreign_keys = ON;    
`);