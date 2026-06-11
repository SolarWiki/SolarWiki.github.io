/* Compatibility layer: exposes window.VGAME and window.VSTATS so the ported
   Void Team Builder + Damage Calculator views work against Solar Eclipse data. */
(function () {
  const CHART = window.VSE_CHART;
  const TYPE_ORDER = window.VSE_TYPE_ORDER;

  // effectiveness of attacking type vs a single defending type
  function eff(atk, def) {
    if (!CHART || !CHART[atk]) return 1;
    const v = CHART[atk][def];
    return (v === undefined || v === null) ? 1 : v;
  }

  // move lookup by name (case/spacing/underscore-insensitive)
  const moveIndex = {};
  (window.VSE_MOVES || []).forEach(m => {
    moveIndex[norm(m.name)] = m;
  });
  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function byMove(name) { return moveIndex[norm(name)] || null; }

  window.VGAME = { eff, CHART, TYPE_ORDER, byMove, MOVES: window.VSE_MOVES };

  // ---- Stable 2-char move-id codec (for team share codes) ----
  // Each move maps to a fixed 2-char base-36 id from its index in a name-sorted
  // list, so ids are stable across sessions regardless of VSE_MOVES order.
  (function () {
    const sorted = (window.VSE_MOVES || []).map(m => m.name).sort((a, b) => a.localeCompare(b));
    const toId = {}, fromId = {};
    const B36 = '0123456789abcdefghijklmnopqrstuvwxyz';
    const enc2 = (n) => B36[Math.floor(n / 36) % 36] + B36[n % 36];
    sorted.forEach((name, i) => {
      const id = enc2(i + 1); // +1 so id '00' is never a real move
      toId[normName(name)] = id;
      fromId[id] = name;
    });
    function normName(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
    window.VGAME.moveToId = (name) => toId[normName(name)] || null;
    window.VGAME.idToMove = (id) => fromId[id] || null;
  })();

  // ---- Stat / nature helpers (window.VSTATS) ----
  const NATURES = {
    Hardy: null, Lonely: ['ATK', 'DEF'], Brave: ['ATK', 'SPE'], Adamant: ['ATK', 'SPA'], Naughty: ['ATK', 'SPD'],
    Bold: ['DEF', 'ATK'], Docile: null, Relaxed: ['DEF', 'SPE'], Impish: ['DEF', 'SPA'], Lax: ['DEF', 'SPD'],
    Timid: ['SPE', 'ATK'], Hasty: ['SPE', 'DEF'], Serious: null, Jolly: ['SPE', 'SPA'], Naive: ['SPE', 'SPD'],
    Modest: ['SPA', 'ATK'], Mild: ['SPA', 'DEF'], Quiet: ['SPA', 'SPE'], Bashful: null, Rash: ['SPA', 'SPD'],
    Calm: ['SPD', 'ATK'], Gentle: ['SPD', 'DEF'], Sassy: ['SPD', 'SPE'], Careful: ['SPD', 'SPA'], Quirky: null,
  };
  function natureMultFor(nature, stat) {
    const n = NATURES[nature];
    if (!n) return 1;
    if (n[0] === stat) return 1.1;
    if (n[1] === stat) return 0.9;
    return 1;
  }
  function calcStat(base, iv, ev, level, isHP, natureMult) {
    if (isHP) {
      if (base === 1) return 1;
      return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
    }
    const s = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
    return Math.floor(s * natureMult);
  }
  function maxIVs() { return { HP: 31, ATK: 31, DEF: 31, SPA: 31, SPD: 31, SPE: 31 }; }
  function freshEVs() { return { HP: 0, ATK: 0, DEF: 0, SPA: 0, SPD: 0, SPE: 0 }; }

  window.VSTATS = { NATURES, NATURE_LIST: Object.keys(NATURES), natureMultFor, calcStat, maxIVs, freshEVs };
})();
