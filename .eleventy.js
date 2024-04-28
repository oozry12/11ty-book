/* ***** ----------------------------------------------- ***** **
/* ***** Eleventy Config
/* ***** ----------------------------------------------- ***** */

// Import transforms
const parseContent = require("./eleventy/transforms/parseContent.js");
const minifyHtml = require("./eleventy/transforms/minifyHtml.js");
// const addHeaderCredit = require("./eleventy/transforms/addHeaderCredit.js");

// // Import filters
const absoluteUrl = require("./eleventy/filters/absoluteUrl.js");
const cacheBust = require("./eleventy/filters/cacheBust.js");
const htmlDate = require("./eleventy/filters/htmlDate.js");
// const readableDate = require("./eleventy/filters/readableDate.js");
const rssLastUpdatedDate = require("./eleventy/filters/rssLastUpdatedDate.js");
// const rssDate = require("./eleventy/filters/rssDate.js");
const articleUrl = require("./eleventy/filters/articleUrl.js");
const articleCategoryUrl = require("./eleventy/filters/articleCategoryUrl.js");
// const highlight = require("./eleventy/filters/highlight.js");
const groupbydate = require("./eleventy/filters/groupbydate.js");
const doubanGroupbydate = require("./eleventy/filters/doubanGroupbydate.js");
const usMonth = require("./eleventy/filters/usMonth.js");

const albums = require("./eleventy/filters/albums.js");

const fontmin = require("./eleventy/utilities/minfont.js");

// // Import shortcodes
// // const imageUrl = require("./eleventy/shortcodes/imageUrl.js");
// const imageSrcset = require("./eleventy/shortcodes/imageSrcset.js");
// const isSamePageOrSection = require("./eleventy/shortcodes/isSamePageOrSection.js");
const svg = require("./eleventy/shortcodes/svg.js");
// const currentYear = require("./eleventy/shortcodes/currentYear.js");

const toc = require("./eleventy/shortcodes/toc.js");

const excerpt = require("./eleventy/filters/excerpt.js");

const ghostContentAPI = require("@tryghost/content-api");
const {
    ghost,
    memos,
    mode,
    customPage,
    taxonomy,
    footer,
    themes,
} = require("./config.js");

// Init Ghost API
const api = new ghostContentAPI({ ...ghost });

// const pd = require("pandas");

// const axios = require("axios");

const loadData = mode[process.env.NODE_ENV.trim()].limit;
const fluxToken = process.env.FLUX_TOKEN;

module.exports = function (config) {
    config.addTransform("parseContent", parseContent);
    if (process.env.NODE_ENV.trim() != "dev") {
        config.addTransform("minifyHtml", minifyHtml);
    }
    // Filters
    config.addFilter("excerpt", excerpt);
    config.addFilter("absoluteUrl", absoluteUrl);
    config.addFilter("cacheBust", cacheBust);
    config.addFilter("htmlDate", htmlDate);
    //   config.addFilter("readableDate", readableDate);
    config.addFilter("rssLastUpdatedDate", rssLastUpdatedDate);
    //   config.addFilter("rssDate", rssDate);
    config.addFilter("articleUrl", articleUrl);
    config.addFilter("articleCategoryUrl", articleCategoryUrl);
    //   config.addFilter("highlight", highlight);
    //   config.addFilter("getReadingTime", (text) => {
    //     const wordsPerMinute = 200;
    //     const numberOfWords = text.split(/\s/g).length;
    //     return Math.ceil(numberOfWords / wordsPerMinute);
    //   });
    config.addFilter("groupbydate", groupbydate);
    config.addFilter("doubanGroupbydate", doubanGroupbydate);
    config.addFilter("usMonth", usMonth);
    config.addFilter("testaaa", albums);

    //   // Shortcodes
    //   // config.addShortcode("imageUrl", imageUrl);
    //   config.addShortcode("imageSrcset", imageSrcset);
    //   config.addShortcode("isSamePageOrSection", isSamePageOrSection);
    config.addShortcode("svg", svg);
    //   config.addShortcode("currentYear", currentYear);
    config.addFilter("tocGen", toc);

    // Layout aliases
    // config.addLayoutAlias("base", "layouts/base.liquid");

    config.addFilter("getReadingTime", (text) => {
        const wordsPerMinute = 200;
        const numberOfWords = text.split(/\s/g).length;
        return Math.ceil(numberOfWords / wordsPerMinute);
    });

    // Don't ignore the same files ignored in the git repo
    config.setUseGitIgnore(false);

    config.addGlobalData("taxonomys", taxonomy);
    config.addGlobalData("footer", footer);
    config.addGlobalData("memos", memos);
    config.addGlobalData("themes", themes);
    config.addGlobalData("site_url", mode[process.env.NODE_ENV.trim()]);

    // Get all pages, called 'docs' to prevent
    // conflicting the eleventy page object
    config.addCollection("docs", async function (collection) {
        collection = await api.pages
            .browse({
                include: "tags,authors",
                limit: "all",
            })
            .catch((err) => {
                console.error(err);
            });
        //过滤掉自定义页面
        collection = collection.filter(function (page) {
            return !customPage.includes(page.slug);
        });

        return collection;
    });

    // Get all pages, called 'docs' to prevent
    // conflicting the eleventy page object
    config.addCollection("docs-all", async function (collection) {
        collection = await api.pages
            .browse({
                include: "tags,authors",
                limit: "all",
            })
            .catch((err) => {
                console.error(err);
            });

        return collection;
    });

    // Get all posts
    config.addCollection("posts", async function (collection) {
        collection = await api.posts
            .browse({
                include: "tags,authors",
                limit: loadData,
                order: "published_at desc",
                filter: "visibility:public",
            })
            .catch((err) => {
                console.error(err);
            });
        const titleText = collection
            .map(function (item) {
                let tags = item.tags.map(tag => tag.name).join(',');
                let desc = item.excerpt != null ? item.excerpt.substring(0,100) : '';
                return item.title + desc +tags;
            })
            .join(",");

        fontmin(titleText);

        return collection;
    });

    // Get all albums
    config.addCollection("albums", async function (collection) {
        collection = await api.posts
            .browse({
                include: "tags,authors",
                limit: loadData,
                order: "published_at desc",
                filter: "visibility:public+tag:hash-album",
            })
            .catch((err) => {
                console.error(err);
            });

        return collection;
    });

    // Get all authors
    config.addCollection("authors", async function (collection) {
        collection = await api.authors
            .browse({
                limit: "all",
                filter: "visibility:public",
            })
            .catch((err) => {
                console.error(err);
            });

        // Get all posts with their authors attached
        const posts = await api.posts
            .browse({
                include: "authors",
                filter: "visibility:public",
                limit: "all",
            })
            .catch((err) => {
                console.error(err);
            });

        return collection;
    });

    // Get all tags
    config.addCollection("tags", async function (collection) {
        collection = await api.tags
            .browse({
                include: "count.posts",
                limit: "all",
                order: "count.posts desc",
            })
            .catch((err) => {
                console.error(err);
            });

        // Get all posts with their tags attached
        const posts = await api.posts
            .browse({
                include: "tags,authors",
                limit: "all",
                order: "published_at desc",
                filter: "visibility:public",
            })
            .catch((err) => {
                console.error(err);
            });

        posts.forEach((post) => {
            post.tags = post.tags.filter((tag) => tag.visibility == "public");
        });

        // Attach posts to their respective tags
        collection.forEach(async (tag) => {
            const taggedPosts = posts.filter((post) => {
                return post.primary_tag && post.primary_tag.slug === tag.slug;
            });
            if (taggedPosts.length) tag.posts = taggedPosts;
        });

        return collection;
    });

    // Get all tags
    config.addCollection("tagsPagetion", async function (collection) {
        collection = await api.tags
            .browse({
                include: "count.posts",
                limit: "all",
            })
            .catch((err) => {
                console.error(err);
            });

        // Get all posts with their tags attached
        const posts = await api.posts
            .browse({
                include: "tags,authors",
                limit: "all",
                order: "published_at desc",
                filter: "visibility:public",
            })
            .catch((err) => {
                console.error(err);
            });

        // posts.forEach((post) => {
        //   post.tags = post.tags.filter((tag) => tag.visibility == "public");
        // });

        const pagedPosts = [];

        // Attach posts to their respective tags
        collection.forEach(async (tag) => {
            const taggedPosts = posts.filter((post) => {
                return post.tags.some((ptag) => ptag.slug === tag.slug);
            });
            // if (taggedPosts.length) tag.posts = taggedPosts;
            if (taggedPosts.length) {
                const numberOfPage = Math.ceil(taggedPosts.length / 7);
                for (let pageNum = 1; pageNum <= numberOfPage; pageNum++) {
                    const sliceFrom = (pageNum - 1) * 7;
                    const sliceTo = sliceFrom + 7;

                    pagedPosts.push({
                        tagName: tag.name,
                        tagSlug: tag.slug,
                        number: pageNum,
                        posts: taggedPosts.slice(sliceFrom, sliceTo),
                        first: pageNum === 1,
                        last: pageNum === numberOfPage,
                    });
                    tag.posts = pagedPosts;
                }
            }
        });

        return pagedPosts;
    });

    // Get All memos
    config.addCollection("memos", async function (collection) {
        // fetch(umiUrl, {
        //     method: 'GET',
        //     mode: 'cors',
        //     cache: 'default',
        //     headers: {
        //     Authorization: 'Bearer ' + umiData.token,
        //     'Content-Type': 'application/json'
        //     }
        // }).then(res => res.json()).then(resdata => {
        //     let data = groupBy(resdata, item => item.x).map(g => ({
        //     name: g.key,
        //     typeId: g.items.map(item => item.t),
        //     number: g.items.reduce((sum, item) => sum + item.y, 0)
        //     }));
        //     Likes = data.filter(function (item) {
        //     return item.name == 'Like';
        //     });
        //     if (Likes.length !== 0) {
        //     let likeNum = Likes[0].number;
        //     num.innerHTML = likeNum;
        //     btn.dataset.like = likeNum;
        //     btn.ariaLabel = btn.ariaLabel.replace(' 0 ', ' ' + likeNum + ' ');
        //     } else {
        //     num.innerHTML = 0;
        //     btn.dataset.like = 0;
        //     }
        // });
        return collection;
    });

    // Get All feeds
    config.addCollection("feeds", async function (collection) {
        if (fluxToken) {
            try {
                const response = await fetch(
                    "https://flux.1900.live/v1/categories/4/entries?order=id&direction=desc&limit=99999",
                    {
                        method: "GET",
                        headers: {
                            "X-Auth-Token": fluxToken,
                        },
                    }
                );
                let data = await response.json();
                data = data.entries.filter((entry, index, self) => {
                    const domain = new URL(entry.feed.site_url).origin;
                    entry.feed.site_url = domain;
                    return (
                        self.findIndex(
                            (item) => item.feed_id === entry.feed_id
                        ) === index
                    );
                });
                return data;
            } catch (error) {
                console.log("请求错误:", error);
            }
        }
        return collection;
    });

    // Get All Douban
    config.addCollection("douban", async function (collection) {
        if (fluxToken) {
            try {
                const response = await fetch("https://neodb.190102.xyz");
                let data = await response.json();
                return data;
            } catch (error) {
                console.log("请求错误:", error);
            }
        }
        return collection;
    });

    return {
        dir: {
            input: "src/site",
            output: "dist",
        },
        htmlTemplateEngine: "liquid",
        markdownTemplateEngine: "liquid",
        dataTemplateEngine: "liquid",
    };
};
