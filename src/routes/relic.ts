import { Hono } from "hono";
import { db } from "../db";

const data = new Hono();

data.get("/", (c)=> {
    const rows = db
    .query(`
        SELECT id, name
        FROM relics
        ORDER BY id
    `).all();

    return c.json(rows);
});

export default data;