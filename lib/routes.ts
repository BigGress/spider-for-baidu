/**
 * Koa 2 routes
 */

import * as Router from 'koa-router';
import {Request} from 'koa';
import * as chalk from 'chalk';
import {readFile, readFileSync, writeFile} from "fs";
import * as path from "path";
import { searchKey } from "./module/readBaidu";
import * as cluster from "cluster";
import * as Threads from "webworker-threads";

const router = new Router();

/**
 * Index page. Currently doesn't do anything. ¯\_(ツ)_/¯
 */
router.get('/', async (ctx, next) => {
  await next();
  ctx.body = readFileSync(path.join(__dirname,"./pages/index.html"),"utf-8")
  ctx.status = 200;
});

router.post("/send", async function(ctx, next) {
  await next();
  let request: any = ctx["request"];
  let key: string = request.body.key;
  let mail = request.body.mail;

  searchKey(key,mail);
  ctx.body = {
    msg: "开始搜索"
  }
  ctx.status = 200;
});

// router.post("/test", async function(ctx, next) {
//   await next();
//   transporter.sendMail(mailOptions, (err) => {
//     if (err) {
//       console.error(err);
//       ctx.body = "内部错误";
//       ctx.status = 500;
//     }

//     ctx.body = "ok";
//     ctx.status = 200;
//   });
// })

export default router;

interface IKoaRequestWithBody extends Router.IRouterContext {
  request: IKoaBodyParserRequest;
}

interface IKoaBodyParserRequest extends Request {
  body: any;
}
