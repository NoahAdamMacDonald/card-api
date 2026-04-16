import { Hono } from "hono";
import { db } from "../db";

const data = new Hono();

//GET
data.get("/", (c)=> {
    const rows = db
    .query(`
        SELECT id, name
        FROM beasts
        ORDER BY id
    `).all();

    return c.json(rows);
});

data.get("/:id", (c) => {
    const id = Number(c.req.param("id"))

    //base level
    const base = db
    .query(`
        SELECT id, name, play_cost, level, bts, evo_cost, evo_color
        FROM beasts where id = ?
    `).get(id);

});

//POST

//PATCH

//DELETE

export default data;