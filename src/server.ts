import { Hono } from "hono";
import { serveStatic } from "hono/bun";

//import routes
import beast from "./routes/beast";
import relic from "./routes/relic";
import program from "./routes/program";
import biome from "./routes/biome";

const app = new Hono();

//app routing
app.route("/api/beast", beast);
app.route("/api/relic", relic);
app.route("/api/program", program);
app.route("/api/biome", biome);

//redirect to doc page
app.use("/*", serveStatic({ root: "./public" }));
app.get("/api/*", c => c.redirect("../index.html"));
app.get("*", (c) => c.redirect("./index.html"));


export default{
    port: 3000,
    fetch: app.fetch
};
