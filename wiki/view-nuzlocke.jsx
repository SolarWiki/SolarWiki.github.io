/* Pokémon Solar Eclipse — Nuzlocke Randomizer. window.VIEWS.Nuzlocke
   One press of the Eclipse Forge conjures a complete, conflict-free Nuzlocke
   ruleset across three difficulty tiers (Standard / Hard / Extreme), each with a
   difficulty rating, full rules, and clear win & loss conditions. Pure generation,
   no external data. Rules carry a `w` (weight = how restrictive) and an optional
   `tag` so contradictory rules can never appear together. Eclipse-themed: corona
   forge orb, drifting embers, staggered rule reveals. */
window.VIEWS = window.VIEWS || {};
(function () {
  const { PageHead } = window.VUI;

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ---- keyframes / ambient styles (injected once) ----
  function injectStyles() {
    if (document.getElementById('vse-nuzlocke-style')) return;
    const s = document.createElement('style');
    s.id = 'vse-nuzlocke-style';
    s.textContent = `
      @keyframes vseEclipsePulse {
        0%,100% { box-shadow: 0 0 0 2px #1a1206, 0 0 36px 4px #ffb34744, inset 0 0 30px #2a1c08; }
        50%     { box-shadow: 0 0 0 2px #1a1206, 0 0 58px 10px #ffb34766, inset 0 0 30px #2a1c08; }
      }
      @keyframes vseCoronaSpin { to { transform: rotate(360deg); } }
      @keyframes vseEmberRise {
        0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
        12%  { opacity: var(--o, .55); }
        88%  { opacity: var(--o, .55); }
        100% { transform: translateY(-120px) translateX(var(--dx, 10px)) scale(.4); opacity: 0; }
      }
      @keyframes vseFlare {
        0%   { transform: scale(.2); opacity: .9; }
        100% { transform: scale(2.6); opacity: 0; }
      }
      @keyframes vseRuleIn {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes vseBannerIn {
        from { opacity: 0; transform: scale(.96) translateY(8px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      .vse-nuz-rule { animation: vseRuleIn .42s cubic-bezier(.2,.7,.3,1) both; }
      .vse-nuz-banner { animation: vseBannerIn .5s cubic-bezier(.2,.7,.3,1) both; }
      .vse-forge-btn { transition: transform .15s ease, box-shadow .25s ease, filter .2s ease; }
      .vse-forge-btn:hover { transform: translateY(-2px) scale(1.02); filter: brightness(1.08); }
      .vse-forge-btn:active { transform: translateY(0) scale(.98); }
      @media (prefers-reduced-motion: reduce) {
        .vse-nuz-rule, .vse-nuz-banner { animation: none !important; }
        .vse-ember, .vse-corona-spin, .vse-flare { animation: none !important; display: none; }
      }
    `;
    document.head.appendChild(s);
  }

  // ---- ambient embers drifting up behind the forge ----
  function Embers({ count = 14, tint = '#ffb347' }) {
    const parts = React.useMemo(() => Array.from({ length: count }, (_, i) => ({
      left: Math.round(Math.random() * 100),
      size: 2 + Math.round(Math.random() * 3),
      dur: 5 + Math.random() * 6,
      delay: -Math.random() * 8,
      dx: (Math.random() * 30 - 15).toFixed(0) + 'px',
      o: (0.3 + Math.random() * 0.45).toFixed(2),
      key: i,
    })), [count]);
    return (
      <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: 'inherit' }}>
        {parts.map(p => (
          <span key={p.key} className="vse-ember" style={{
            position: 'absolute', bottom: -6, left: p.left + '%', width: p.size, height: p.size,
            borderRadius: '50%', background: tint, boxShadow: `0 0 6px ${tint}`,
            '--dx': p.dx, '--o': p.o,
            animation: `vseEmberRise ${p.dur}s linear ${p.delay}s infinite`,
          }} />
        ))}
      </div>
    );
  }

  // ---- the eclipse forge orb (idle pulse, corona ring) ----
  function ForgeOrb({ tint = '#ffb347', size = 84 }) {
    return (
      <div style={{ position: 'relative', width: size, height: size, flex: '0 0 auto' }}>
        {/* corona ring */}
        <div className="vse-corona-spin" style={{
          position: 'absolute', inset: -10, borderRadius: '50%',
          background: `conic-gradient(from 0deg, transparent, ${tint}55, transparent 40%, ${tint}33, transparent 70%, ${tint}66, transparent)`,
          animation: 'vseCoronaSpin 9s linear infinite', filter: 'blur(2px)',
        }} />
        {/* eclipse disc */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 50% 50%, #0a0805 58%, #1a1206 62%, transparent 64%)',
          animation: 'vseEclipsePulse 3.4s ease-in-out infinite',
        }} />
        {/* bright limb */}
        <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', border: `2px solid ${tint}`, boxShadow: `0 0 18px ${tint}, inset 0 0 14px ${tint}88`, opacity: .9 }} />
      </div>
    );
  }

  // Each option: { t: text, w: weight, tag?: mutual-exclusion key }
  const CATS = {
    encounter: {
      label: 'Encounter Rules', color: '#ffd23c',
      one: [
        { t: 'Standard: only the FIRST encounter on each route or area may be caught.', w: 0 },
        { t: 'Choice: you may pick between the first TWO encounters on each route.', w: 0 },
        { t: 'First unique species only — if you already own that species, the route is burned.', w: 1 },
        { t: 'Dupes Clause: if the first encounter is a species you already own, you may try again until it is new.', w: 0 },
      ],
      addons: [
        { t: 'Shiny Clause: a shiny may always be caught, even outside the normal rules.', w: 0, tag: 'shiny' },
        { t: 'Static encounters (gift spots, forced battles) count as your encounter for that area.', w: 1, tag: 'static' },
        { t: 'Static encounters are BANNED — they never count and may not be caught.', w: 2, tag: 'static' },
        { t: 'Gift Pokémon are ALLOWED and do not use up an encounter.', w: 0, tag: 'gift' },
        { t: 'Gift Pokémon are BANNED entirely.', w: 2, tag: 'gift' },
      ],
    },
    death: {
      label: 'Death Rules', color: '#ff6f5e',
      one: [
        { t: 'A fainted Pokémon is dead — box it permanently.', w: 1, tag: 'deadfate' },
        { t: 'A fainted Pokémon is dead — release it.', w: 2, tag: 'deadfate' },
      ],
      addons: [
        { t: 'One Revive Token per gym: you may resurrect a single dead Pokémon once between each badge.', w: -1, tag: 'mercy' },
        { t: 'A full team wipe ends the run immediately.', w: 2, tag: 'wipe' },
        { t: 'A team wipe only kills your active party — boxed Pokémon survive.', w: 0, tag: 'wipe' },
      ],
    },
    team: {
      label: 'Team Restrictions', color: '#c08bff',
      addons: [
        { t: 'Party cap: you may carry a maximum of {N} Pokémon at once.', w: 1, tag: 'size', dyn: () => ({ N: pick([3, 4, 5]) }) },
        { t: 'Monotype Run: every team member must share one chosen type.', w: 3, tag: 'typing' },
        { t: 'No Overlapping Types: no two team members may share any type.', w: 2, tag: 'typing' },
        { t: 'Your starter is benched permanently after the first gym.', w: 2, tag: 'starter' },
        { t: 'Team Rotation: you must swap in at least one fresh Pokémon after every badge.', w: 2, tag: 'rotate' },
        { t: 'Your lowest-level living Pokémon must always remain on the team.', w: 1, tag: 'lowmember' },
      ],
    },
    battle: {
      label: 'Battle Rules', color: '#ffb347',
      addons: [
        { t: 'Set Mode only — no free switching when the foe sends out a new Pokémon.', w: 1, tag: 'set' },
        { t: 'No items in battle — no potions, revives, or X-items mid-fight.', w: 2, tag: 'items' },
        { t: 'Held items are BANNED.', w: 1, tag: 'held' },
        { t: 'Level Cap: no Pokémon may exceed the next gym leader’s ace level.', w: 2, tag: 'cap' },
        { t: 'Once one of your Pokémon is KO’d, no switching out for the rest of that battle.', w: 2, tag: 'noswitch' },
        { t: 'You must LEAD every battle with your lowest-level living Pokémon.', w: 2, tag: 'lead' },
      ],
    },
    species: {
      label: 'Pokémon Restrictions', color: '#5fd17a',
      addons: [
        { t: 'Legendary and Mythical Pokémon are BANNED.', w: 1, tag: 'legend' },
        { t: 'Pseudo-legendary Pokémon are BANNED.', w: 1, tag: 'pseudo' },
        { t: 'Trade-evolution Pokémon may not be evolved.', w: 1, tag: 'tradeevo' },
        { t: 'Pokémon with healing abilities are BANNED.', w: 1, tag: 'healability' },
        { t: 'Setup moves (stat-boosting moves) are BANNED.', w: 2, tag: 'setup' },
        { t: 'No two team members may share the same Ability.', w: 1, tag: 'dupeability' },
        { t: 'No Pokémon with a base stat total above {N} may be used.', w: 2, tag: 'bst', dyn: () => ({ N: pick([480, 500, 525]) }) },
      ],
    },
    modifier: {
      label: 'Extra Modifiers', color: '#ff8fd0',
      addons: [
        { t: 'No Pokémon Centers — healing only via items or in-field methods.', w: 3, tag: 'noheal' },
        { t: 'No Marts — you may not purchase anything.', w: 2, tag: 'nomart' },
        { t: 'No TMs may be used.', w: 1, tag: 'notm' },
        { t: 'Evolution is BANNED — Pokémon stay in their caught form forever.', w: 3, tag: 'noevo' },
        { t: 'One Pokémon per gym: you may only use a single Pokémon against each gym leader.', w: 3, tag: 'onepergym' },
        { t: 'Permadeath applies to the whole evolution line — if one dies, that line is gone forever.', w: 2, tag: 'lineperma' },
        { t: 'After every gym, randomly sacrifice one surviving Pokémon.', w: 3, tag: 'sacrifice' },
      ],
    },
  };

  // EXTREME-ONLY pool: chaotic, cursed, deliberately punishing clauses.
  const EXTREME = {
    label: 'Eclipse Clauses', color: '#ff3b5a',
    addons: [
      { t: 'Shadow-Locke: you may ONLY use shiny Pokémon. Non-shinies cannot join your team.', w: 4, tag: 'shinylock' },
      { t: 'Nickname Curse: every Pokémon must be nicknamed by a random word someone else gives you — no take-backs.', w: 1, tag: 'nickcurse' },
      { t: 'Color-Locke: pick one color at the start. Every Pokémon you use must visually match it.', w: 3, tag: 'colorlock' },
      { t: 'Cataclysm Clause: if ANY Pokémon faints, the box loses one random member too.', w: 4, tag: 'cataclysm' },
      { t: 'No healing items, EVER — survive on Centers and move PP alone.', w: 3, tag: 'noitemheal' },
      { t: 'Eclipse Floor: your levels may never EXCEED the last gym leader’s ace. Stay underleveled the whole game.', w: 4, tag: 'underlevel' },
      { t: 'One Type, One Life: choose a type; the run ENDS the moment a non-matching Pokémon touches your party.', w: 4, tag: 'typedeath' },
      { t: 'Randomized Movesets: before each gym, replace every team member’s moves with 4 random ones.', w: 3, tag: 'randmove' },
      { t: 'Solo Soul: only ONE Pokémon alive at a time. Catch a new one only after it dies.', w: 5, tag: 'solo' },
      { t: 'Roulette: after every badge, spin — a 1-in-6 chance to release a random living Pokémon.', w: 3, tag: 'roulette6' },
      { t: 'Glass Cannon: any Pokémon that takes a hit above 50% of its max HP dies, even if it survives.', w: 4, tag: 'glass' },
      { t: 'The Unholy Trinity: no evolutions, no items, and Set mode — all at once.', w: 5, tag: 'trinity' },
      { t: 'Bank Error: start with no money and never sell anything. Marts are decoration.', w: 2, tag: 'broke' },
      { t: 'Timed Locke: defeat the next gym within {N} in-game hours or release your strongest Pokémon.', w: 3, tag: 'timed', dyn: () => ({ N: pick([3, 4, 5]) }) },
    ],
  };
  const EXTREME_THEMES = ['Total Eclipse', 'Umbra Locke', 'Corona Locke', 'Blacksun Locke', 'Penumbra Locke', 'Annihilation Locke', 'Ruin Locke'];

  const CORE = [
    'If a Pokémon faints, it is considered dead and must be boxed or released (per your Death Rules).',
    'You may only catch the first valid encounter in each route or area.',
    'Every Pokémon you catch must be given a nickname.',
    'A blackout / whiteout (losing with no usable Pokémon) loses the run, unless a selected rule says otherwise.',
  ];

  const THEMES = [
    { name: 'Standard Nuzlocke', when: (d) => d <= 6 },
    { name: 'Mercy Locke', when: (d, r) => r.some(x => x.tag === 'mercy') },
    { name: 'Typebound Locke', when: (d, r) => r.some(x => x.tag === 'typing') },
    { name: 'Poverty Locke', when: (d, r) => r.some(x => x.tag === 'nomart' || x.tag === 'noheal') },
    { name: 'Hardcore Locke', when: (d) => d >= 12 && d < 17 },
    { name: 'Chaos Locke', when: (d, r) => r.length >= 11 },
    { name: 'Roulette Locke', when: (d, r) => r.some(x => x.tag === 'sacrifice') },
    { name: 'Masochist Locke', when: (d) => d >= 21 },
    { name: 'Eclipse Locke', when: () => true },
  ];

  const TIERS = [
    { name: 'Easy', min: -99, color: '#5fd17a' },
    { name: 'Normal', min: 7, color: '#ffd23c' },
    { name: 'Hard', min: 12, color: '#ffb347' },
    { name: 'Brutal', min: 17, color: '#ff7f4f' },
    { name: 'Nightmare', min: 21, color: '#ff5a5a' },
    { name: 'TOTALITY', min: 30, color: '#ff2f55' },
  ];

  const realize = (opt) => {
    if (!opt.dyn) return { ...opt };
    const params = opt.dyn();
    let t = opt.t;
    Object.entries(params).forEach(([k, v]) => { t = t.replace('{' + k + '}', v); });
    return { ...opt, t };
  };

  // cross-category contradictions
  const CONFLICTS = {
    trinity: ['noevo', 'items', 'set', 'noitemheal', 'held'],
    size: ['solo'],
    solo: ['size', 'rotate', 'lowmember', 'lead', 'onepergym'],
    noevo: ['tradeevo'],
    cap: ['underlevel'],
    items: ['noitemheal'],
    lineperma: ['lineperma'],
    typing: ['typedeath'],
    typedeath: ['typing'],
    glass: ['mercy'],
  };
  const conflictsWith = (() => {
    const m = {};
    const add = (a, b) => { (m[a] = m[a] || new Set()).add(b); };
    Object.entries(CONFLICTS).forEach(([k, arr]) => arr.forEach(v => { add(k, v); add(v, k); }));
    return (a, b) => !!(m[a] && m[a].has(b));
  })();

  function dedupeConflicts(rules) {
    const keptTags = [];
    const out = [];
    for (const r of rules) {
      const tag = r.tag;
      if (tag) {
        if (keptTags.includes(tag)) continue;
        if (keptTags.some(t => conflictsWith(tag, t))) continue;
        keptTags.push(tag);
      }
      out.push(r);
    }
    return out;
  }

  function pickAddons(pool, minN, maxN) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const usedTags = new Set();
    const chosen = [];
    const target = minN + Math.floor(Math.random() * (maxN - minN + 1));
    for (const opt of shuffled) {
      if (chosen.length >= target) break;
      if (opt.tag && usedTags.has(opt.tag)) continue;
      chosen.push(realize(opt));
      if (opt.tag) usedTags.add(opt.tag);
    }
    return chosen;
  }

  // mode: 'standard' | 'hard' | 'extreme'
  function generate(mode) {
    const extreme = mode === 'extreme';
    const hard = mode === 'hard';
    const out = {};
    const all = [];

    const INTENSITY = extreme
      ? { core: [2, 3], mod: [2, 3], extra: 3 }
      : hard
        ? { core: [1, 2], mod: [1, 2], extra: 2 }
        : pick([
            { core: [0, 1], mod: [0, 1], extra: 1 },
            { core: [1, 2], mod: [0, 1], extra: 2 },
          ]);
    const C = INTENSITY.core, MOD = INTENSITY.mod, EX = INTENSITY.extra;

    const encOne = realize(pick(CATS.encounter.one));
    const encAdd = pickAddons(CATS.encounter.addons, 0, EX);
    out.encounter = [encOne, ...encAdd];

    const deathOne = realize(pick(CATS.death.one));
    const deathAdd = pickAddons(CATS.death.addons, 0, Math.min(2, EX));
    out.death = [deathOne, ...deathAdd];

    out.team = pickAddons(CATS.team.addons, C[0], C[1]);
    out.battle = pickAddons(CATS.battle.addons, C[0], C[1]);
    out.species = pickAddons(CATS.species.addons, C[0], C[1]);
    out.modifier = pickAddons(CATS.modifier.addons, MOD[0], MOD[1]);
    out.extreme = extreme ? pickAddons(EXTREME.addons, 2, 4) : [];

    const order = ['encounter', 'death', 'team', 'battle', 'species', 'modifier', 'extreme'];
    const tagged = [];
    order.forEach(k => (out[k] || []).forEach(r => tagged.push({ k, r })));
    const survivors = dedupeConflicts(tagged.map(x => x.r));
    const survivorSet = new Set(survivors);
    order.forEach(k => { out[k] = (out[k] || []).filter(r => survivorSet.has(r)); });
    order.forEach(k => out[k].forEach(r => all.push(r)));

    let score = all.reduce((s, r) => s + (r.w || 0), 0);
    if (extreme) score = Math.max(score, 30);
    if (hard) score = Math.max(score, 12);
    const tier = [...TIERS].reverse().find(t => score >= t.min) || TIERS[0];

    const theme = extreme ? pick(EXTREME_THEMES) : (THEMES.find(t => t.when(score, all)) || THEMES[THEMES.length - 1]).name;

    const wipeEnds = all.some(r => r.tag === 'wipe' && /ends the run/.test(r.t));
    const soloOrTypeDeath = all.some(r => r.tag === 'solo' || r.tag === 'typedeath');
    let loss = wipeEnds
      ? 'You black out with no usable Pokémon, OR your entire team is wiped in a single battle.'
      : 'You black out / white out with no usable Pokémon remaining.';
    if (soloOrTypeDeath) loss += ' Any Eclipse Clause failure also ends the run instantly.';

    return { theme, tier, score, extreme, mode, core: CORE, ...out, win: 'Become the Solar Monarch with at least one living Pokémon.', loss };
  }

  // ---- the three forge buttons ----
  const MODES = [
    { id: 'standard', label: 'Standard', sub: 'The classic run', tint: '#ffd23c', grad: 'linear-gradient(135deg, #6b4a12, #ffb347)' },
    { id: 'hard', label: 'Hard', sub: 'Heavier restrictions', tint: '#ff7f4f', grad: 'linear-gradient(135deg, #7a2f12, #ff8f4f)' },
    { id: 'extreme', label: 'Extreme', sub: 'Cursed & feral', tint: '#ff3b5a', grad: 'linear-gradient(135deg, #5a0a18, #ff3b5a)' },
  ];

  window.VIEWS.Nuzlocke = function Nuzlocke() {
    const [run, setRun] = React.useState(null);
    const [flareKey, setFlareKey] = React.useState(0);
    React.useEffect(() => { injectStyles(); }, []);
    const roll = (mode) => { setRun(generate(mode)); setFlareKey(k => k + 1); };

    const tint = run ? run.tier.color : '#ffb347';

    const Section = ({ label, color, rules, base = 0 }) => (
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, letterSpacing: 2, color, marginBottom: 10, textTransform: 'uppercase' }}>{label}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rules.map((r, i) => (
            <div key={i} className="vse-nuz-rule" style={{
              animationDelay: (base + i) * 45 + 'ms',
              display: 'flex', gap: 12, alignItems: 'flex-start', padding: '11px 15px', borderRadius: 10,
              background: '#100c05', border: `1px solid ${color}33`,
            }}>
              <span style={{ flex: '0 0 auto', width: 6, height: 6, borderRadius: '50%', background: color, marginTop: 7, boxShadow: `0 0 8px ${color}` }} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, color: '#e6dcc6', lineHeight: 1.5 }}>{r.t || r}</span>
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <div>
        <PageHead kicker="CHALLENGE FORGE" title="Nuzlocke Randomizer" sub="One press of the Eclipse Forge conjures a complete, conflict-free Nuzlocke ruleset — chaotic and replayable, but always actually beatable. Pick your tier: Standard rolls the classics, Hard tightens the screws, Extreme goes feral." />

        {/* forge */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, padding: '30px 0 18px', marginBottom: run ? 30 : 50 }}>
          <div style={{ position: 'relative' }}>
            <ForgeOrb tint={tint} />
            {/* corona flare burst on each roll */}
            {flareKey > 0 && (
              <div key={flareKey} className="vse-flare" aria-hidden style={{
                position: 'absolute', inset: -20, borderRadius: '50%', pointerEvents: 'none',
                background: `radial-gradient(circle, ${tint}aa, ${tint}33 40%, transparent 70%)`,
                animation: 'vseFlare .7s ease-out forwards',
              }} />
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            {MODES.map(m => (
              <button key={m.id} className="vse-forge-btn" onClick={() => roll(m.id)} style={{
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '14px 26px', minWidth: 150, borderRadius: 13, background: m.grad,
                border: `1px solid ${m.tint}`, color: '#fff',
                boxShadow: `0 0 26px ${m.tint}44`,
              }}>
                <Embers count={9} tint={m.tint} />
                <span style={{ position: 'relative', fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 21, letterSpacing: 0.5, textShadow: `0 0 14px ${m.tint}99` }}>{m.label}</span>
                <span style={{ position: 'relative', fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1, color: '#fff', opacity: 0.85, textTransform: 'uppercase' }}>{m.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {!run ? (
          <div style={{ textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontSize: 15, color: '#8a7d63', maxWidth: 520, margin: '0 auto' }}>
            Choose a tier to forge a run. You’ll get a themed challenge with a difficulty rating, the full rules, and clear win &amp; loss conditions to follow start to finish.
          </div>
        ) : (
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            {/* banner */}
            <div className="vse-nuz-banner" style={{
              position: 'relative', overflow: 'hidden', padding: 24, borderRadius: 18, marginBottom: 24,
              background: `radial-gradient(ellipse at 30% 0%, ${run.tier.color}22, #0a0805 72%)`,
              border: `1px solid ${run.tier.color}66`,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
            }}>
              <Embers count={10} tint={run.tier.color} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1, color: run.tier.color, marginBottom: 8, textTransform: 'uppercase' }}>Challenge Name</div>
                <div style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 40, lineHeight: 1, color: '#fff', textShadow: `0 0 26px ${run.tier.color}66` }}>{run.theme}</div>
              </div>
              <div style={{ position: 'relative', textAlign: 'right' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1, color: '#b3a892', marginBottom: 6, textTransform: 'uppercase' }}>Difficulty</div>
                <div style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 30, color: run.tier.color, textShadow: `0 0 18px ${run.tier.color}66` }}>{run.tier.name}</div>
              </div>
            </div>

            <Section label="Core Rules" color="#ffb347" rules={run.core.map(t => ({ t }))} base={0} />
            <Section label="Encounter Rules" color={CATS.encounter.color} rules={run.encounter} base={4} />
            <Section label="Death Rules" color={CATS.death.color} rules={run.death} base={7} />
            {run.team.length > 0 && <Section label="Team Restrictions" color={CATS.team.color} rules={run.team} base={10} />}
            {run.battle.length > 0 && <Section label="Battle Rules" color={CATS.battle.color} rules={run.battle} base={13} />}
            {run.species.length > 0 && <Section label="Pokémon Restrictions" color={CATS.species.color} rules={run.species} base={16} />}
            {run.modifier.length > 0 && <Section label="Extra Modifiers" color={CATS.modifier.color} rules={run.modifier} base={19} />}
            {run.extreme && run.extreme.length > 0 && <Section label="☀ Eclipse Clauses ☀" color={EXTREME.color} rules={run.extreme} base={22} />}

            {/* win / loss */}
            <div className="vse-nuz-rule" style={{ animationDelay: '300ms', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 6 }}>
              <div style={{ padding: 16, borderRadius: 12, background: '#0c1c10', border: '1px solid #2f8f4a' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#5fd17a', marginBottom: 8, textTransform: 'uppercase' }}>Win Condition</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#bfe6c9', lineHeight: 1.5 }}>{run.win}</div>
              </div>
              <div style={{ padding: 16, borderRadius: 12, background: '#1c0c0c', border: '1px solid #8f3a2f' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#ff6f5e', marginBottom: 8, textTransform: 'uppercase' }}>Loss Condition</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#e6c9bf', lineHeight: 1.5 }}>{run.loss}</div>
              </div>
            </div>

            {/* reroll hint */}
            <div style={{ textAlign: 'center', marginTop: 22, fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#6a5d42', letterSpacing: 1 }}>
              Press a tier again to forge a different run.
            </div>
          </div>
        )}
      </div>
    );
  };
})();
