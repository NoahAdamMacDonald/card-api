import { Hono } from "hono";
import type { ApplicableRefactorInfo } from "typescript";

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

export default{
    port: 3000,
    fetch: app.fetch
};
