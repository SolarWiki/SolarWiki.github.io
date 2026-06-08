/* Pokémon Solar Eclipse — TMs page. window.VIEWS.TMs */
window.VIEWS = window.VIEWS || {};
(function () {
  const { TYPES } = window.VSEDEX;
  const { TypePill, PageHead, Empty } = window.VUI;
  const TMS = window.VSE_TMS;
  const ALL_TYPES = Object.keys(TYPES);
  const CLS_COLOR = { Physical: '#ff7a3c', Special: '#6fa8ff', Status: '#b5a98f' };

  function Row({ t }) {
    const ty = TYPES[t.type];
    const cls = CLS_COLOR[t.cls] || '#9a8d6f';
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '50px 1.4fr 0.9fr 0.7fr 46px 46px 38px 1.3fr', gap: 12, alignItems: 'center', padding: '11px 16px', background: '#0c0a05', border: '1px solid #241d10', borderRadius: 10, marginBottom: 7 }} className="se-tm-row">
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#ffb347', fontWeight: 700 }}>TM{String(t.tm).padStart(2, '0')}</span>
        <span style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 15, color: '#fff' }}>{t.move}</span>
        <span>{ty ? <TypePill t={t.type} sm onClick={() => {}} /> : <span style={{ fontSize: 11, color: '#6a5d42' }}>{t.type}</span>}</span>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, color: cls }}>{t.cls}</span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#fff6e8', textAlign: 'right' }}>{t.pow || '—'}</span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#cbbd9f', textAlign: 'right' }}>{t.acc || '—'}</span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#9a8d6f', textAlign: 'right' }}>{t.pp || '—'}</span>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#9a8d6f', textAlign: 'right' }}>{t.loc || '—'}</span>
      </div>
    );
  }

  window.VIEWS.TMs = function TMs() {
    const [q, setQ] = React.useState('');
    const [typeF, setTypeF] = React.useState(null);
    const [clsF, setClsF] = React.useState(null);
    const query = q.trim().toLowerCase();
    let list = TMS.filter(t => {
      if (typeF && t.type !== typeF) return false;
      if (clsF && t.cls !== clsF) return false;
      if (query && !(t.move.toLowerCase().includes(query) || (t.loc || '').toLowerCase().includes(query))) return false;
      return true;
    }).sort((a, b) => a.tm - b.tm);

    const Chip = ({ on, onClick, color, children }) => (
      <button onClick={onClick} style={{
        cursor: 'pointer', padding: '5px 12px', borderRadius: 999, fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
        color: on ? '#0d0b08' : (color || '#9a8d6f'), background: on ? (color || '#ffb347') : 'transparent', border: `1px solid ${on ? (color || '#ffb347') : '#2c2413'}`,
      }}>{children}</button>
    );

    return (
      <div>
        <PageHead kicker="TM LIST" title="TMs"
          sub={`All ${TMS.length} Technical Machines, what they teach, and where to find them. Filter by move type or category.`} />

        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', borderRadius: 10, background: '#0f0b04', border: '1px solid #2a2110', flex: '0 1 280px' }}>
            <span style={{ color: '#7a6c4a', fontSize: 15 }}>⌕</span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search TMs or locations…"
              style={{ border: 'none', outline: 'none', background: 'transparent', color: '#ece3d2', fontFamily: "'Outfit', sans-serif", fontSize: 14, width: '100%' }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Physical', 'Special', 'Status'].map(c => <Chip key={c} on={clsF === c} color={CLS_COLOR[c]} onClick={() => setClsF(clsF === c ? null : c)}>{c}</Chip>)}
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

        <div style={{ display: 'grid', gridTemplateColumns: '50px 1.4fr 0.9fr 0.7fr 46px 46px 38px 1.3fr', gap: 12, padding: '0 16px 8px', fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1, color: '#7a6c4a', textTransform: 'uppercase' }}>
          <span>TM</span><span>Move</span><span>Type</span><span>Class</span><span style={{ textAlign: 'right' }}>Pow</span><span style={{ textAlign: 'right' }}>Acc</span><span style={{ textAlign: 'right' }}>PP</span><span style={{ textAlign: 'right' }}>Location</span>
        </div>

        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#8a7d63', marginBottom: 10 }}>{list.length} TMs</div>
        {list.length === 0 ? <Empty label="No TMs match." /> : list.map(t => <Row key={t.tm + t.move} t={t} />)}
      </div>
    );
  };
})();
