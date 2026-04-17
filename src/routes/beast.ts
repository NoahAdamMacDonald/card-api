import { Hono } from "hono";
import { db } from "../db";

//endpoint imports
import { createCard } from "../util/createCard";
import { getCardbyId } from "../util/getCardbyId";
import { deleteCard } from "../util/deleteCard";
import { updateCard } from "../util/updateCard";
import { replaceCard } from "../util/replaceCard";

//config
import { beastPostConfig } from "../config/beast/beastPostConfig";
import { beastGetConfig } from "../config/beast/beastGetConfig";
import { beastDeleteConfig } from "../config/beast/beastDeleteConfig";
import { beastPatchConfig } from "../config/beast/beastPatchConfig";
import { beastPutConfig } from "../config/beast/beastPutConfig";

const data = new Hono();

//GET
data.get("/", (c) => {
	//filters
	const page = Number(c.req.param("page") ?? 1);
	const limit = Number(c.req.param("limit") ?? 20);
	const name = c.req.param("name") ?? null;
	const minLevel = Number(c.req.param("minLevel") ?? null);
	const maxLevel = Number(c.req.param("maxLevel") ?? null);
	const evoColor = c.req.param("evoColor") ?? null;

	const offset = (page - 1) * limit;

    const rows = db
	.query(`
		SELECT id, name
		FROM beasts
		WHERE (?1 IS NULL OR name LIKE '%' || ?1 || '%')
		AND (?2 IS NULL OR level >= ?2)
		AND (?3 IS NULL OR level <= ?3)
		AND (?4 IS NULL OR evo_color = ?4)
		ORDER BY id
		LIMIT ?5 OFFSET ?6
    `,).all(name, minLevel, maxLevel, evoColor, limit, offset);

    return c.json({
		page,
		limit,
		count: rows.length,
		results: rows,
	});
});

data.get("/:id", (c) => getCardbyId(c, beastGetConfig));

//POST
data.post("/", (c) => createCard(c, beastPostConfig));

//PATCH
data.patch("/:id", (c) => updateCard(c, beastPatchConfig));

//PUT
data.put("/:id", (c) => replaceCard(c, beastPutConfig));

//DELETE
data.delete("/:id", (c) => deleteCard(c, beastDeleteConfig));

export default data;
