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
	//Filters
	const page = Number(c.req.query("page") ?? 1);
	const limit = Number(c.req.query("limit") ?? 20);
	const name = c.req.query("name") ?? null;
	const evoColor = c.req.query("evoColor") ?? null;
	const minLevel =
		c.req.query("minLevel") !== undefined
			? Number(c.req.query("minLevel"))
			: null;
	const maxLevel =
		c.req.query("maxLevel") !== undefined
			? Number(c.req.query("maxLevel"))
			: null;
	const minId =
		c.req.query("minId") !== undefined ? Number(c.req.query("minId")) : null;
	const maxId =
		c.req.query("maxId") !== undefined ? Number(c.req.query("maxId")) : null;
	const order = c.req.query("order")?.toUpperCase() === "DESC" ? "DESC" : "ASC";
	
	const offset = (page - 1) * limit;
	
	const rows = db
	.query(`
      	SELECT id, name
		FROM beasts
		WHERE (?1 IS NULL OR name LIKE '%' || ?1 || '%')
		AND (?2 IS NULL OR level >= ?2)
		AND (?3 IS NULL OR level <= ?3)
		AND (?4 IS NULL OR evo_color = ?4)
		AND (?5 IS NULL OR id >= ?5)
		AND (?6 IS NULL OR id <= ?6)
		ORDER BY id ${order}
		LIMIT ?7 OFFSET ?8
    `).all(name, minLevel, maxLevel, evoColor, minId, maxId, limit, offset);

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
