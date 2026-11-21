// tactSuggest.js
// Suggested tactics rows from the monster database (mobdata.js, generated from rAthena):
// what a monster is (plant, MVP, boss, aggressive, can't move) decides its row.
(function () {
  'use strict';

  var DATA = window.AzzyMobData || null;
  var BOSS = 1, MVP = 2, PLANT = 4, AGGRESSIVE = 8, IMMOBILE = 16;

  // [basic, skill, kite, cast, push, debuff, class, rescue, sp, snipe, ks, weight, chase]
  function row(basic, skill, weight, chase, snipe) {
    return [basic, skill, 'KITE_NEVER', 'CAST_REACT', 'PUSH_NEVER', 'DEBUFF_NEVER', 'CLASS_BOTH',
      'RESCUE_NEVER', '-1', snipe || 'SNIPE_OK', 'KS_NEVER', weight, chase || 'CHASE_NORMAL'];
  }

  // Each rule: [test, English description shown in the GUI, values]. The first match wins.
  var RULES = [
    [function (f) { return f & PLANT; }, 'Plants and mushrooms: only when they are hit, no skills, no weight',
      row('TACT_REACT_L', 'SKILL_NEVER', '0')],
    [function (f) { return f & MVP; }, 'MVPs: only when they attack, all skills',
      row('TACT_REACT_H', 'SKILL_ALWAYS', '1')],
    [function (f) { return f & BOSS; }, 'Other bosses: only when they attack, all skills',
      row('TACT_REACT_M', 'SKILL_ALWAYS', '1')],
    [function (f) { return (f & AGGRESSIVE) && (f & IMMOBILE); }, 'Aggressive monsters that can\'t move: ignored, never chased',
      row('TACT_IGNORE', 'SKILL_NEVER', '1', 'CHASE_NEVER', 'SNIPE_DISABLE')],
    [function (f) { return f & IMMOBILE; }, 'Harmless monsters that can\'t move (eggs): last, no skills',
      row('TACT_ATTACK_L', 'SKILL_NEVER', '1')],
    [function (f) { return f & AGGRESSIVE; }, 'Aggressive monsters: attacked first, all skills',
      row('TACT_ATTACK_H', 'SKILL_ALWAYS', '1')],
    [function () { return true; }, 'Passive monsters: attacked after the aggressive ones, all skills',
      row('TACT_ATTACK_M', 'SKILL_ALWAYS', '1')]
  ];

  function mob(id) {
    var m = DATA && DATA.mobs[id];
    return m ? { id: Number(id), name: m[0], level: m[1], flags: m[2], element: m[3], elementLevel: m[4], race: m[5] } : null;
  }

  function elementName(m) {
    return (DATA.elements[m.element] || '?') + ' ' + m.elementLevel;
  }

  // "Dimik (Earth 2)": monsters that share a name differ by element
  function rowName(m) {
    return m.name + ' (' + elementName(m) + ')';
  }

  // "Dimik #1672 - Lv 116, Earth 2": the text in the monster search list
  function label(m) {
    return m.name + ' #' + m.id + ' - Lv ' + m.level + ', ' + elementName(m);
  }

  function ruleFor(m) {
    for (var i = 0; i < RULES.length; i++) if (RULES[i][0](m.flags)) return RULES[i];
    return RULES[RULES.length - 1];
  }

  // Tactics row {id, name, values} for a monster ID, or null when it is not in the database
  function suggest(id) {
    var m = mob(id);
    if (!m) return null;
    return { id: String(m.id), name: rowName(m), values: ruleFor(m)[2].slice() };
  }

  function allIds() {
    return DATA ? Object.keys(DATA.mobs).map(Number) : [];
  }

  window.AzzyTactSuggest = {
    available: function () { return !!(DATA && DATA.mobs); },
    rules: function () { return RULES.map(function (r) { return r[1]; }); },
    mob: mob,
    label: label,
    suggest: suggest,
    maps: function () { return DATA && DATA.maps ? Object.keys(DATA.maps).sort() : []; },
    mapMobs: function (name) { return DATA && DATA.maps ? DATA.maps[name] || null : null; },
    allIds: allIds,
    plants: function () { return allIds().filter(function (id) { return mob(id).flags & PLANT; }); },
    // "Dimik #1672 - ..." or "1672" -> 1672
    parseMob: function (text) {
      var m = /#(\d+)/.exec(text || '') || /^\s*(\d+)\s*$/.exec(text || '');
      return m ? Number(m[1]) : null;
    }
  };
})();
