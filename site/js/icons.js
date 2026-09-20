/* Inline SVG icon helper (loaded first on every page).
   ico('sparkles')          -> <svg class="ico"><use href="…/assets/icons.svg?v=N#sparkles"/></svg>
   The sprite path is derived from the stylesheet link so it works at any page depth and shares the cache-busting version. */
(function () {
  var css = document.querySelector('link[href*="css/styles.css"]');
  var base = css ? css.getAttribute('href').replace('css/styles.css', 'assets/icons.svg') : 'assets/icons.svg';
  window.ICON_SPRITE = base;
  window.ico = function (name, cls) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true" focusable="false"><use href="' + base + '#' + name + '"/></svg>';
  };
})();
