/* ***** ----------------------------------------------- ***** **
/* ***** Image URL Shortcode 图片宽高处理
/* ***** ----------------------------------------------- ***** */

const absoluteUrl = require("../filters/absoluteUrl.js");
const { URL } = require("url");

const whtieList = [
    'www.1900.live',
    '1900.live',
    'localhost:8080',
    'neodb.social'
]

// 定义一个规范化 URL 的函数
function isWhite(url) {
    try{
        const parsedUrl = new URL(url);
        return whtieList.includes(parsedUrl.host);

    }catch{
        return false;
    }
}

module.exports = (link) => {
    if(isWhite(link)){
        return link;
    }else{
        return `${absoluteUrl("")}/golink/?target=${Buffer.from(
            link,
            "utf-8"
        ).toString("base64")}`;
    }
    
};
