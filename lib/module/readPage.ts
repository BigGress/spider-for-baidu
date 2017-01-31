import * as request from "request";
import * as iconv from "iconv-lite"; 

const charsetType = /charset\=[\w]+/g;

export function getPage(url: string) {
    return new Promise(function(resovle, reject) {
        request.get({
            url: url,
            encoding: null,
            timeout: 100 * 1000
        }, function(err, res,body) {
            if (err) {
                reject(err);
            }

            if (res && res.statusCode === 200) {
                let bodyStr = body.toString();
                let code = bodyStr.match(charsetType);
                if (code && code.length) {
                    let type: string = code[0].slice(8,code[0].length).match(/\w+/g)[0];
                    if (type.toUpperCase() === "GB2312") {
                        resovle(iconv.decode(body,type.toUpperCase()));
                    } else {
                        resovle(body);
                    }
                }
                resovle(body);
            }
            resovle(body);
        })
    })
}