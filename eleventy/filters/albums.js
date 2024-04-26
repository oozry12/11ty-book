/* ***** ----------------------------------------------- ***** **
/* ***** Parse Content Transform
/* ***** ----------------------------------------------- ***** */

const { JSDOM } = require("jsdom");
const imageSrcset = require("./../shortcodes/imageSrcset");
const pangu = require("pangu/src/browser/pangu");
const hljs = require("highlight.js");

module.exports = (posts) => {
    let imgs = { data: [] };

    posts.forEach(function(post){
        const dom = new JSDOM(post.html);
        const { document, Node, DocumentFragment, XPathResult } = dom.window;
        global.Node = Node;
        global.DocumentFragment = DocumentFragment;
        global.XPathResult = XPathResult;
        global.document = document;

        // // Add lazyload to all article images
        const articleImages = [...document.querySelectorAll("img")];
        articleImages.forEach(img => {
            // 使用src作为键，创建一个对象，其中包含src和alt作为属性

            imgs.data.push ({
                src: img.src,
                alt: img.alt
            });
        });
    })
    

    return imgs;

    // if (outputPath.endsWith(".html")) {
    //     const dom = new JSDOM(content);
    //     const { document, Node, DocumentFragment, XPathResult } = dom.window;
    //     global.Node = Node;
    //     global.DocumentFragment = DocumentFragment;
    //     global.XPathResult = XPathResult;
    //     global.document = document;

    //     // // Add lazyload to all article images
    //     const articleImages = [...document.querySelectorAll(".markdown img")];
    //     if (articleImages.length) {
    //         articleImages.forEach((image) => {
    //             // Set image src to data-src
    //             const imageSrc = image.getAttribute("src");
    //             image.setAttribute("srcset", imageSrcset(imageSrc));
    //             image.setAttribute("data-sizes", "auto");
    //             image.removeAttribute("src");

    //             // Add lazyload class for lazysizes plugin
    //             image.classList.add("lazyload");
    //         });
    //     }

    //     // Wrap video player with container to make size responsive and add lazyload
    //     const articleVideos = [
    //         ...document.querySelectorAll(".markdown iframe"),
    //     ];
    //     if (articleVideos.length) {
    //         articleVideos.forEach((video) => {
    //             const videoSrc = video.getAttribute("src");
    //             if (
    //                 videoSrc.includes("youtube") ||
    //                 videoSrc.includes("vimeo") ||
    //                 videoSrc.includes("bilibili")
    //             ) {
    //                 // If YouTube, add lazyload attributes
    //                 // Lazyloading with Vimeo will disable fullscreen so we don't include it here
    //                 if (videoSrc.includes("youtube")) {
    //                     // Set video src to data-src
    //                     video.setAttribute("data-src", videoSrc);
    //                     video.removeAttribute("src");

    //                     // Add lazyload class for lazysizes plugin
    //                     video.classList.add("lazyload");
    //                 }

    //                 // Add fullscreen attributes
    //                 video.setAttribute("allowfullscreen", "");

    //                 // Wrap video player with proportional container
    //                 const embedWrapper = document.createElement("div");
    //                 embedWrapper.classList = "aspect-ratio";
    //                 video.parentNode.insertBefore(embedWrapper, video);
    //                 embedWrapper.appendChild(video);
    //             }
    //         });
    //     }

    //     // add pangu space and hilghight code block
    //     pangu.spacingPageBody();

    //     const codes = [...document.querySelectorAll(".markdown pre code")];

    //     if (codes.length) {
    //         codes.forEach((code) => {
    //             if (
    //                 hljs.getLanguage(
    //                     code.className.replaceAll("language-", "")
    //                 ) == undefined
    //             ) {
    //                 code.className = "language-plaintext";
    //             }
    //             hljs.highlightElement(code);
    //         });
    //     }

    //     return `<!DOCTYPE html>` + document.documentElement.outerHTML;
    // }

    // return content;
};
