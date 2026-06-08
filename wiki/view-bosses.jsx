/* Pokémon Solar Eclipse — Boss dex. window.VIEWS.Bosses
   Rivals, Gym Leaders, Team Sol admins/boss. Battles toggle Normal ↔ Enhanced (Hard). */
window.VIEWS = window.VIEWS || {};
(function () {
  const { TYPES, byDex } = window.VSEDEX;
  const { go, SpriteSlot, PageHead, Empty } = window.VUI;
  const BOSSES = window.VSE_BOSSES;

  const CLASS_COLOR = { 'Rival': '#ff9e58', 'Gym Leader': '#6fa8ff', 'Team Sol': '#c45fff' };
  const STAT_LABELS = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];

  function evList(str) {
    if (!str) return [];
    const v = str.split(',').map(n => parseInt(n, 10));
    return STAT_LABELS.map((l, i) => ({ l, n: v[i] || 0 })).filter(x => x.n > 0);
  }

  // A single Pokémon card in a boss team
  function MonCard({ m }) {
    const entry = m.dex && byDex[m.dex];
    const accent = entry ? TYPES[entry.types[0]].glow : '#ffb347';
    const evs = evList(m.ev);
    const abilName = entry ? (m.abil === 'H' ? entry.hidden : (entry.abilities[m.abil] || entry.abilities[0])) : null;
    return (
      <div style={{ background: '#0d0a04', border: `1px solid ${accent}33`, borderRadius: 12, padding: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <button onClick={() => m.dex && go('#/pokemon/' + m.dex)} style={{ cursor: m.dex ? 'pointer' : 'default', background: 'none', border: 'none', padding: 0, flexShrink: 0 }}>
            <SpriteSlot dex={m.dex} name={m.sp} size={64} accent={accent} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 }}>
              <span style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 15, color: '#fff', textTransform: 'capitalize' }}>{entry ? entry.name : m.sp.toLowerCase()}</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#ffb347' }}>Lv {m.lv}</span>
            </div>
            {entry && <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>{entry.types.map(t => <span key={t} style={{ width: 7, height: 7, borderRadius: '50%', background: TYPES[t].glow }} title={TYPES[t].name} />)}</div>}
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11.5, color: '#b3a892', marginTop: 5, lineHeight: 1.5 }}>
              {abilName && <span>{abilName}</span>}
              {m.item && <span> · <span style={{ color: '#cbb88f' }}>{m.item.replace(/([A-Z])/g, ' $1').trim()}</span></span>}
              {m.nat && <span> · {m.nat.charAt(0) + m.nat.slice(1).toLowerCase()}</span>}
            </div>
          </div>
        </div>
        {m.moves && m.moves.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 9 }}>
            {m.moves.map((mv, i) => <span key={i} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#d8cbb0', background: '#1a1407', border: '1px solid #2c2413', borderRadius: 6, padding: '2px 7px', textTransform: 'capitalize' }}>{mv.toLowerCase().replace(/_/g, ' ')}</span>)}
          </div>
        )}
        {evs.length > 0 && (
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, color: '#7a6c4a', marginTop: 7 }}>
            EVs: {evs.map(e => `${e.n} ${e.l}`).join(' / ')}
          </div>
        )}
      </div>
    );
  }

  function BossCard({ b }) {
    const [battleIdx, setBattleIdx] = React.useState(0);
    const [enhanced, setEnhanced] = React.useState(false);
    const col = CLASS_COLOR[b.class] || '#ffb347';
    const battle = b.battles[battleIdx];
    const hasEnh = !!battle.enhanced;
    const team = (enhanced && hasEnh) ? battle.enhanced : battle.normal;

    React.useEffect(() => { if (!hasEnh) setEnhanced(false); }, [battleIdx, hasEnh]);

    return (
      <div style={{ background: 'linear-gradient(160deg, #14100a, #0a0805)', border: `1px solid ${col}33`, borderRadius: 16, padding: 20, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 800, fontSize: 24, color: '#fff' }}>{b.name}</span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: col, background: col + '18', border: `1px solid ${col}44`, borderRadius: 7, padding: '3px 9px', textTransform: 'uppercase' }}>{b.class}</span>
          </div>
          {hasEnh && (
            <div style={{ display: 'flex', gap: 0, borderRadius: 9, overflow: 'hidden', border: '1px solid #2a2110' }}>
              {['Normal', 'Enhanced'].map((lbl, i) => {
                const on = (i === 1) === enhanced;
                return <button key={lbl} onClick={() => setEnhanced(i === 1)} style={{
                  cursor: 'pointer', padding: '6px 14px', fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: on ? 700 : 500,
                  background: on ? (i === 1 ? '#5e1f2a' : '#2a1c08') : 'transparent', color: on ? (i === 1 ? '#ff8f8f' : '#ffb347') : '#9a8d6f', border: 'none',
                }}>{lbl}</button>;
              })}
            </div>
          )}
        </div>

        {/* battle selector */}
        {b.battles.length > 1 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {b.battles.map((bt, i) => {
              const lv = bt.normal.map(p => p.lv);
              const on = i === battleIdx;
              const label = (bt.sub && bt.sub !== 'None') ? bt.sub.replace(/\s*\(Hard\)/i, '') : `Lv ${Math.min(...lv)}`;
              return <button key={i} onClick={() => setBattleIdx(i)} style={{
                cursor: 'pointer', padding: '5px 11px', borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: 11.5,
                background: on ? '#2a1c08' : 'transparent', color: on ? '#ffb347' : '#9a8d6f', border: `1px solid ${on ? '#ffb34788' : '#241d10'}`, fontWeight: on ? 600 : 400,
              }}>{label} <span style={{ opacity: 0.6, fontFamily: "'Space Mono', monospace" }}>Lv{Math.min(...lv)}–{Math.max(...lv)}</span></button>;
            })}
          </div>
        )}

        {enhanced && hasEnh && (
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#ff8f8f', marginBottom: 12 }}>★ Enhanced: a harder version with buffs, effects, or an adjusted team.</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {team.map((m, i) => <MonCard key={i} m={m} />)}
        </div>
      </div>
    );
  }

  window.VIEWS.Bosses = function Bosses() {
    const [cls, setCls] = React.useState(null);
    const list = cls ? BOSSES.filter(b => b.class === cls) : BOSSES;
    const classes = ['Rival', 'Gym Leader', 'Team Sol'];
    return (
      <div>
        <PageHead kicker="BOSS DEX" title="Bosses"
          sub="Rivals, Gym Leaders, and Team Sol's admins and boss. Pick a battle to see the team; toggle Enhanced for the harder version where one exists." />
        <div style={{ display: 'flex', gap: 7, marginBottom: 22, flexWrap: 'wrap' }}>
          {classes.map(c => {
            const on = cls === c; const col = CLASS_COLOR[c];
            return <button key={c} onClick={() => setCls(on ? null : c)} style={{
              cursor: 'pointer', padding: '7px 15px', borderRadius: 9, fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: on ? 600 : 500,
              color: on ? '#0d0b08' : col, background: on ? col : col + '14', border: `1px solid ${on ? col : col + '55'}`,
            }}>{c}s</button>;
          })}
          {cls && <button onClick={() => setCls(null)} style={{ cursor: 'pointer', padding: '7px 15px', borderRadius: 9, fontSize: 12, color: '#ff8f6f', background: 'transparent', border: '1px solid #5e3020', fontFamily: "'Outfit', sans-serif" }}>clear ×</button>}
        </div>
        {list.length === 0 ? <Empty label="No bosses." /> : list.map(b => <BossCard key={b.type + b.name} b={b} />)}
      </div>
    );
  };
})();
