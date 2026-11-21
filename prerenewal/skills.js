// skills.js
// Homunculus skills shown by the web GUI: icon, name, the settings that control the skill and the
// official (LATAM) numbers at max level, from USER_AI/H_SkillList.lua.
// Official names, in-game descriptions (skilldata.js) and icons (img/skills) are a local copy made
// with skilldata_sync.py from the Divine Pride API; the page loads nothing from Divine Pride.
// The names below are used until skilldata.js has been generated.
// stats: [SP at lv1, SP at max lv, fixed cast ms, variable cast ms, cooldown ms, duration ms] at max level.
// match: lowercase pieces of setting names that belong to the skill.
(function () {
  'use strict';

  var ICON = 'img/skills/{id}.png';
  var PAGE = 'https://www.divine-pride.net/database/skill/{id}';
  var DATA = window.AzzySkillData || {};

  var HOMUNCULI = [
    ['lif', 'Lif'], ['amistr', 'Amistr'], ['filir', 'Filir'], ['vanilmirth', 'Vanilmirth'],
    
  ];

  function s(id, homun, en, pt, es, maxlv, stats, match) {
    return { id: id, homun: homun, name: { en: en, pt: pt, es: es }, maxlv: maxlv, stats: stats, match: match || [] };
  }

  var LIST = [
    // Lif
    s(8001, 'lif', 'Healing Hands', 'Cura pelas Mãos', 'Manos Sanadoras', 5, [13, 25, 0, 0, 20000, 0], []),
    s(8002, 'lif', 'Urgent Escape', 'Bater em Retirada', 'Escape Urgente', 5, [20, 40, 0, 0, 35000, 20000], ['lifescape']),
    s(8004, 'lif', 'Mental Charge', 'Esforço Mental', 'Carga Mental', 3, [100, 100, 0, 0, 1200000, 300000], []),
    // Amistr
    s(8005, 'amistr', 'Castling', 'Troca de Lugar', 'Cambio de Lugar', 5, [10, 10, 0, 0, 1000, 0], ['castledefend']),
    s(8006, 'amistr', 'Amistr Bulwark', 'Fortaleza', 'Bastión de Amistr', 5, [20, 40, 0, 0, 30000, 20000], ['bulwark']),
    s(8008, 'amistr', 'Blood Lust', 'Desejo de Sangue', 'Lujuria de Sangre', 3, [120, 120, 0, 0, 900000, 300000], ['bloodlust']),
    // Filir
    s(8009, 'filir', 'Moonlight', 'Pica-Pau', 'Luz de Luna', 5, [4, 20, 0, 0, 2000, 0], ['usefilirmoon']),
    s(8010, 'filir', 'Flitting', 'Voo Frenético', 'Revoloteo', 5, [30, 70, 0, 0, 120000, 40000], ['filirflit']),
    s(8011, 'filir', 'Accelerated Flight', 'Voo Acelerado', 'Vuelo Acelerado', 5, [30, 70, 0, 0, 120000, 40000], ['filiraccel']),
    s(8012, 'filir', 'S.B.R.44', 'S.B.R.44', 'S.B.R.44', 3, [1, 1, 0, 0, 1000, 0], ['sbr44']),
    // Vanilmirth
    s(8013, 'vanilmirth', 'Caprice', 'Capricho', 'Capricho', 5, [22, 30, 0, 0, 2800, 0], ['vanilcaprice']),
    s(8014, 'vanilmirth', 'Chaotic Blessings', 'Bênção Caótica', 'Bendiciones Caóticas', 5, [40, 40, 0, 0, 3000, 0], []),
    s(8016, 'vanilmirth', 'Self-Destruction', 'Bioexplosão', 'Autodestrucción', 3, [1, 1, 0, 0, 1000, 0], ['usevanilselfdestruct']),
  ];


  // Settings that drive each skill (a setting can drive more than one skill).
  var SKILL_SETTINGS = {"8001": ["UseAutoHeal"], "8004": ["UseOffensiveBuff"], "8014": ["UseAutoHeal"], "8009": ["UseFilirMoon"], "8016": ["UseVanilSelfDestruct"]};
  var BY_ID = {};
  LIST.forEach(function (k) { BY_ID[k.id] = k; });

  // The skill a setting belongs to, or null.
  function forSetting(name) {
    var lower = String(name).toLowerCase();
    for (var i = 0; i < LIST.length; i++) {
      var m = LIST[i].match;
      for (var j = 0; j < m.length; j++) if (lower.indexOf(m[j]) >= 0) return LIST[i];
    }
    return null;
  }

  window.AzzySkills = {
    HOMUNCULI: HOMUNCULI,
    list: LIST,
    settingsOf: function (id) { return SKILL_SETTINGS[String(id)] || []; },
    byId: function (id) { return BY_ID[id] || null; },
    ofHomunculus: function (key) { return LIST.filter(function (k) { return k.homun === key; }); },
    forSetting: forSetting,
    icon: function (id) { return ICON.replace('{id}', id); },
    page: function (id) { return PAGE.replace('{id}', id); },
    // official client name in the language, then the built-in name, then the official English one
    name: function (skill, lang) {
      var d = DATA[skill.id];
      return (d && d.name && d.name[lang]) || skill.name[lang] || (d && d.name && d.name.en) || skill.name.en;
    },
    // in-game description (with the client's ^RRGGBB color codes), or ''
    description: function (skill, lang) {
      var d = DATA[skill.id];
      return (d && d.desc && (d.desc[lang] || d.desc.en)) || '';
    },
    hasData: function () { return Object.keys(DATA).length > 0; }
  };
})();
