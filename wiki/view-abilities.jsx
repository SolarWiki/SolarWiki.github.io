/* Pokémon Solar Eclipse — Abilities page. window.VIEWS.Abilities */
window.VIEWS = window.VIEWS || {};
(function () {
  const { go, PageHead, Empty } = window.VUI;
  const ABIL = window.VSE_ABILITIES;

  function Row({ a }) {
    const [open, setOpen] = React.useState(false);
    return (
      <div style={{ background: '#0c0a05', border: `1px solid ${a.changed ? '#ffb34744' : '#241d10'}`, borderRadius: 12, padding: '14px 18px', marginBottom: 10 }}>
        <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 17, color: '#fff' }}>{a.name}</span>
            {a.changed && <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: '#ffb347', background: '#2a1c08', border: '1px solid #ffb34755', borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase' }}>Changed</span>}
          </div>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#7a6c4a' }}>{a.count} {a.count === 1 ? 'Pokémon' : 'Pokémon'}</span>
        </div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#c9bca0', marginTop: 8, lineHeight: 1.5 }}>{a.desc || <span style={{ color: '#6a5d42' }}>No description in the documentation.</span>}</div>
        {a.changed && a.old && (
          <div style={{ marginTop: 8, fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: '#8a7d63', lineHeight: 1.5 }}>
            <span style={{ color: '#b5552f', fontWeight: 600 }}>Was: </span>{a.old}
          </div>
        )}
        {open && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #1c1609' }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, color: '#8a7d63', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' }}>Pokémon with this ability</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {a.mons.map(([dex, name, slot]) => (
                <button key={dex + slot} onClick={() => go('#/pokemon/' + dex)} style={{
                  cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: 12, padding: '4px 9px', borderRadius: 7,
                  background: slot === 'H' ? '#2a1c08' : '#1a1407', color: slot === 'H' ? '#ffb347' : '#ffe0b0',
                  border: `1px solid ${slot === 'H' ? '#ffb34744' : '#3a2c12'}`,
                }}>{name}{slot === 'H' ? ' ·HA' : ''}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  window.VIEWS.Abilities = function Abilities({ param }) {
    const [q, setQ] = React.useState(param ? decodeURIComponent(param) : '');
    const [only, setOnly] = React.useState(false);
    React.useEffect(() => { if (param) setQ(decodeURIComponent(param)); }, [param]);
    const query = q.trim().toLowerCase();
    let list = ABIL.filter(a => {
      if (only && !a.changed) return false;
      if (query && !(a.name.toLowerCase().includes(query) || (a.desc || '').toLowerCase().includes(query))) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
    const changedCount = ABIL.filter(a => a.changed).length;
    return (
      <div>
        <PageHead kicker="ABILITIES" title="Abilities"
          sub={`All ${ABIL.length} abilities in the regional dex. ${changedCount} are modified for Solar Eclipse — tap any ability to see which Pokémon have it.`} />
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', borderRadius: 10, background: '#0f0b04', border: '1px solid #2a2110', flex: '0 1 320px' }}>
            <span style={{ color: '#7a6c4a', fontSize: 15 }}>⌕</span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search abilities…"
              style={{ border: 'none', outline: 'none', background: 'transparent', color: '#ece3d2', fontFamily: "'Outfit', sans-serif", fontSize: 14, width: '100%' }} />
          </div>
          <button onClick={() => setOnly(o => !o)} style={{
            cursor: 'pointer', padding: '8px 14px', borderRadius: 9, fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: only ? 600 : 500,
            background: only ? '#2a1c08' : '#0f0b04', color: only ? '#ffb347' : '#9a8d6f', border: `1px solid ${only ? '#ffb34788' : '#2a2110'}`,
          }}>{only ? '✓ ' : ''}Changed only</button>
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#8a7d63', marginBottom: 14 }}>{list.length} {list.length === 1 ? 'ability' : 'abilities'}</div>
        {list.length === 0 ? <Empty label="No abilities match." /> : list.map(a => <Row key={a.name} a={a} />)}
      </div>
    );
  };
})();
