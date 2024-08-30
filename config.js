module.exports = {
    mode: {
        dev: {
            url: "http://localhost:8080",
            limit: "20",
            neodb: "https://neodb.190102.xyz?cg=book",
        },
        pro: {
            url: "https://1900.live",
            limit: "all",
            neodb: "https://neodb.190102.xyz",
        },
        cdnUrl: "https://cdn.1900.live",
    },
    customPage: ["archives", "memos", "links","douban","albums","map"],
    ghost: {
        url: "https://cms.1900.live",
        key: "54bae25f075f027aba23d6f657",
        version: "v5.0",
    },
    memos: {
        url: "https://memos.1900.live/api/v1/memo?creatorId=101",
        limit: 10,
        offset: 10,
    },
    //配置合集信息
    taxonomy: [
        {
            name: "节气",
            slug: "jie-qi",
            desc: "24节气是中国劳动人民的智慧和浪漫...",
            tags: ["jie-qi"],
        },
        {
            name: "工具箱",
            slug: "tools",
            desc: "收集的小玩意儿和工具有关的经验分享...",
            tags: [
                "gong-ju-xiang",
                "xiao-he-shuang-pin",
                "chromium",
                "docker",
                "jamstack",
                "memos",
                "nginx",
                "rime",
                "spa",
            ],
        },
    ],
    footer: [
        {
            name: "rss",
            html: "<a href='https://github.com/rebron1900' target='_blank'>Github</a> | <a href='https://1900.live/rss'  target='_blank'>Rss</a>",
        },
        {
            name: "theme",
            html: "Theme: <a href='https://github.com/rebron1900/11ty-book' target='_blank'>11ty-book</a>",
        },
        {
            name: "copyright",
            html: "<a href='https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hans' target='_blank'>CC BY-NC-ND 4.0</a>",
        },
        {
            name: "power",
            html: "Power by <a href='https://www.11ty.dev/' target='_blank'>11ty</a> & <a href='https://www.ghost.org/' target='_blank'>ghost</a>",
        },
        {
            name: "icp",
            html: "<a href='https://beian.miit.gov.cn/' target='_blank'>蜀ICP备16022135号-2</a>",
        },
    ],
    themes: [
        {
            name: "light",
            desc: "月牙白",
            type: "light"
        },
        {
            name: "dark",
            desc: "极夜黑",
            type: "dark"
        },
        {
            name: "yayu",
            desc: "雅余黄",
            type: "dark"
        },
        {
            name: "yuhang",
            desc: "昱行粉",
            type: "dark"
        },
        {
            name: "herblue",
            desc: "她的蓝",
            type: "dark"
        },
        {
            name: "onojyun",
            desc: "莫比乌斯",
            type: "light"
        },
        {
            name: "auto",
            desc: "自适应",
            type: "auto"
        },
    ],
};
