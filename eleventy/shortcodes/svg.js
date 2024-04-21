/* ***** ----------------------------------------------- ***** **
/* ***** SVG Shortcode
/* ***** ----------------------------------------------- ***** */

const absoluteUrl = require('../filters/absoluteUrl.js')

module.exports = (name = '', viewbox = '0 0 24 24', classes = 'book-icon') => {
  return `
    <svg viewBox="${viewbox}" aria-hidden="true"${
    classes ? ` class="${classes}"` : ''
  }>
      <use xlink:href="${absoluteUrl('')}/assets/svg/icons.svg#${name}"></use>
    </svg>
  `
}
