const Fontmin = require("fontmin");

module.exports = (titleText) => {
    const fontmin = new Fontmin()
        .src("assets/SmileySans.ttf")
        .use(
            Fontmin.glyph({
                text: titleText,
                hinting: false,
            })
        )
        .dest("src/assets/fonts");

    fontmin.run((err, files) => {
        if (err) throw err;
        console.log("compress font success\n");
    });
};
