import { Hono } from "hono";
import { db } from "../db";

//endpoint imports
import { createCard } from "../util/createCard";
import { getCardbyId } from "../util/getCardbyId";
import { deleteCard } from "../util/deleteCard";
import { updateCard } from "../util/updateCard";

//config
import { biomePostConfig } from "../config/biome/biomePostConfig";
import { biomeGetConfig } from "../config/biome/biomeGetConfig";
import { biomeDeleteConfig } from "../config/biome/biomeDeleteConfig";
import { biomePatchConfig } from "../config/biome/biomePatchConfig";

const data = new Hono();

//GET
data.get("/", (c) => {
	const rows = db
		.query(
			`
        SELECT id, name
        FROM biomes
        ORDER BY id
    `,
		)
		.all();

	return c.json(rows);
});

data.get("/:id", (c) => getCardbyId(c, biomeGetConfig));

//POST
data.post("/", (c) => createCard(c, biomePostConfig));

//PATCH
data.patch("/:id", (c) => updateCard(c, biomePatchConfig));

//DELETE
data.delete("/:id", (c) => deleteCard(c, biomeDeleteConfig));

export default data;
