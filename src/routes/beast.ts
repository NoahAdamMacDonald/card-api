import { Hono } from "hono";
import { db } from "../db";

//endpoint imports
import { createCard } from "../util/createCard";
import { getCardbyId } from "../util/getCardbyId";
import { deleteCard } from "../util/deleteCard";
import { updateCard } from "../util/updateCard";

//config
import { beastPostConfig } from "../config/beast/beastPostConfig";
import { beastGetConfig } from "../config/beast/beastGetConfig";
import { beastDeleteConfig } from "../config/beast/beastDeleteConfig";
import { beastPatchConfig } from "../config/beast/beastPatchConfig";

const data = new Hono();

//GET
data.get("/", (c) => {
	const rows = db
		.query(
			`
        SELECT id, name
        FROM beasts
        ORDER BY id
    `,
		)
		.all();

	return c.json(rows);
});

data.get("/:id", (c) => getCardbyId(c, beastGetConfig));

//POST
data.post("/", (c) => createCard(c, beastPostConfig));

//PATCH
data.patch("/:id", (c) => updateCard(c, beastPatchConfig));

//DELETE
data.delete("/:id", (c) => deleteCard(c, beastDeleteConfig));

export default data;
