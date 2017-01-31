/**
 * Koa 2 TypeScript Boilerplate
 *
 * 2016 Ændrew Rininsland
 */

// Save your local vars in .env for testing. DO NOT VERSION CONTROL `.env`!.
// if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') require('dotenv').config();

import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as chalk from 'chalk';
import * as path from "path";
import * as fs from "fs";
import { createServer } from "http";

import router from './routes';

const app = new Koa();
const port = process.env.PORT || 5555;

app.use(bodyParser()) 
    .use(async function(ctx,next) {
        if (ctx.url.startsWith("/static")) {
            ctx.body = fs.readFileSync(path.join(__dirname, "../", ctx.url));
            ctx.type = ctx.url.indexOf("css") >= 0 ? "text/css" : "text/plain";
            ctx.status = 200;
        } else {
            await next();
        }
    })
//    .use(require('koa-static')(path.join(__dirname,"./static")))
   .use(router.routes())
   .use(router.allowedMethods());

const server = createServer(app.callback());

server.listen(port, () => console.log(chalk.black.bgGreen.bold(`Listening on port ${port}`)));

export default app;
