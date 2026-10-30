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
    ['eira', 'Eira'], ['bayeri', 'Bayeri'], ['sera', 'Sera'], ['dieter', 'Dieter'], ['eleanor', 'Eleanor']
  ];

  function s(id, homun, en, pt, es, maxlv, stats, match) {
    return { id: id, homun: homun, name: { en: en, pt: pt, es: es }, maxlv: maxlv, stats: stats, match: match || [] };
  }

  var LIST = [
    // Lif
    s(8001, 'lif', 'Healing Hands', 'Cura pelas Mãos', 'Manos Curativas', 5, [13, 25, 0, 0, 20000, 0], []),
    s(8002, 'lif', 'Urgent Escape', 'Bater em Retirada', 'Escape Urgente', 5, [20, 40, 0, 0, 35000, 20000], ['lifescape']),
    s(8004, 'lif', 'Mental Charge', 'Esforço Mental', 'Carga Mental', 3, [100, 100, 0, 0, 1200000, 300000], []),
    // Amistr
    s(8005, 'amistr', 'Castling', 'Troca de Lugar', 'Enroque', 5, [10, 10, 0, 0, 1000, 0], ['castledefend']),
    s(8006, 'amistr', 'Amistr Bulwark', 'Fortaleza', 'Baluarte', 5, [20, 40, 0, 0, 30000, 20000], ['bulwark']),
    s(8008, 'amistr', 'Bloodlust', 'Desejo por Sangue', 'Sed de Sangre', 3, [120, 120, 0, 0, 900000, 300000], ['bloodlust']),
    // Filir
    s(8009, 'filir', 'Moonlight', 'Pica-Pau', 'Luz de Luna', 5, [4, 20, 0, 0, 2000, 0], []),
    s(8010, 'filir', 'Flitting', 'Voo Frenético', 'Vuelo Frenético', 5, [30, 70, 0, 0, 120000, 40000], ['filirflit']),
    s(8011, 'filir', 'Accelerated Flight', 'Voo Acelerado', 'Vuelo Acelerado', 5, [30, 70, 0, 0, 120000, 40000], ['filiraccel']),
    s(8012, 'filir', 'S.B.R.44', 'S.B.R.44', 'S.B.R.44', 3, [1, 1, 0, 0, 1000, 0], ['sbr44']),
    // Vanilmirth
    s(8013, 'vanilmirth', 'Caprice', 'Capricho', 'Capricho', 5, [22, 30, 0, 0, 2800, 0], []),
    s(8014, 'vanilmirth', 'Chaotic Blessings', 'Bênção Caótica', 'Bendición Caótica', 5, [40, 40, 0, 0, 3000, 0], []),
    s(8016, 'vanilmirth', 'Bio Explosion', 'Bioexplosão', 'Bioexplosión', 3, [1, 1, 0, 0, 1000, 0], []),
    // Sera
    s(8018, 'sera', 'Summon Legion', 'Convocação', 'Invocar Legión', 5, [60, 140, 1200, 800, 60000, 60000], ['calllegion']),
    s(8019, 'sera', 'Needle of Paralyze', 'Ponto de Paralisia', 'Aguja Paralizante', 10, [42, 96, 0, 1000, 0, 7500], ['paralyze']),
    s(8020, 'sera', 'Poison Mist', 'Névoa Venenosa', 'Niebla Venenosa', 5, [65, 105, 0, 1000, 10000, 15000], ['poisonmist']),
    s(8021, 'sera', 'Pain Killer', 'Analgésico', 'Analgésico', 10, [48, 84, 0, 2500, 0, 600000], ['painkiller']),
    s(8053, 'sera', 'Toxin of Mandara', 'Toxin Of Mandara', 'Toxina de Mandrágora', 10, [60, 105, 700, 0, 2000, 7000], ['toxinofmandara']),
    s(8054, 'sera', 'Needle Stinger', 'Needle Stinger', 'Aguijón', 10, [74, 146, 300, 0, 250, 0], ['needlestinger']),
    // Eira
    s(8022, 'eira', 'Light of Regenerate', 'Luz da Vida', 'Luz de Regeneración', 5, [40, 80, 800, 0, 0, 600000], ['lightofregene']),
    s(8023, 'eira', 'Overed Boost', 'Superestimular', 'Sobreimpulso', 5, [70, 150, 600, 400, 0, 90000], ['overedboost']),
    s(8024, 'eira', 'Eraser Cutter', 'Choque Supersônico', 'Cortador Borrador', 10, [25, 70, 0, 1500, 0, 0], ['erasecutter', 'erasercutter']),
    s(8025, 'eira', 'Xeno Slasher', 'Onda Supersônica', 'Tajo Xeno', 10, [85, 130, 0, 1500, 0, 0], ['xenoslasher']),
    s(8026, 'eira', 'Silent Breeze', 'Brisa da Calmaria', 'Brisa Silenciosa', 5, [45, 81, 200, 1800, 0, 21000], ['silentbreeze', 'healownerbreeze']),
    s(8047, 'eira', 'Twister Cutter', 'Twister Cutter', 'Cortador Tornado', 10, [106, 160, 0, 1500, 200, 0], ['twistercutter']),
    s(8048, 'eira', 'Absolute Zephyr', 'Absolute Zephyr', 'Céfiro Absoluto', 10, [122, 185, 300, 1000, 300, 0], ['absolutezephyr']),
    // Bayeri
    s(8031, 'bayeri', 'Stahl Horn', 'Impacto Preciso', 'Cuerno de Acero', 10, [43, 70, 0, 500, 0, 0], ['stahlhorn']),
    s(8032, 'bayeri', 'Goldene Ferse', 'Fúria Iluminada', 'Talón Dorado', 5, [60, 80, 0, 1800, 0, 90000], ['goldenpherze']),
    s(8033, 'bayeri', 'Stein Wand', 'Luz Salvadora', 'Muro de Piedra', 5, [80, 120, 0, 1000, 20000, 600000], ['steinwand']),
    s(8034, 'bayeri', 'Heilige Stange', 'Illuminatus', 'Pilar Sagrado', 10, [48, 102, 0, 1500, 0, 0], ['hailegestar']),
    s(8035, 'bayeri', 'Angriffs Modus', 'Raiva Iluminada', 'Modo de Ataque', 5, [60, 80, 0, 1000, 0, 90000], ['angriffmodus']),
    s(8056, 'bayeri', 'Glanzen Spies', 'Glanzen Spies', 'Lanza Brillante', 10, [60, 105, 700, 0, 250, 0], ['glanzenspies']),
    s(8057, 'bayeri', 'Heilige Pferd', 'Heilige Pferd', 'Corcel Sagrado', 10, [122, 185, 300, 1000, 500, 0], ['heiligepferd']),
    s(8058, 'bayeri', 'Goldene Tone', 'Goldene Tone', 'Tono Dorado', 10, [124, 205, 1000, 2000, 120000, 120000], ['goldenetone']),
    // Dieter
    s(8039, 'dieter', 'Magma Flow', 'Inundação de Magma', 'Flujo de Magma', 5, [34, 50, 0, 4000, 0, 90000], ['magmaflow']),
    s(8040, 'dieter', 'Granitic Armor', 'Armadura de Granito', 'Armadura de Granito', 5, [54, 70, 1000, 3000, 0, 60000], ['graniticarmor']),
    s(8041, 'dieter', 'Lava Slide', 'Derretimento com Lava', 'Deslizamiento de Lava', 10, [40, 85, 0, 2000, 3000, 15000], ['lavaslide']),
    s(8042, 'dieter', 'Pyroclastic', 'Piroclástico', 'Piroclástico', 10, [20, 70, 0, 2500, 0, 600000], ['pyroclastic']),
    s(8043, 'dieter', 'Volcanic Ash', 'Cinzas Vulcânicas', 'Ceniza Volcánica', 5, [60, 80, 1000, 2000, 0, 40000], ['volcanicash']),
    s(8044, 'dieter', 'Blast Forge', 'Blast Forge', 'Forja Explosiva', 10, [52, 115, 1000, 0, 3000, 5000], ['blastforge']),
    s(8045, 'dieter', 'Tempering', 'Tempering', 'Templado', 10, [83, 155, 2000, 0, 120000, 180000], ['tempering']),
    // Eleanor
    s(8027, 'eleanor', 'Style Change', 'Estilo de Luta', 'Cambio de Estilo', 1, [35, 35, 0, 0, 0, 0], ['donotswitchmode']),
    s(8028, 'eleanor', 'Sonic Claw', 'Garra Supersônica', 'Garra Sónica', 5, [20, 40, 0, 0, 1000, 0], ['sonicclaw']),
    s(8029, 'eleanor', 'Silvervein Rush', 'Rastro Brilhante', 'Embestida Plateada', 10, [17, 35, 0, 0, 1500, 0], ['silvervein']),
    s(8030, 'eleanor', 'Midnight Frenzy', 'Delírio Noturno', 'Frenesí Nocturno', 10, [18, 45, 0, 0, 1500, 0], ['midnight']),
    s(8036, 'eleanor', 'Tinder Breaker', 'Quebra-Costelas', 'Rompecostillas', 5, [20, 40, 0, 1000, 0, 0], ['tinderbreaker']),
    s(8037, 'eleanor', 'C.B.C.', 'Dreno Traumático', 'Combo Continuo', 5, [10, 50, 0, 0, 0, 0], ['eleanorcbc']),
    s(8038, 'eleanor', 'E.Q.C.', 'Estado Traumático', 'Combo Eterno', 5, [24, 40, 0, 0, 0, 0], ['eleanoreqc']),
    s(8050, 'eleanor', 'Blazing and Furious', 'Blazing And Furious', 'Ardiente y Furioso', 10, [103, 148, 0, 0, 1000, 0], ['blazingandfurious']),
    s(8051, 'eleanor', 'The One Fighter Rises', 'The One Fighter Rises', 'El Luchador se Levanta', 10, [100, 154, 0, 0, 2000, 0], ['theonefighterrises'])
  ];

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
