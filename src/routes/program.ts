import { Hono } from "hono";
import { db } from "../db";
import * as programTypes from "../types/program";

const data = new Hono();

//GET
data.get("/", (c)=> {
    const rows = db
    .query<Pick<programTypes.ProgramRow, "id" | "name">, []>(`
        SELECT id, name
        FROM programs
        ORDER BY id
    `).all();

    return c.json(rows);
});

//POST

//PATCH

//DELETE

export default data;