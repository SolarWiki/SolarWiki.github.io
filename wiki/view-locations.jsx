/* Pokémon Solar Eclipse — Locations. window.VIEWS.Locations
   Browse every area in route order; see its wild encounters grouped by method
   (with sprites, levels, and rarity), plus any items documented for that area.
   Data parsed from the game's Encounters sheet → window.VSE_LOCATIONS. */
window.VIEWS = window.VIEWS || {};
(function () {
  const { PageHead, SpriteSlot, TypePill, go } = window.VUI;
  const DEX = window.VSEDEX.DEX;
  const byDex = window.VSEDEX.byDex;

  // method → {label, color, icon}. Trades/coins/gifts fall through to defaults.
  const METHOD_META = {
    'Grass': { label: 'Tall Grass', color: '#5fd17a' },
    'Cave': { label: 'Cave', color: '#b89a6a' },
    'Surfing': { label: 'Surfing', color: '#4fa8e8' },
    'Fishing': { label: 'Fishing', color: '#4f7fe8' },
    'Hidden Grotto': { label: 'Hidden Grotto', color: '#c08bff' },
    'Marsh': { label: 'Marsh', color: '#8fbf5f' },
    'Deep Sand': { label: 'Deep Sand', color: '#e8c45f' },
    'Inside': { label: 'Inside', color: '#b89a6a' },
    'Only One': { label: 'Static / One-time', color: '#ff8f5c' },
    'Chase': { label: 'Roaming / Chase', color: '#ff6f9e' },
    'Gift': { label: 'Gift', color: '#ffd23c' },
  };
  function methodMeta(m) {
    if (METHOD_META[m]) return METHOD_META[m];
    if (/^trade/i.test(m)) return { label: m, color: '#ff9e5c' };
    if (/coins?$/i.test(m)) return { label: 'Game Corner — ' + m, color: '#ffd23c' };
    return { label: m || 'Other', color: '#9a8d6f' };
  }

  // order methods sensibly within an area
  const METHOD_ORDER = ['Grass', 'Cave', 'Marsh', 'Deep Sand', 'Inside', 'Surfing', 'Fishing', 'Hidden Grotto', 'Only One', 'Gift', 'Chase'];
  function methodRank(m) {
    const i = METHOD_ORDER.indexOf(m);
    if (i >= 0) return i;
    if (/coins?$/i.test(m)) return 50;
    if (/^trade/i.test(m)) return 60;
    return 40;
  }

  function rarityLabel(r) {
    if (r == null) return '';
    const p = r * 100;
    if (p >= 30) return 'Common';
    if (p >= 15) return 'Uncommon';
    if (p >= 5) return 'Rare';
    return 'Very Rare';
  }
  function rarityColor(r) {
    if (r == null) return '#9a8d6f';
    const p = r * 100;
    if (p >= 30) return '#5fd17a';
    if (p >= 15) return '#ffd23c';
    if (p >= 5) return '#ff9e5c';
    return '#ff6f6f';
  }

  function EncRow({ e }) {
    const mon = e.d ? byDex[e.d] : null;
    const clickable = !!mon;
    return (
      <div onClick={() => clickable && go('detail', e.d)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 10,
          background: '#100c05', border: '1px solid #241d10', cursor: clickable ? 'pointer' : 'default',
        }}
        onMouseEnter={ev => { if (clickable) ev.currentTarget.style.borderColor = '#ffb34766'; }}
        onMouseLeave={ev => { ev.currentTarget.style.borderColor = '#241d10'; }}>
        <SpriteSlot dex={e.d} name={e.n} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 600, color: '#ece3d2' }}>{e.n}</div>
          <div style={{ display: 'flex', gap: 5, marginTop: 3 }}>{mon && mon.types.map(t => <TypePill key={t} t={t} sm />)}</div>
        </div>
        {e.l ? <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#ffb347', whiteSpace: 'nowrap' }}>Lv {e.l}</div> : null}
        {e.r != null ? (
          <div style={{ textAlign: 'right', minWidth: 72 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: rarityColor(e.r) }}>{Math.round(e.r * 100)}%</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: '#7a6c4a', textTransform: 'uppercase', letterSpacing: 0.5 }}>{rarityLabel(e.r)}</div>
          </div>
        ) : null}
      </div>
    );
  }

  function MethodBlock({ method, list }) {
    const meta = methodMeta(method);
    const sorted = [...list].sort((a, b) => (b.r || 0) - (a.r || 0));
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, letterSpacing: 1.5, color: meta.color, textTransform: 'uppercase' }}>{meta.label}</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#6a5d42' }}>{list.length}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sorted.map((e, i) => <EncRow key={e.n + i} e={e} />)}
        </div>
      </div>
    );
  }

  function GroupBlock({ g }) {
    // group encounters by method
    const byMethod = {};
    g.enc.forEach(e => { (byMethod[e.m] = byMethod[e.m] || []).push(e); });
    const methods = Object.keys(byMethod).sort((a, b) => methodRank(a) - methodRank(b));
    return (
      <div style={{ marginBottom: g.sub || g.note ? 20 : 0 }}>
        {g.sub && <div style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 18, color: '#ffd9a0', marginBottom: 12 }}>{g.sub}</div>}
        {g.note && <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontStyle: 'italic', color: '#9a8d6f', marginBottom: 12, padding: '8px 12px', borderLeft: '2px solid #ffb34755', background: '#0e0a04' }}>{g.note}</div>}
        {methods.map(m => <MethodBlock key={m} method={m} list={byMethod[m]} />)}
      </div>
    );
  }

  function AreaDetail({ area }) {
    const totalEnc = area.groups.reduce((s, g) => s + g.enc.length, 0);
    const uniqueSpecies = new Set();
    area.groups.forEach(g => g.enc.forEach(e => uniqueSpecies.add(e.n)));
    const trainers = area.trainers || [];
    return (
      <div>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1, color: '#ffb347', marginBottom: 6, textTransform: 'uppercase' }}>Location</div>
          <h2 style={{ margin: 0, fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 34, lineHeight: 1.05, color: '#fff', textShadow: '0 0 22px #ffb34744' }}>{area.name}</h2>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#8a7d63', marginTop: 8 }}>
            {totalEnc > 0 ? `${uniqueSpecies.size} species · ${totalEnc} encounter${totalEnc === 1 ? '' : 's'}` : ''}
            {totalEnc > 0 && trainers.length > 0 ? ' · ' : ''}
            {trainers.length > 0 ? `${trainers.length} trainer${trainers.length === 1 ? '' : 's'}` : ''}
          </div>
        </div>

        {area.groups.map((g, i) => <GroupBlock key={i} g={g} />)}

        {area.items && area.items.length > 0 && (
          <div style={{ marginTop: 8, paddingTop: 18, borderTop: '1px solid #1c1609' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffd23c', boxShadow: '0 0 8px #ffd23c' }} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, letterSpacing: 1.5, color: '#ffd23c', textTransform: 'uppercase' }}>Items Found Here</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {area.items.map((it, i) => (
                <div key={i} onClick={() => go('items')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 10, padding: '8px 12px', borderRadius: 9, background: '#100c05', border: '1px solid #241d10' }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: '#ffd9a0', whiteSpace: 'nowrap' }}>{it.name}</span>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: '#8a7d63' }}>{it.where}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {trainers.length > 0 && (
          <div style={{ marginTop: 8, paddingTop: 18, borderTop: '1px solid #1c1609' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff8f5c', boxShadow: '0 0 8px #ff8f5c' }} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, letterSpacing: 1.5, color: '#ff8f5c', textTransform: 'uppercase' }}>Trainers</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#6a5d42' }}>{trainers.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {trainers.map((t, i) => <TrainerCard key={i} t={t} />)}
            </div>
          </div>
        )}
      </div>
    );
  }

  function TrainerCard({ t }) {
    const [tier, setTier] = React.useState(0);
    const hasTiers = t.tiers.length > 1;
    const team = t.tiers[tier] ? t.tiers[tier].team : [];
    return (
      <div style={{ padding: 14, borderRadius: 14, background: 'radial-gradient(ellipse at 20% 0%, #1a1206, #0d0a05 78%)', border: '1px solid #2a1d0e' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 1, color: '#ff8f5c', textTransform: 'uppercase' }}>{t.label}</span>
            <div style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 19, color: '#fff' }}>{t.name}</div>
          </div>
          {hasTiers && (
            <div style={{ display: 'flex', gap: 5 }}>
              {t.tiers.map((tr, i) => (
                <button key={i} onClick={() => setTier(i)} style={{
                  cursor: 'pointer', padding: '4px 10px', borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 10,
                  background: i === tier ? '#ffb347' : '#0f0b04', color: i === tier ? '#1a1206' : '#9a8d6f',
                  border: `1px solid ${i === tier ? '#ffb347' : '#2a2110'}`, fontWeight: i === tier ? 700 : 400,
                }}>{tr.ver ? 'Tier ' + tr.ver : 'Base'}</button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
          {team.map((m, i) => <TrainerMon key={i} m={m} />)}
        </div>
      </div>
    );
  }

  function TrainerMon({ m }) {
    const mon = m.d ? byDex[m.d] : null;
    const spriteKey = m.d || m.s; // dex number or natNNN key
    const types = mon ? mon.types : (window.VSE_SPECIES_INFO && window.VSE_SPECIES_INFO[normUp(m.n)] ? window.VSE_SPECIES_INFO[normUp(m.n)].types : []);
    const clickable = !!mon;
    return (
      <div onClick={() => clickable && go('detail', m.d)} title={m.mv ? m.mv.map(mvName).join(', ') : ''}
        style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 9px', borderRadius: 10, background: '#100c05', border: '1px solid #241d10', cursor: clickable ? 'pointer' : 'default' }}>
        <SpriteSlot dex={spriteKey} name={m.n} size={38} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: '#ece3d2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.n}</span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#ffb347' }}>Lv{m.lv}</span>
          </div>
          {m.nick && <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10.5, color: '#9a8d6f', fontStyle: 'italic' }}>"{m.nick}"</div>}
          <div style={{ display: 'flex', gap: 4, marginTop: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {types.map(ty => <TypePill key={ty} t={ty} sm />)}
            {m.item && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8.5, color: '#ffd23c', border: '1px solid #ffd23c44', borderRadius: 4, padding: '1px 4px' }}>{itemName(m.item)}</span>}
          </div>
        </div>
      </div>
    );
  }

  function normUp(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function mvName(internal) {
    const mv = window.VGAME && window.VGAME.byMove ? window.VGAME.byMove(internal) : null;
    return mv ? mv.name : titleish(internal);
  }
  function itemName(internal) {
    const map = window.VSE_ITEM_ICON || {};
    // VSE_ITEMS has display names; try to find by internal-ish match
    const items = window.VSE_ITEMS || [];
    const norm = normUp(internal);
    const hit = items.find(it => normUp(it.name) === norm);
    return hit ? hit.name : titleish(internal);
  }
  function titleish(s) { return String(s || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

  window.VIEWS.Locations = function Locations() {
    const AREAS = window.VSE_LOCATIONS || [];
    const [sel, setSel] = React.useState(0);
    const [q, setQ] = React.useState('');

    const filtered = AREAS.map((a, i) => ({ a, i })).filter(({ a }) =>
      !q.trim() || a.name.toLowerCase().includes(q.trim().toLowerCase()) ||
      a.groups.some(g => g.enc.some(e => e.n.toLowerCase().includes(q.trim().toLowerCase())))
    );
    const area = AREAS[sel];

    return (
      <div>
        <PageHead kicker="WORLD MAP" title="Locations" sub="Every area in route order, with its wild encounters grouped by method — sprites, level ranges, and rarity — plus the items documented for each place." />

        <div className="v-loc-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
          {/* area list */}
          <div style={{ position: 'sticky', top: 16 }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search area or Pokémon…" spellCheck={false}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 9, background: '#0f0b04', border: '1px solid #2a2110', color: '#ece3d2', fontFamily: "'Outfit', sans-serif", fontSize: 13.5, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: '70vh', overflowY: 'auto' }}>
              {filtered.map(({ a, i }) => {
                const active = i === sel;
                const count = a.groups.reduce((s, g) => s + g.enc.length, 0);
                return (
                  <button key={i} onClick={() => setSel(i)} style={{
                    cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    padding: '9px 12px', borderRadius: 9, background: active ? 'linear-gradient(100deg, #2a1c08, #1a1206)' : '#0d0a05',
                    border: `1px solid ${active ? '#ffb347' : '#1c1609'}`,
                  }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? '#ffd9a0' : '#cbbd9f' }}>{a.name}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: active ? '#ffb347' : '#6a5d42' }}>{count}</span>
                  </button>
                );
              })}
              {filtered.length === 0 && <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#7a6c4a', padding: 12 }}>No areas match.</div>}
            </div>
          </div>

          {/* detail */}
          <div style={{ padding: 22, borderRadius: 16, background: 'radial-gradient(ellipse at 30% 0%, #14100a, #0a0805 75%)', border: '1px solid #241d10', minHeight: 300 }}>
            {area ? <AreaDetail area={area} /> : <div style={{ color: '#7a6c4a' }}>Select an area.</div>}
          </div>
        </div>

        <style>{`@media (max-width: 720px){ .v-loc-grid{ grid-template-columns: 1fr !important; } }`}</style>
      </div>
    );
  };
})();
