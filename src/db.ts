import { Database } from "bun:sqlite";

import { beastSchema } from "./schema/beast";
import { biomeSchema } from "./schema/biome";
import { programSchema } from "./schema/program";
import { relicSchema } from "./schema/relic";

export const db = new Database("/data/database.sqlite");

db.run(`PRAGMA foreign_keys = ON;`);

//create tables
db.run(beastSchema);
db.run(biomeSchema);
db.run(programSchema);
db.run(relicSchema);