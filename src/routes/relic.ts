import { Hono } from "hono";
import { db } from "../db";

//endpoint imports
import { createCard } from "../util/createCard";
import { getCardbyId } from "../util/getCardbyId";
import { deleteCard } from "../util/deleteCard";
import { updateCard } from "../util/updateCard";
import { replaceCard } from "../util/replaceCard";

//config
import { relicPostConfig } from "../config/relic/relicPostConfig";
import { relicGetConfig } from "../config/relic/relicGetConfig";
import { relicDeleteConfig } from "../config/relic/relicDeleteConfig";
import { relicPatchConfig } from "../config/relic/relicPatchConfig";
import { relicPutConfig } from "../config/relic/relicPutConfig";

const data = new Hono();

//GET
data.get("/", (c) => {
	const rows = db
		.query(
			`
        SELECT id, name
        FROM relics
        ORDER BY id
    `,
		)
		.all();

	return c.json(rows);
});

data.get("/:id", (c) => getCardbyId(c, relicGetConfig));

//POST
data.post("/", (c) => createCard(c, relicPostConfig));

//PATCH
data.patch("/:id", (c) => updateCard(c, relicPatchConfig));

//PUT
data.put("/:id", (c) => replaceCard(c, relicPutConfig));

//DELETE
data.delete("/:id", (c) => deleteCard(c, relicDeleteConfig));

export default data;
