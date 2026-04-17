import { db } from "../db";

export function checkExists(
	c: any,
	table: string,
	id: number,
	notFoundMessage: string,
) {
	const row = db.query(`SELECT id FROM ${table} WHERE id = ?`).get(id);

	if (!row) {
		return c.json({ error: notFoundMessage, success: false }, 404);
	}

	return row;
}
