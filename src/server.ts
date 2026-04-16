import { Hono } from "hono";
import type { ApplicableRefactorInfo } from "typescript";

//import routes

const app = new Hono();

//app routing


export default(
    port: 3000,
    fetch: app.fetch
);