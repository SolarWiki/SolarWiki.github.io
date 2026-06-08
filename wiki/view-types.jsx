/* Pokémon Solar Eclipse — interactive type calculator. window.VIEWS.Types
   Pick attacking type(s) and defending type(s); shows the combined multiplier.
   Uses VSE_CHART (the game's modified 18×18 chart). */
window.VIEWS = window.VIEWS || {};
(function () {
  const { TYPES } = window.VSEDEX;
  const { PageHead } = window.VUI;
  const CHART = window.VSE_CHART;
  const ORDER = window.VSE_TYPE_ORDER;

  const CHANGED = [['WATER','ICE'],['FLYING','ICE'],['BUG','FAIRY'],['DARK','BUG'],['FAIRY','BUG']];
  const isChanged = (a, d) => CHANGED.some(c => c[0] === a && c[1] === d);

  const multLabel = (m) => m === 0 ? '×0' : m === 0.25 ? '×¼' : m === 0.5 ? '×½' : m === 2 ? '×2' : m === 4 ? '×4' : '×1';
  const multColor = (m) => m === 0 ? '#6a5d42' : m < 1 ? '#e0884a' : m > 1 ? '#5fc04e' : '#8a8270';

  // A selectable type chip
  function Chip({ t, on, onClick }) {
    const c = TYPES[t];
    return (
      <button onClick={onClick} style={{
        cursor: 'pointer', padding: '6px 12px', borderRadius: 999, fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
        textTransform: 'uppercase', color: on ? c.fg : c.glow, background: on ? c.bg : c.glow + '14',
        border: `1px solid ${on ? c.glow : c.glow + '66'}`, boxShadow: on ? `0 0 12px ${c.glow}55` : 'none', transition: 'all .15s',
      }}>{c.name}</button>
    );
  }

  window.VIEWS.Types = function Types() {
    // attacking: single type (a move has one type). defending: up to 2 (a Pokémon's typing).
    const [atk, setAtk] = React.useState('FIRE');
    const [def, setDef] = React.useState(['GRASS']);
    const [showGrid, setShowGrid] = React.useState(false);

    const toggleDef = (t) => setDef(s => s.includes(t) ? s.filter(x => x !== t) : (s.length >= 2 ? [s[1], t] : [...s, t]));

    // combined multiplier of atk vs each defending type, multiplied together
    const mult = def.length ? def.reduce((acc, d) => acc * CHART[atk][d], 1) : 1;

    return (
      <div>
        <PageHead kicker="TYPE MATCHUPS" title="Type Calculator"
          sub="Solar Eclipse uses a modified type chart — 5 matchups differ from the standard games. Pick an attacking type and a defending typing to see the result." />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginBottom: 26 }} className="se-tc-grid">
          {/* Attacking */}
          <div style={{ background: '#0c0a05', border: '1px solid #241d10', borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#ffb347', marginBottom: 12, textTransform: 'uppercase' }}>Attacking move type</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ORDER.map(t => <Chip key={t} t={t} on={atk === t} onClick={() => setAtk(t)} />)}
            </div>
          </div>
          {/* Defending */}
          <div style={{ background: '#0c0a05', border: '1px solid #241d10', borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#ffb347', marginBottom: 12, textTransform: 'uppercase' }}>Defending Pokémon typing (up to 2)</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ORDER.map(t => <Chip key={t} t={t} on={def.includes(t)} onClick={() => toggleDef(t)} />)}
            </div>
          </div>
        </div>

        {/* Result */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '26px 18px', background: `radial-gradient(circle at 50% 50%, ${multColor(mult)}22, #0c0a05)`, border: `1px solid ${multColor(mult)}55`, borderRadius: 16, marginBottom: 30, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ padding: '6px 13px', borderRadius: 999, background: TYPES[atk].bg, color: TYPES[atk].fg, border: `1px solid ${TYPES[atk].glow}`, fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{TYPES[atk].name}</span>
            <span style={{ color: '#7a6c4a', fontSize: 18 }}>→</span>
            {def.length ? def.map(d => (
              <span key={d} style={{ padding: '6px 13px', borderRadius: 999, background: TYPES[d].bg, color: TYPES[d].fg, border: `1px solid ${TYPES[d].glow}`, fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{TYPES[d].name}</span>
            )) : <span style={{ color: '#6a5d42', fontFamily: "'Outfit', sans-serif" }}>pick a defending type</span>}
          </div>
          <div style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 800, fontSize: 40, color: multColor(mult), textShadow: `0 0 24px ${multColor(mult)}66` }}>{multLabel(mult)}</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#b3a892', minWidth: 120 }}>
            {mult === 0 ? 'No effect' : mult > 1 ? 'Super effective' : mult < 1 ? 'Not very effective' : 'Normal damage'}
            {def.length && isChanged(atk, def[0]) || (def[1] && isChanged(atk, def[1])) ? <div style={{ color: '#ffb347', fontSize: 11, marginTop: 3 }}>★ changed from vanilla</div> : null}
          </div>
        </div>

        {/* Toggle full chart */}
        <button onClick={() => setShowGrid(g => !g)} style={{ cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: showGrid ? '#ffb347' : '#9a8d6f', background: showGrid ? '#2a1c08' : '#0f0b04', border: `1px solid ${showGrid ? '#ffb34788' : '#2a2110'}`, borderRadius: 9, padding: '8px 16px', marginBottom: 18 }}>
          {showGrid ? '✓ ' : ''}Full chart
        </button>

        {showGrid && (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#9a8d6f', marginBottom: 10 }}>Rows attack, columns defend. Gold-outlined cells differ from vanilla.</div>
            <table style={{ borderCollapse: 'collapse', fontFamily: "'Space Mono', monospace" }}>
              <thead>
                <tr><th style={{ width: 34, height: 34 }} />{ORDER.map(d => (
                  <th key={d} style={{ width: 28, padding: 0 }}><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 700, color: TYPES[d].glow, height: 54, margin: '0 auto', whiteSpace: 'nowrap' }}>{TYPES[d].name}</div></th>
                ))}</tr>
              </thead>
              <tbody>
                {ORDER.map(a => (
                  <tr key={a}>
                    <th style={{ textAlign: 'right', paddingRight: 8, fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 700, color: TYPES[a].glow, whiteSpace: 'nowrap' }}>{TYPES[a].name}</th>
                    {ORDER.map(d => {
                      const m = CHART[a][d]; const chg = isChanged(a, d);
                      const bg = m === 0 ? '#3a2a1a' : m === 0.5 ? '#5e3a1f' : m === 2 ? '#2f5e28' : 'transparent';
                      return <td key={d} title={`${TYPES[a].name}→${TYPES[d].name}: ×${m}`} style={{ width: 28, height: 28, textAlign: 'center', fontSize: 10, color: m === 1 ? '#4a4234' : '#fff', background: bg, border: chg ? '2px solid #ffb347' : '1px solid #1c1609' }}>{m === 1 ? '' : (m === 0 ? '0' : m === 0.5 ? '½' : m === 2 ? '2' : m)}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };
})();
