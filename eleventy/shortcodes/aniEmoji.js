/* ***** ----------------------------------------------- ***** **
/* ***** Current Year Shortcode 获取年份
/* ***** ----------------------------------------------- ***** */

const site_emoji = require("../../src/assets/js/emoji.json");

module.exports = (content) => {
    content.forEach(function (params) {
        let emojiRegex =
            /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu;
        let emojis = params.innerHTML.match(emojiRegex);

    });

    return `<img src="https://cdn.1900.live/fluent-emoji/%E7%94%9F%E6%B0%94%E7%9A%84%E6%81%B6%E9%AD%94.gif!gif" atk-emoticon="生气的恶魔">`;
};
