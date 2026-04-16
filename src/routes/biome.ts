import { Hono } from "hono";
import { db } from "../db";

const data = new Hono();

//GET
data.get("/", (c)=> {
    const rows = db
    .query(`
        SELECT id, name
        FROM biomes
        ORDER BY id
    `).all();

    return c.json(rows);
});

//POST

//PATCH

//DELETE

export default data;