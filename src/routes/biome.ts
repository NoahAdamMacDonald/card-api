import { Hono } from "hono";
import { db } from "../db";
import * as biomeTypes from "../types/biome";

const data = new Hono();

//GET
data.get("/", (c)=> {
    const rows = db
    .query<Pick<biomeTypes.BiomeRow, "id" | "name">, []>(`
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