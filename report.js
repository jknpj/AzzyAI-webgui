// report.js
// Help > "Export diagnostics for a bug report...": reads the game folder the player picks and builds
// AzzyAI-diag-<date>.zip with the startup report, the AI logs, the configuration and the data files
// that remember learned skill levels and cooldowns. Owner IDs become <owner> and nothing is
// uploaded: the player attaches the file to the GitHub issue.
(function () {
  'use strict';

  var tr = window.AzzyI18n ? window.AzzyI18n.t : function (s, a) {
    return a ? s.replace(/\{(\d+)\}/g, function (m, i) { return a[i]; }) : s;
  };
  var REPO = 'https://github.com/jknpj/AzzyAI';
  var ISSUE = REPO + '/issues/new?template=bug_report.yml';

  var STARTUP = ['AAIStartH.txt', 'AAIStartM.txt'];
  var LOGS = ['AAI_ERROR.log', 'AAI_SKILLFAIL.log', 'AAI_PROBE.log'];
  var CONFIGS = ['H_Config.lua', 'M_Config.lua', 'H_Tactics.lua', 'M_Tactics.lua', 'H_PVP_Tact.lua',
    'M_PVP_Tact.lua', 'H_Extra.lua', 'M_Extra.lua'];
  var TAIL = 400;
  // Only these folders are walked, so picking the game folder does not read the whole client.
  var DIRS = { AI: true, USER_AI: true, Types: true, data: true };

  function wanted(path) {
    var name = path.substring(path.lastIndexOf('/') + 1);
    if (STARTUP.indexOf(name) >= 0 || LOGS.indexOf(name) >= 0 || CONFIGS.indexOf(name) >= 0) return true;
    if (/[\/](Types|data)\//.test('/' + path) && /\.lua$/i.test(name)) return true;
    return false;
  }

  function shortName(path) {
    // "AI/USER_AI/Types/Dieter.lua" -> "Types/Dieter.lua"
    var i = path.indexOf('USER_AI/');
    return i >= 0 ? path.substring(i + 'USER_AI/'.length) : path;
  }

  function owners(paths) {
    var ids = [];
    paths.forEach(function (path) {
      var m = /[\/]?[HM]_(\d+)/.exec(path);
      if (m && ids.indexOf(m[1]) < 0) ids.push(m[1]);
    });
    return ids;
  }

  function redact(text, ids) {
    ids.forEach(function (id) {
      text = text.replace(new RegExp('(^|[^0-9])' + id + '(?![0-9])', 'g'), '$1<owner>');
    });
    return text;
  }

  function tail(text) {
    var lines = text.replace(/\r\n/g, '\n').split('\n');
    if (lines.length <= TAIL) return { text: text, truncated: false };
    return {
      text: '... ' + (lines.length - TAIL) + ' earlier lines left out ...\n' + lines.slice(-TAIL).join('\n'),
      truncated: true
    };
  }

  function isLog(name) { return LOGS.indexOf(name) >= 0; }

  // ---------- reading the folder ----------

  function readWithPicker() {
    return window.showDirectoryPicker({ id: 'azzyai-diag', mode: 'read' }).then(async function (root) {
      var out = {};
      async function visit(dir, prefix, depth) {
        for await (var entry of dir.entries()) {
          var name = entry[0], handle = entry[1];
          var path = prefix ? prefix + '/' + name : name;
          if (handle.kind === 'file') {
            if (!wanted(path) || !/\.(lua|log|txt)$/i.test(name)) continue;
            out[path] = await (await handle.getFile()).text();
          } else if (DIRS[name] && depth < 3) {
            await visit(handle, path, depth + 1);
          }
        }
      }
      await visit(root, '', 0);
      return out;
    });
  }

  // Fallback for browsers without the File System Access API: a folder input.
  function readWithInput() {
    return new Promise(function (resolve) {
      var input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.multiple = true;
      var done = false;
      function finish(out) { if (!done) { done = true; resolve(out); } }
      input.onchange = function () {
        var files = Array.prototype.slice.call(input.files || []);
        Promise.all(files.map(function (f) {
          var path = f.webkitRelativePath || f.name;
          if (!wanted(path) || !/\.(lua|log|txt)$/i.test(f.name)) return null;
          return f.text().then(function (t) { return [path, t]; });
        })).then(function (pairs) {
          var out = {};
          pairs.forEach(function (p) { if (p) out[p[0]] = p[1]; });
          finish(out);
        });
      };
      // The player closed the picker without choosing anything.
      window.addEventListener('focus', function () {
        setTimeout(function () { if (!input.files || input.files.length === 0) finish({}); }, 1500);
      }, { once: true });
      input.click();
    });
  }

  function readFolder() {
    if (window.showDirectoryPicker) return readWithPicker();
    return readWithInput();
  }

  // ---------- building the bundle ----------

  function release(files) {
    for (var i = 0; i < STARTUP.length; i++) {
      var text = files[STARTUP[i]];
      if (!text) continue;
      var m = /Constant version:(\S+)/.exec(text);
      if (m) return m[1].trim();
    }
    return '';
  }

  function buildZip(files) {
    var names = Object.keys(files).sort();
    var ids = owners(names);
    var stamp = new Date().toISOString().replace(/[:T]/g, '-').substring(0, 16);
    var zip = new window.JSZip();
    var listed = [];
    names.forEach(function (path) {
      var name = shortName(path);
      var text = redact(files[path], ids);
      var info = { name: redact(name, ids), truncated: false };
      if (isLog(name.substring(name.lastIndexOf('/') + 1))) {
        var cut = tail(text);
        text = cut.text;
        info.truncated = cut.truncated;
      }
      zip.file(info.name, text);
      listed.push(info);
    });
    var version = release(files);
    var info2 = ['AzzyAI diagnostics',
      'Release: ' + (version || 'unknown'),
      'Exported: ' + new Date().toString(),
      'Files:',
      listed.map(function (f) { return '  ' + f.name + (f.truncated ? ' (last ' + TAIL + ' lines)' : ''); }).join('\n'),
      '',
      'Owner IDs in file names and log lines were replaced by <owner>.',
      'Nothing was uploaded: this file stays on your computer until you attach it.'].join('\n');
    zip.file('info.txt', info2);
    return zip.generateAsync({ type: 'blob' }).then(function (blob) {
      return { blob: blob, name: 'AzzyAI-diag-' + stamp + '.zip', version: version, count: listed.length };
    });
  }

  function buildText(files) {
    var names = Object.keys(files).sort();
    var ids = owners(names);
    var stamp = new Date().toISOString().replace(/[:T]/g, '-').substring(0, 16);
    var version = release(files);
    var out = ['AzzyAI diagnostics', 'Release: ' + (version || 'unknown'), 'Exported: ' + new Date().toString(),
      'Owner IDs in file names and log lines were replaced by <owner>.', ''];
    names.forEach(function (path) {
      var text = redact(files[path], ids);
      if (isLog(shortName(path).substring(shortName(path).lastIndexOf('/') + 1))) text = tail(text).text;
      out.push('===== ' + redact(shortName(path), ids) + ' =====', text, '');
    });
    var blob = new Blob([out.join('\n')], { type: 'text/plain;charset=utf-8' });
    return { blob: blob, name: 'AzzyAI-diag-' + stamp + '.txt', version: version, count: names.length };
  }

  // ---------- the flow ----------

  function run(ui) {
    var dlg = ui && ui.dialog;
    var save = ui && ui.download;
    var intro = tr('This reads your game folder (the one with USER_AI and AAIStartH.txt) and builds one file with the startup report, the AI logs, your configuration and the learned skill levels. Owner IDs become <owner>; nothing is uploaded.');
    var pick = dlg ? dlg(tr('Export diagnostics'), intro,
      [[tr('Choose folder'), 'pick', 'btn-primary'], [tr('Cancel'), 'cancel']]) : Promise.resolve('cancel');
    return pick.then(function (choice) {
      if (choice !== 'pick') return 0;
      return readFolder().then(function (files) {
        var count = Object.keys(files).length;
        if (!count) {
          return (dlg ? dlg(tr('Export diagnostics'),
            tr('No AzzyAI files were found in that folder. Pick the game folder that contains USER_AI and AAIStartH.txt, or the USER_AI folder itself.'),
            [[tr('OK'), 'ok', 'btn-primary']]) : Promise.resolve()).then(function () { return 0; });
        }
        var bundle;
        if (window.JSZip) {
          bundle = buildZip(files);
        } else {
          bundle = Promise.resolve(buildText(files));
        }
        return bundle.then(function (result) {
          if (save) save(result.name, result.blob);
          var text = tr('Saved {0} ({1} files, release {2}). Attach it to the issue: the form asks for the version, your server and what happened.',
            [result.name, result.count, result.version || '?']);
          var title = 'AzzyAI ' + (result.version || '') + ': ';
          var after = dlg ? dlg(tr('Diagnostics ready'), text,
            [[tr('Open the GitHub issue'), 'issue', 'btn-primary'], [tr('Close'), 'close']]) : Promise.resolve('close');
          return after.then(function (choice2) {
            if (choice2 === 'issue') window.open(ISSUE + '&title=' + encodeURIComponent(title), '_blank');
            return 1;
          });
        });
      });
    });
  }

  window.AzzyReport = { run: run };
})();
