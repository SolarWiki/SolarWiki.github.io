/* Pokémon Solar Eclipse — Boss dex. window.VIEWS.Bosses
   Rivals, Gym Leaders, Team Sol admins/boss. Battles toggle Normal ↔ Enhanced (Hard). */
window.VIEWS = window.VIEWS || {};
(function () {
  const { TYPES, byDex } = window.VSEDEX;
  const { go, SpriteSlot, TypePill, MovePill, AbilityPill, ItemPill, PageHead, Empty } = window.VUI;
  const BOSSES = window.VSE_BOSSES;

  const CLASS_COLOR = { 'Rival': '#ff9e58', 'Gym Leader': '#ffd23c', 'Team Sol': '#e0556f' };
  const STAT_LABELS = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];

  // Story order for Gym Leaders (the order you fight them). Names not listed fall
  // to the end, alphabetically. Diana's post-game fight is a Rival, handled separately.
  const LEADER_ORDER = ['Hongxin & Huangxin', 'Amanda', 'Calix', 'Emilia', 'Benjamin', 'Patriama', 'Angeline', 'Leonard', 'Yira'];

  // Leaders whose single Lv-80 team is actually the POST-GAME rematch, not the
  // main-story team. (Xin and Benjamin already show their correct story teams.)
  const POSTGAME_LEADERS = { 'LEADER_Amanda': 1, 'LEADER_Angeline': 1, 'LEADER_Calix': 1, 'LEADER_Emilia': 1, 'LEADER_Leonard': 1, 'LEADER_Patriama': 1, 'LEADER_Yira': 1 };

  function evList(str) {
    if (!str) return [];
    const v = str.split(',').map(n => parseInt(n, 10));
    return STAT_LABELS.map((l, i) => ({ l, n: v[i] || 0 })).filter(x => x.n > 0);
  }

  // A single Pokémon card in a boss team
  function MonCard({ m }) {
    const entry = m.dex && byDex[m.dex];
    // Fallback species info (types/abilities) for boss Pokémon not in the regional dex.
    const info = !entry && window.VSE_SPECIES_INFO && window.VSE_SPECIES_INFO[m.sp.toUpperCase()];
    const types = entry ? entry.types : (info ? info.types : []);
    const accent = types.length ? TYPES[types[0]].glow : '#ffb347';
    const evs = evList(m.ev);
    let abilName = null;
    if (entry) abilName = (m.abil === 'H' ? entry.hidden : (entry.abilities[m.abil] || entry.abilities[0]));
    else if (info) abilName = (m.abil === 'H' ? info.hidden : (info.abilities[m.abil] || info.abilities[0] || info.hidden));
    const isHidden = m.abil === 'H' || (entry && abilName === entry.hidden) || (info && abilName === info.hidden);
    // Sprite key: regional dex if present, else national-sprite fallback by species name.
    const fallback = window.VSE_SPECIES_SPRITE && window.VSE_SPECIES_SPRITE[m.sp.toUpperCase()];
    const spriteKey = m.dex || fallback;
    return (
      <div style={{ background: '#0d0a04', border: `1px solid ${accent}33`, borderRadius: 12, padding: 12, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <button onClick={() => m.dex && go('#/pokemon/' + m.dex)} style={{ cursor: m.dex ? 'pointer' : 'default', background: 'none', border: 'none', padding: 0, flexShrink: 0 }}>
            <SpriteSlot dex={spriteKey} name={m.sp} size={64} accent={accent} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 }}>
              <span style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700, fontSize: 15, color: '#fff', textTransform: 'capitalize' }}>{m.nick || (entry ? entry.name : m.sp.toLowerCase())}</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#ffb347' }}>Lv {m.lv}</span>
            </div>
            {m.nick && <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#7a6c4a', textTransform: 'capitalize', marginTop: 1 }}>{entry ? entry.name : m.sp.toLowerCase()}</div>}
            {types.length > 0 && <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 5 }}>{types.map(t => <TypePill key={t} t={t} sm onClick={() => {}} />)}</div>}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 7 }}>
              {abilName && <AbilityPill name={abilName} hidden={isHidden} />}
              {m.item && <ItemPill name={m.item} />}
              {m.nat && <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11.5, color: '#9a8d6f' }}>{m.nat.charAt(0) + m.nat.slice(1).toLowerCase()}</span>}
            </div>
          </div>
        </div>
        {m.moves && m.moves.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 9 }}>
            {m.moves.map((mv, i) => <MovePill key={i} name={mv} />)}
          </div>
        )}
        {evs.length > 0 && (
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, color: '#7a6c4a', marginTop: 7 }}>
            EVs: {evs.map(e => `${e.n} ${e.l}`).join(' / ')}
          </div>
        )}
        {(() => {
          const st = entry ? entry.stats : (info && info.stats);
          if (!st) return null;
          const order = [['HP', st.HP], ['Atk', st.ATK], ['Def', st.DEF], ['SpA', st.SPA], ['SpD', st.SPD], ['Spe', st.SPE]];
          const bst = order.reduce((a, [, n]) => a + (n || 0), 0);
          const max = Math.max(...order.map(([, n]) => n || 0), 1);
          return (
            <div style={{ marginTop: 'auto', paddingTop: 9, borderTop: '1px solid #1c1609' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8.5, letterSpacing: 1, color: '#7a6c4a', textTransform: 'uppercase' }}>Base Stats</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#ffb347', fontWeight: 700 }}>BST {bst}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
                {order.map(([lbl, n]) => (
                  <div key={lbl} style={{ textAlign: 'center' }}>
                    <div style={{ height: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div title={String(n)} style={{ width: '70%', height: `${Math.max(6, ((n || 0) / max) * 28)}px`, background: `linear-gradient(180deg, ${accent}, ${accent}66)`, borderRadius: 2 }} />
                    </div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: '#8a7d63', marginTop: 2 }}>{lbl}</div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#cbbd9f', fontWeight: 700 }}>{n}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  function BossCard({ b }) {
    const [battleIdx, setBattleIdx] = React.useState(0);
    const [enhanced, setEnhanced] = React.useState(false);
    const col = CLASS_COLOR[b.class] || '#ffb347';
    const battle = b.battles[battleIdx];
    const hasEnhTeam = !!battle.enhanced;
    const hasEnhFx = !!(battle.enhFx && battle.enhFx.length);
    const hasEnh = hasEnhTeam || hasEnhFx; // enhanced exists if a different team OR an effect
    const team = (enhanced && hasEnhTeam) ? battle.enhanced : battle.normal;
    const fx = (enhanced && hasEnhFx) ? battle.enhFx : (battle.fx || []);
    const lv = (battle.normal || []).map(p => p.lv);

    React.useEffect(() => { if (!hasEnh) setEnhanced(false); }, [battleIdx, hasEnh]);

    return (
      <div style={{ background: 'linear-gradient(160deg, #14100a, #0a0805)', border: `1px solid ${col}33`, borderRadius: 16, padding: 20, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 72, height: 72, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src={'trainers/' + b.type + '.png'} alt={b.name}
                onError={(e) => { if (e.target.src.indexOf('trainers/') !== -1 && b.sprite) { e.target.src = b.sprite; } else { e.target.style.display = 'none'; } }}
                style={{ maxHeight: 70, maxWidth: 70, imageRendering: 'pixelated', objectFit: 'contain' }} />
            </div>
            <div>
              <span style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 800, fontSize: 24, color: '#fff' }}>{b.name}</span>
              <div><span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: col, background: col + '18', border: `1px solid ${col}44`, borderRadius: 7, padding: '3px 9px', textTransform: 'uppercase', display: 'inline-block', marginTop: 5 }}>{b.class}</span>
              {b._postgame && <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: '#ffb347', background: '#2a1c08', border: '1px solid #ffb34744', borderRadius: 7, padding: '3px 9px', textTransform: 'uppercase', display: 'inline-block', marginTop: 5, marginLeft: 6 }}>Post-Game team</span>}
              </div>
            </div>
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

        {/* battle selector (by location) */}
        {b.battles.length > 1 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {b.battles.map((bt, i) => {
              const blv = (bt.normal || []).map(p => p.lv);
              const on = i === battleIdx;
              return <button key={i} onClick={() => setBattleIdx(i)} style={{
                cursor: 'pointer', padding: '5px 11px', borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: 11.5,
                background: on ? '#2a1c08' : 'transparent', color: on ? '#ffb347' : '#9a8d6f', border: `1px solid ${on ? '#ffb34788' : '#241d10'}`, fontWeight: on ? 600 : 400,
              }}>{bt.loc} {blv.length ? <span style={{ opacity: 0.6, fontFamily: "'Space Mono', monospace" }}>Lv{Math.min(...blv)}–{Math.max(...blv)}</span> : null}</button>;
            })}
          </div>
        )}

        {/* battle effects */}
        {fx.length > 0 && (
          <div style={{ background: enhanced ? '#1f0f12' : '#0f0b04', border: `1px solid ${enhanced ? '#5e1f2a' : '#2a2110'}`, borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1, color: enhanced ? '#ff8f8f' : '#ffb347', textTransform: 'uppercase', marginBottom: 5 }}>
              {enhanced ? '★ Enhanced battle effects' : 'Battle effects'}
            </div>
            {fx.map((f, i) => <div key={i} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#d8cbb0', lineHeight: 1.5 }}>{f}</div>)}
          </div>
        )}
        {enhanced && hasEnhTeam && !hasEnhFx && (
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#ff8f8f', marginBottom: 12 }}>★ Enhanced: a harder version with an adjusted team.</div>
        )}

        {team && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {team.map((m, i) => <MonCard key={i} m={m} />)}
          </div>
        )}
      </div>
    );
  }

  window.VIEWS.Bosses = function Bosses() {
    const [cls, setCls] = React.useState(null);

    // Apply post-game relabel + story ordering once (cheap, derived from BOSSES).
    const prepared = React.useMemo(() => {
      const order = (b) => {
        if (b.class !== 'Gym Leader') return 999;
        const i = LEADER_ORDER.indexOf(b.name);
        return i === -1 ? 500 : i;
      };
      return BOSSES.map(b => {
        if (b.class === 'Gym Leader' && POSTGAME_LEADERS[b.type]) {
          // mark the (single, Lv80) battle as a post-game rematch
          const battles = b.battles.map(bt => /post.?game/i.test(bt.loc) ? bt : { ...bt, loc: bt.loc + ' (Post-Game rematch)' });
          return { ...b, battles, _postgame: true };
        }
        return b;
      }).slice().sort((a, b2) => {
        // keep class grouping order Rival -> Gym Leader -> Team Sol, leaders in story order
        const classRank = c => (c === 'Rival' ? 0 : c === 'Gym Leader' ? 1 : 2);
        const cr = classRank(a.class) - classRank(b2.class);
        if (cr !== 0) return cr;
        return order(a) - order(b2);
      });
    }, []);

    const list = cls ? prepared.filter(b => b.class === cls) : prepared;
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
