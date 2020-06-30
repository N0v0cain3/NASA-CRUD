import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const port = 8000;

app.use(async (ctx) => {
  const filePath = ctx.request.url.pathname;
  const fileWhitelist = [
    "/index.html",
    "/javascripts/script.js",
    "/stylesheets/style.css",
    "/images/favicon.png",
  ];
  if (fileWhitelist.includes(filePath)) {
    await send(ctx, filePath, {
      root: `${Deno.cwd()}/public`,
    });
  }
});

app.listen({ port });
console.log("Listening at 8000");
