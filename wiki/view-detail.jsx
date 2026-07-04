/* Pokémon Solar Eclipse — full Pokémon detail page. window.VIEWS.Detail
   Mirrors Void's view-detail routing: reached via #/pokemon/<dex>. */
window.VIEWS = window.VIEWS || {};
(function () {
  const { DEX, TYPES, byDex } = window.VSEDEX;
  const { go, TypePill, AbilityPill, SpriteSlot, StatBars, PageHead, Empty } = window.VUI;
  const bstOf = s => Object.values(s).reduce((a, b) => a + b, 0);

  // ---- Stat + abilities block --------------------------------------------
  function StatBlock({ entry, vanilla, d, accent, vi }) {
    const [compare, setCompare] = React.useState(true);
    const showCmp = vanilla && compare;
    const eclipseBst = bstOf(entry.stats);
    const vanillaBst = vanilla ? Object.values(vanilla).reduce((a, b) => a + b, 0) : null;
    const bstDelta = vanillaBst != null ? eclipseBst - vanillaBst : 0;
    const anyChange = vanilla && ['HP','ATK','DEF','SPA','SPD','SPE'].some(k => entry.stats[k] !== vanilla[k]);
    return (
      <div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>{entry.types.map(t => <TypePill key={t} t={t} />)}</div>
        {vanilla && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => setCompare(c => !c)} style={{
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 8,
              background: showCmp ? '#2a1c08' : 'transparent', color: showCmp ? '#ffb347' : '#9a8d6f',
              border: `1px solid ${showCmp ? '#ffb34788' : '#2a2110'}`,
            }}>{showCmp ? '✓ ' : ''}Compare to vanilla</button>
            {showCmp && (
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#8a7d63' }}>
                {anyChange ? 'Δ vs official base stats' : 'No stat changes from vanilla'}
              </span>
            )}
          </div>
        )}
        <StatBars stats={entry.stats} vanilla={showCmp ? vanilla : null} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 10, borderTop: '1px solid #2a2110' }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, color: '#b8a489' }}>TOTAL</span>
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
            {showCmp && bstDelta !== 0 && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: bstDelta > 0 ? '#5fe08a' : '#ff6f6f' }}>{bstDelta > 0 ? '+' : ''}{bstDelta}</span>}
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, color: '#ffb347', fontWeight: 700 }}>{eclipseBst}</span>
          </span>
        </div>
        {d && <ShinyShowcase d={d} accent={accent} vi={vi} />}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, color: '#8a7d63', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Abilities</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entry.abilities.map(a => <AbilityDesc key={a} name={a} />)}
            {entry.hidden && <AbilityDesc name={entry.hidden} hidden />}
          </div>
        </div>
      </div>
    );
  }

  // ---- Ability with its description (from VSE_ABILITIES) ------------------
  const ABIL_INDEX = (() => {
    const m = {};
    (window.VSE_ABILITIES || []).forEach(a => { m[String(a.name).toLowerCase()] = a; });
    return m;
  })();
  function AbilityDesc({ name, hidden }) {
    const info = ABIL_INDEX[String(name).toLowerCase()];
    return (
      <div style={{ background: '#0c0a05', border: `1px solid ${hidden ? '#ffb34733' : '#241d10'}`, borderRadius: 10, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: info && info.desc ? 6 : 0 }}>
          <AbilityPill name={name} hidden={hidden} />
          {info && info.changed && <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8.5, fontWeight: 700, letterSpacing: 0.5, color: '#ffb347', background: '#2a1c08', border: '1px solid #ffb34755', borderRadius: 5, padding: '2px 6px', textTransform: 'uppercase' }}>Changed</span>}
        </div>
        {info && info.desc && <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: '#b3a892', lineHeight: 1.5 }}>{info.desc}</div>}
        {info && info.changed && info.old && <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11.5, color: '#8a7d63', marginTop: 5, lineHeight: 1.45 }}><span style={{ color: '#b5552f', fontWeight: 600 }}>Was: </span>{info.old}</div>}
      </div>
    );
  }

  // ---- Defensive type matchup chart --------------------------------------
  function TypeMatchup({ types }) {
    const G = window.VGAME;
    if (!G || !G.eff || !G.TYPE_ORDER) return null;
    const buckets = { '0': [], '0.25': [], '0.5': [], '2': [], '4': [] };
    G.TYPE_ORDER.forEach(atk => {
      let mult = 1;
      types.forEach(def => { mult *= G.eff(atk, def); });
      const key = String(mult);
      if (buckets[key]) buckets[key].push(atk);
    });
    const rows = [
      { label: 'Immune', mult: '0', color: '#6a6a6a', bg: '#141414' },
      { label: '¼× damage', mult: '0.25', color: '#5fd1a0', bg: '#0e1a12' },
      { label: '½× damage', mult: '0.5', color: '#8fd17e', bg: '#101a0e' },
      { label: '2× weak', mult: '2', color: '#ffb347', bg: '#1c1407' },
      { label: '4× weak', mult: '4', color: '#ff8f5c', bg: '#1d1008' },
    ].filter(r => buckets[r.mult].length);
    if (!rows.length) return null;
    const TypePill = window.VUI.TypePill;
    return (
      <div style={{ marginTop: 26 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, color: '#8a7d63', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Type Defenses</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map(r => (
            <div key={r.mult} style={{ display: 'flex', alignItems: 'center', gap: 12, background: r.bg, border: `1px solid ${r.color}33`, borderRadius: 10, padding: '8px 12px' }}>
              <span style={{ flex: '0 0 92px', fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: r.color, letterSpacing: 0.5 }}>{r.label}</span>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{buckets[r.mult].map(t => <TypePill key={t} t={t} />)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- Shiny / Super Shiny showcase --------------------------------------
  // Super shiny hue-shifts the SHINY sprite in 45° increments, per the game's
  // adjust_shiny logic: superHue = (1 + rand(7)) * 45  ->  45..360. The filter
  // is applied to the sprite image only, never its background.
  // HSV hue rotation, matching the game's adjust_shiny (which works in HSV,
  // not the constant-luma matrix that CSS hue-rotate / LCH-style rotation uses).
  // Renders the sprite to a canvas, shifts each pixel's H in HSV, redraws.
  function HsvSprite({ src, deg, size, accent }) {
    const canvasRef = React.useRef(null);
    const [failed, setFailed] = React.useState(false);
    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const w = img.naturalWidth, h = img.naturalHeight;
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = false;
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0);
          if (deg % 360 !== 0) {
            const data = ctx.getImageData(0, 0, w, h);
            const p = data.data;
            const shift = ((deg % 360) + 360) % 360;
            for (let i = 0; i < p.length; i += 4) {
              if (p[i + 3] === 0) continue; // skip transparent
              const r = p[i] / 255, g = p[i + 1] / 255, b = p[i + 2] / 255;
              const max = Math.max(r, g, b), min = Math.min(r, g, b), dl = max - min;
              let hh = 0;
              if (dl !== 0) {
                if (max === r) hh = ((g - b) / dl) % 6;
                else if (max === g) hh = (b - r) / dl + 2;
                else hh = (r - g) / dl + 4;
                hh *= 60; if (hh < 0) hh += 360;
              }
              const s = max === 0 ? 0 : dl / max, v = max;
              hh = (hh + shift) % 360;
              // HSV -> RGB
              const c = v * s, x = c * (1 - Math.abs(((hh / 60) % 2) - 1)), m = v - c;
              let rr = 0, gg = 0, bb = 0;
              if (hh < 60) { rr = c; gg = x; }
              else if (hh < 120) { rr = x; gg = c; }
              else if (hh < 180) { gg = c; bb = x; }
              else if (hh < 240) { gg = x; bb = c; }
              else if (hh < 300) { rr = x; bb = c; }
              else { rr = c; bb = x; }
              p[i] = Math.round((rr + m) * 255);
              p[i + 1] = Math.round((gg + m) * 255);
              p[i + 2] = Math.round((bb + m) * 255);
            }
            ctx.putImageData(data, 0, 0);
          }
          setFailed(false);
        } catch (e) { setFailed(true); } // CORS-tainted canvas etc.
      };
      img.onerror = () => setFailed(true);
      img.src = src;
    }, [src, deg]);
    // Frame matches SpriteSlot so all three cells look identical bar the pixels.
    return (
      <div style={{
        position: 'relative', width: size, height: size, borderRadius: 10, overflow: 'hidden', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 42%, #2a1c08 0%, #0a0905 74%)', border: `1px solid ${accent}33`,
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 44%, transparent 30%, #ffb34711 42%, transparent 52%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(1px 1px at 20% 30%, #fff7, transparent), radial-gradient(1px 1px at 70% 60%, #fff5, transparent), radial-gradient(1px 1px at 42% 80%, #fff6, transparent), radial-gradient(2px 2px at 62% 22%, #ffd98a88, transparent)' }} />
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: '8%', width: '84%', height: '84%', objectFit: 'contain', imageRendering: 'pixelated', display: failed ? 'none' : 'block', zIndex: 3 }} />
        {failed && <img src={src} alt="" style={{ position: 'absolute', inset: '8%', width: '84%', height: '84%', objectFit: 'contain', imageRendering: 'pixelated', zIndex: 3, filter: `hue-rotate(${deg}deg)` }} />}
      </div>
    );
  }

  function ShinyShowcase({ d, accent, vi }) {
    const HUE_STEPS = [45, 90, 135, 180, 225, 270, 315];
    const [step, setStep] = React.useState(0);
    const hue = HUE_STEPS[step];
    // Sprite suffixes: base variant (vi 0) -> "", "shiny"; form i -> "i", "i-shiny".
    const formPart = vi > 0 ? String(vi) + '-' : '';
    const normalSuffix = vi > 0 ? String(vi) : undefined;
    const shinySuffix = formPart + 'shiny';
    // Resolve the shiny sprite URL the same way SpriteSlot does, so HsvSprite
    // can rotate it on a canvas (HSV) rather than via CSS filter (LCH-ish).
    const shinyUrl = (window.VUI.spriteUrl ? window.VUI.spriteUrl(d.dex, shinySuffix) : null);
    const cell = (label, color, suffix, node) => (
      <div style={{ flex: 1, minWidth: 130, padding: 14, borderRadius: 12, background: '#0d0a04', border: `1px solid ${color}44`, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1, color, marginBottom: 10, textTransform: 'uppercase' }}>{label}</div>
        {node}
      </div>
    );
    const superNode = shinyUrl
      ? <HsvSprite src={shinyUrl} deg={hue} size={104} accent="#ff66cc" />
      : <SpriteSlot dex={d.dex} name={d.name} size={104} accent="#ff66cc" suffix={shinySuffix} imgFilter={`hue-rotate(${hue}deg)`} />;
    return (
      <div style={{ marginTop: 26 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, color: '#8a7d63', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Sprite Showcase</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {cell('Normal', accent, normalSuffix, <SpriteSlot dex={d.dex} name={d.name} size={104} accent={accent} suffix={normalSuffix} />)}
          {cell('Shiny', '#ffd700', shinySuffix, <SpriteSlot dex={d.dex} name={d.name} size={104} accent="#ffd700" suffix={shinySuffix} />)}
          {cell('Super Shiny', '#ff66cc', shinySuffix, (
            <React.Fragment>
              {superNode}
              <div style={{ marginTop: 12 }}>
                <input type="range" min={0} max={HUE_STEPS.length - 1} step={1} value={step}
                  onChange={e => setStep(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ff66cc', cursor: 'pointer' }} />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 6 }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#ff8fd6' }}>shiny hue +{hue}°</span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#6a5d42', marginTop: 10, lineHeight: 1.5 }}>
          Shiny is the real shiny sprite. Super shiny rotates the shiny's hue in 45° steps (the game's <code>superHue = (1 + rand(7)) × 45</code>), applied in HSV to match the in-engine palette shift.
        </div>
      </div>
    );
  }

  // ---- Where to find (reverse-indexed from VSE_LOCATIONS) ----------------
  const ENCOUNTER_INDEX = (() => {
    const idx = {};
    (window.VSE_LOCATIONS || []).forEach(area => {
      (area.groups || []).forEach(g => {
        (g.enc || []).forEach(e => {
          const dex = String(e.d).padStart(3, '0');
          (idx[dex] = idx[dex] || []).push({
            area: area.name, sub: g.sub || null, method: e.m, level: e.l, rarity: e.r,
          });
        });
      });
    });
    return idx;
  })();
  function WhereToFind({ dex }) {
    const spots = ENCOUNTER_INDEX[String(dex).padStart(3, '0')];
    if (!spots || !spots.length) return null;
    const pct = r => (typeof r === 'number' ? Math.round(r * 100) + '%' : null);
    return (
      <div style={{ marginTop: 26 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, color: '#8a7d63', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Where to Find</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {spots.map((s, i) => (
            <button key={i} onClick={() => go('#/locations')} style={{ cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: '#0c0a05', border: '1px solid #241d10', borderRadius: 10, padding: '9px 12px' }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: '#ece3d2' }}>{s.area}{s.sub ? ` · ${s.sub}` : ''}</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#ffb347', background: '#1c1407', border: '1px solid #ffb34733', borderRadius: 5, padding: '2px 7px' }}>{s.method}</span>
              {s.level && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#9a8d6f' }}>Lv {s.level}</span>}
              {pct(s.rarity) && <span style={{ marginLeft: 'auto', fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#8a7d63' }}>{pct(s.rarity)}</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---- Evolution family (branching tree) ---------------------------------
  function EvoFamily({ d }) {
    const baseKey = window.VSE_FAMILY_OF && window.VSE_FAMILY_OF[d.dex];
    const fam = baseKey && window.VSE_FAMILIES && window.VSE_FAMILIES[baseKey];
    if (!fam || fam.length < 2) return null; // no evolution

    const byD = {}; fam.forEach(s => { byD[s.dex] = s; });
    const hasBranch = fam.some(s => s.from);

    const Node = ({ s, showArrow }) => (
      <button onClick={() => s.dex !== d.dex && go('#/pokemon/' + s.dex)} style={{
        cursor: s.dex === d.dex ? 'default' : 'pointer', background: s.dex === d.dex ? '#1a1407' : 'transparent',
        border: `1px solid ${s.dex === d.dex ? '#ffb34766' : '#241d10'}`, borderRadius: 12, padding: 8, textAlign: 'center', flexShrink: 0,
      }}>
        <SpriteSlot dex={s.dex} name={s.name} size={72} accent={s.dex === d.dex ? '#ffb347' : '#5a5240'} />
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: s.dex === d.dex ? 700 : 500, color: s.dex === d.dex ? '#fff' : '#b3a892', marginTop: 4 }}>{s.name}</div>
      </button>
    );
    const Arrow = ({ method }) => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 6px', minWidth: 70 }}>
        <span style={{ color: '#ffb347', fontSize: 18, lineHeight: 1 }}>→</span>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: '#9a8d6f', textAlign: 'center', marginTop: 2 }}>{(method || '').replace(/^at /, '')}</span>
      </div>
    );

    let body;
    if (!hasBranch) {
      // simple linear chain (unchanged behaviour for ordinary lines)
      body = (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
          {fam.map((s, i) => (
            <React.Fragment key={s.dex}>
              {i > 0 && <Arrow method={s.method} />}
              <Node s={s} />
            </React.Fragment>
          ))}
        </div>
      );
    } else {
      // branching: build children map from `from`.
      const children = {};
      fam.forEach(s => { if (s.from) (children[s.from] = children[s.from] || []).push(s); });
      const root = fam.find(s => !s.from) || fam[0];

      // A "hub" is a single parent that fans out to many children (Eevee = 8,
      // Cosmoem = 2 but preceded by a chain). Use a radial wheel when one node
      // has >= 4 direct children; otherwise fall back to the vertical tree.
      const hubDex = Object.keys(children).find(k => (children[k] || []).length >= 4);

      if (hubDex) {
        body = <RadialEvo fam={fam} children={children} hubDex={hubDex} root={root} curDex={d.dex} />;
      } else {
        const renderFrom = (node) => {
          const kids = children[node.dex] || [];
          if (!kids.length) return null;
          if (kids.length === 1) {
            const k = kids[0];
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Arrow method={k.method} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Node s={k} />
                  {renderFrom(k)}
                </div>
              </div>
            );
          }
          return (
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', color: '#4a3a14' }}>
                <div style={{ width: 14, borderTop: '2px solid #3a2f10' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '2px solid #3a2f10', paddingLeft: 8 }}>
                {kids.map(k => (
                  <div key={k.dex} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Arrow method={k.method} />
                    <Node s={k} />
                    {renderFrom(k)}
                  </div>
                ))}
              </div>
            </div>
          );
        };
        body = (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            <Node s={root} />
            {renderFrom(root)}
          </div>
        );
      }
    }

    // Eevee's family gets the "Eeveelutions" header; others say "Evolution Family".
    const isEevee = baseKey === '134';
    return (
      <div style={{ marginTop: 26 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, color: '#8a7d63', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>{isEevee ? 'Eeveelutions' : 'Evolution Family'}</div>
        {body}
      </div>
    );
  }

  // ---- Radial evolution wheel (hub fans out to many children) -------------
  // Used for big splits like Eevee. Any chain leading INTO the hub (e.g.
  // Cosmog -> Cosmoem -> {Solgaleo, Lunala}) is drawn as a short pre-chain to
  // the left of the wheel, then the hub sits centered with children on a ring.
  function RadialEvo({ fam, children, hubDex, root, curDex }) {
    const byD = {}; fam.forEach(s => { byD[s.dex] = s; });
    const kids = children[hubDex] || [];

    // Build the pre-chain from root down to the hub (root, ..., hub).
    const preChain = [];
    let walk = byD[hubDex];
    const guard = new Set();
    while (walk && !guard.has(walk.dex)) { guard.add(walk.dex); preChain.unshift(walk); walk = walk.from ? byD[walk.from] : null; }
    // preChain ends with the hub; the nodes before it are the lead-in.
    const lead = preChain.slice(0, -1); // everything before the hub

    // Wheel geometry. Radius scales a touch with child count so labels breathe.
    const n = kids.length;
    const R = n >= 8 ? 150 : n >= 6 ? 138 : 124;
    const NODE = 96;            // node box footprint (sprite 72 + label + padding)
    const size = (R + NODE) * 2; // svg/canvas square side
    const cx = size / 2, cy = size / 2;

    // Angles: start at the right (0°) and sweep clockwise, but nudge so the
    // first child sits at top-right for a balanced look.
    const start = -Math.PI / 2 + (n % 2 === 0 ? Math.PI / n : 0);
    const pts = kids.map((k, i) => {
      const a = start + (i * 2 * Math.PI) / n;
      return { k, a, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
    });

    const NodeMini = ({ s, hub }) => (
      <button onClick={() => s.dex !== curDex && go('#/pokemon/' + s.dex)} style={{
        cursor: s.dex === curDex ? 'default' : 'pointer',
        background: s.dex === curDex ? '#1a1407' : (hub ? '#120d05' : 'transparent'),
        border: `1px solid ${s.dex === curDex ? '#ffb34788' : (hub ? '#ffb34744' : '#241d10')}`,
        borderRadius: 12, padding: 7, textAlign: 'center', width: NODE, boxSizing: 'border-box',
      }}>
        <SpriteSlot dex={s.dex} name={s.name} size={64} accent={s.dex === curDex ? '#ffb347' : (hub ? '#c47a1e' : '#5a5240')} />
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: s.dex === curDex ? 700 : 500, color: s.dex === curDex ? '#fff' : '#b3a892', marginTop: 3, lineHeight: 1.15 }}>{s.name}</div>
      </button>
    );

    const wheel = (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {/* spokes */}
        <svg width={size} height={size} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {pts.map(({ k, x, y }) => (
            <line key={k.dex} x1={cx} y1={cy} x2={x} y2={y} stroke="#3a2f10" strokeWidth="1.5" />
          ))}
        </svg>
        {/* method labels at the spoke midpoints */}
        {pts.map(({ k, a }) => {
          const mx = cx + (R * 0.52) * Math.cos(a);
          const my = cy + (R * 0.52) * Math.sin(a);
          return (
            <div key={'lbl' + k.dex} style={{
              position: 'absolute', left: mx, top: my, transform: 'translate(-50%, -50%)',
              fontFamily: "'Outfit', sans-serif", fontSize: 9.5, color: '#9a8d6f', textAlign: 'center',
              background: '#0a0805', padding: '1px 5px', borderRadius: 5, whiteSpace: 'nowrap', pointerEvents: 'none',
            }}>{(k.method || '').replace(/^at /, '').replace(/^use /, '')}</div>
          );
        })}
        {/* hub (center) */}
        <div style={{ position: 'absolute', left: cx, top: cy, transform: 'translate(-50%, -50%)' }}>
          <NodeMini s={byD[hubDex]} hub />
        </div>
        {/* children on the ring */}
        {pts.map(({ k, x, y }) => (
          <div key={k.dex} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)' }}>
            <NodeMini s={k} />
          </div>
        ))}
      </div>
    );

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        {lead.map((s, i) => (
          <React.Fragment key={s.dex}>
            <button onClick={() => s.dex !== curDex && go('#/pokemon/' + s.dex)} style={{
              cursor: s.dex === curDex ? 'default' : 'pointer', background: s.dex === curDex ? '#1a1407' : 'transparent',
              border: `1px solid ${s.dex === curDex ? '#ffb34766' : '#241d10'}`, borderRadius: 12, padding: 8, textAlign: 'center', flexShrink: 0,
            }}>
              <SpriteSlot dex={s.dex} name={s.name} size={72} accent={s.dex === curDex ? '#ffb347' : '#5a5240'} />
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: s.dex === curDex ? 700 : 500, color: s.dex === curDex ? '#fff' : '#b3a892', marginTop: 4 }}>{s.name}</div>
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 6px', minWidth: 64 }}>
              <span style={{ color: '#ffb347', fontSize: 18, lineHeight: 1 }}>→</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: '#9a8d6f', textAlign: 'center', marginTop: 2 }}>{(byD[hubDex].method || '').replace(/^at /, '')}</span>
            </div>
          </React.Fragment>
        ))}
        {wheel}
      </div>
    );
  }

  // ---- Learnset (level-up / egg / TM moves) ------------------------------
  // Category badge colors (Physical / Special / Status)
  const CAT_STYLE = {
    Physical: { bg: '#c0392b', label: 'PHY' },
    Special: { bg: '#3b6fb5', label: 'SPC' },
    Status: { bg: '#6b6b6b', label: 'STA' },
  };
  function CatBadge({ cls }) {
    const c = CAT_STYLE[cls] || CAT_STYLE.Status;
    return (
      <span title={cls} style={{
        fontFamily: "'Space Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: '#fff',
        background: c.bg, borderRadius: 4, padding: '2px 5px', flexShrink: 0, width: 30, textAlign: 'center', display: 'inline-block',
      }}>{c.label}</span>
    );
  }
  function MoveRow({ mv, lvl, showLevel }) {
    const TypePill = window.VUI.TypePill;
    const TYPES = window.VUI.TYPES;
    const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const info = (window.VSE_MOVES || []).find(m => norm(m.name) === norm(mv));
    const name = info ? info.name : mv.toLowerCase().replace(/_/g, ' ');
    const type = info ? info.type : null;
    const cls = info ? info.cls : 'Status';
    const pow = (info && typeof info.pow === 'number' && info.pow > 0) ? info.pow : null;
    const acc = (info && typeof info.acc === 'number' && info.acc > 0) ? info.acc : null;
    const pp = (info && typeof info.pp === 'number' && info.pp > 0) ? info.pp : null;
    const [hov, setHov] = React.useState(false);
    const cols = (showLevel ? '46px ' : '') + '1fr 44px 48px 40px 76px 38px';
    return (
      <button onClick={() => go('#/moves/' + encodeURIComponent(info ? info.name : mv))}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          cursor: 'pointer', display: 'grid', gridTemplateColumns: cols, alignItems: 'center', columnGap: 10, width: '100%', textAlign: 'left',
          padding: '7px 12px', borderRadius: 9, background: hov ? '#1b1408' : '#100c05',
          border: `1px solid ${hov ? '#5a4318' : '#241d10'}`,
        }}>
        {showLevel && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#ffb347', textAlign: 'right' }}>{lvl === 0 || lvl === 1 ? '—' : 'Lv' + lvl}</span>}
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: hov ? '#fff' : '#e6dcc6', textTransform: 'capitalize', minWidth: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#9a8d6f', textAlign: 'center' }}>{pow !== null ? pow : '–'}</span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#9a8d6f', textAlign: 'center' }}>{acc !== null ? acc : '–'}</span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#9a8d6f', textAlign: 'center' }}>{pp !== null ? pp : '–'}</span>
        <span style={{ display: 'flex', justifyContent: 'center' }}>{type && <TypePill t={type} sm onClick={() => {}} />}</span>
        <span style={{ display: 'flex', justifyContent: 'center' }}><CatBadge cls={cls} /></span>
      </button>
    );
  }
  function MoveHeader({ showLevel }) {
    const cols = (showLevel ? '46px ' : '') + '1fr 44px 48px 40px 76px 38px';
    const cell = { fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 1, color: '#6f6450', textTransform: 'uppercase' };
    return (
      <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', columnGap: 10, padding: '0 12px 2px', width: '100%', boxSizing: 'border-box', border: '1px solid transparent', borderBottom: 'none' }}>
        {showLevel && <span style={{ ...cell, textAlign: 'right' }}>Lv</span>}
        <span style={cell}>Move</span>
        <span style={{ ...cell, textAlign: 'center' }}>Pwr</span>
        <span style={{ ...cell, textAlign: 'center' }}>Acc</span>
        <span style={{ ...cell, textAlign: 'center' }}>PP</span>
        <span style={{ ...cell, textAlign: 'center' }}>Type</span>
        <span style={{ ...cell, textAlign: 'center' }}>Cat</span>
      </div>
    );
  }
  function Learnset({ d }) {
    const [tab, setTab] = React.useState('level');
    const ls = window.VSE_LEARN && window.VSE_LEARN[d.dex];
    if (!ls) return null;

    const tabs = [
      ['level', 'Level-up', ls.level.length],
      ['egg', 'Egg', ls.egg.length],
      ['tm', 'TM', ls.tms.length],
      ['tutor', 'Tutor', ls.tutor.length],
    ].filter(t => t[2] > 0);
    if (!tabs.length) return null;
    React.useEffect(() => { if (!tabs.find(t => t[0] === tab)) setTab(tabs[0][0]); }, [d.dex]);

    // stable min-height across tabs (each row ~38px) so switching doesn't jolt the layout
    const rowH = 38;
    const counts = { level: ls.level.length, egg: ls.egg.length, tm: ls.tms.length, tutor: ls.tutor.length };
    const minH = Math.max(...Object.values(counts)) * rowH;

    const showLevel = tab === 'level';
    const rows = tab === 'level'
      ? ls.level.map(([lv, mv], i) => <MoveRow key={i} mv={mv} lvl={lv} showLevel />)
      : (tab === 'egg' ? ls.egg : tab === 'tm' ? ls.tms : ls.tutor).map((mv, i) => <MoveRow key={i} mv={mv} />);

    return (
      <div style={{ marginTop: 26 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, color: '#8a7d63', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Learnable Moves</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {tabs.map(([id, label, n]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              cursor: 'pointer', padding: '6px 13px', borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: tab === id ? 600 : 500,
              background: tab === id ? '#2a1c08' : 'transparent', color: tab === id ? '#ffb347' : '#9a8d6f', border: `1px solid ${tab === id ? '#ffb34788' : '#241d10'}`,
            }}>{label} <span style={{ opacity: 0.6, fontFamily: "'Space Mono', monospace" }}>{n}</span></button>
          ))}
        </div>
        <MoveHeader showLevel={showLevel} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minHeight: minH, marginTop: 4 }}>
          {rows}
        </div>
      </div>
    );
  }

  // ---- Full detail page --------------------------------------------------
  window.VIEWS.Detail = function Detail({ param }) {
    const d = byDex[param];
    const [vi, setVi] = React.useState(0);
    React.useEffect(() => { setVi(0); }, [param]);

    if (!d) return <Empty label={`No Pokémon found for #${param}.`} />;

    const accent = TYPES[d.types[0]].glow;
    const variants = [{ label: 'Base', name: d.name, types: d.types, abilities: d.abilities, hidden: d.hidden, stats: d.stats }, ...(d.forms || [])];
    const cur = variants[vi];

    // prev / next dex navigation
    const idx = DEX.findIndex(x => x.dex === d.dex);
    const prev = idx > 0 ? DEX[idx - 1] : DEX[DEX.length - 1];
    const next = idx < DEX.length - 1 ? DEX[idx + 1] : DEX[0];

    return (
      <div>
        {/* breadcrumb + prev/next */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <button onClick={() => go('#/pokedex')} style={{ cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: '#b3a892', background: 'transparent', border: '1px solid #2a2110', borderRadius: 8, padding: '7px 14px' }}>← Pokédex</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => go('#/pokemon/' + prev.dex)} style={{ cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#9a8d6f', background: 'transparent', border: '1px solid #2a2110', borderRadius: 8, padding: '7px 12px' }}>← No.{prev.dex}</button>
            <button onClick={() => go('#/pokemon/' + next.dex)} style={{ cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#9a8d6f', background: 'transparent', border: '1px solid #2a2110', borderRadius: 8, padding: '7px 12px' }}>No.{next.dex} →</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32, alignItems: 'start' }} className="se-detail-grid">
          {/* left: hero sprite + name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, position: 'sticky', top: 20 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 2, color: '#7a6c4a' }}>No.{d.dex}</div>
            <SpriteSlot dex={d.dex} name={cur.name} size={240} accent={accent} suffix={vi > 0 ? String(vi) : undefined} label="HERO SPRITE" />
            <div style={{ fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif", fontWeight: 800, fontSize: 38, color: '#fff', textAlign: 'center', lineHeight: 1, textShadow: `0 0 24px ${accent}44` }}>{cur.name}</div>
          </div>

          {/* right: forms + stats + showcase */}
          <div style={{ background: 'linear-gradient(160deg, #14100a, #0a0805)', border: `1px solid ${accent}33`, borderRadius: 16, padding: 26 }}>
            {variants.length > 1 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                {variants.map((v, i) => (
                  <button key={i} onClick={() => setVi(i)} style={{
                    cursor: 'pointer', padding: '6px 13px', borderRadius: 8, fontSize: 12, fontFamily: "'Outfit', sans-serif",
                    background: vi === i ? '#2a1c08' : 'transparent', color: vi === i ? '#ffb347' : '#9a8d6f',
                    border: `1px solid ${vi === i ? '#ffb34788' : '#2a2110'}`, fontWeight: vi === i ? 600 : 400,
                  }}>{i === 0 ? 'Base' : (v.label || `Form ${i}`)}</button>
                ))}
              </div>
            )}
            <StatBlock entry={cur} vanilla={vi === 0 ? (window.VSE_VANILLA && window.VSE_VANILLA[d.dex]) : null} d={d} accent={accent} vi={vi} />
            <TypeMatchup types={cur.types} />
            {vi === 0 && <WhereToFind dex={d.dex} />}
            {vi === 0 && <EvoFamily d={d} />}
            {vi === 0 && <Learnset d={d} />}
          </div>
        </div>
      </div>
    );
  };
})();
