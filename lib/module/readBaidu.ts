import * as cheerio from "cheerio";
import { getPage } from "./readPage";
import { linkType } from "../lang/linkType";
import { join } from "path";

import * as nodemailer from "@nodemailer/pro";

let transporter = nodemailer.createTransport({
    host: "smtp.163.com",
    port: 465,
    secureConnection: true,
    auth: {
      user: "tl451148156test@163.com",
      pass: "test123"
    }
})
let mailOptions = {
    from: `tl451148156test@163.com`, // sender address
    to: "451148156@qq.com",
    subject: '搜索结果', // Subject line
    text: "Text",
    html: "html"
};


import * as fs from "fs";

let PageLinks: string[] = [];
let PageIndex = 0;
let detailPageLinks: string[] = [];
let btLinks: string[] = [];
let FILEMD5

export function searchKey(keyword: string, email: string) {
    console.log(`开始搜索:${keyword}`);
    FILEMD5 = Date.now();
    getPage(`http://www.baidu.com/s?wd=${encodeURIComponent(keyword)}`)
        .then((body: string) => {
            let $ = cheerio.load(body);
            mailOptions.to = email;
            if (checkHadNextPage($, true)) {
                getAllBaiduPageLinks($, true).then(e => {
                    writeBtLinks();
                }).catch(e => {
                    console.error(`分析分页出错${e}`);
                });
            } else {
                getBaiduPageLink([`http://www.baidu.com/s?wd=${encodeURIComponent(keyword)}`])
            }
        })
}

/**
 * 检查是否还有下一页
 */
function checkHadNextPage($: any, isFirst: boolean) {
    let hasNextEl = $("#page .n");

    return hasNextEl.length > 1 || isFirst;
}

function getAllBaiduPageLinks($: any, isFirst: boolean) {
    let pageLinks = Array.from($("#page a[href]")).map(e => $(e).attr("href"));
    // 去除最后一个链接，因为这个链接是下一页的链接
    pageLinks.pop();

    if (pageLinks.length) {

        /**
         * 检查全局是否有这个链接，没有就保存
         */
        pageLinks.forEach((e: string) => {
            let shortUrl = e.split("&").slice(0,2).join("&");
            if (!(PageLinks.indexOf(shortUrl) >= 0)) {
                PageLinks.push(shortUrl)
            }
        })
    }

    /**
     * 如果爬过的页面比链接数多，那么就开始详细页面的读取，否则就继续爬
     */
    if (checkHadNextPage($, false) || isFirst) {
        setTimeout(() => {
            let nextUrl = `http://www.baidu.com${PageLinks[PageLinks.length - 1]}`;
            PageIndex += PageLinks.length;
            getPage(nextUrl).then((body: string) => {
                let $ = cheerio.load(body);
                console.log(`开始下一个链接(${PageIndex})`);
                return getAllBaiduPageLinks($, false);
            }).catch(e => {
                console.error(e);
            });
        }, Math.random() * 1000 + 1000);
    } else {
        console.log(`开始百度详情页面分析(${PageLinks.length})`);
        return getBaiduPageLink(PageLinks);
    }
}

// 对百度的每一个分页结果进行分析
function getBaiduPageLink(links: string[]) {
    return getPage(`http://www.baidu.com${links.pop()}`).then((body: string) => {
        let $ = cheerio.load(body);
        let detailLinks = Array.from($("#content_left a")).map(e => $(e).attr("href"))
                                .filter(e => !!e).filter(e => e.includes("www.baidu.com/link"));
        
        detailPageLinks.push(...detailLinks);

        isContinue();
    }).catch(e => {
        console.error(`分析百度详细页面出错...${e}`);
        isContinue();
    })

    function isContinue() {
        // 如果链接还有 就继续分析百度的每个页面， 如果没有就开始详情页面
        if (links.length) {
            setTimeout(() => {
                console.log(`继续百度详情页面分析(${links.length})`);
                getBaiduPageLink(links)
            }, Math.random() * 1000 + 1000);
        } else {
            console.log(`开始详情页面分析`);
            return getDetailPage(detailPageLinks).then(() => {
                writeBtLinks();
            });
        }
    }
}

function getDetailPage(links: string[]): Promise<any> {
    return getPage(`${links.pop()}`).then((e: string) => {
        if (e && (typeof e === "string")) {
            let pageLinks = e.match(linkType);

            if (pageLinks && pageLinks.length) {
                btLinks.push(...pageLinks);
                writeBtLinks();      
            }
        }

        isContinue();

    }).catch(e => {
        console.error(`分析详细页面出错...${e}`);
        isContinue();
    });

    function isContinue() {

        if (links.length) {
            console.log(`继续详情页面分析(${links.length})`);
            return getDetailPage(links);
        } else {
            writeBtLinks();
            console.log("完成");
            mailOptions.html = btLinks.join("\n");
            transporter.sendMail(mailOptions,() => {
                console.log("邮件发送");
                initData();
            })
            return Promise.resolve(btLinks);
        }
    }
}

function initData() {
    PageLinks = [];
    detailPageLinks = [];
    btLinks = [];
    PageIndex = 0;
}

function writeBtLinks() {
    fs.writeFile(join(__dirname,"../../output",`output${FILEMD5}.md`),btLinks.join("\n"));
}

function writeLog(str: string[]) {
    fs.writeFile(join(__dirname,"../../",`log/log-${Date.now()}.txt`),str.join("\n"));
}