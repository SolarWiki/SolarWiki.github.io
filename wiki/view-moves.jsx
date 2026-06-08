/* Pokémon Solar Eclipse — Moves page. window.VIEWS.Moves */
window.VIEWS = window.VIEWS || {};
(function () {
  const { TYPES } = window.VSEDEX;
  const { go, TypePill, PageHead, Empty } = window.VUI;
  const MOVES = window.VSE_MOVES;
  const ALL_TYPES = Object.keys(TYPES);
  const CLS_COLOR = { Physical: '#ff7a3c', Special: '#6fa8ff', Status: '#b5a98f' };

  function Row({ m }) {
    const t = TYPES[m.type];
    const cls = CLS_COLOR[m.cls] || '#9a8d6f';
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.9fr 0.7fr 54px 54px 44px', gap: 12, alignItems: 'center', padding: '11px 16px', background: '#0c0a05', border: '1px solid #241d10', borderRadius: 10, marginBottom: 7 }} className="se-move-row">
        <div>
          <div style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 15, color: '#fff' }}>{m.name}</div>
          {m.desc && <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11.5, color: '#9a8d6f', marginTop: 2, lineHeight: 1.4 }}>{m.desc}</div>}
        </div>
        <div>{t ? <TypePill t={m.type} sm onClick={() => {}} /> : <span style={{ fontSize: 11, color: '#6a5d42' }}>{m.type}</span>}</div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, color: cls }}>{m.cls}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#fff6e8', textAlign: 'right' }}>{m.pow || '—'}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#cbbd9f', textAlign: 'right' }}>{m.acc || '—'}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#9a8d6f', textAlign: 'right' }}>{m.pp || '—'}</div>
      </div>
    );
  }

  window.VIEWS.Moves = function Moves() {
    const [q, setQ] = React.useState('');
    const [typeF, setTypeF] = React.useState(null);
    const [clsF, setClsF] = React.useState(null);
    const [sort, setSort] = React.useState('name');
    const query = q.trim().toLowerCase();

    let list = MOVES.filter(m => {
      if (typeF && m.type !== typeF) return false;
      if (clsF && m.cls !== clsF) return false;
      if (query && !(m.name.toLowerCase().includes(query) || (m.desc || '').toLowerCase().includes(query))) return false;
      return true;
    });
    if (sort === 'power') list = [...list].sort((a, b) => b.pow - a.pow);
    else if (sort === 'acc') list = [...list].sort((a, b) => b.acc - a.acc);
    else list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    const Chip = ({ on, onClick, color, children }) => (
      <button onClick={onClick} style={{
        cursor: 'pointer', padding: '4px 10px', borderRadius: 999, fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
        textTransform: 'uppercase', color: on ? (color ? '#0d0b08' : '#ffb347') : (color || '#9a8d6f'),
        background: on ? (color || '#2a1c08') : 'transparent', border: `1px solid ${on ? (color || '#ffb34788') : '#2c2413'}`,
      }}>{children}</button>
    );

    return (
      <div>
        <PageHead kicker="MOVEDEX" title="Moves"
          sub={`All ${MOVES.length} moves available in Solar Eclipse, with power, accuracy, PP, and effect.`} />

        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', borderRadius: 10, background: '#0f0b04', border: '1px solid #2a2110', flex: '0 1 300px' }}>
            <span style={{ color: '#7a6c4a', fontSize: 15 }}>⌕</span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search moves…"
              style={{ border: 'none', outline: 'none', background: 'transparent', color: '#ece3d2', fontFamily: "'Outfit', sans-serif", fontSize: 14, width: '100%' }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Physical', 'Special', 'Status'].map(c => (
              <Chip key={c} on={clsF === c} color={CLS_COLOR[c]} onClick={() => setClsF(clsF === c ? null : c)}>{c}</Chip>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: 1, color: '#7a6c4a' }}>SORT</span>
            {[['name', 'A–Z'], ['power', 'Power'], ['acc', 'Acc']].map(([id, l]) => (
              <Chip key={id} on={sort === id} onClick={() => setSort(id)}>{l}</Chip>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 16 }}>
          {ALL_TYPES.map(t => {
            const on = typeF === t; const c = TYPES[t];
            return <button key={t} onClick={() => setTypeF(on ? null : t)} style={{
              cursor: 'pointer', padding: '3px 9px', borderRadius: 999, fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
              textTransform: 'uppercase', color: on ? c.fg : c.glow, background: on ? c.bg : c.glow + '14', border: `1px solid ${on ? c.glow : c.glow + '55'}`,
            }}>{c.name}</button>;
          })}
          {(typeF || clsF) && <button onClick={() => { setTypeF(null); setClsF(null); }} style={{ cursor: 'pointer', padding: '3px 9px', borderRadius: 999, fontSize: 11, color: '#ff8f6f', background: 'transparent', border: '1px solid #5e3020', fontFamily: "'Outfit', sans-serif" }}>clear ×</button>}
        </div>

        {/* column header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.9fr 0.7fr 54px 54px 44px', gap: 12, padding: '0 16px 8px', fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1, color: '#7a6c4a', textTransform: 'uppercase' }}>
          <span>Move</span><span>Type</span><span>Class</span><span style={{ textAlign: 'right' }}>Pow</span><span style={{ textAlign: 'right' }}>Acc</span><span style={{ textAlign: 'right' }}>PP</span>
        </div>

        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#8a7d63', marginBottom: 10 }}>{list.length} moves</div>
        {list.length === 0 ? <Empty label="No moves match." /> : list.map(m => <Row key={m.name} m={m} />)}
      </div>
    );
  };
})();
