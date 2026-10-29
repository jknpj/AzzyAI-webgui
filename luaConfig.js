// luaConfig.js
// Reads and writes H_Config.lua / M_Config.lua: values are matched by
// "Name = value" and only changed values are replaced in place (the rest of
// the file stays untouched); options missing from the file are appended only
// when they differ from the default. LastSavedDate is refreshed when something changed.
(function () {
  'use strict';

  var TOKEN = '(-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)|[A-Za-z_][A-Za-z0-9_]*)';

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function luaName(entry) {
    return entry.lua || entry.name;
  }

  function assignRegex(name, flags) {
    return new RegExp('^([ \\t]*)' + escapeRegex(name) + '[ \\t]*=[ \\t]*' + TOKEN, flags || 'gm');
  }

  function eolOf(text) {
    return /\r\n/.test(text) ? '\r\n' : '\n';
  }

  function padName(name) {
    var s = name;
    while (s.length < 25) s += ' ';
    return s;
  }

  function clamp(entry, v) {
    if (typeof entry.min === 'number' && v < entry.min) v = entry.min;
    if (typeof entry.max === 'number' && v > entry.max) v = entry.max;
    return v;
  }

  function defaults(schema) {
    var values = {};
    schema.forEach(function (e) { values[e.name] = e.default; });
    return values;
  }

  // Returns the raw token of the last uncommented assignment, or null.
  function readToken(text, name) {
    var re = assignRegex(name);
    var m, last = null;
    while ((m = re.exec(text)) !== null) last = m[2];
    return last;
  }

  function fromToken(entry, token) {
    switch (entry.type) {
      case 'bool':
        if (token === 'true') return true;
        if (token === 'false') return false;
        if (!/^-?\d/.test(token)) return undefined;
        return parseFloat(token) !== 0;
      case 'serverType':
        if (token === 'SERVER_PRIVATE' || token === '1') return 1;
        if (token === 'SERVER_OFFICIAL' || token === '0') return 0;
        return undefined;
      case 'double': {
        var d = parseFloat(token);
        return isNaN(d) ? undefined : clamp(entry, d);
      }
      default: {
        if (!/^-?\d/.test(token)) return undefined;
        var n = parseInt(token, 10);
        if (isNaN(n)) return undefined;
        return entry.type === 'int' ? clamp(entry, n) : n;
      }
    }
  }

  function toToken(entry, value) {
    switch (entry.type) {
      case 'bool': return value ? '1' : '0';
      case 'serverType': return Number(value) === 1 ? 'SERVER_PRIVATE' : 'SERVER_OFFICIAL';
      case 'double': return String(Number(value));
      default: return String(Math.trunc(Number(value)));
    }
  }

  // Load values from a Lua config text. Missing values keep their defaults.
  function load(text, schema) {
    var values = defaults(schema);
    schema.forEach(function (e) {
      var token = readToken(text, luaName(e));
      if (token === null) return;
      var v = fromToken(e, token);
      if (v !== undefined) values[e.name] = v;
    });
    return values;
  }

  function sameValue(entry, a, b) {
    if (entry.type === 'bool') return !!a === !!b;
    return Number(a) === Number(b);
  }

  // Replaces only the value token, keeping the line's spacing and trailing comment.
  function setAssignment(text, name, token) {
    var re = new RegExp('^([ \\t]*' + escapeRegex(name) + '[ \\t]*=[ \\t]*)' + TOKEN, 'gm');
    if (re.test(text)) {
      re.lastIndex = 0;
      return text.replace(re, function (all, prefix) { return prefix + token; });
    }
    var eol = eolOf(text);
    var sep = text.length === 0 || /\n$/.test(text) ? '' : eol;
    return text + sep + padName(name) + '= ' + token + eol;
  }

  function nowString() {
    return new Date().toLocaleString();
  }

  // Writes only the values that differ from the file, so untouched lines stay byte-for-byte
  // the same. Missing options are appended only when set to something other than the default.
  function save(text, schema, values) {
    var out = text || '';
    var base = load(out, schema);
    var touched = false;
    schema.forEach(function (e) {
      var v = values[e.name];
      if (v === undefined) v = e.default;
      var present = readToken(out, luaName(e)) !== null;
      if (sameValue(e, v, present ? base[e.name] : e.default)) return;
      out = setAssignment(out, luaName(e), toToken(e, v));
      touched = true;
    });
    if (!touched) return out;
    var dateLine = padName('LastSavedDate') + '= "' + nowString() + '"';
    var dateRe = /^[ \t]*LastSavedDate[ \t]*=[ \t]*".*"/m;
    if (dateRe.test(out)) {
      out = out.replace(dateRe, dateLine);
    } else {
      var eol = eolOf(out);
      out += (/\n$/.test(out) ? '' : eol) + dateLine + eol;
    }
    return out;
  }

  window.AzzyLuaConfig = {
    load: load,
    save: save,
    sameValue: sameValue,
    defaults: defaults,
    clamp: clamp,
    padName: padName,
    eolOf: eolOf,
    nowString: nowString
  };
})();
