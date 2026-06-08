/* Pokémon Solar Eclipse — Pokédex grid view. window.VIEWS.Pokedex */
window.VIEWS = window.VIEWS || {};
(function () {
  const { DEX, TYPES } = window.VSEDEX;
  const { go, TypePill, AbilityPill, SpriteSlot, PageHead, Empty } = window.VUI;
  const ALL_TYPES = Object.keys(TYPES);
  const bst = d => Object.values(d.stats).reduce((a, b) => a + b, 0);

  // ---- Grid card (navigates to #/pokemon/<dex>) --------------------------
  function Card({ d }) {
    const [hov, setHov] = React.useState(false);
    const accent = TYPES[d.types[0]].glow;
    const total = bst(d);
    const formCount = (d.forms || []).length;
    const open = () => go('#/pokemon/' + d.dex);
    return (
      <button onClick={open} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          textAlign: 'left', cursor: 'pointer', padding: 16, borderRadius: 16,
          background: hov ? `linear-gradient(160deg, ${TYPES[d.types[0]].bg}55, #0a0805)` : '#0c0a05',
          border: `1px solid ${hov ? accent + 'aa' : '#241d10'}`,
          boxShadow: hov ? `0 0 28px ${accent}33` : 'none', transition: 'all .18s', transform: hov ? 'translateY(-3px)' : 'none',
          fontFamily: "'Outfit', sans-serif",
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#7a6c4a' }}>No.{d.dex}</span>
          {formCount > 0 && <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8, fontWeight: 700, color: '#ffb347' }}>+{formCount} {formCount === 1 ? 'FORM' : 'FORMS'}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <SpriteSlot dex={d.dex} name={d.name} size={132} accent={accent} />
        </div>
        <div style={{ fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 22, color: '#fff', lineHeight: 1 }}>{d.name}</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', margin: '4px 0 10px', minHeight: 14 }}>
          {d.abilities.map(a => <AbilityPill key={a} name={a} />)}
          {d.hidden && <AbilityPill name={d.hidden} hidden />}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>{d.types.map(t => <TypePill key={t} t={t} sm onClick={(e) => { e.stopPropagation(); open(); }} />)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #1c1609' }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8, fontWeight: 600, letterSpacing: 1, color: '#7a6c4a' }}>BST</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: accent, fontWeight: 700 }}>{total}</span>
        </div>
      </button>
    );
  }

  // ---- Page --------------------------------------------------------------
  window.VIEWS.Pokedex = function Pokedex({ query }) {
    const [filters, setFilters] = React.useState([]);
    const [sort, setSort] = React.useState('dex');
    const q = (query || '').trim().toLowerCase();
    const toggle = (t) => setFilters(f => f.includes(t) ? f.filter(x => x !== t) : [...f, t]);

    let list = DEX.filter(d => {
      if (q && !(d.name.toLowerCase().includes(q) || d.dex.includes(q))) return false;
      if (filters.length && !filters.every(t => d.types.includes(t))) return false;
      return true;
    });
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'bst') list = [...list].sort((a, b) => bst(b) - bst(a));
    else list = [...list].sort((a, b) => a.dex.localeCompare(b.dex));

    const SortBtn = ({ id, label }) => (
      <button onClick={() => setSort(id)} style={{
        cursor: 'pointer', padding: '6px 12px', borderRadius: 7, fontFamily: "'Outfit', sans-serif", fontSize: 13,
        background: sort === id ? '#2a1c08' : 'transparent', color: sort === id ? '#fff' : '#9a8d6f',
        border: `1px solid ${sort === id ? '#5a4318' : '#241d10'}`, fontWeight: sort === id ? 600 : 400, whiteSpace: 'nowrap', flexShrink: 0,
      }}>{label}</button>
    );

    return (
      <div>
        <PageHead kicker="REGIONAL SOLDEX" title="Pokédex"
          sub="Every species catalogued for Pokémon Solar Eclipse. Filter by type, search by name, and open any entry for its stats, abilities, and alternate forms." />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ALL_TYPES.map(t => {
              const on = filters.includes(t); const c = TYPES[t];
              return (
                <button key={t} onClick={() => toggle(t)} style={{
                  cursor: 'pointer', padding: '4px 10px', borderRadius: 999, fontFamily: "'Outfit', sans-serif", fontSize: 9, letterSpacing: 0.5, fontWeight: 600,
                  textTransform: 'uppercase', color: on ? c.fg : c.glow, background: on ? c.bg : c.glow + '14',
                  border: `1px solid ${on ? c.glow : c.glow + '66'}`, opacity: on ? 1 : 0.85,
                  boxShadow: on ? `0 0 12px ${c.glow}55, inset 0 0 10px ${c.glow}33` : 'none', transition: 'all .15s',
                }}>{c.name}</button>
              );
            })}
            {filters.length > 0 && <button onClick={() => setFilters([])} style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: 999, fontSize: 11, color: '#ff8f6f', background: 'transparent', border: '1px solid #5e3020', fontFamily: "'Outfit', sans-serif" }}>clear ×</button>}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: 1, color: '#7a6c4a' }}>SORT</span>
            <SortBtn id="dex" label="Dex №" /><SortBtn id="name" label="A–Z" /><SortBtn id="bst" label="Total" />
          </div>
        </div>

        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#8a7d63', marginBottom: 16 }}>{list.length} {list.length === 1 ? 'entry' : 'entries'}</div>

        {list.length === 0 ? <Empty label="No Pokémon match your filters." /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(216px, 1fr))', gap: 16 }}>
            {list.map(d => <Card key={d.dex} d={d} />)}
          </div>
        )}
      </div>
    );
  };
})();
