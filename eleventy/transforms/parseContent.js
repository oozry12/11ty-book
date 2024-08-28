/* ***** ----------------------------------------------- ***** **
/* ***** Parse Content Transform
/* ***** ----------------------------------------------- ***** */

const { JSDOM } = require("jsdom");
const imageSrcset = require("./../shortcodes/imageSrcset");
const pangu = require("pangu/src/browser/pangu");
const hljs = require("highlight.js");
const golink = require("./../shortcodes/golink")
const aniEmoji = require("../shortcodes/aniEmoji")
const emojis = require("../../assets/emoji.json")


module.exports = (content, outputPath) => {
  if (outputPath.endsWith(".html")) {
    const dom = new JSDOM(content);
    const { document, Node, DocumentFragment, XPathResult } = dom.window;
    global.Node = Node;
    global.DocumentFragment = DocumentFragment;
    global.XPathResult = XPathResult;
    global.document = document;

    aniEmoji(document.querySelectorAll(".markdown"));


    const links = document.querySelectorAll(".book-article a:not(.book-btn)");

    if(links){
      links.forEach(function(link){
        link.href = golink(link.href);

        link.target = link.href.indexOf('/golink/?target=')  == -1 ? "_self":"_blank";
      })
    }

    // // Add lazyload to all article images
    const articleImages = [
      ...document.querySelectorAll(".markdown img"),
    ];
    if (articleImages.length) {
      articleImages.forEach((image) => {
        // Set image src to data-src
        const imageSrc = image.getAttribute("src");
        image.setAttribute("srcset", imageSrcset(imageSrc));
        image.setAttribute("data-sizes", "auto");
        image.removeAttribute("src");

        // Add lazyload class for lazysizes plugin
        image.classList.add("lazyload");
      });
    }

    // Wrap video player with container to make size responsive and add lazyload
    const articleVideos = [...document.querySelectorAll(".markdown iframe")];
    if (articleVideos.length) {
      articleVideos.forEach((video) => {
        const videoSrc = video.getAttribute("src");
        if (
          videoSrc.includes("youtube") ||
          videoSrc.includes("vimeo") ||
          videoSrc.includes("bilibili")
        ) {
          // If YouTube, add lazyload attributes
          // Lazyloading with Vimeo will disable fullscreen so we don't include it here
          if (videoSrc.includes("youtube")) {
            // Set video src to data-src
            video.setAttribute("data-src", videoSrc);
            video.removeAttribute("src");

            // Add lazyload class for lazysizes plugin
            video.classList.add("lazyload");
          }

          // Add fullscreen attributes
          video.setAttribute("allowfullscreen", "");

          // Wrap video player with proportional container
          const embedWrapper = document.createElement("div");
          embedWrapper.classList ="aspect-ratio";
          video.parentNode.insertBefore(embedWrapper, video);
          embedWrapper.appendChild(video);
        }
      });
    }


    // add pangu space and hilghight code block
    pangu.spacingPageBody();
    
    const emojiRegex = /([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g;

    document.querySelectorAll(".markdown").forEach(function(el){
      let finds = el.innerHTML.match(emojiRegex);

      if(!finds){return}
      finds.forEach(function(i){
          let temp = emojis.items.find(item => item.icon === i)
          if(temp){
              el.innerHTML = el.innerHTML.replaceAll(i,"<img class='book-emoji' src='"+ temp.val +"'/>")
          }
      })
      
  })

    const codes = [
      ...document.querySelectorAll(".markdown pre code"),
    ];

    if (codes.length) {
      codes.forEach((code) => {
        if(hljs.getLanguage(code.className.replaceAll('language-','')) == undefined){
          code.className = 'language-plaintext'
        }
        hljs.highlightElement(code);
      
      })
    }

    return `<!DOCTYPE html>`+document.documentElement.outerHTML;
  }

  return content;
};
