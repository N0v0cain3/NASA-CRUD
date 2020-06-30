import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const port = 8000;

app.listen({ port });
console.log("Listening at 8000");
