  
import { log, Application, send } from "./deps.ts";

import api from "./api.ts";

const app = new Application();
const PORT = 8000;

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("INFO"),
  },
  loggers: {
    default: {
      level: "INFO",
      handlers: ["console"],
    },
  },
});

app.addEventListener("error", (event) => {
  log.error(event.error);
})

// error handling for the downstream middleware
app.use(async (ctx, next) => {
   try {
     await next();
    } catch(err) {
      log.error(err);
      ctx.response.body = "Internal server error";
      throw err;
    }
})

// next async controls when next piece of mw is caleld
app.use(async (ctx, next) => {
  // codes keep running waiting for the next from the api
  await next();
  const time = ctx.response.headers.get("X-Response-Time");
  log.info(`${ctx.request.method} ${ctx.request.url}: ${time}`);
});

// measuring time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const delta = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${delta}ms`);
});

// ascii art route
app.use(api.routes());
app.use(api.allowedMethods());

// serving file
app.use(async (ctx) => {
  // endpoint
  const filePath = ctx.request.url.pathname;
  const fileWhitelist = [
    "/index.html",
    "/javascripts/script.js",
    "/stylesheets/style.css",
    "/images/favicon.png",
    "/videos/space.mp4",
  ];
  if (fileWhitelist.includes(filePath)) {
    await send(ctx, filePath, {
      root: `${Deno.cwd()}/public`,
    });
  }
});

if (import.meta.main) {
  log.info(`Starting server on port ${PORT}....`);
  await app.listen({
    port: PORT,
  });
}