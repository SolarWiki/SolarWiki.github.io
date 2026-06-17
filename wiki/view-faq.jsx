/* Pokémon Solar Eclipse — FAQ page. window.VIEWS.FAQ
   Searchable, collapsible Q&A grouped by category. Content lives in window.VSE_FAQ
   (see data-faq.js) so the dev can add/edit questions without touching this file. */
window.VIEWS = window.VIEWS || {};
(function () {
  const { PageHead, Empty } = window.VUI;

  // Category accent colors (fall back to gold for any unlisted category).
  const CAT_COLOR = {
    'General': '#ffd23c',
    'Gameplay': '#ffb347',
    'Story': '#ff9e58',
    'Features': '#7fd17a',
    'Technical': '#5fb8ff',
    'Difficulty': '#e0556f',
  };
  const catColor = (c) => CAT_COLOR[c] || '#ffb347';

  function QA({ item, open, onToggle }) {
    const col = catColor(item.cat);
    return (
      <div style={{ background: '#0c0a05', border: `1px solid ${open ? col + '55' : '#241d10'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color .15s' }}>
        <button onClick={onToggle} style={{ cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', padding: '14px 16px' }}>
          <span style={{ flex: 1, fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 15.5, color: open ? '#fff' : '#e7dcc4', lineHeight: 1.35 }}>{item.q}</span>
          {item.cat && <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8.5, fontWeight: 700, letterSpacing: 0.5, color: col, background: col + '18', border: `1px solid ${col}44`, borderRadius: 5, padding: '2px 7px', textTransform: 'uppercase', flexShrink: 0 }}>{item.cat}</span>}
          <span style={{ color: col, fontSize: 16, lineHeight: 1, flexShrink: 0, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>›</span>
        </button>
        {open && (
          <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${col}22` }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#c9bca0', lineHeight: 1.6, marginTop: 12, whiteSpace: 'pre-wrap' }}>{item.a}</div>
          </div>
        )}
      </div>
    );
  }

  window.VIEWS.FAQ = function FAQ({ param }) {
    const ALL = window.VSE_FAQ || [];
    const [q, setQ] = React.useState('');
    const [cat, setCat] = React.useState(null);
    const [openIdx, setOpenIdx] = React.useState(param != null ? 0 : null);

    const query = q.trim().toLowerCase();
    const list = ALL.filter(it => {
      if (cat && it.cat !== cat) return false;
      if (query && !((it.q || '').toLowerCase().includes(query) || (it.a || '').toLowerCase().includes(query))) return false;
      return true;
    });

    // category chips, in first-seen order
    const cats = [];
    ALL.forEach(it => { if (it.cat && !cats.includes(it.cat)) cats.push(it.cat); });

    return (
      <div>
        <PageHead kicker="HELP" title="FAQ"
          sub="Common questions about Pokémon Solar Eclipse — gameplay, story, features, and troubleshooting. Tap a question to expand it." />

        {ALL.length === 0 ? (
          <Empty label="No FAQ entries yet — check back soon." />
        ) : (
          <React.Fragment>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', borderRadius: 10, background: '#0f0b04', border: '1px solid #2a2110', marginBottom: 14, maxWidth: 360 }}>
              <span style={{ color: '#7a6c4a', fontSize: 15 }}>⌕</span>
              <input value={q} onChange={e => { setQ(e.target.value); setOpenIdx(null); }} placeholder="Search questions…"
                style={{ border: 'none', outline: 'none', background: 'transparent', color: '#ece3d2', fontFamily: "'Outfit', sans-serif", fontSize: 14, width: '100%' }} />
            </div>

            {cats.length > 1 && (
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 22 }}>
                {cats.map(c => {
                  const on = cat === c; const col = catColor(c);
                  return <button key={c} onClick={() => { setCat(on ? null : c); setOpenIdx(null); }} style={{
                    cursor: 'pointer', padding: '6px 13px', borderRadius: 999, fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
                    color: on ? '#0d0b08' : col, background: on ? col : col + '14', border: `1px solid ${on ? col : col + '55'}`,
                  }}>{c}</button>;
                })}
                {cat && <button onClick={() => setCat(null)} style={{ cursor: 'pointer', padding: '6px 13px', borderRadius: 999, fontSize: 11, color: '#ff8f6f', background: 'transparent', border: '1px solid #5e3020', fontFamily: "'Outfit', sans-serif" }}>clear ×</button>}
              </div>
            )}

            {list.length === 0 ? <Empty label="No questions match your search." /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 820 }}>
                {list.map((it, i) => (
                  <QA key={i} item={it} open={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? null : i)} />
                ))}
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    );
  };
})();
