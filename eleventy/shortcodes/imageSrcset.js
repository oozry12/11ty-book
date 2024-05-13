/* ***** ----------------------------------------------- ***** **
/* ***** Image Srcset Shortcode 图片多规格转换
/* ***** ----------------------------------------------- ***** */

// const absoluteUrl = require("../filters/absoluteUrl.js");
// const imageUrl = require("../shortcodes/imageUrl.js");
const { mode } = require("../../config.js");
// const sizeOf = require("image-size");

// Generate responsive image srcset based on width
module.exports = (image, isLocal = false) => {
  image = encodeURI(image);
  let imageSrcset = [];
  const imageWidths = [200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800];

  if (image.match(mode.cdnUrl)) {
    // If image is local, determine the width of the image and then generate
    // markup for images at sizes smaller than the image
    imageWidths.forEach((width) => {
      let img = image.endsWith('.gif') == true ? image:`${image}!${width}w ${width}w`
      imageSrcset.push(img);
    });
  } else if(image.match('unsplash.com')){
    imageWidths.forEach((width) => {
      const updatedUrl = image.replace(/(w=)[^\&]+/, '$1'+width)
      imageSrcset.push(`${updatedUrl} ${width}w`);
    });
  } else {
    imageSrcset.push(image);
  }

  return imageSrcset.join(", ");
};
