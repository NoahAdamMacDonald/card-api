import { Database } from "bun:sqlite";

import { beastSchema } from "./schema/beast";
import { biomeSchema } from "./schema/biome";
import { programSchema } from "./schema/program";
import { relicSchema } from "./schema/relic";

import { existsSync, mkdirSync } from "node:fs";

const DATA_DIR = "/app/data";

//create data folder
if (!existsSync(DATA_DIR)) {
	mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new Database(`${DATA_DIR}/database.sqlite`);

db.run(`PRAGMA foreign_keys = ON;`);

//create tables
db.run(beastSchema);
db.run(biomeSchema);
db.run(programSchema);
db.run(relicSchema);