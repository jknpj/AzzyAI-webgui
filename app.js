// app.js
// AzzyAI configuration web GUI. Mirrors the WinForms GUI (GUI/AzzyAIConfig):
// Homunculus/Mercenary settings, Homunculus/Mercenary tactics, PVP tactics,
// Extra options, Apply/Revert/Reset to Defaults, Import/Export, Help.
(function () {
  'use strict';

  var L = window.AzzyLuaConfig;
  var T = window.AzzyTactics;
  var HOM_ALL = window.AzzyHomSchema || [];
  var HG_ONLY = window.AzzyHomHgOnly || [];
  var HOM = HOM_ALL;
  var MER = window.AzzyMerSchema || [];
  var HOM_ENUMS = window.AzzyHomEnums || {};
  var MER_ENUMS = window.AzzyMerEnums || {};
  var TEMPLATES = window.AzzyTemplates || {};

  var FILES = ['H_Config.lua', 'M_Config.lua', 'H_Tactics.lua', 'M_Tactics.lua',
    'H_PVP_Tact.lua', 'M_PVP_Tact.lua', 'H_Extra.lua', 'M_Extra.lua'];
  var STORE_KEY = 'azzyai.webgui.files';
  var APPLY_HINT = window.showDirectoryPicker
    ? 'Apply asks for your USER_AI folder and saves the .lua files there'
    : 'this browser cannot write to folders: Apply downloads AzzyAI_config.zip; use Chrome or Edge to save directly';
  var FILTER_KEY = 'azzyai.webgui.homFilters';
  var VERSION_KEY = 'azzyai.webgui.version';
  var DOC_ONLINE_URL = 'https://github.com/jknpj/AzzyAI/blob/HEAD/USER_AI/Documentation.pdf';

  var HOM_CATEGORIES = ['Basic Options', 'AutoSkill Options', 'Walk/Follow Options', 'Autobuff Options',
    'Berserk Options', 'Friending Options', 'PVP Options', 'Standby Options', 'Kiting Options'];

  var S_TYPES = {
    sera: ['paralyze', 'poisonmist', 'painkiller', 'calllegion'],
    eira: ['silentbreeze', 'healownerbreeze', 'xenoslasher', 'erasercutter', 'overedboost', 'regene'],
    eleanor: ['sonicclaw', 'silvervein', 'midnight', 'tinderbreaker', 'switchmode'],
    bayeri: ['stahlhorn', 'hailege', 'goldene', 'steinwand', 'angriffs'],
    dieter: ['lavaslide', 'magmaflow', 'granitic', 'pyroclastic', 'volcanic']
  };
  var BASE_TYPES = {
    lif: ['escape'],
    amistr: ['bulwark', 'castle', 'bloodlust', 'provokeowner'],
    filir: ['flit', 'accel', 'moon', 'speed', 'sbr44'],
    vanilmirth: ['caprice', 'chaotic', 'selfdestruct']
  };
  var S_ORDER = ['sera', 'eira', 'eleanor', 'bayeri', 'dieter'];
  var BASE_ORDER = ['lif', 'amistr', 'filir', 'vanilmirth'];

  var ABOUT_TEXT = 'AzzyAI LATAM HG\nAI by Dr. Azzy; GUI by Machiavellian and contributors\n\n' +
    'Includes current Homunculus S settings and official/private server selection.\n\nIcon by Kami Kali';

  // ---------- state ----------
  var saved = {};          // last applied file texts
  var state = { hom: {}, mer: {}, tact: { hom: [], mer: [], hompvp: [], merpvp: [] }, extra: {} };
  var dirty = false;
  var dirHandle = null;    // File System Access directory (USER_AI folder), when opened
  var homSearch = '';
  var homOnlyModified = false;
  var homCategory = HOM_CATEGORIES[0];
  var homSelected = null;
  var merSelected = null;
  var merSearch = '';
  var merOnlyModified = false;
  var merSort = 'categorized';
  var collapsed = { hom: {}, mer: {} };
  var tactSelected = { hom: 0, mer: 0, hompvp: 0, merpvp: 0 };
  var extraFile = 'H_Extra.lua';
  var THEME_KEY = 'azzyai.webgui.theme';
  var THEMES = ['auto', 'light', 'dark'];
  var THEME_LABELS = { auto: '\u25D0 Theme: System', light: '\u2600 Theme: Light', dark: '\u263E Theme: Dark' };
  var themeMode = 'auto';
  var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  // ---------- DOM helpers ----------
  function $(id) { return document.getElementById(id); }

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === undefined || v === null || v === false) return;
        if (k === 'text') e.textContent = v;
        else if (k === 'class') e.className = v;
        else if (k.indexOf('on') === 0) e.addEventListener(k.substring(2), v);
        else if (v === true) e.setAttribute(k, '');
        else e.setAttribute(k, v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  }

  function option(label, value, selected) {
    var o = el('option', { value: String(value), text: label });
    if (selected) o.selected = true;
    return o;
  }

  // ---------- modals ----------
  var modal, modalTitle, modalBody, modalFooter, modalPending = null, modalChain = Promise.resolve();

  function setupModal() {
    modal = new bootstrap.Modal($('appModal'));
    modalTitle = $('appModalTitle');
    modalBody = $('appModalBody');
    modalFooter = $('appModalFooter');
    // Resolve only once the modal is fully hidden so a follow-up dialog can be shown.
    $('appModal').addEventListener('hidden.bs.modal', function () {
      if (modalPending) { var p = modalPending; modalPending = null; p.resolve(p.result); }
    });
  }

  // buttons: [[label, value, cssClass]]. Dialogs are queued and shown one at a time.
  function dialog(title, text, buttons) {
    var next = modalChain.then(function () {
      return new Promise(function (resolve) {
        modalPending = { resolve: resolve, result: 'cancel' };
        modalTitle.textContent = title;
        modalBody.textContent = text;
        modalFooter.innerHTML = '';
        buttons.forEach(function (b) {
          modalFooter.appendChild(el('button', {
            type: 'button', class: 'btn ' + (b[2] || 'btn-secondary'), text: b[0],
            onclick: function () { if (modalPending) modalPending.result = b[1]; modal.hide(); }
          }));
        });
        modal.show();
      });
    });
    modalChain = next.catch(function () { /* keep queue alive */ });
    return next;
  }

  function message(title, text) {
    return dialog(title, text, [['OK', 'ok', 'btn-primary']]);
  }

  // ---------- persistence ----------
  function templateFiles() {
    var files = {};
    FILES.forEach(function (f) { files[f] = TEMPLATES[f] || ''; });
    return files;
  }

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      var files = templateFiles();
      FILES.forEach(function (f) { if (typeof data[f] === 'string') files[f] = data[f]; });
      return files;
    } catch (e) {
      return null;
    }
  }

  function writeStore(files) {
    localStorage.setItem(STORE_KEY, JSON.stringify(files));
  }

  function loadFilters() {
    try { return JSON.parse(localStorage.getItem(FILTER_KEY)) || {}; } catch (e) { return {}; }
  }

  function saveFilters() {
    try {
      localStorage.setItem(FILTER_KEY, JSON.stringify({ s: $('homSFilter').value, base: $('homBaseFilter').value }));
    } catch (e) { /* ignore */ }
  }

  // ---------- AzzyAI version (HG / Classic) ----------
  var version = 'hg';

  function setVersion(v) {
    version = v === 'classic' ? 'classic' : 'hg';
    HOM = version === 'hg' ? HOM_ALL : HOM_ALL.filter(function (e) {
      return HG_ONLY.indexOf(e.name) < 0;
    }).map(function (e) {
      if (!e.classicDescription) return e;
      var copy = {};
      Object.keys(e).forEach(function (k) { copy[k] = e[k]; });
      copy.description = e.classicDescription;
      return copy;
    });
    var sel = $('aiVersion');
    if (sel) sel.value = version;
    try { localStorage.setItem(VERSION_KEY, version); } catch (e) { /* ignore */ }
  }

  // HG defines ServerType in Defaults.lua; the classic AI does not.
  function detectVersion(map) {
    var hasServerType = /^[ \t]*ServerType[ \t]*=/m;
    if (hasServerType.test(map['Defaults.lua'] || '') || hasServerType.test(map['H_Config.lua'] || '')) return 'hg';
    if (typeof map['Defaults.lua'] === 'string') return 'classic';
    return null;
  }

  // ---------- load/build ----------
  function loadConfigs() {
    state.hom = L.load(saved['H_Config.lua'], HOM);
    state.mer = L.load(saved['M_Config.lua'], MER);
  }

  function loadAll() {
    loadConfigs();
    state.tact.hom = T.parseTactics(saved['H_Tactics.lua']);
    state.tact.mer = T.parseTactics(saved['M_Tactics.lua']);
    state.tact.hompvp = T.parsePvp(saved['H_PVP_Tact.lua']);
    state.tact.merpvp = T.parsePvp(saved['M_PVP_Tact.lua']);
    state.extra = { 'H_Extra.lua': saved['H_Extra.lua'] || '', 'M_Extra.lua': saved['M_Extra.lua'] || '' };
    Object.keys(tactSelected).forEach(function (k) { tactSelected[k] = 0; });
  }

  function buildFile(name) {
    // Unchanged files are written back exactly as they were.
    if (!fileChanged(name)) return saved[name] || '';
    switch (name) {
      case 'H_Config.lua': return L.save(saved[name], HOM, state.hom);
      case 'M_Config.lua': return L.save(saved[name], MER, state.mer);
      case 'H_Tactics.lua': return T.serializeTactics(state.tact.hom);
      case 'M_Tactics.lua': return T.serializeTactics(state.tact.mer);
      case 'H_PVP_Tact.lua': return T.serializePvp(saved[name], state.tact.hompvp);
      case 'M_PVP_Tact.lua': return T.serializePvp(saved[name], state.tact.merpvp);
      default: return state.extra[name] || '';
    }
  }

  function buildAll() {
    var files = {};
    FILES.forEach(function (f) { files[f] = buildFile(f); });
    return files;
  }

  // ---------- dirty tracking ----------
  function setDirty(v) {
    dirty = v;
    ['btnApply', 'btnRevert', 'menuApply', 'menuRevert'].forEach(function (id) {
      var e = $(id);
      if (!e) return;
      if (e.tagName === 'BUTTON') e.disabled = !v;
      else e.classList.toggle('disabled', !v);
    });
    document.title = (v ? '* ' : '') + 'AzzyAI Configuration';
    scheduleChanges();
  }

  function changed() { setDirty(true); }

  // ---------- unapplied changes ----------
  function sameValue(entry, a, b) {
    if (entry.type === 'bool') return !!a === !!b;
    return Number(a) === Number(b);
  }

  function countDiff(schema, values, text) {
    var base = L.load(text, schema);
    return schema.filter(function (e) { return !sameValue(e, values[e.name], base[e.name]); }).length;
  }

  function stripTactDate(s) { return s.replace(/^.*TactLastSavedDate.*$/m, ''); }

  // True when the editor's content for a file differs from the applied file.
  function fileChanged(name) {
    switch (name) {
      case 'H_Config.lua': return countDiff(HOM, state.hom, saved[name]) > 0;
      case 'M_Config.lua': return countDiff(MER, state.mer, saved[name]) > 0;
      case 'H_Tactics.lua':
      case 'M_Tactics.lua': {
        var k = name === 'H_Tactics.lua' ? 'hom' : 'mer';
        return stripTactDate(T.serializeTactics(state.tact[k])) !== stripTactDate(T.serializeTactics(T.parseTactics(saved[name])));
      }
      case 'H_PVP_Tact.lua':
      case 'M_PVP_Tact.lua': {
        var p = name === 'H_PVP_Tact.lua' ? 'hompvp' : 'merpvp';
        return T.serializePvp(saved[name], state.tact[p]) !== T.serializePvp(saved[name], T.parsePvp(saved[name]));
      }
      default: return (state.extra[name] || '') !== (saved[name] || '');
    }
  }

  // Returns [[tabId, label, count or null]] for every section that differs from the applied files.
  function pendingChanges() {
    var out = [];
    var n = countDiff(HOM, state.hom, saved['H_Config.lua']);
    if (n) out.push(['tab-hom', 'Homunculus', n]);
    n = countDiff(MER, state.mer, saved['M_Config.lua']);
    if (n) out.push(['tab-mer', 'Mercenary', n]);
    [['H_Tactics.lua', 'tab-homtact', 'Homunculus tactics'], ['M_Tactics.lua', 'tab-mertact', 'Mercenary tactics'],
      ['H_PVP_Tact.lua', 'tab-hompvp', 'PVP tactics'], ['M_PVP_Tact.lua', 'tab-merpvp', 'Merc PVP tactics']].forEach(function (p) {
      if (fileChanged(p[0])) out.push([p[1], p[2], null]);
    });
    if (fileChanged('H_Extra.lua') || fileChanged('M_Extra.lua')) out.push(['tab-extra', 'Extra options', null]);
    return out;
  }

  var changesTimer = null;
  function scheduleChanges() {
    if (changesTimer) clearTimeout(changesTimer);
    changesTimer = setTimeout(function () { changesTimer = null; showChanges(); }, 150);
  }

  function showChanges() {
    try { updateSummaries(); } catch (e) { /* not rendered yet */ }
    var list = [];
    if (dirty) {
      try { list = pendingChanges(); } catch (e) { list = []; }
    }
    var label = $('changesLabel');
    if (label) {
      label.classList.toggle('d-none', !dirty);
      var text = list.map(function (c) { return c[1] + (c[2] ? ' (' + c[2] + ')' : ''); }).join(', ');
      label.textContent = 'Not applied' + (text ? ': ' + text : '');
      label.title = label.textContent;
    }
    var tabs = list.map(function (c) { return c[0]; });
    Array.prototype.forEach.call(document.querySelectorAll('.main-tabs [data-bs-target]'), function (btn) {
      var dot = btn.querySelector('.change-dot');
      var on = tabs.indexOf(btn.getAttribute('data-bs-target').substring(1)) >= 0;
      if (on && !dot) btn.appendChild(el('span', { class: 'change-dot', title: 'Not applied' }));
      else if (!on && dot) btn.removeChild(dot);
    });
  }

  // ---------- theme ----------
  function applyTheme() {
    var dark = themeMode === 'dark' || (themeMode === 'auto' && darkQuery && darkQuery.matches);
    document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
    var b = $('btnTheme');
    if (b) b.textContent = THEME_LABELS[themeMode];
    Array.prototype.forEach.call(document.querySelectorAll('[data-theme]'), function (item) {
      item.classList.toggle('active', item.getAttribute('data-theme') === themeMode);
    });
  }

  function initTheme() {
    try { themeMode = localStorage.getItem(THEME_KEY) || 'auto'; } catch (e) { /* ignore */ }
    if (THEMES.indexOf(themeMode) < 0) themeMode = 'auto';
    applyTheme();
    Array.prototype.forEach.call(document.querySelectorAll('[data-theme]'), function (item) {
      item.addEventListener('click', function () {
        themeMode = item.getAttribute('data-theme');
        try { localStorage.setItem(THEME_KEY, themeMode); } catch (e) { /* ignore */ }
        applyTheme();
      });
    });
    if (darkQuery) {
      var onSystemChange = function () { if (themeMode === 'auto') applyTheme(); };
      if (darkQuery.addEventListener) darkQuery.addEventListener('change', onSystemChange);
      else if (darkQuery.addListener) darkQuery.addListener(onSystemChange);
    }
  }

  // ---------- validation ----------
  function validateTactics() {
    var problems = [];
    [['hom', 'Homunculus Tactics'], ['mer', 'Mercenary Tactics']].forEach(function (p) {
      var seen = {};
      state.tact[p[0]].forEach(function (t) {
        if (!t.name.trim()) problems.push([p[0], p[1] + ': You must enter a monster name. (ID ' + t.id + ')']);
        if (!/^-?\d+$/.test(t.id) || seen[t.id]) problems.push([p[0], p[1] + ': You must enter a unique monster ID (' + (t.id || 'empty') + ')']);
        seen[t.id] = true;
      });
    });
    [['hompvp', 'PVP Tactics'], ['merpvp', 'Merc PVP Tactics']].forEach(function (p) {
      var seen = {};
      state.tact[p[0]].forEach(function (t) {
        if (!t.id.trim() || t.id === 'new') problems.push([p[0], p[1] + ': You must enter a name.']);
        else if (seen[t.id]) problems.push([p[0], p[1] + ': You must enter a unique name. (' + t.id + ')']);
        seen[t.id] = true;
      });
    });
    return problems;
  }

  var TAB_FOR = { hom: 'tab-homtact', mer: 'tab-mertact', hompvp: 'tab-hompvp', merpvp: 'tab-merpvp' };

  // ---------- file output ----------
  function download(name, text, type) {
    var blob = text instanceof Blob ? text : new Blob([text], { type: type || 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = el('a', { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function writeToFolder(files, names) {
    return Promise.all(names.map(function (f) {
      return dirHandle.getFileHandle(f, { create: true }).then(function (h) {
        return h.createWritable();
      }).then(function (w) {
        return w.write(files[f]).then(function () { return w.close(); });
      });
    }));
  }

  function downloadAll(files) {
    if (window.JSZip) {
      var zip = new window.JSZip();
      FILES.forEach(function (f) { zip.file(f, files[f]); });
      return zip.generateAsync({ type: 'blob' }).then(function (blob) { download('AzzyAI_config.zip', blob); });
    }
    FILES.forEach(function (f) { download(f, files[f]); });
    return Promise.resolve();
  }

  function apply() {
    var problems = validateTactics();
    if (problems.length) {
      showTab(TAB_FOR[problems[0][0]]);
      return message('AzzyAI Configuration', problems.map(function (p) { return p[1]; }).join('\n')).then(function () { return false; });
    }
    return chooseTarget().then(function (target) {
      if (target === 'cancel') return false;
      var files, names;
      try {
        // Only files with edits are written to the folder; the zip always has every file.
        names = FILES.filter(fileChanged);
        files = buildAll();
      } catch (e) {
        return message('Error', 'Settings could not be saved completely. Your edits are still open.\n\n' + e.message).then(function () { return false; });
      }
      return finishApply(target === 'folder' ? writeToFolder(files, names) : downloadAll(files), files);
    }).catch(function (e) {
      if (e && e.name === 'AbortError') return false;
      return message('Error', 'Settings could not be saved completely. Your edits are still open.\n\n' + (e && e.message)).then(function () { return false; });
    });
  }

  function editsOf(schema, values, text) {
    var base = L.load(text, schema);
    var edits = {};
    schema.forEach(function (e) { if (!sameValue(e, values[e.name], base[e.name])) edits[e.name] = values[e.name]; });
    return edits;
  }

  // The folder chosen at Apply time may differ from what the editor was showing
  // (e.g. browser storage). Keep only the user's edits and take everything else
  // from the folder, so Apply never overwrites settings the user did not touch.
  function rebase(map) {
    var was = {};
    FILES.forEach(function (f) { was[f] = fileChanged(f); });
    var homEdits = editsOf(HOM, state.hom, saved['H_Config.lua']);
    var merEdits = editsOf(MER, state.mer, saved['M_Config.lua']);
    FILES.forEach(function (f) { if (typeof map[f] === 'string') saved[f] = map[f]; });
    state.hom = L.load(saved['H_Config.lua'], HOM);
    Object.keys(homEdits).forEach(function (k) { state.hom[k] = homEdits[k]; });
    state.mer = L.load(saved['M_Config.lua'], MER);
    Object.keys(merEdits).forEach(function (k) { state.mer[k] = merEdits[k]; });
    if (!was['H_Tactics.lua']) state.tact.hom = T.parseTactics(saved['H_Tactics.lua']);
    if (!was['M_Tactics.lua']) state.tact.mer = T.parseTactics(saved['M_Tactics.lua']);
    if (!was['H_PVP_Tact.lua']) state.tact.hompvp = T.parsePvp(saved['H_PVP_Tact.lua']);
    if (!was['M_PVP_Tact.lua']) state.tact.merpvp = T.parsePvp(saved['M_PVP_Tact.lua']);
    ['H_Extra.lua', 'M_Extra.lua'].forEach(function (f) { if (!was[f]) state.extra[f] = saved[f] || ''; });
    renderAll();
  }

  function pickUserAiFolder() {
    return window.showDirectoryPicker({ id: 'azzyai-user-ai', mode: 'readwrite' }).then(function (handle) {
      var map = {};
      return Promise.all(FILES.map(function (f) {
        return handle.getFileHandle(f).then(function (h) { return h.getFile(); })
          .then(readText).then(function (t) { map[f] = t; }).catch(function () { /* missing: keep base */ });
      })).then(function () {
        rebase(map);
        dirHandle = handle;
        setEditing(handle.name + ' (Apply writes the .lua files directly to this folder)');
        return 'folder';
      });
    });
  }

  // Resolves to 'folder', 'zip' or 'cancel'.
  function chooseTarget() {
    if (dirHandle) return Promise.resolve('folder');
    if (!window.showDirectoryPicker) return Promise.resolve('zip');
    return dialog('Apply Settings',
      'Choose your USER_AI folder to save the .lua files directly, or download them as a zip.',
      [['Choose USER_AI folder...', 'folder', 'btn-primary'], ['Download zip', 'zip', 'btn-secondary'],
        ['Cancel', 'cancel', 'btn-outline-secondary']]
    ).then(function (r) { return r === 'folder' ? pickUserAiFolder() : r; });
  }

  function finishApply(out, files) {
    return out.then(function () {
      saved = files;
      try { writeStore(saved); } catch (e) { /* browser storage full: files were still written */ }
      loadAll();
      renderAll();
      setDirty(false);
      return true;
    }).catch(function (e) {
      return message('Error', 'Settings could not be saved completely. Your edits are still open.\n\n' + e.message).then(function () { return false; });
    });
  }

  function revert() {
    loadConfigs();
    renderHom();
    renderMer();
    setDirty(false);
  }

  function resetDefaults() {
    state.hom = L.defaults(HOM);
    state.mer = L.defaults(MER);
    renderHom();
    renderMer();
    changed();
  }

  function quit() {
    var close = function () {
      window.close();
      setTimeout(function () { message('AzzyAI Configuration', 'You can close this browser tab now.'); }, 200);
    };
    if (!dirty) { close(); return; }
    dialog('AzzyAI Configuration', 'Do you want to save your changes before quitting?', [
      ['Yes', 'yes', 'btn-primary'], ['No', 'no', 'btn-secondary'], ['Cancel', 'cancel', 'btn-outline-secondary']
    ]).then(function (r) {
      if (r === 'yes') apply().then(function (ok) { if (ok) close(); });
      else if (r === 'no') { setDirty(false); close(); }
    });
  }

  // ---------- file input ----------
  function pickFile(accept, multiple, directory) {
    return new Promise(function (resolve) {
      var input = el('input', { type: 'file', accept: accept, style: 'display:none' });
      if (multiple) input.multiple = true;
      if (directory) { input.setAttribute('webkitdirectory', ''); input.setAttribute('directory', ''); }
      input.addEventListener('change', function () {
        var files = Array.prototype.slice.call(input.files || []);
        document.body.removeChild(input);
        resolve(files);
      });
      document.body.appendChild(input);
      input.click();
    });
  }

  function readText(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result).replace(/^\uFEFF/, '')); };
      r.onerror = function () { reject(r.error); };
      r.readAsText(file);
    });
  }

  var IMPORTERS = {
    'H_Config.lua': function (t) { state.hom = L.load(t, HOM); renderHom(); },
    'M_Config.lua': function (t) { state.mer = L.load(t, MER); renderMer(); },
    'H_Tactics.lua': function (t) { state.tact.hom = T.parseTactics(t); tactSelected.hom = 0; renderTact('hom'); },
    'M_Tactics.lua': function (t) { state.tact.mer = T.parseTactics(t); tactSelected.mer = 0; renderTact('mer'); },
    'H_PVP_Tact.lua': function (t) { state.tact.hompvp = T.parsePvp(t); tactSelected.hompvp = 0; renderTact('hompvp'); },
    'M_PVP_Tact.lua': function (t) { state.tact.merpvp = T.parsePvp(t); tactSelected.merpvp = 0; renderTact('merpvp'); },
    'H_Extra.lua': function (t) { state.extra['H_Extra.lua'] = t; renderExtra(); },
    'M_Extra.lua': function (t) { state.extra['M_Extra.lua'] = t; renderExtra(); }
  };

  function importOne(kind) {
    pickFile('.lua', false, false).then(function (files) {
      if (!files.length) return;
      return readText(files[0]).then(function (text) {
        IMPORTERS[kind](text);
        changed();
      });
    }).catch(function (e) { message('Error', e.message); });
  }

  function exportOne(kind) {
    try {
      download(kind, buildFile(kind));
    } catch (e) {
      message('Error', e.message);
    }
  }

  // Replaces the base files with a folder's contents (USER_AI).
  function adoptFiles(map, label) {
    var found = FILES.filter(function (f) { return typeof map[f] === 'string'; });
    if (!found.length) {
      return message('AzzyAI Configuration', 'No AzzyAI configuration files (' + FILES.join(', ') + ') were found in that folder.');
    }
    saved = templateFiles();
    found.forEach(function (f) { saved[f] = map[f]; });
    try { writeStore(saved); } catch (e) { /* ignore */ }
    var detected = detectVersion(map);
    if (detected) setVersion(detected);
    loadAll();
    renderAll();
    setDirty(false);
    setEditing(label);
    var missing = FILES.filter(function (f) { return found.indexOf(f) < 0; });
    if (missing.length) {
      message('AzzyAI Configuration', 'Loaded ' + found.length + ' file(s). Missing files use the defaults: ' + missing.join(', '));
    }
  }

  function openFolder() {
    if (window.showDirectoryPicker) {
      window.showDirectoryPicker({ mode: 'readwrite' }).then(function (handle) {
        var map = {};
        return Promise.all(FILES.concat(['Defaults.lua']).map(function (f) {
          return handle.getFileHandle(f).then(function (h) { return h.getFile(); })
            .then(readText).then(function (t) { map[f] = t; }).catch(function () { /* missing */ });
        })).then(function () {
          dirHandle = handle;
          adoptFiles(map, handle.name + ' (Apply writes the files directly to this folder)');
        });
      }).catch(function (e) { if (e && e.name !== 'AbortError') message('Error', e.message); });
      return;
    }
    pickFile('', true, true).then(function (files) {
      if (!files.length) return;
      var map = {};
      return Promise.all(files.map(function (file) {
        if (FILES.indexOf(file.name) < 0 && file.name !== 'Defaults.lua') return null;
        return readText(file).then(function (t) { map[file.name] = t; });
      })).then(function () {
        dirHandle = null;
        adoptFiles(map, 'folder import (' + APPLY_HINT + ')');
      });
    }).catch(function (e) { message('Error', e.message); });
  }

  function setEditing(label) {
    $('editingLabel').textContent = 'Editing: ' + label;
  }

  // ---------- property grid ----------
  function enumOptions(entry, enums) {
    if (entry.type === 'serverType') return enums[entry.enum] || [['Official', 0], ['Private', 1]];
    return enums[entry.enum] || [];
  }

  function isDefault(entry, value) {
    if (entry.type === 'bool') return !!value === !!entry.default;
    return Number(value) === Number(entry.default);
  }

  function makeEditor(entry, enums, values, onChange) {
    var v = values[entry.name];
    var input;
    if (entry.type === 'bool') {
      input = el('select', { class: 'form-select form-select-sm' },
        [option('True', 'true', !!v), option('False', 'false', !v)]);
      input.addEventListener('change', function () { onChange(input.value === 'true'); });
    } else if (entry.type === 'enum' || entry.type === 'serverType') {
      var opts = enumOptions(entry, enums);
      input = el('select', { class: 'form-select form-select-sm' });
      var known = false;
      opts.forEach(function (o) {
        if (Number(o[1]) === Number(v)) known = true;
        input.appendChild(option(o[0], o[1], Number(o[1]) === Number(v)));
      });
      if (!known) input.appendChild(option(String(v), v, true));
      input.addEventListener('change', function () { onChange(Number(input.value)); });
    } else {
      input = el('input', {
        type: 'number', class: 'form-control form-control-sm',
        step: entry.type === 'double' ? 'any' : '1',
        min: typeof entry.min === 'number' ? String(entry.min) : null,
        max: typeof entry.max === 'number' ? String(entry.max) : null
      });
      input.value = String(v);
      input.addEventListener('change', function () {
        var n = entry.type === 'double' ? parseFloat(input.value) : parseInt(input.value, 10);
        if (isNaN(n)) { input.value = String(values[entry.name]); return; }
        n = L.clamp(entry, n);
        input.value = String(n);
        onChange(n);
      });
    }
    input.setAttribute('aria-label', entry.name);
    return input;
  }

  function sortByName(list) {
    return list.slice().sort(function (a, b) {
      var x = a.name.toLowerCase(), y = b.name.toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }

  function defaultLabel(entry, enums) {
    if (entry.type === 'bool') return entry.default ? 'True' : 'False';
    if (entry.type === 'enum' || entry.type === 'serverType') {
      var match = enumOptions(entry, enums).filter(function (o) { return Number(o[1]) === Number(entry.default); })[0];
      if (match) return match[0];
    }
    return String(entry.default);
  }

  function gridRow(entry, enums, values, selectedName, onSelect, rerender, applied) {
    var nameCell = el('td', { class: 'prop-name', text: entry.name, title: entry.name });
    var row = el('tr', { class: selectedName === entry.name ? 'table-active' : '' });
    var mark = function (val) {
      var mod = !isDefault(entry, val);
      var pend = !sameValue(entry, val, applied[entry.name]);
      row.classList.toggle('modified', mod);
      row.classList.toggle('pending', pend);
      nameCell.title = entry.name + (mod ? ' (changed from default)' : '') + (pend ? ' (not applied yet)' : '');
    };
    var editor = makeEditor(entry, enums, values, function (val) {
      values[entry.name] = val;
      mark(val);
      changed();
    });
    mark(values[entry.name]);
    var select = function () {
      var rows = row.parentNode ? row.parentNode.parentNode.querySelectorAll('tr.table-active') : [];
      Array.prototype.forEach.call(rows, function (r) { r.classList.remove('table-active'); });
      row.classList.add('table-active');
      onSelect(entry);
    };
    var reset = el('button', {
      type: 'button', class: 'btn btn-sm btn-link btn-reset flex-shrink-0', text: '\u21BA',
      title: 'Reset to default (' + defaultLabel(entry, enums) + ')',
      'aria-label': 'Reset ' + entry.name + ' to default',
      onclick: function (ev) {
        ev.stopPropagation();
        values[entry.name] = entry.default;
        changed();
        rerender();
      }
    });
    row.addEventListener('click', select);
    editor.addEventListener('focus', select);
    row.appendChild(nameCell);
    row.appendChild(el('td', { class: 'prop-value' }, [el('div', { class: 'd-flex align-items-center gap-1' }, [editor, reset])]));
    return row;
  }

  // Collapsible category header; scope is 'hom' or 'mer'.
  function groupRow(scope, cat, count, rerender, id) {
    var open = !collapsed[scope][cat];
    return el('tr', {
      class: 'table-secondary group-row', id: id, 'aria-expanded': open ? 'true' : 'false',
      onclick: function () { collapsed[scope][cat] = open; rerender(); }
    }, [el('th', { colspan: '2' }, [(open ? '\u25BE ' : '\u25B8 ') + cat + ' ', el('span', { class: 'badge text-bg-secondary', text: String(count) })])]);
  }

  function emptyRow(text) {
    return el('tr', {}, [el('td', { colspan: '2', class: 'text-muted text-center py-3', text: text })]);
  }

  function matchesSearch(entry, q) {
    q = q.trim().toLowerCase();
    if (!q) return true;
    return entry.name.toLowerCase().indexOf(q) >= 0 || (entry.description || '').toLowerCase().indexOf(q) >= 0;
  }

  function modifiedCount(schema, values) {
    return schema.filter(function (e) { return e.browsable !== false && !isDefault(e, values[e.name]); }).length;
  }

  // ---------- Homunculus tab ----------
  function classify(name, table, order) {
    var lower = name.toLowerCase();
    for (var i = 0; i < order.length; i++) {
      var k = order[i];
      if (lower.indexOf(k) >= 0) return k;
      for (var j = 0; j < table[k].length; j++) if (lower.indexOf(table[k][j]) >= 0) return k;
    }
    return null;
  }

  function homVisible(entry) {
    if (entry.browsable === false) return false;
    if (!matchesSearch(entry, homSearch)) return false;
    if (homOnlyModified && isDefault(entry, state.hom[entry.name])) return false;
    var sSel = $('homSFilter').value;
    var bSel = $('homBaseFilter').value;
    var sType = classify(entry.name, S_TYPES, S_ORDER);
    var bType = sType ? null : classify(entry.name, BASE_TYPES, BASE_ORDER);
    if (sSel !== 'All Types' && sType && sType !== sSel.toLowerCase()) return false;
    if (bSel !== 'All Types' && bType && bType !== bSel.toLowerCase()) return false;
    return true;
  }

  function setHomDescription(entry) {
    homSelected = entry ? entry.name : null;
    $('homDescTitle').textContent = entry ? entry.name : 'Description';
    $('homDescription').textContent = entry
      ? (entry.description ? entry.description : 'No description available for this property.')
      : 'Select a setting to see its description here.';
  }

  function renderHom() {
    var visible = HOM.filter(homVisible);
    // While searching, show matches from every category, grouped, instead of only the current tab.
    var searching = homSearch.trim() !== '' || homOnlyModified;
    var tabs = $('homCategoryTabs');
    tabs.innerHTML = '';
    HOM_CATEGORIES.forEach(function (cat, i) {
      var n = visible.filter(function (e) { return e.category === cat; }).length;
      var btn = el('button', {
        type: 'button', class: 'nav-link' + (!searching && cat === homCategory ? ' active' : '') + (searching && !n ? ' disabled' : ''),
        onclick: function () {
          if (!searching) { homCategory = cat; renderHom(); return; }
          collapsed.hom[cat] = false;
          renderHom();
          var h = $('homGroup-' + i);
          if (h) h.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
      }, [cat + ' ', el('span', { class: 'badge text-bg-secondary', text: String(n) })]);
      tabs.appendChild(el('li', { class: 'nav-item' }, [btn]));
    });

    var body = $('homGridBody');
    body.innerHTML = '';
    var applied = L.load(saved['H_Config.lua'], HOM);
    if (searching) {
      HOM_CATEGORIES.forEach(function (cat, i) {
        var items = sortByName(visible.filter(function (e) { return e.category === cat; }));
        if (!items.length) return;
        body.appendChild(groupRow('hom', cat, items.length, renderHom, 'homGroup-' + i));
        if (collapsed.hom[cat]) return;
        items.forEach(function (entry) {
          body.appendChild(gridRow(entry, HOM_ENUMS, state.hom, homSelected, setHomDescription, renderHom, applied));
        });
      });
    } else {
      sortByName(visible.filter(function (e) { return e.category === homCategory; })).forEach(function (entry) {
        body.appendChild(gridRow(entry, HOM_ENUMS, state.hom, homSelected, setHomDescription, renderHom, applied));
      });
    }
    if (!body.firstChild) body.appendChild(emptyRow(visible.length ? 'No settings in this category match the filters.' : 'No matching settings.'));
    updateSummaries();
  }

  function updateSummaries() {
    var homCount = HOM.filter(homVisible).length;
    $('homSummary').textContent = (homCount === 0
      ? 'No matching settings. Clear filters to see all options.'
      : homCount + ' matching settings. Select a setting for its description.') +
      ' ' + modifiedCount(HOM, state.hom) + ' changed from default.';
    $('merSummary').textContent = MER.filter(merVisible).length + ' matching settings. ' +
      modifiedCount(MER, state.mer) + ' changed from default.';
  }

  // ---------- Mercenary tab ----------
  function setMerDescription(entry) {
    merSelected = entry ? entry.name : null;
    $('merDescTitle').textContent = entry ? entry.name : 'Description';
    $('merDescText').textContent = entry ? (entry.description || 'No description available for this property.') : 'Select a setting to see its description here.';
  }

  function merVisible(entry) {
    if (entry.browsable === false) return false;
    if (!matchesSearch(entry, merSearch)) return false;
    if (merOnlyModified && isDefault(entry, state.mer[entry.name])) return false;
    return true;
  }

  function renderMer() {
    var body = $('merGridBody');
    body.innerHTML = '';
    var list = MER.filter(merVisible);
    var applied = L.load(saved['M_Config.lua'], MER);
    if (merSort === 'alphabetical') {
      sortByName(list).forEach(function (entry) {
        body.appendChild(gridRow(entry, MER_ENUMS, state.mer, merSelected, setMerDescription, renderMer, applied));
      });
    } else {
      var cats = [];
      list.forEach(function (e) { if (cats.indexOf(e.category) < 0) cats.push(e.category); });
      cats.sort();
      cats.forEach(function (cat) {
        var items = sortByName(list.filter(function (e) { return e.category === cat; }));
        body.appendChild(groupRow('mer', cat, items.length, renderMer));
        if (collapsed.mer[cat]) return;
        items.forEach(function (entry) {
          body.appendChild(gridRow(entry, MER_ENUMS, state.mer, merSelected, setMerDescription, renderMer, applied));
        });
      });
    }
    if (!list.length) body.appendChild(emptyRow('No matching settings.'));
    $('merSortCategorized').classList.toggle('active', merSort === 'categorized');
    $('merSortAlphabetical').classList.toggle('active', merSort === 'alphabetical');
    updateSummaries();
  }

  // ---------- Tactics tabs ----------
  var F = T.F;

  function tactLabel(kind, t) {
    return T.LAYOUTS[kind].pvp ? t.id : (t.name || '(unnamed) #' + t.id);
  }

  function selectField(values, idx, options, onChange) {
    var s = el('select', { class: 'form-select form-select-sm' });
    var cur = values[idx];
    var known = false;
    options.forEach(function (o) {
      if (o[1] === cur) known = true;
      s.appendChild(option(o[0], o[1], o[1] === cur));
    });
    if (!known) s.appendChild(option(cur + ' (not supported by the GUI)', cur, true));
    s.addEventListener('change', function () { values[idx] = s.value; onChange(); });
    return s;
  }

  function skillField(values, layout, onChange) {
    var cur = values[F.SKILL];
    var mode, num;
    if (cur === 'SKILL_ALWAYS') { mode = 'always'; num = 100; }
    else if (cur === 'SKILL_NEVER') { mode = 'never'; num = 0; }
    else if (/^-?\d+$/.test(cur) && parseInt(cur, 10) < 0 && layout.onceLevel) { mode = 'once'; num = Math.min(5, -parseInt(cur, 10)); }
    else if (/^-?\d+$/.test(cur)) { mode = 'times'; num = Math.max(0, Math.min(100, parseInt(cur, 10))); }
    else { mode = 'raw'; num = 0; }

    var s = el('select', { class: 'form-select form-select-sm' }, [
      option('Always', 'always', mode === 'always'),
      option('Never', 'never', mode === 'never'),
      option('This many times:', 'times', mode === 'times')
    ]);
    if (layout.onceLevel) s.appendChild(option('Once; level:', 'once', mode === 'once'));
    if (mode === 'raw') s.appendChild(option(cur + ' (not supported by the GUI)', 'raw', true));
    var n = el('input', { type: 'number', class: 'form-control form-control-sm', step: '1' });
    n.value = String(num);

    function sync() {
      var m = s.value;
      n.disabled = m !== 'times' && m !== 'once';
      n.min = m === 'once' ? '1' : '0';
      n.max = m === 'once' ? '5' : '100';
    }
    function write() {
      var m = s.value;
      var v = parseInt(n.value, 10);
      if (isNaN(v)) v = 0;
      if (m === 'once') { v = Math.max(1, Math.min(5, v)); n.value = String(v); values[F.SKILL] = String(-v); }
      else if (m === 'times') { v = Math.max(0, Math.min(100, v)); n.value = String(v); values[F.SKILL] = String(v); }
      else if (m === 'always') values[F.SKILL] = 'SKILL_ALWAYS';
      else if (m === 'never') values[F.SKILL] = 'SKILL_NEVER';
      else values[F.SKILL] = cur;
      onChange();
    }
    s.addEventListener('change', function () { if (s.value === 'once') n.value = '5'; sync(); write(); });
    n.addEventListener('change', write);
    sync();
    return el('div', { class: 'input-group input-group-sm' }, [s, n]);
  }

  function debuffField(values, kinds, onChange) {
    var cur = values[F.DEBUFF];
    var kind = null, phase = 'C', known = cur === 'DEBUFF_NEVER';
    var m = /^DEBUFF_(.+)_([CA])$/.exec(cur);
    if (m && kinds.some(function (k) { return k[1] === m[1]; })) { kind = m[1]; phase = m[2]; known = true; }

    var s = el('select', { class: 'form-select form-select-sm' });
    kinds.forEach(function (k) { s.appendChild(option(k[0], k[1] || '', known && k[1] === kind)); });
    if (!known) s.appendChild(option(cur + ' (not supported by the GUI)', '__raw', true));
    var w = el('select', { class: 'form-select form-select-sm' }, [
      option('Chasing', 'C', phase === 'C'), option('Attacking', 'A', phase === 'A')
    ]);
    function sync() { w.disabled = s.value === '' || s.value === '__raw'; }
    function write() {
      if (s.value === '__raw') values[F.DEBUFF] = cur;
      else if (s.value === '') values[F.DEBUFF] = 'DEBUFF_NEVER';
      else values[F.DEBUFF] = 'DEBUFF_' + s.value + '_' + w.value;
      onChange();
    }
    s.addEventListener('change', function () { sync(); write(); });
    w.addEventListener('change', write);
    sync();
    return el('div', { class: 'input-group input-group-sm' }, [s, el('span', { class: 'input-group-text', text: 'While' }), w]);
  }

  function numberField(values, idx, min, max, step, decimals, onChange) {
    var n = el('input', { type: 'number', class: 'form-control form-control-sm', min: String(min), max: String(max), step: String(step) });
    var v = parseFloat(values[idx]);
    n.value = isNaN(v) ? values[idx] : String(v);
    n.addEventListener('change', function () {
      var x = parseFloat(n.value);
      if (isNaN(x)) { n.value = values[idx]; return; }
      x = Math.max(min, Math.min(max, x));
      x = decimals ? Math.round(x * 10) / 10 : Math.round(x);
      n.value = String(x);
      values[idx] = String(x);
      onChange();
    });
    return n;
  }

  function renderTact(kind) {
    var layout = T.LAYOUTS[kind];
    var list = state.tact[kind];
    var root = $('tact-' + kind);
    root.innerHTML = '';
    if (tactSelected[kind] >= list.length) tactSelected[kind] = list.length - 1;
    var t = list[tactSelected[kind]];

    var listBox = el('select', { class: 'form-select tact-list', size: '18', 'aria-label': 'Tactics' });
    list.forEach(function (x, i) { listBox.appendChild(option(tactLabel(kind, x), i, i === tactSelected[kind])); });
    listBox.addEventListener('change', function () { tactSelected[kind] = parseInt(listBox.value, 10); renderTact(kind); });

    var addBtn = el('button', {
      type: 'button', class: 'btn btn-sm btn-outline-primary', text: 'Add',
      onclick: function () {
        list.push(layout.pvp ? T.newPvpTact('new') : T.newTact(1, ''));
        tactSelected[kind] = list.length - 1;
        changed();
        renderTact(kind);
      }
    });
    var isZero = t && t.id === '0';
    var removeBtn = el('button', {
      type: 'button', class: 'btn btn-sm btn-outline-danger', text: 'Remove', disabled: !t || isZero,
      onclick: function () {
        if (!t || isZero) return;
        list.splice(tactSelected[kind], 1);
        if (tactSelected[kind] >= list.length) tactSelected[kind] = list.length - 1;
        changed();
        renderTact(kind);
      }
    });

    var left = el('div', { class: 'col-md-4' }, [listBox, el('div', { class: 'd-flex gap-2 mt-2' }, [addBtn, removeBtn])]);
    var right = el('div', { class: 'col-md-8' });

    if (t) {
      var onChange = function () { changed(); };
      var head = el('div', { class: 'row g-2 mb-3' });
      if (!layout.pvp) {
        var name = el('input', { type: 'text', class: 'form-control form-control-sm', disabled: isZero });
        name.value = t.name;
        name.addEventListener('input', function () {
          t.name = name.value;
          listBox.options[tactSelected[kind]].text = tactLabel(kind, t);
          name.classList.toggle('is-invalid', !t.name.trim());
          changed();
        });
        name.classList.toggle('is-invalid', !t.name.trim());
        head.appendChild(el('div', { class: 'col-sm-8' }, [
          el('label', { class: 'form-label small mb-0', text: layout.nameLabel }), name,
          el('div', { class: 'invalid-feedback', text: 'You must enter a monster name.' })
        ]));
      }
      var id = el('input', { type: 'text', class: 'form-control form-control-sm', disabled: isZero || (layout.pvp && t.id !== 'new') && !t.editable });
      id.value = t.id;
      var idFeedback = el('div', { class: 'invalid-feedback' });
      var checkId = function () {
        var dup = list.some(function (o) { return o !== t && o.id === t.id; });
        var bad = layout.pvp ? (!t.id.trim() || t.id === 'new') : !/^-?\d+$/.test(t.id);
        idFeedback.textContent = layout.pvp
          ? (bad ? 'You must enter a name.' : 'You must enter a unique name.')
          : 'You must enter a unique monster ID';
        id.classList.toggle('is-invalid', bad || dup);
      };
      id.addEventListener('input', function () {
        t.id = id.value.trim();
        if (layout.pvp) { t.editable = true; listBox.options[tactSelected[kind]].text = tactLabel(kind, t); }
        checkId();
        changed();
      });
      checkId();
      head.appendChild(el('div', { class: layout.pvp ? 'col-sm-8' : 'col-sm-4' }, [
        el('label', { class: 'form-label small mb-0', text: layout.idLabel }), id, idFeedback
      ]));
      right.appendChild(head);

      var grid = el('div', { class: 'row g-2' });
      layout.fields.forEach(function (f) {
        var idx = f[0], label = f[1], fkind = f[2], opts = f[3];
        var control;
        switch (fkind) {
          case 'select': control = selectField(t.values, idx, opts, onChange); break;
          case 'skill': control = skillField(t.values, layout, onChange); break;
          case 'debuff': control = debuffField(t.values, opts, onChange); break;
          case 'sp': control = numberField(t.values, idx, -1, 1000, 1, false, onChange); break;
          case 'weight': control = numberField(t.values, idx, 0, 20, 0.1, true, onChange); break;
          case 'snipe': {
            var cb = el('input', { type: 'checkbox', class: 'form-check-input', id: 'snipe-' + kind });
            cb.checked = t.values[idx] !== 'SNIPE_DISABLE';
            cb.addEventListener('change', function () { t.values[idx] = cb.checked ? 'SNIPE_OK' : 'SNIPE_DISABLE'; onChange(); });
            grid.appendChild(el('div', { class: 'col-sm-6 d-flex align-items-end' }, [
              el('div', { class: 'form-check' }, [cb, el('label', { class: 'form-check-label', for: 'snipe-' + kind, text: label })])
            ]));
            return;
          }
        }
        var wide = fkind === 'skill' || fkind === 'debuff' || (fkind === 'select' && idx === F.BASIC);
        grid.appendChild(el('div', { class: wide ? 'col-12' : 'col-sm-6' }, [
          el('label', { class: 'form-label small mb-0', text: label }), control
        ]));
      });
      right.appendChild(el('fieldset', { class: 'border rounded p-2' }, [
        el('legend', { class: 'float-none w-auto px-2 fs-6 mb-0', text: 'Overall Tactics' }), grid
      ]));
    }

    var row = el('div', { class: 'row g-3' }, [left, right]);
    if (layout.warning) root.appendChild(el('div', { class: 'alert alert-warning py-2 small', text: layout.warning }));
    root.appendChild(row);
  }

  // ---------- Extra ----------
  function renderExtra() {
    $('extraSelect').value = extraFile;
    $('extraText').value = state.extra[extraFile] || '';
  }

  // ---------- general ----------
  function renderAll() {
    renderHom();
    renderMer();
    ['hom', 'mer', 'hompvp', 'merpvp'].forEach(renderTact);
    renderExtra();
  }

  function showTab(id) {
    var btn = document.querySelector('[data-bs-target="#' + id + '"]');
    if (btn) bootstrap.Tab.getOrCreateInstance(btn).show();
  }

  function openDocumentation() {
    var url = '../USER_AI/Documentation.pdf';
    if (location.protocol === 'file:') { window.open(url, '_blank'); return; }
    // Hosted without a USER_AI folder next to it (e.g. GitHub Pages): use the online copy.
    var win = window.open('', '_blank');
    fetch(url, { method: 'HEAD' }).then(function (r) {
      if (!r.ok) throw new Error();
      return url;
    }).catch(function () {
      return DOC_ONLINE_URL;
    }).then(function (target) {
      if (win) win.location.href = target;
      else window.open(target, '_blank');
    });
  }

  function bindMenu(id, fn) {
    var e = $(id);
    if (!e) return;
    e.addEventListener('click', function (ev) {
      ev.preventDefault();
      if (e.classList.contains('disabled')) return;
      fn();
    });
  }

  function init() {
    setupModal();
    initTheme();

    if (!HOM.length || !MER.length || !Object.keys(TEMPLATES).length) {
      message('Error', 'Some data files (homSchema.js, merSchema.js, templates.js) failed to load.');
    }

    saved = loadStore() || templateFiles();
    var storedVersion = null;
    try { storedVersion = localStorage.getItem(VERSION_KEY); } catch (e) { /* ignore */ }
    setVersion(storedVersion || detectVersion(saved) || 'hg');
    loadAll();
    setEditing((loadStore() ? 'browser storage' : 'built-in defaults') + ' (' + APPLY_HINT + ')');

    // Homunculus filters
    var filters = loadFilters();
    if (filters.s) $('homSFilter').value = filters.s;
    if (filters.base) $('homBaseFilter').value = filters.base;
    if (!$('homSFilter').value) $('homSFilter').value = 'All Types';
    if (!$('homBaseFilter').value) $('homBaseFilter').value = 'All Types';
    $('homSearch').addEventListener('input', function () { homSearch = $('homSearch').value; renderHom(); });
    $('homOnlyModified').addEventListener('change', function () { homOnlyModified = $('homOnlyModified').checked; renderHom(); });
    $('homSFilter').addEventListener('change', function () { saveFilters(); renderHom(); });
    $('homBaseFilter').addEventListener('change', function () { saveFilters(); renderHom(); });
    $('homClearFilters').addEventListener('click', function () {
      $('homSearch').value = '';
      homSearch = '';
      $('homOnlyModified').checked = false;
      homOnlyModified = false;
      $('homSFilter').value = 'All Types';
      $('homBaseFilter').value = 'All Types';
      saveFilters();
      renderHom();
    });

    $('merSearch').addEventListener('input', function () { merSearch = $('merSearch').value; renderMer(); });
    $('merOnlyModified').addEventListener('change', function () { merOnlyModified = $('merOnlyModified').checked; renderMer(); });

    $('merSortCategorized').addEventListener('click', function () { merSort = 'categorized'; renderMer(); });
    $('merSortAlphabetical').addEventListener('click', function () { merSort = 'alphabetical'; renderMer(); });

    $('aiVersion').value = version;
    $('aiVersion').addEventListener('change', function () {
      setVersion($('aiVersion').value);
      // Options that were hidden until now take their value from the loaded file.
      var fromFile = L.load(saved['H_Config.lua'], HOM);
      HOM.forEach(function (e) { if (state.hom[e.name] === undefined) state.hom[e.name] = fromFile[e.name]; });
      if (homSelected && !HOM.some(function (e) { return e.name === homSelected; })) setHomDescription(null);
      renderHom();
    });

    $('extraSelect').addEventListener('change', function () { extraFile = $('extraSelect').value; renderExtra(); });
    $('extraText').addEventListener('input', function () { state.extra[extraFile] = $('extraText').value; changed(); });

    // Menus and buttons
    bindMenu('menuOpenFolder', openFolder);
    Array.prototype.forEach.call(document.querySelectorAll('[data-import]'), function (e) {
      bindMenu(e.id, function () { importOne(e.getAttribute('data-import')); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-export]'), function (e) {
      bindMenu(e.id, function () { exportOne(e.getAttribute('data-export')); });
    });
    bindMenu('menuExportAll', function () {
      try { downloadAll(buildAll()); } catch (e) { message('Error', e.message); }
    });
    bindMenu('menuExit', quit);
    bindMenu('menuApply', apply);
    bindMenu('menuRevert', revert);
    bindMenu('menuReset', resetDefaults);
    bindMenu('menuDocs', openDocumentation);
    bindMenu('menuAbout', function () { message('About', ABOUT_TEXT); });
    $('btnApply').addEventListener('click', apply);
    $('btnQuit').addEventListener('click', quit);
    $('btnOpenFolder').addEventListener('click', openFolder);
    $('btnDownloadZip').addEventListener('click', function () {
      try { downloadAll(buildAll()); } catch (e) { message('Error', e.message); }
    });
    $('btnRevert').addEventListener('click', revert);

    document.addEventListener('keydown', function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && (ev.key === 's' || ev.key === 'S')) {
        ev.preventDefault();
        if (dirty) apply();
      } else if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && (ev.key === 'f' || ev.key === 'F')) {
        var search = $('tab-hom').classList.contains('active') ? $('homSearch')
          : $('tab-mer').classList.contains('active') ? $('merSearch') : null;
        if (search) {
          ev.preventDefault();
          search.focus();
          search.select();
        }
      }
    });

    window.addEventListener('beforeunload', function (ev) {
      if (!dirty) return;
      ev.preventDefault();
      ev.returnValue = '';
    });

    renderAll();
    setHomDescription(null);
    setMerDescription(null);
    setDirty(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
