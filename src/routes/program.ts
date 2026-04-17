import { Hono } from "hono";
import { db } from "../db";

//endpoint imports
import { createCard } from "../util/createCard";
import { getCardbyId } from "../util/getCardbyId";
import { deleteCard } from "../util/deleteCard";
import { updateCard } from "../util/updateCard";

//config
import { programPostConfig } from "../config/program/programPostConfig";
import { programGetConfig } from "../config/program/programGetConfig";
import { programDeleteConfig } from "../config/program/programDeleteConfig";
import { programPatchConfig } from "../config/program/programPatchConfig";

const data = new Hono();

//GET
data.get("/", (c) => {
	const rows = db
		.query(
			`
        SELECT id, name
        FROM programs
        ORDER BY id
    `,
		)
		.all();

	return c.json(rows);
});

data.get("/:id", (c) => getCardbyId(c, programGetConfig));

//POST
data.post("/", (c) => createCard(c, programPostConfig));

//PATCH
data.patch("/:id", (c) => updateCard(c, programPatchConfig));

//DELETE
data.delete("/:id", (c) => deleteCard(c, programDeleteConfig));

export default data;
