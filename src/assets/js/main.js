import "../sass/book.scss";

import Alpine from "alpinejs";
import mediumZoom from "medium-zoom";
import search from "./search";
import Artalk from "./ArtalkLite";
import { initCopyButton } from "./code.js";
import initMap from "./map.js";
import tippy from "tippy.js";
import initWebSocket from "./actives.js";

import { getMemos, parseMemos } from "./memos.js";

// var apiUrl = "https://api.1900.live";
var apiUrl = "http://localhost:3000";


window.Alpine = Alpine;
Alpine.data("theme", () => ({
    themeName: localStorage.name,
    changeTheme: changeTheme,
    setName: function () {
        this.themeName = localStorage.name;
    },
}));
Alpine.data("memos", () => ({
    data: {},
    limit: 0,
    offset: 0,
    url: "",
    getMemoss: function () {
        this.data = getMemos(this.url, this.limit, this.offset);
    },
    loadmore: function () {
        this.offset = this.offset + this.offset;
        this.limit = this.limit + this.limit;
        this.getMemoss();
    },
    initZoom: initZoom,
}));
Alpine.data("post_action", () => ({
    apiUrl: apiUrl,
    like: (post_id) => {
        var likelist = localStorage.getItem("lieklist") || "";
        var likeButton = document.querySelector(".post_like");
        var likeText = document.querySelector(".post_likes");

        if (likelist.indexOf(post_id + ",") != -1) {
            console.log("你已经点过赞了");
            likeButton.classList.add("active");
        } else {
            fetch(`${apiUrl}/post/${post_id}/like`, { method: "post" })
                .then((res) => {
                    return res.json();
                })
                .then((data) => {
                    console.log("点赞成功" + JSON.stringify(data));
                    localStorage.setItem("lieklist", likelist + post_id + ",");
                    likeButton.classList.add("active");
                    likeText.innerText = data.likes
                })
                .catch((error) => {
                    console.error(
                        "There was a problem with the fetch operation:",
                        error
                    );
                });
        }
    },
    initLike: (post_id) => {
        var likelist = localStorage.getItem("lieklist") || "";
        var likeButton = document.querySelector(".post_like");
        var likeText = document.querySelector(".post_likes");
        if (likelist.indexOf(post_id + ",") != -1) {
            likeButton.classList.add("active");
        }
        fetch(`${apiUrl}/post/${post_id}/like`)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                if (data.likes) {
                    likeButton.dataset.like = data.likes;
                    likeText.innerText = data.likes;
                }else{
                    likeButton.dataset.like = 0;
                    likeText.innerText = 0; 
                }
            }).catch((error) => {
                likeButton.dataset.like = 0;
                likeText.innerText = 0;
                console.error(
                    "There was a problem with the fetch operation:",
                    error
                );
            });
        return true;
    },
    initViews: (post_id) => {
        var viewlist = localStorage.getItem("viewlist") || "";
        var viewText = document.querySelector(".post_views");

        if (viewlist.indexOf(post_id + ",") != -1) {
            fetch(`${apiUrl}/post/${post_id}/views`)
                .then((res) => {
                    return res.json();
                })
                .then((data) => {
                    if (data.Views) {
                        viewText.innerText = data.Views;
                    }else{
                        viewText.innerText = 0; 
                    }

                });
        } else {
            fetch(`${apiUrl}/post/${post_id}/views`, { method: "post" })
                .then((res) => {
                    return res.json();
                })
                .then((data) => {
                    console.log("浏览量" + JSON.stringify(data));
                    localStorage.setItem("viewlist", viewlist + post_id + ",");
                    viewText.innerText = data.Views;
                })
                .catch((error) => {
                    viewText.innerText = 0;
                    console.error(
                        "There was a problem with the fetch operation:",
                        error
                    );
                });
        }

        return true;
    },
}));

Alpine.data("douban", () => ({
    change: function (type) {
        // 选择所有具有data-itemtype属性的元素
        const elements = document.querySelectorAll("[data-itemtype]");

        // 遍历这些元素
        elements.forEach(function (el) {
            // 检查data-itemtype的值是否不等于'book'
            const t = el.getAttribute("data-itemtype");
            if (type == "all") {
                el.style.display = "";
                return;
            }
            if (t !== type) {
                // 如果不等于，隐藏该元素
                el.style.display = "none";
            } else {
                el.style.display = "";
            }
        });
        this.hidden();
    },
    hidden: function () {
        const cardElements = document.querySelectorAll(".db--listBydate");

        cardElements.forEach(function (card) {
            // 检查db--dateList__card类下的子元素是否全部被隐藏
            let allHidden = true;
            card.querySelectorAll(".db--item").forEach(function (dateListCard) {
                // 如果存在任何未隐藏的子元素，则将allHidden设置为false
                if (dateListCard.style.display !== "none") {
                    allHidden = false;
                    card.style.display = "";
                }
            });

            // 如果所有子元素都被隐藏，则隐藏db--list__card元素
            if (allHidden) {
                card.style.display = "none";
            }
        });
    },
    active: function (el) {
        document.querySelectorAll(".db--navItem").forEach(function (item) {
            item.classList.remove("current");
        });
        el.currentTarget.classList.add("current");
    },
}));

Alpine.start();
//init kg-gallery-image

var gallery = document.querySelectorAll(".kg-gallery-image img");
gallery.forEach(function (e) {
    var l = e.closest(".kg-gallery-image"),
        a = e.attributes.width.value / e.attributes.height.value;
    l.style.flex = a + " 1 0%";
});

function initZoom() {
    mediumZoom(".markdown img", {
        background: "rgba(0,0,0,0.75)",
    });
    // this.$nextTick(() => {
    //     mediumZoom(".markdown img", {
    //         background: "rgba(0,0,0,0.75)",
    //     });
    // });
    return;
}

search();
initZoom();
initCopyButton();
initMap();
initWebSocket();

if (navigator.serviceWorker) {
    navigator.serviceWorker.register(location.origin + "/sw.js", {
        scope: location.origin,
    });
}

if (
    commentinfo.type == "artalk" &&
    document.getElementById("comments") != null
) {
    window.artalk = Artalk.init({
        el: commentinfo.el, // 绑定元素的 Selector
        server: commentinfo.server, // 后端地址
        site: commentinfo.name, // 你的站点名
    });
    artalk.on("list-loaded", function () {
        // 添加博主样式
        var badges = document.querySelectorAll(".atk-badge");

        // 遍历这些atk-badge元素
        badges.forEach(function (badge) {
            // 检查元素的文本内容是否为'Admin'
            if (badge.textContent === "Admin") {
                // 获取最近的atk-main父元素
                var mainElement = badge.closest(".atk-main");
                // 检查是否找到了atk-main元素
                if (mainElement) {
                    // 获取atk-main元素的父元素，并为其添加atk-admin类
                    mainElement.parentNode.classList.add("atk-admin");
                }
            }
        });
        changeTheme(localStorage.theme, localStorage.name);
    });
}

function changeTheme(theme, name) {
    if (theme == "auto") {
        document.documentElement.setAttribute("class", "");
        const prefersDarkScheme = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;
        // if (window.artalk) window.artalk.setDarkMode(prefersDarkScheme);
    } else {
        // 切换主题并存储到localStorage
        document.documentElement.setAttribute("class", theme);
        // if (window.artalk)
        //     window.artalk.setDarkMode(theme === "dark" ? true : false);
    }
    localStorage.theme = theme;
    localStorage.name = name;
}

// // 隐藏所有非当前类型的元素
const cardElements = document.querySelectorAll(".db--listBydate");

cardElements.forEach(function (card) {
    // 检查db--dateList__card类下的子元素是否全部被隐藏
    let allHidden = true;
    card.querySelectorAll(".db--item").forEach(function (dateListCard) {
        // 如果存在任何未隐藏的子元素，则将allHidden设置为false
        if (dateListCard.style.display !== "none") {
            allHidden = false;
        }
    });

    // 如果所有子元素都被隐藏，则隐藏db--list__card元素
    if (allHidden) {
        card.style.display = "none";
    }
});

const title = tippy(".actives img", {
    placement: "right",
    maxWidth: 300,
});

tippy(".db--icon-comment", {
    placement: "bottom",
    maxWidth: 300,
});

window.activeTippy = title;
window.tippy = tippy;
