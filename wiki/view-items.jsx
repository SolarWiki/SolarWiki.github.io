/* Pokémon Solar Eclipse — Items page (card grid). window.VIEWS.Items */
window.VIEWS = window.VIEWS || {};
(function () {
  const { PageHead, Empty } = window.VUI;
  const ITEMS = window.VSE_ITEMS;

  const POCKETS = [
    ['Poké Balls', '#ff7a6f'], ['Medicine', '#ff8f8f'], ['Items', '#cbb88f'],
    ['Evolution', '#7fd17a'], ['Battle Items', '#ffb347'], ['Berries', '#c45fff'],
    ['Key Items', '#6fa8ff'], ['Treasures', '#ffd23c'],
  ];
  const pocketColor = (c) => (POCKETS.find(p => p[0] === c) || [, '#9a8d6f'])[1];

  function Card({ it }) {
    const col = pocketColor(it.cat);
    const iconKey = window.VSE_ITEM_ICON && window.VSE_ITEM_ICON[it.name];
    return (
      <div style={{ background: '#0c0a05', border: `1px solid ${it.changed ? col + '66' : '#241d10'}`, borderRadius: 14, padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {/* icon slot — real item sprite, falls back to a colored dot */}
          <div style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 10, border: `1px solid ${col}33`, background: 'radial-gradient(circle at 50% 42%, #2a1c08 0%, #0a0905 75%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {iconKey
              ? <img src={'items/' + iconKey + '.png'} alt={it.name}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                  style={{ maxWidth: 38, maxHeight: 38, imageRendering: 'pixelated', objectFit: 'contain' }} />
              : null}
            <span style={{ display: iconKey ? 'none' : 'block', width: 8, height: 8, borderRadius: '50%', background: col, boxShadow: `0 0 8px ${col}` }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 17, color: '#fff' }}>{it.name}</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8.5, fontWeight: 700, letterSpacing: 0.5, color: col, background: col + '18', border: `1px solid ${col}44`, borderRadius: 5, padding: '2px 7px', textTransform: 'uppercase' }}>{it.cat}</span>
              {it.changed && <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8.5, fontWeight: 700, letterSpacing: 0.5, color: '#ffb347', background: '#2a1c08', border: '1px solid #ffb34755', borderRadius: 5, padding: '2px 7px', textTransform: 'uppercase' }}>Changed</span>}
            </div>
            {it.desc && <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#c9bca0', lineHeight: 1.45 }}>{it.desc}</div>}
            {it.locs.length > 0 && (
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#8a7d63', marginTop: 8, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <span style={{ color: '#6a5d42' }}>⌖</span><span style={{ fontFamily: "'Outfit', sans-serif" }}>{it.locs.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  window.VIEWS.Items = function Items({ param }) {
    const [q, setQ] = React.useState(param ? decodeURIComponent(param) : '');
    const [pocket, setPocket] = React.useState(null);
    React.useEffect(() => { if (param) setQ(decodeURIComponent(param)); }, [param]);
    const query = q.trim().toLowerCase();
    let list = ITEMS.filter(it => {
      if (pocket && it.cat !== pocket) return false;
      if (query && !(it.name.toLowerCase().includes(query) || (it.desc || '').toLowerCase().includes(query) || it.locs.join(' ').toLowerCase().includes(query))) return false;
      return true;
    });
    // group by pocket in defined order for clean organization
    const grouped = POCKETS.map(([name]) => ({ name, items: list.filter(i => i.cat === name) })).filter(g => g.items.length);

    return (
      <div>
        <PageHead kicker="ITEMS" title="Items"
          sub={`All ${ITEMS.length} obtainable items with effects and where to find them, organized by bag pocket.`} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', borderRadius: 10, background: '#0f0b04', border: '1px solid #2a2110', marginBottom: 14, maxWidth: 360 }}>
          <span style={{ color: '#7a6c4a', fontSize: 15 }}>⌕</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search items, effects, locations…"
            style={{ border: 'none', outline: 'none', background: 'transparent', color: '#ece3d2', fontFamily: "'Outfit', sans-serif", fontSize: 14, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 22 }}>
          {POCKETS.map(([name, col]) => {
            const on = pocket === name;
            return <button key={name} onClick={() => setPocket(on ? null : name)} style={{
              cursor: 'pointer', padding: '6px 13px', borderRadius: 999, fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
              color: on ? '#0d0b08' : col, background: on ? col : col + '14', border: `1px solid ${on ? col : col + '55'}`,
            }}>{name}</button>;
          })}
          {pocket && <button onClick={() => setPocket(null)} style={{ cursor: 'pointer', padding: '6px 13px', borderRadius: 999, fontSize: 11, color: '#ff8f6f', background: 'transparent', border: '1px solid #5e3020', fontFamily: "'Outfit', sans-serif" }}>clear ×</button>}
        </div>

        {list.length === 0 ? <Empty label="No items match." /> : grouped.map(g => (
          <div key={g.name} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: pocketColor(g.name), textTransform: 'uppercase' }}>{g.name}</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#6a5d42' }}>{g.items.length}</span>
              <div style={{ flex: 1, height: 1, background: '#1c1609' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 12 }}>
              {g.items.map(it => <Card key={it.name} it={it} />)}
            </div>
          </div>
        ))}
      </div>
    );
  };
})();
