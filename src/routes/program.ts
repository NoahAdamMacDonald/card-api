import { Hono } from "hono";
import { db } from "../db";

//endpoint imports
import { createCard } from "../util/createCard";
import { getCardbyId } from "../util/getCardbyId";
import { deleteCard } from "../util/deleteCard";
import { updateCard } from "../util/updateCard";
import { replaceCard } from "../util/replaceCard";

//config
import { programPostConfig } from "../config/program/programPostConfig";
import { programGetConfig } from "../config/program/programGetConfig";
import { programDeleteConfig } from "../config/program/programDeleteConfig";
import { programPatchConfig } from "../config/program/programPatchConfig";
import { programPutConfig } from "../config/program/programPutConfig";

const data = new Hono();

//GET
data.get("/", (c) => {
    //Filters
	const page = Number(c.req.query("page") ?? 1);
	const limit = Number(c.req.query("limit") ?? 20);
	const name = c.req.query("name") ?? null;
	const color = c.req.query("color") ?? null;
	const minId =
		c.req.query("minId") !== undefined ? Number(c.req.query("minId")) : null;
	const maxId =
		c.req.query("maxId") !== undefined ? Number(c.req.query("maxId")) : null;

	const order = c.req.query("order")?.toUpperCase() === "DESC" ? "DESC" : "ASC";

	const offset = (page - 1) * limit;

	const rows = db
    .query(`
        SELECT id, name
        FROM programs
        WHERE (?1 IS NULL OR name LIKE '%' || ?1 || '%')
        AND (?2 IS NULL OR color = ?2)
        AND (?3 IS NULL OR id >= ?3)
        AND (?4 IS NULL OR id <= ?4)
        ORDER BY id ${order}
        LIMIT ?5 OFFSET ?6
    `).all(name, color, minId, maxId, limit, offset);

	return c.json({
		page,
		limit,
		count: rows.length,
		results: rows,
	});
});


data.get("/:id", (c) => getCardbyId(c, programGetConfig));

//POST
data.post("/", (c) => createCard(c, programPostConfig));

//PATCH
data.patch("/:id", (c) => updateCard(c, programPatchConfig));

//PUT
data.put("/:id", (c) => replaceCard(c, programPutConfig));

//DELETE
data.delete("/:id", (c) => deleteCard(c, programDeleteConfig));

export default data;
