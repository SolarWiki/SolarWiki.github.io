/* Pokémon Solar Eclipse — Type matchup calculator. window.VIEWS.Types
   Uses VSE_CHART (the game's modified 18×18 chart). */
window.VIEWS = window.VIEWS || {};
(function () {
  const { TYPES } = window.VSEDEX;
  const { go, TypePill, PageHead } = window.VUI;
  const CHART = window.VSE_CHART;
  const ORDER = window.VSE_TYPE_ORDER;

  // Vanilla reference (for flagging changed matchups in the grid)
  const CHANGED = [
    ['WATER', 'ICE'], ['FLYING', 'ICE'], ['BUG', 'FAIRY'], ['DARK', 'BUG'], ['FAIRY', 'BUG'],
  ];
  const isChanged = (a, d) => CHANGED.some(c => c[0] === a && c[1] === d);

  const multColor = (m) => m === 0 ? '#6a5d42' : m === 0.25 ? '#7a3b2e' : m === 0.5 ? '#b5552f'
    : m === 1 ? '#5a5240' : m === 2 ? '#5fae4e' : '#3f8c3a';
  const multLabel = (m) => m === 0 ? '0' : m === 0.25 ? '¼' : m === 0.5 ? '½' : m === 1 ? '1' : m === 2 ? '2' : m === 4 ? '4' : String(m);

  // ---- Defensive calculator (pick up to 2 types, see incoming damage) ----
  function Defensive() {
    const [sel, setSel] = React.useState(['FIRE']);
    const toggle = (t) => setSel(s => s.includes(t) ? s.filter(x => x !== t) : (s.length >= 2 ? [s[1], t] : [...s, t]));
    // incoming multiplier from each attacking type = product across defender's types
    const incoming = ORDER.map(atk => {
      let m = 1;
      sel.forEach(def => { m *= CHART[atk][def]; });
      return { atk, m };
    });
    const buckets = {
      '4': incoming.filter(x => x.m === 4), '2': incoming.filter(x => x.m === 2),
      '0.5': incoming.filter(x => x.m === 0.5), '0.25': incoming.filter(x => x.m === 0.25),
      '0': incoming.filter(x => x.m === 0),
    };
    const Group = ({ label, items, color }) => items.length === 0 ? null : (
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, color, marginBottom: 8 }}>{label} ({items.length})</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{items.map(x => <TypePill key={x.atk} t={x.atk} sm onClick={() => {}} />)}</div>
      </div>
    );
    return (
      <div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#b3a892', marginBottom: 12 }}>Pick a defending type (or two) to see what hits it for how much:</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22 }}>
          {ORDER.map(t => {
            const on = sel.includes(t); const c = TYPES[t];
            return <button key={t} onClick={() => toggle(t)} style={{
              cursor: 'pointer', padding: '5px 11px', borderRadius: 999, fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
              textTransform: 'uppercase', color: on ? c.fg : c.glow, background: on ? c.bg : c.glow + '14',
              border: `1px solid ${on ? c.glow : c.glow + '66'}`, boxShadow: on ? `0 0 12px ${c.glow}55` : 'none',
            }}>{c.name}</button>;
          })}
        </div>
        <Group label="Weak to (×4)" items={buckets['4']} color="#3f8c3a" />
        <Group label="Weak to (×2)" items={buckets['2']} color="#5fae4e" />
        <Group label="Resists (×½)" items={buckets['0.5']} color="#b5552f" />
        <Group label="Resists (×¼)" items={buckets['0.25']} color="#7a3b2e" />
        <Group label="Immune (×0)" items={buckets['0']} color="#9a8d6f" />
      </div>
    );
  }

  // ---- Full chart grid ---------------------------------------------------
  function Grid() {
    return (
      <div style={{ overflowX: 'auto' }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#b3a892', marginBottom: 12 }}>
          Attacking type (rows) → defending type (columns). Cells outlined in gold differ from vanilla.
        </div>
        <table style={{ borderCollapse: 'collapse', fontFamily: "'Space Mono', monospace" }}>
          <thead>
            <tr>
              <th style={{ width: 34, height: 34 }} />
              {ORDER.map(d => (
                <th key={d} style={{ width: 30, padding: 0 }}>
                  <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 700, color: TYPES[d].glow, height: 56, margin: '0 auto', whiteSpace: 'nowrap' }}>{TYPES[d].name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ORDER.map(a => (
              <tr key={a}>
                <th style={{ textAlign: 'right', paddingRight: 8, fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 700, color: TYPES[a].glow, whiteSpace: 'nowrap' }}>{TYPES[a].name}</th>
                {ORDER.map(d => {
                  const m = CHART[a][d];
                  const chg = isChanged(a, d);
                  return (
                    <td key={d} title={`${TYPES[a].name} → ${TYPES[d].name}: ×${m}${chg ? ' (changed)' : ''}`}
                      style={{ width: 30, height: 30, textAlign: 'center', fontSize: 11, color: m === 1 ? '#5a5240' : '#fff',
                        background: m === 1 ? 'transparent' : multColor(m), border: chg ? '2px solid #ffb347' : '1px solid #1c1609' }}>
                      {m === 1 ? '' : multLabel(m)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  window.VIEWS.Types = function Types() {
    const [tab, setTab] = React.useState('calc');
    const Tab = ({ id, label }) => (
      <button onClick={() => setTab(id)} style={{
        cursor: 'pointer', padding: '7px 16px', borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: 13,
        background: tab === id ? '#2a1c08' : 'transparent', color: tab === id ? '#ffb347' : '#9a8d6f',
        border: `1px solid ${tab === id ? '#ffb34788' : '#2a2110'}`, fontWeight: tab === id ? 600 : 400,
      }}>{label}</button>
    );
    return (
      <div>
        <PageHead kicker="TYPE MATCHUPS" title="Type Calculator"
          sub="Solar Eclipse uses a modified type chart — 5 matchups differ from the standard games. Check defensive coverage or browse the full chart." />
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          <Tab id="calc" label="Defensive calculator" />
          <Tab id="grid" label="Full chart" />
        </div>
        {tab === 'calc' ? <Defensive /> : <Grid />}
      </div>
    );
  };
})();
