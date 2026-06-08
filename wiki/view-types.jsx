/* Pokémon Solar Eclipse — type calculator (defense + offense), modeled on the Void wiki.
   Uses VSE_CHART (the game's modified 18×18 chart). window.VIEWS.Types */
window.VIEWS = window.VIEWS || {};
(function () {
  const { TYPES } = window.VSEDEX;
  const { PageHead } = window.VUI;
  const CHART = window.VSE_CHART;
  const ORDER = window.VSE_TYPE_ORDER;

  const CHANGED = [['WATER','ICE'],['FLYING','ICE'],['BUG','FAIRY'],['DARK','BUG'],['FAIRY','BUG']];

  // A small colored type pill (dot + name) used in result buckets and selections.
  function Pill({ t, onRemove }) {
    const c = TYPES[t];
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 999, background: '#15110a', border: `1px solid ${c.glow}66`, fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 600, color: '#f0e7d6' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.glow }} />
        {c.name}
        {onRemove && <span onClick={onRemove} style={{ cursor: 'pointer', color: '#9a8d6f', marginLeft: 1, fontSize: 13 }}>×</span>}
      </span>
    );
  }

  // Grid row in the picker (a selectable type).
  function PickRow({ t, on, onClick }) {
    const c = TYPES[t];
    return (
      <button onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', cursor: 'pointer',
        padding: '10px 13px', borderRadius: 9, fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: on ? 700 : 500,
        color: on ? '#fff' : '#b3a892', background: on ? c.bg : 'transparent',
        border: `1px solid ${on ? c.glow : '#241d10'}`, transition: 'all .12s',
      }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: c.glow, flexShrink: 0 }} />
        {c.name}
      </button>
    );
  }

  function Picker({ title, hint, sel, setSel, max }) {
    const toggle = (t) => setSel(s => s.includes(t) ? s.filter(x => x !== t) : (s.length >= max ? [...s.slice(1), t] : [...s, t]));
    const col1 = ORDER.slice(0, 9), col2 = ORDER.slice(9);
    return (
      <div style={{ background: '#0c0a05', border: '1px solid #241d10', borderRadius: 14, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#ffb347', textTransform: 'uppercase' }}>{title}</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#7a6c4a' }}>{sel.length}/{max}</span>
        </div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: '#9a8d6f', marginBottom: 12 }}>{hint}</div>
        {sel.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px', marginBottom: 12, background: '#0a0805', border: '1px solid #2a2110', borderRadius: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{sel.map(t => <Pill key={t} t={t} onRemove={() => toggle(t)} />)}</div>
            <span onClick={() => setSel([])} style={{ cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#8f7fff' }}>↺ clear</span>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{col1.map(t => <PickRow key={t} t={t} on={sel.includes(t)} onClick={() => toggle(t)} />)}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{col2.map(t => <PickRow key={t} t={t} on={sel.includes(t)} onClick={() => toggle(t)} />)}</div>
        </div>
      </div>
    );
  }

  function Bucket({ mult, label, types }) {
    if (!types.length) return null;
    const ml = mult === 0 ? '×0' : mult === 0.25 ? '×¼' : mult === 0.5 ? '×½' : mult === 2 ? '×2' : mult === 4 ? '×4' : '×1';
    const col = mult === 0 ? '#9a8d6f' : mult < 1 ? '#e0884a' : mult > 1 ? '#5fc04e' : '#b3a892';
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 800, fontSize: 15, color: col }}>{ml}</span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1, color: '#7a6c4a', textTransform: 'uppercase' }}>{label}</span>
          <div style={{ flex: 1, height: 1, background: '#1c1609' }} />
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>{types.map(t => <Pill key={t} t={t} />)}</div>
      </div>
    );
  }

  function Results({ rows, emptyHint }) {
    const order = [4, 2, 1, 0.5, 0.25, 0];
    const labels = { 4: 'Quad weak', 2: 'Weak', 1: 'Neutral', 0.5: 'Resist', 0.25: 'Double resist', 0: 'No effect' };
    const byMult = {};
    rows.forEach(({ t, m }) => { (byMult[m] = byMult[m] || []).push(t); });
    const any = rows.length > 0;
    return (
      <div style={{ background: '#0c0a05', border: '1px solid #241d10', borderRadius: 14, padding: 18, minHeight: 200 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#ffb347', textTransform: 'uppercase', marginBottom: 16 }}>Damage taken</div>
        {!any ? <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a5d42', padding: '30px 0', textAlign: 'center' }}>{emptyHint}</div>
          : order.map(m => <Bucket key={m} mult={m} label={labels[m]} types={byMult[m] || []} />)}
      </div>
    );
  }

  window.VIEWS.Types = function Types() {
    const [mode, setMode] = React.useState('defense');
    const [def, setDef] = React.useState([]);
    const [atk, setAtk] = React.useState([]);

    // DEFENSE: for a defending typing, incoming multiplier from each attacking type.
    const defRows = def.length ? ORDER.map(a => ({ t: a, m: def.reduce((acc, d) => acc * CHART[a][d], 1) })) : [];

    // OFFENSE: for an attacking type, multiplier vs each defending type.
    const atkType = atk[0];
    const offRows = atkType ? ORDER.map(d => ({ t: d, m: CHART[atkType][d] })) : [];

    const Tab = ({ id, label }) => (
      <button onClick={() => setMode(id)} style={{
        cursor: 'pointer', padding: '8px 16px', borderRadius: 9, fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: mode === id ? 600 : 500,
        background: mode === id ? '#2a1c08' : '#0f0b04', color: mode === id ? '#ffb347' : '#9a8d6f', border: `1px solid ${mode === id ? '#ffb34788' : '#2a2110'}`,
      }}>{label}</button>
    );

    return (
      <div>
        <PageHead kicker="TYPE CALCULATOR" title="Type Matchups"
          sub="Two calculators in one: check what hurts a defending Pokémon, or what an attacking move type is strong against — using Solar Eclipse's modified type chart." />

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <Tab id="defense" label="Defense — what hits this type" />
          <Tab id="offense" label="Offense — what this type hits" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginTop: 18 }} className="se-tc-grid">
          {mode === 'defense' ? (
            <React.Fragment>
              <Picker title="Defending types" hint="Pick one or two types to see what it takes damage from." sel={def} setSel={setDef} max={2} />
              <Results rows={defRows} emptyHint="Pick a defending type to see incoming damage." />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Picker title="Attacking type" hint="Pick a move type to see what it's strong and weak against." sel={atk} setSel={setAtk} max={1} />
              <Results rows={offRows} emptyHint="Pick an attacking type to see its coverage." />
            </React.Fragment>
          )}
        </div>
      </div>
    );
  };
})();
