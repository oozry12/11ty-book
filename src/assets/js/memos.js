import { Marked } from "marked";
// import { markedHighlight } from "marked-highlight";
// import hljs from "highlight.js";

export async function getMemos(url, limit, offset) {
    try {
        const response = await fetch(`${url}&limit=${limit}`);
        var data = {};
        const value = await response.json();
        data = parseMemos(value);
        return data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

// 插入 html
export function parseMemos(data) {
    let TAG_REG = /#([^#\s!.,;:?"'()]+)(?= )/g,
        IMG_REG = /\!\[(.*?)\]\((.*?)\)/g,
        LINK_REG = /(?<!!)\[(.*?)\]\((.*?)\)/g,
        LINE_REG = /\n/g,
        BLOCKQUDTE_REG = /\>.*$/g,
        CODE_REG = /\```.*$/g,
        DOUDB_LINK_REG =
            /(https:\/\/(www|movie|book)\.douban\.com\/(game|subject)\/[0-9]+\/).*?/g,
        NEODB_LINK_REG =
            /(https:\/\/neodb\.social\/(game|movie|tv\/season|book)\/[0-9a-zA-Z]+)(?= )/g,
        BILIBILI_REG2 = /{ bilibili ([0-9a-zA-Z]+) }/g,
        BILIBILI_REG =
            /<a.*?href="https:\/\/www\.bilibili\.com\/video\/((av[\d]{1,10})|(BV([\w]{10})))\/?".*?>.*<\/a>/g,
        NETEASE_MUSIC_REG =
            /<a.*?href="https:\/\/music\.163\.com\/.*id=([0-9]+)".*?>.*<\/a>/g,
        QQMUSIC_REG =
            /<a.*?href="https\:\/\/y\.qq\.com\/.*(\/[0-9a-zA-Z]+)(\.html)?".*?>.*?<\/a>/g,
        QQVIDEO_REG =
            /<a.*?href="https:\/\/v\.qq\.com\/.*\/([a-z|A-Z|0-9]+)\.html".*?>.*<\/a>/g,
        YOUKU_REG =
            /<a.*?href="https:\/\/v\.youku\.com\/.*\/id_([a-z|A-Z|0-9|==]+)\.html".*?>.*<\/a>/g,
        YOUTUBE_REG =
            /<a.*?href="https:\/\/www\.youtube\.com\/watch\?v\=([a-z|A-Z|0-9]{11})\".*?>.*<\/a>/g;

    // Marked Options
    const marked = new Marked();

    marked.use({
        breaks: true
    });

    // Memos Content
    for (var i = 0; i < data.length; i++) {
        let memo = data[i];
        let link = memo.link;
        let avatar = memo.avatar;
        let creatorId = memo.creatorId;
        let creatorName = memo.creatorName;
        let createdTs = memo.createdTs;
        let memosRes = memo.content
            .replace(TAG_REG, "")
            .replace(IMG_REG, "")
            .replace(DOUDB_LINK_REG, "")
            .replace(NEODB_LINK_REG, "")
            .replace(
                LINK_REG,
                `<a class='primary' href='$2' target='_blank'>$1</a>`
            );
        memosRes = marked
            .parse(memosRes)
            .replace(
                BILIBILI_REG,
                `<div class='video-wrapper'><iframe src='//www.bilibili.com/blackboard/html5mobileplayer.html?bvid=$1&as_wide=1&high_quality=1&danmaku=0' scrolling='no' border='0' frameborder='no' framespacing='0' allowfullscreen='true'></iframe></div>`
            )
            .replace(
                BILIBILI_REG2,
                `<div class='video-wrapper'><iframe src='//www.bilibili.com/blackboard/html5mobileplayer.html?bvid=$1&as_wide=1&high_quality=1&danmaku=0' scrolling='no' border='0' frameborder='no' framespacing='0' allowfullscreen='true'></iframe></div>`
            )
            .replace(
                NETEASE_MUSIC_REG,
                `<meting-js auto='https://music.163.com/#/song?id=$1'></meting-js>`
            )
            .replace(
                QQMUSIC_REG,
                `<meting-js auto='https://y.qq.com/n/yqq/song$1.html'></meting-js>`
            )
            .replace(
                QQVIDEO_REG,
                `<div class='video-wrapper'><iframe src='//v.qq.com/iframe/player.html?vid=$1' allowFullScreen='true' frameborder='no'></iframe></div>`
            )
            .replace(
                YOUKU_REG,
                `<div class='video-wrapper'><iframe src='https://player.youku.com/embed/$1' frameborder=0 'allowfullscreen'></iframe></div>`
            )
            .replace(
                YOUTUBE_REG,
                `<div class='video-wrapper'><iframe src='https://www.youtube.com/embed/$1' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen title='YouTube Video'></iframe></div>`
            );
        let transData = memo.content
            .replace(TAG_REG, "")
            .replace(IMG_REG, "")
            .replace(LINK_REG, "$1")
            .replace(LINE_REG, " ")
            .replace(BLOCKQUDTE_REG, "")
            .replace(CODE_REG, "");
        if (transData.length > 140) {
            transData = transData.substring(0, 140) + "...";
        }
        //解析 content 内 md 格式图片
        let imgArr = memo.content.match(IMG_REG);
        let imgStr = String(imgArr).replace(/[,]/g, "");
        if (imgArr) {
            let memosImg = imgStr.replace(
                IMG_REG,
                `<div class="memo-resource width-100"><img class="lozad" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-src="$2"></div>`
            );
            memosRes += `<div class="resource-wrapper"><div class="images-wrapper my-2">${memosImg}</div></div>`;
        }
        // // DoubanDB
        // let doudbArr = memo.content.match(DOUDB_LINK_REG);
        // let neodbDom = '';
        // if(doudbArr){
        //   for(let k=0;k < doudbArr.length;k++){
        //     neodbDom += await fetchNeoDB(doudbArr[k],"douban")
        //   }
        // }
        // DoubanDB
        // let neodbArr = memo.content.match(NEODB_LINK_REG);
        // if(neodbArr){
        //   for(let l=0;l < neodbArr.length;l++){
        //     neodbDom += await fetchNeoDB(neodbArr[l],"neodb")
        //   }
        // }
        //标签
        let tagArr = memo.content.match(TAG_REG);
        if (tagArr) {
            memosTag = tagArr
                .map((t) => {
                    return `<a href="javascript:void">#${String(t
                    ).replace(/[#]/, "")}</a>`;
                })
                .join("");
        } else {
            memosTag = ``;
        }

        memo.content = memosRes;
        memo.tagArr = memosTag;
        data[i] = memo;
    }

    return data;

    //取消这行注释解析豆瓣电影和豆瓣阅读
    //fetchDB()

    // document.querySelector('button.button-load').textContent = '加载更多';
}
// Memos End

// 解析豆瓣 Start
// 文章内显示豆瓣条目 https://immmmm.com/post-show-douban-item/
// 解析豆瓣必须要API，请找朋友要权限，或自己按 https://github.com/eallion/douban-api-rs 这个架设 API，非常简单，资源消耗很少
// 已内置样式，修改 API 即可使用
function fetchDB() {
    var dbAPI = "https://api.example.com/"; // 修改为自己的 API
    var dbA =
        document.querySelectorAll(
            ".timeline a[href*='douban.com/subject/']:not([rel='noreferrer'])"
        ) || "";
    if (dbA) {
        for (var i = 0; i < dbA.length; i++) {
            _this = dbA[i];
            var dbHref = _this.href;
            var db_reg =
                /^https\:\/\/(movie|book)\.douban\.com\/subject\/([0-9]+)\/?/;
            var db_type = dbHref.replace(db_reg, "$1");
            var db_id = dbHref.replace(db_reg, "$2").toString();
            if (db_type == "movie") {
                var this_item = "movie" + db_id;
                var url = dbAPI + "movies/" + db_id;
                if (
                    localStorage.getItem(this_item) == null ||
                    localStorage.getItem(this_item) == "undefined"
                ) {
                    fetch(url)
                        .then((res) => res.json())
                        .then((data) => {
                            let fetch_item = "movies" + data.sid;
                            let fetch_href =
                                "https://movie.douban.com/subject/" +
                                data.sid +
                                "/";
                            localStorage.setItem(
                                fetch_item,
                                JSON.stringify(data)
                            );
                            movieShow(fetch_href, fetch_item);
                        });
                } else {
                    movieShow(dbHref, this_item);
                }
            } else if (db_type == "book") {
                var this_item = "book" + db_id;
                var url = dbAPI + "v2/book/id/" + db_id;
                if (
                    localStorage.getItem(this_item) == null ||
                    localStorage.getItem(this_item) == "undefined"
                ) {
                    fetch(url)
                        .then((res) => res.json())
                        .then((data) => {
                            let fetch_item = "book" + data.id;
                            let fetch_href =
                                "https://book.douban.com/subject/" +
                                data.id +
                                "/";
                            localStorage.setItem(
                                fetch_item,
                                JSON.stringify(data)
                            );
                            bookShow(fetch_href, fetch_item);
                        });
                } else {
                    bookShow(dbHref, this_item);
                }
            }
        } // for end
    }
}

function movieShow(fetch_href, fetch_item) {
    var storage = localStorage.getItem(fetch_item);
    var data = JSON.parse(storage);
    var db_star = Math.ceil(data.rating);
    var db_html =
        "<div class='post-preview'><div class='post-preview--meta'><div class='post-preview--middle'><h4 class='post-preview--title'><a target='_blank' rel='noreferrer' href='" +
        fetch_href +
        "'>《" +
        data.name +
        "》</a></h4><div class='rating'><div class='rating-star allstar" +
        db_star +
        "'></div><div class='rating-average'>" +
        data.rating +
        "</div></div><time class='post-preview--date'>导演：" +
        data.director +
        " / 类型：" +
        data.genre +
        " / " +
        data.year +
        "</time><section class='post-preview--excerpt'>" +
        data.intro.replace(/\s*/g, "") +
        "</section></div></div></div>";
    var db_div = document.createElement("div");
    var qs_href = ".timeline a[href='" + fetch_href + "']";
    var qs_dom = document.querySelector(qs_href);
    qs_dom.parentNode.replaceChild(db_div, qs_dom);
    db_div.innerHTML = db_html;
}

function bookShow(fetch_href, fetch_item) {
    var storage = localStorage.getItem(fetch_item);
    var data = JSON.parse(storage);
    var db_star = Math.ceil(data.rating.average);
    var db_html =
        "<div class='post-preview'><div class='post-preview--meta'><div class='post-preview--middle'><h4 class='post-preview--title'><a target='_blank' rel='noreferrer' href='" +
        fetch_href +
        "'>《" +
        data.title +
        "》</a></h4><div class='rating'><div class='rating-star allstar" +
        db_star +
        "'></div><div class='rating-average'>" +
        data.rating.average +
        "</div></div><time class='post-preview--date'>作者：" +
        data.author +
        " </time><section class='post-preview--excerpt'>" +
        data.summary.replace(/\s*/g, "") +
        "</section></div></div></div>";
    var db_div = document.createElement("div");
    var qs_href = ".timeline a[href='" + fetch_href + "']";
    var qs_dom = document.querySelector(qs_href);
    qs_dom.parentNode.replaceChild(db_div, qs_dom);
    db_div.innerHTML = db_html;
}
// 解析豆瓣 End

// 加载Twikoo评论
// function loadTwikoo(i) {
//     let twikooEnv = i.getAttribute("data-env")
//     let twikooPath = i.getAttribute("data-path")
//     let twikooId = i.getAttribute("data-id")
//     let twikooTime = i.getAttribute("data-time")
//     let twikooDom = document.getElementById(`${Number(twikooTime) + Number(twikooId)}`);
//     let twikooCon = "<div id='twikoo'></div>"
//     if (twikooDom.classList.contains('d-none')) {
//         document.querySelectorAll('.item-comment').forEach((item) => { item.classList.add('d-none'); })
//         if (document.getElementById("twikoo")) {
//             document.getElementById("twikoo").remove()
//         }
//         twikooDom.insertAdjacentHTML('beforeend', twikooCon);
//         twikooDom.classList.remove('d-none');
//         twikoo.init({
//             envId: twikooEnv,
//             el: '#twikoo',
//             path: twikooPath
//         });
//         let memoDom = document.querySelector(`.memo-${Number(twikooTime) + Number(twikooId)}`)
//         window.scrollTo({
//             top: memoDom.offsetTop,
//             behavior: "smooth"
//         });
//     } else {
//         twikooDom.classList.add('d-none');
//         document.getElementById("twikoo").remove()
//     }
// }

export function loadTwikoo(memosId) {
    var twikooDom = document.querySelector(".talk-comments-" + memosId);
    var twikooCon = "<div id='twikoo'></div>";
    if (twikooDom.classList.contains("d-none")) {
        document.querySelectorAll(".twikoo-body").forEach((item) => {
            item.classList.add("d-none");
        });
        if (document.getElementById("twikoo")) {
            document.getElementById("twikoo").remove(); //如果页面中已经有其他Twikoo初始化，则移除。
        }
        twikooDom.insertAdjacentHTML("beforeend", twikooCon);
        twikooDom.classList.remove("d-none");
        twikoo.init({
            envId: "https://comment.1900.live",
            el: "#twikoo",
            path: "https://memos.1900.live/m/" + memosId,
        });
    } else {
        twikooDom.classList.add("d-none");
        document.getElementById("twikoo").remove();
    }
}

export function initMemos2() {
    if (document.getElementsByClassName("talks-more").length == 0) {
        return;
    }

    mconfig = document.getElementsByClassName("talks-more")[0].dataset;
    getMemos(mconfig.limit, mconfig.offset);
    window.Lately && Lately.init({ target: ".date" });
}
