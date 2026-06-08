/* Pokémon Solar Eclipse — Items page. window.VIEWS.Items */
window.VIEWS = window.VIEWS || {};
(function () {
  const { PageHead, Empty } = window.VUI;
  const ITEMS = window.VSE_ITEMS;

  // Bag pocket order + accent colors
  const POCKETS = [
    ['Items', '#cbb88f'], ['Medicine', '#ff8f8f'], ['Poké Balls', '#ff7a6f'],
    ['Battle Items', '#ffb347'], ['Berries', '#c45fff'], ['Key Items', '#6fa8ff'],
    ['Treasures', '#ffd23c'],
  ];
  const pocketColor = (c) => (POCKETS.find(p => p[0] === c) || [, '#9a8d6f'])[1];

  function Row({ it }) {
    const col = pocketColor(it.cat);
    return (
      <div style={{ background: '#0c0a05', border: '1px solid #241d10', borderRadius: 11, padding: '12px 16px', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: col, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 16, color: '#fff' }}>{it.name}</span>
          </div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: col, background: col + '18', border: `1px solid ${col}44`, borderRadius: 6, padding: '2px 8px', textTransform: 'uppercase' }}>{it.cat}</span>
        </div>
        {it.locs.length > 0 && (
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: '#9a8d6f', marginTop: 7, lineHeight: 1.5 }}>
            <span style={{ color: '#6a5d42' }}>Location: </span>{it.locs.join(' · ')}
          </div>
        )}
      </div>
    );
  }

  window.VIEWS.Items = function Items() {
    const [q, setQ] = React.useState('');
    const [pocket, setPocket] = React.useState(null);
    const query = q.trim().toLowerCase();
    let list = ITEMS.filter(it => {
      if (pocket && it.cat !== pocket) return false;
      if (query && !(it.name.toLowerCase().includes(query) || it.locs.join(' ').toLowerCase().includes(query))) return false;
      return true;
    });
    return (
      <div>
        <PageHead kicker="ITEMS" title="Items"
          sub={`All ${ITEMS.length} obtainable items and where to find them, sorted into bag pockets.`} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', borderRadius: 10, background: '#0f0b04', border: '1px solid #2a2110', marginBottom: 14, maxWidth: 360 }}>
          <span style={{ color: '#7a6c4a', fontSize: 15 }}>⌕</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search items or locations…"
            style={{ border: 'none', outline: 'none', background: 'transparent', color: '#ece3d2', fontFamily: "'Outfit', sans-serif", fontSize: 14, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 18 }}>
          {POCKETS.map(([name, col]) => {
            const on = pocket === name;
            return <button key={name} onClick={() => setPocket(on ? null : name)} style={{
              cursor: 'pointer', padding: '6px 13px', borderRadius: 999, fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
              color: on ? '#0d0b08' : col, background: on ? col : col + '14', border: `1px solid ${on ? col : col + '55'}`,
            }}>{name}</button>;
          })}
          {pocket && <button onClick={() => setPocket(null)} style={{ cursor: 'pointer', padding: '6px 13px', borderRadius: 999, fontSize: 11, color: '#ff8f6f', background: 'transparent', border: '1px solid #5e3020', fontFamily: "'Outfit', sans-serif" }}>clear ×</button>}
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#8a7d63', marginBottom: 12 }}>{list.length} {list.length === 1 ? 'item' : 'items'}</div>
        {list.length === 0 ? <Empty label="No items match." /> : list.map(it => <Row key={it.name} it={it} />)}
      </div>
    );
  };
})();
