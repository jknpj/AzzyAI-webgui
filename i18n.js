// i18n.js
// Language support for the AzzyAI web GUI: English (source), Brazilian Portuguese and
// Latin American Spanish. UI strings are keyed by their English text (i18n.strings.js);
// setting descriptions are keyed by setting name (i18n.desc.<lang>.js). Anything without a
// translation falls back to English.
(function () {
  'use strict';

  var KEY = 'azzyai.webgui.lang';
  var LANGS = [['en', 'English'], ['pt', 'Português (BR)'], ['es', 'Español (LatAm)']];
  var HTML_LANG = { en: 'en', pt: 'pt-BR', es: 'es-419' };
  var listeners = [];

  function supported(l) { return LANGS.some(function (x) { return x[0] === l; }); }

  function detect() {
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) { /* ignore */ }
    if (supported(stored)) return stored;
    var nav = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase();
    if (nav.indexOf('pt') === 0) return 'pt';
    if (nav.indexOf('es') === 0) return 'es';
    return 'en';
  }

  var lang = detect();

  // t('Text') or t('{0} matching settings.', [n]): translated text with {n} placeholders filled in.
  function t(text, args) {
    if (text === null || text === undefined) return text;
    var out = text;
    if (lang !== 'en') {
      var dict = (window.AzzyI18nStrings || {})[lang];
      if (dict && Object.prototype.hasOwnProperty.call(dict, text)) out = dict[text];
    }
    if (args) out = out.replace(/\{(\d+)\}/g, function (m, i) { return args[i] !== undefined ? String(args[i]) : m; });
    return out;
  }

  // Description of a schema entry; scope 'hom' or 'mer'. classic: use the AzzyAI Classic text.
  function desc(scope, entry, classic) {
    if (!entry) return '';
    var src = classic && entry.classicDescription ? entry.classicDescription : entry.description;
    if (lang === 'en') return src;
    var d = (window.AzzyI18nDesc || {})[lang];
    if (!d) return src;
    var table = classic && entry.classicDescription ? d[scope + 'Classic'] : d[scope];
    return (table && table[entry.name]) || src;
  }

  // Elements with data-i18n="English text" (text), data-i18n-title, data-i18n-placeholder and
  // data-i18n-aria-label get their translated text. The English source stays in the attribute.
  function applyStatic(root) {
    root = root || document;
    Array.prototype.forEach.call(root.querySelectorAll('[data-i18n]'), function (e) {
      e.textContent = t(e.getAttribute('data-i18n'));
    });
    [['data-i18n-title', 'title'], ['data-i18n-placeholder', 'placeholder'], ['data-i18n-aria-label', 'aria-label']].forEach(function (p) {
      Array.prototype.forEach.call(root.querySelectorAll('[' + p[0] + ']'), function (e) {
        e.setAttribute(p[1], t(e.getAttribute(p[0])));
      });
    });
    document.documentElement.setAttribute('lang', HTML_LANG[lang]);
  }

  function setLang(l) {
    if (!supported(l) || l === lang) return;
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) { /* ignore */ }
    applyStatic();
    listeners.forEach(function (fn) { try { fn(lang); } catch (e) { /* keep others running */ } });
  }

  window.AzzyI18n = {
    LANGS: LANGS,
    t: t,
    desc: desc,
    applyStatic: applyStatic,
    setLang: setLang,
    get lang() { return lang; },
    onChange: function (fn) { listeners.push(fn); }
  };
})();
