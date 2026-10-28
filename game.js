(function () {
  'use strict';
  const C = window.BranchCore, Q = window.QuestData;
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => reduce ? 40 : ms;
  const A = 'assets/gear/';
  const PLACES = ['grass', 'castles', 'forest', 'fall', 'desert'];
  const HEROES = { femaleAdventurer: 'Ava', maleAdventurer: 'Max' };
  const REAL = ['Training data', 'Underfitting', 'Missing features', 'Noisy labels', 'Imbalanced data'];
  const G = { screen: 'title', hero: 'femaleAdventurer', level: 0, unlocked: 1, stars: [], teacher: location.hash === '#teacher', notes: [], revealed: false, checks: 0, scouts: 0, depth: 1, project: null, tree: null, taught: false, selected: 'r', growing: false, battle: null, story: 0, lost: false, timer: null };
  if (G.teacher) G.unlocked = 5;
  const level = () => Q.LEVELS[G.level];
  let toastTimer;
  function toast(text) { $('toast').textContent = text; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 3200); }
  function say(text) { $('live').textContent = text; }
  const heroImg = pose => `${A}heroes/${G.hero}-${pose}.png`;
  const foeImg = v => `${A}villains/${v.kind}${v.values.horns ? '-horns' : ''}.png`;
  function gear(id, small) {
    const g = Q.GEAR[id];
    return `<span class="gear"><i style="background:${g.color}"><img src="${A}icons/${g.img}.${g.img === 'hammer' ? 'svg' : 'png'}" alt=""></i>${small ? '' : escape(g.label)}</span>`;
  }
  function qtext(featureId, threshold) {
    const f = Q.CLUES[featureId];
    return f.type === 'boolean' ? `${f.icon} ${f.question}` : `${f.icon} ${f.name} more than ${Math.round(threshold * 10) / 10}?`;
  }
  function chips(v) {
    const L = level(); const yn = b => b ? 'Yes' : 'No';
    return `<div class="chips">${L.clues.map(id => {
      const c = Q.CLUES[id];
      if (id === L.hidden && !G.revealed) return `<span class="chip mystery" title="Nobody wrote this clue down">❓ ???</span>`;
      return `<span class="chip">${c.icon} ${escape(c.name)}: ${c.type === 'boolean' ? yn(v.values[id]) : v.values[id]}</span>`;
    }).join('')}</div>`;
  }
  /* ---------- tree drawing ---------- */
  function wrap(text, max = 19) {
    const lines = ['']; for (const w of text.split(' ')) { if ((lines[lines.length - 1] + ' ' + w).trim().length > max) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim(); }
    return lines.slice(0, 3);
  }
  function treeSvg(tree, project, opts = {}) {
    const path = opts.path || [];
    const nodes = C.walk(tree), leaves = nodes.filter(n => !n.split);
    const depth = Math.max(...nodes.map(n => n.depth));
    const NW = 176, NH = 78, ROW = 132;
    const width = Math.max(420, leaves.length * (NW + 16) + 20), height = (depth + 1) * ROW + 10;
    const pos = new Map(); let li = 0;
    (function locate(n) { const x = n.split ? (locate(n.no) + locate(n.yes)) / 2 : 10 + (li++ + .5) * ((width - 20) / leaves.length); pos.set(n.id, { x, y: 8 + n.depth * ROW }); return x; })(tree);
    const edges = nodes.filter(n => n.split).map(n => ['no', 'yes'].map(b => {
      const p = pos.get(n.id), c = pos.get(n[b].id), on = path.includes(n[b].id) && path.includes(n.id);
      return `<path class="tree-edge ${on ? 'on' : ''}" d="M${p.x},${p.y + NH} C${p.x},${p.y + NH + 30} ${c.x},${c.y - 30} ${c.x},${c.y}"/><text x="${(p.x + c.x) / 2 + (b === 'no' ? -14 : 14)}" y="${(p.y + NH + c.y) / 2 + 4}" text-anchor="middle" font-weight="900" font-size="15" fill="${b === 'no' ? '#a3412a' : '#2f6b22'}">${b === 'no' ? 'No' : 'Yes'}</text>`;
    }).join('')).join('');
    const cards = nodes.map(n => {
      const p = pos.get(n.id), x = p.x - NW / 2, on = path.includes(n.id);
      const rows = C.nodeRows(project, n); const mixed = C.gini(rows, project.labels) > 1e-10;
      if (n.split) {
        const lines = wrap(qtext(n.split.featureId, n.split.threshold));
        return `<g class="tree-node ${on ? 'on' : ''}"><rect x="${x}" y="${p.y}" width="${NW}" height="${NH}" rx="12" fill="#fff8dc"/>${lines.map((l, i) => `<text x="${p.x}" y="${p.y + NH / 2 + 5 + (i - (lines.length - 1) / 2) * 18}" text-anchor="middle">${escape(l)}</text>`).join('')}</g>`;
      }
      const pickable = opts.pick && mixed && n.depth < opts.maxDepth;
      if (pickable) return `<g class="tree-node pick ${opts.selected === n.id ? 'sel' : ''}" data-node="${n.id}" role="button" tabindex="0" aria-label="Mixed group of ${rows.length} notes. Choose a question here."><rect x="${x}" y="${p.y}" width="${NW}" height="${NH}" rx="12" fill="#f6e6c8"/><text x="${p.x}" y="${p.y + 30}" text-anchor="middle">🤔 Mixed group</text><text x="${p.x}" y="${p.y + 52}" text-anchor="middle" font-size="12">${rows.length} notes · pick a question</text></g>`;
      const g = Q.GEAR[Q.gearId(n.prediction)];
      return `<g class="tree-node ${on ? 'on' : ''}"><rect x="${x}" y="${p.y}" width="${NW}" height="${NH}" rx="12" fill="${g.color}22"/><circle cx="${x + 30}" cy="${p.y + NH / 2}" r="20" fill="${g.color}"/><image href="${A}icons/${g.img}.${g.img === 'hammer' ? 'svg' : 'png'}" x="${x + 16}" y="${p.y + NH / 2 - 14}" width="28" height="28"/><text x="${x + 58}" y="${p.y + NH / 2 - 2}">${escape(g.label)}</text><text x="${x + 58}" y="${p.y + NH / 2 + 17}" font-size="12" font-weight="600">${rows.length} notes${mixed ? ' · mixed' : ''}</text></g>`;
    }).join('');
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="The Wise Tree with ${nodes.filter(n => n.split).length} questions">${edges}${cards}</svg>`;
  }
  /* ---------- level flow ---------- */
  function rebuild(keepTree) {
    G.project = Q.project(G.level, G.notes, G.revealed);
    if (!keepTree) { G.tree = level().manual ? C.newTree(G.project) : null; G.taught = false; G.selected = 'r'; }
  }
  function startLevel(i) {
    clearTimeout(G.timer);
    G.level = i; const L = level();
    G.notes = Q.notes(i); G.revealed = false; G.checks = L.checks || 0; G.scouts = L.scouts || 0; G.depth = L.depth[2]; G.lost = false; G.battle = null;
    rebuild(); G.story = 0; G.screen = 'story'; render();
  }
  function teach() {
    if (G.growing) return;
    G.tree = C.newTree(G.project); G.growing = true; G.taught = false; render();
    const grow = () => {
      if (C.growStep(G.tree, G.project, G.depth)) { render(); G.timer = setTimeout(grow, wait(450)); }
      else { G.growing = false; G.taught = true; render(); const s = C.accuracy(G.tree, G.project.rows, G.project); say(`The tree learned. It gets ${s.correct} of ${s.total} notes right.`); }
    };
    G.timer = setTimeout(grow, wait(300));
  }
  function ready() { return level().manual ? !!G.tree.split : G.taught; }
  function startBattle() {
    clearTimeout(G.timer);
    G.battle = { foes: Q.battle(G.level, (Math.random() * 1e9) | 0), i: 0, hearts: 3, step: 0, phase: 'ask', results: [], pred: null };
    G.screen = 'battle'; runFoe();
  }
  function runFoe() {
    const b = G.battle, foe = b.foes[b.i];
    b.pred = C.predict(G.tree, { values: foe.values }, G.project); b.step = 0; b.phase = 'ask'; render();
    say(`${foe.boss ? 'Boss! ' : ''}${foe.name} appears.`);
    const tick = () => {
      if (b.step < b.pred.decisions.length) { b.step++; render(); G.timer = setTimeout(tick, wait(900)); return; }
      b.phase = 'strike'; render();
      G.timer = setTimeout(() => {
        const ok = Q.gearId(b.pred.label) === foe.gear;
        b.results.push(ok); if (!ok) b.hearts = Math.max(0, b.hearts - (foe.boss ? 3 : 1));
        b.phase = 'done'; b.over = b.hearts === 0 || b.i === b.foes.length - 1; render();
        say(ok ? `Hit! ${foe.name} is defeated.` : `Miss! ${foe.name} needed the ${Q.gearLabel(foe.gear)}.`);
      }, wait(800));
    };
    G.timer = setTimeout(tick, wait(900));
  }
  function nextFoe() { const b = G.battle; if (b.over) return finish(); b.i++; runFoe(); }
  function finish() {
    const b = G.battle; const won = b.hearts > 0 && b.results.length === b.foes.length && b.results[b.results.length - 1];
    G.screen = 'result'; b.won = won;
    if (won) { G.stars[G.level] = Math.max(G.stars[G.level] || 0, b.hearts); G.unlocked = Math.max(G.unlocked, G.level + 2); } else G.lost = true;
    render();
  }
  /* ---------- screens ---------- */
  function heartsHtml() {
    if (G.screen !== 'battle') return '';
    return [0, 1, 2].map(i => `<img src="${A}icons/${i < G.battle.hearts ? 'suit_hearts' : 'suit_hearts_broken'}.png" class="${i < G.battle.hearts ? 'heart-on' : 'heart-off'}" alt="">`).join('') + `<span class="sr-only">${G.battle.hearts} hearts left</span>`;
  }
  function title() {
    return `<div class="scene"><div class="title-card"><h1>TREE QUEST: GEAR UP</h1><p class="tag">Teach the Wise Tree to pick the right weapon. Then battle the villains!</p>
      <div class="panel"><h2>1. Choose your hero</h2><div class="heroes">${Object.entries(HEROES).map(([id, name]) => `<button class="hero-pick" data-hero="${id}" aria-pressed="${G.hero === id}"><img src="${A}heroes/${id}-idle.png" alt="">${name}</button>`).join('')}</div>
      <h2>2. Pick a level</h2><div class="map">${Q.LEVELS.map((L, i) => `<button class="stone" data-level="${i}" ${i < G.unlocked ? '' : 'disabled'}><div class="num">${i < G.unlocked ? L.place : '🔒'}</div>${i + 1}. ${escape(L.title)}<div class="stars">${'★'.repeat(G.stars[i] || 0)}</div></button>`).join('')}</div></div></div></div>`;
  }
  function story() {
    const L = level(), last = G.story >= L.story.length - 1;
    return `<div class="scene story"><img class="tree-guy" src="${A}icons/wise-tree.png" alt="The Wise Tree"><div class="bubble"><div class="who">The Wise Tree · Level ${G.level + 1}</div><p>${escape(L.story[G.story])}</p><div class="actions">${last ? `<button class="btn go big" data-action="camp" data-primary>Go to camp ⛺</button>` : `<button class="btn go" data-action="story-next" data-primary>Next ▶</button>`}</div></div><img class="hero" src="${heroImg('idle')}" alt=""></div>`;
  }
  function camp() {
    const L = level(), s = G.tree ? C.accuracy(G.tree, G.project.rows, G.project) : null;
    const notes = G.notes.map((n, i) => `<div class="note ${n.fresh ? 'fresh' : ''} ${n.checked ? 'fixed' : ''}">${G.checks > 0 && !n.checked ? `<button class="btn check" data-check="${i}" aria-label="Check note about ${escape(n.name)}" title="Check this note">🔎</button>` : ''}<div class="pic"><img src="${foeImg(n)}" alt=""></div><div class="nm">${escape(n.name)}</div>${chips(n)}<div class="needs">${gear(n.gear)}</div>${n.checked ? `<div style="text-align:center;font-weight:800;color:#2f6b22">${n.checked}</div>` : ''}</div>`).join('');
    const treeArea = !G.tree ? `<div class="tree-empty"><img src="${A}icons/wise-tree.png" alt=""><p><b>The Wise Tree is ready to learn.</b><br>Choose how many questions, then press Teach.</p></div>`
      : `<div class="tree-box">${treeSvg(G.tree, G.project, { pick: L.manual, selected: G.selected, maxDepth: L.depth[1] })}</div><div class="score"><span>📜 Notes it gets right: ${s.correct} / ${s.total}</span></div>`;
    let controls;
    if (L.manual) {
      const node = C.findNode(G.tree, G.selected);
      const open = node && !node.split && node.depth < L.depth[1] && C.gini(C.nodeRows(G.project, node), G.project.labels) > 1e-10;
      const seen = new Set(); const list = open ? C.candidates(C.nodeRows(G.project, node), G.project.features, G.project.labels).filter(c => !seen.has(c.featureId) && seen.add(c.featureId)) : [];
      const total = open ? node.rowIds.length : 0;
      controls = `<div class="panel controls"><h2>❓ Pick a question</h2>${open ? `<p>Which question splits the notes best? Each one shows how many notes it sorts right.</p><div class="qlist">${list.map(c => { const right = total - c.remaining; return `<button class="qbtn" data-split="${c.featureId}" data-threshold="${c.threshold ?? ''}"><b>${escape(qtext(c.featureId, c.threshold))}</b><div class="meter"><b style="width:${right / total * 100}%"></b></div><small>Sorts ${right} of ${total} notes right</small></button>`; }).join('')}</div>` : `<p class="tip">🌳 Your tree has its question! ${s.correct === s.total ? 'It sorts every note right.' : 'Hmm, some notes are in the wrong group.'}</p><button class="btn" data-action="reset-tree">↺ Pick again</button>`}
        ${G.lost ? `<p class="tip">💡 ${escape(L.hint)}</p>` : ''}<button class="btn go big" data-action="battle" ${ready() ? 'data-primary' : 'disabled'}>⚔️ To battle!</button></div>`;
    } else {
      const tools = [];
      if (L.hidden) tools.push(G.revealed ? `<div class="tool">🔍 <b>Magic Glass used.</b> The shadow clue is now in the notes!</div>` : `<div class="tool"><b>🔍 Magic Glass</b><span>Find a clue the scouts forgot.</span><button class="btn gold" data-action="glass">Use the Magic Glass</button></div>`);
      if (L.checks) tools.push(`<div class="tool"><b>🔎 Check Pip’s notes</b><span>${G.checks} checks left. Tap 🔎 on a note to see if Pip was right.</span></div>`);
      if (L.scouts) tools.push(`<div class="tool"><b>🧭 Send scouts</b><span>Find more villains to learn from.</span><button class="btn gold" data-action="scout" ${G.scouts ? '' : 'disabled'}>Send scouts (${G.scouts} left)</button></div>`);
      controls = `<div class="panel controls"><h2>🌱 Teach the tree</h2><label class="depth" for="depth">Questions in a row<input id="depth" type="range" min="1" max="${L.depth[1]}" value="${G.depth}"><output>${G.depth}</output></label>
        <button class="btn go" data-action="teach" ${G.growing ? 'disabled' : ''} ${!G.taught && !G.growing ? 'data-primary' : ''}>🌱 Teach the tree</button>${tools.join('')}
        ${G.lost ? `<p class="tip">💡 ${escape(L.hint)}</p>` : `<button class="btn small" data-action="hint">💡 Hint</button>`}
        <button class="btn go big" data-action="battle" ${ready() && !G.growing ? 'data-primary' : 'disabled'}>⚔️ To battle!</button></div>`;
    }
    return `<div class="scene camp"><section class="panel notes" aria-label="Scout notes"><h2><img src="${A}icons/notepad_write.png" alt="" style="width:24px;background:#5d7a3b;border-radius:5px;padding:2px"> Scout notes <small style="font-weight:600">(${G.notes.length} villains)</small></h2><p style="font-size:13px;margin-bottom:8px">Past battles: each villain and the weapon that beat it.</p><div class="note-grid">${notes}</div></section>
      <section class="panel" aria-label="The Wise Tree"><h2>🌳 The Wise Tree <small style="font-weight:600;font-size:13px">${L.manual ? 'Help it choose a question' : 'It learns from the notes'}</small></h2>${treeArea}<p style="margin-top:8px;display:flex;gap:10px;flex-wrap:wrap;font-size:13px">Weapons: ${L.gears.map(g => gear(g)).join(' ')}</p></section>${controls}</div>`;
  }
  function battle() {
    const b = G.battle, foe = b.foes[b.i], pred = b.pred, pick = Q.gearId(pred.label), ok = b.phase === 'done' && b.results[b.i];
    const asked = pred.decisions.slice(0, b.step).map((d, k) => { const n = C.findNode(G.tree, pred.path[k]).split; return `<li>${escape(qtext(n.featureId, n.threshold))} <b>${d.answer}</b></li>`; }).join('');
    const path = pred.path.slice(0, b.step + 1);
    let line = `<p class="say">${foe.boss ? '👑 BOSS! ' : ''}${escape(foe.name)} appears!<small>The Wise Tree is thinking…</small></p>`;
    if (b.phase === 'strike') line = `<p class="say">The Wise Tree says: use the ${escape(pred.label)}!</p>`;
    if (b.phase === 'done') line = ok ? `<p class="say">💥 Hit! ${escape(foe.name)} is beaten!<small>The ${escape(pred.label)} was the right choice.</small></p>` : `<p class="say">😵 Miss! ${escape(foe.name)} was too strong.<small>It needed the ${escape(Q.gearLabel(foe.gear))}, not the ${escape(pred.label)}.</small></p>`;
    const primary = b.phase === 'done' ? `<button class="btn go big" data-action="${b.over ? 'finish' : 'next-foe'}" data-primary>${b.over ? 'See how you did ▶' : 'Next villain ▶'}</button>` : '';
    return `<div class="scene"><div class="arena"><img class="hero ${b.phase !== 'ask' && (ok || b.phase === 'strike') ? 'attack' : ''}" src="${heroImg(b.phase === 'done' ? (ok ? 'cheer0' : 'hurt') : b.phase === 'strike' ? 'attack1' : 'idle')}" alt="Your hero">
        ${b.phase === 'strike' ? `<div class="flying-gear go">${gear(pick, true)}</div>` : ''}
        ${b.phase === 'done' ? `<div class="boom">${ok ? '💥 POW!' : '💢 MISS!'}</div>` : ''}
        <div class="foe ${foe.boss ? 'boss' : ''} ${foe.values.flies ? 'flies' : ''} ${b.phase === 'done' ? (ok ? 'beaten' : 'angry') : ''}">${foe.boss ? `<img class="crown" src="${A}icons/crown_a.png" alt="Boss">` : ''}<img class="body" src="${foeImg(foe)}" alt="${escape(foe.name)}"><div class="nameplate">${escape(foe.name)}${chips(foe)}</div></div></div>
      <div class="battle-low"><div class="panel"><div class="lineup" aria-label="Villains">${b.foes.map((f, i) => `<span class="${i === b.i ? 'now' : ''} ${b.results[i] === true ? 'win' : b.results[i] === false ? 'lose' : ''}">${b.results[i] === true ? '✓' : b.results[i] === false ? '✗' : f.boss ? '👑' : i + 1}</span>`).join('')}</div>${line}<ol style="margin:4px 0 8px;padding-left:22px">${asked}</ol>${primary}</div>
      <div class="panel tree-box" aria-label="The tree follows the questions">${treeSvg(G.tree, G.project, { path })}</div></div></div>`;
  }
  function result() {
    const b = G.battle, L = level(), last = G.level === Q.LEVELS.length - 1;
    if (!b.won) return `<div class="scene"><div class="panel result"><img class="hero" src="${heroImg('hurt')}" alt=""><div class="big">Retreat!</div><p>The Wise Tree picked the wrong weapon ${b.results.filter(r => !r).length} time${b.results.filter(r => !r).length === 1 ? '' : 's'}.</p><p class="tip" style="margin:12px 0">💡 ${escape(L.hint)}</p><button class="btn go big" data-action="camp" data-primary>⛺ Back to camp</button> <button class="btn" data-action="battle">⚔️ Try again</button></div></div>`;
    const stars = G.battle.hearts;
    if (last) return finale(stars);
    return `<div class="scene"><div class="panel result"><img class="hero" src="${heroImg('cheer0')}" alt=""><div class="big">Victory!</div><div class="stars" aria-label="${stars} stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <div class="lesson"><h3><img src="${A}icons/book_open.png" alt="">What you learned: ${escape(L.lesson[0])}<span class="real">${REAL[G.level]}</span></h3><p>${escape(L.lesson[1])}</p></div>
      <button class="btn go big" data-action="next-level" data-primary>Next level ▶</button> <button class="btn" data-action="home">🗺️ Map</button></div></div>`;
  }
  function finale(stars) {
    return `<div class="scene"><div class="panel result" style="max-width:980px"><img class="hero" src="${heroImg('cheer0')}" alt=""><img src="${A}icons/award.png" alt="" style="width:110px;background:var(--gold);border-radius:50%;padding:14px"><div class="big">The Shadow King is beaten!</div><div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <p style="font-size:18px;margin:8px 0 14px">You taught a computer to make choices from examples. That is called <b>machine learning</b>. Here is what you discovered:</p>
      <div class="finale-list">${Q.LEVELS.map((L, i) => `<div class="lesson"><h3>${L.place} ${escape(L.lesson[0])}</h3><p style="font-size:14px">${escape(L.lesson[1])}</p><span class="real">${REAL[i]}</span></div>`).join('')}</div>
      <button class="btn go big" data-action="home" data-primary>🗺️ Back to the map</button></div></div>`;
  }
  function render() {
    const screens = { title, story, camp, battle, result };
    const app = $('app');
    app.innerHTML = screens[G.screen]();
    const place = G.screen === 'title' ? 'grass' : PLACES[G.level];
    app.style.backgroundImage = `${G.level === 3 && G.screen !== 'title' ? 'linear-gradient(#1b2a5588,#1b2a5555),' : ''}url(${A}places/${place}.jpg)`;
    $('where').textContent = G.screen === 'title' ? '' : `Level ${G.level + 1}: ${level().title}`;
    $('hearts').innerHTML = heartsHtml();
    const primary = app.querySelector('[data-primary]:not(:disabled)');
    if (primary && document.activeElement?.closest?.('#app') == null) primary.focus({ preventScroll: true });
  }
  /* ---------- events ---------- */
  const go = screen => { clearTimeout(G.timer); G.growing = false; G.screen = screen; render(); $('app').focus({ preventScroll: true }); };
  const actions = {
    home: () => go('title'), 'story-next': () => { G.story++; render(); }, camp: () => go('camp'), battle: () => { if (ready()) startBattle(); },
    'next-foe': nextFoe, finish, 'next-level': () => startLevel(G.level + 1), teach, 'reset-tree': () => { rebuild(); render(); },
    hint: () => toast('💡 ' + level().hint),
    glass: () => { G.revealed = true; rebuild(); render(); toast('🔍 You found the shadow clue! Teach the tree again.'); },
    scout: () => { if (!G.scouts) return; const round = (level().scouts - G.scouts) + 1; G.scouts--; G.notes.forEach(n => { n.fresh = false; }); G.notes.push(...Q.scoutNotes(G.level, round)); rebuild(); render(); toast('🧭 The scouts found 3 more villains! Teach the tree again.'); },
    help: () => dialog(`<h2>How to play</h2><ol><li><b>Read the scout notes.</b> Each note shows a villain, its clues, and the weapon that beat it.</li><li><b>Teach the Wise Tree.</b> It turns the notes into questions, like “Can it fly?”.</li><li><b>Battle!</b> New villains arrive. The tree asks its questions and picks a weapon for you.</li><li>Right weapon = 💥 hit. Wrong weapon = you lose a ❤️. Beat the boss to win.</li></ol><p>The tree only knows what is in the notes. If it gets things wrong, think about <i>why</i>, then go back to camp.</p>`),
    close: () => $('dialog').close()
  };
  function dialog(html) { $('dialog-body').innerHTML = html; $('dialog').showModal(); }
  document.addEventListener('click', event => {
    const t = event.target.closest('button, [data-node]'); if (!t) return;
    if (t.dataset.action && actions[t.dataset.action]) return actions[t.dataset.action]();
    if (t.dataset.hero) { G.hero = t.dataset.hero; render(); return; }
    if (t.dataset.level) return startLevel(+t.dataset.level);
    if (t.dataset.node) { G.selected = t.dataset.node; render(); return; }
    if (t.dataset.split) {
      const f = G.project.features.find(x => x.id === t.dataset.split);
      try { C.applySplit(G.tree, G.selected, f, t.dataset.threshold === '' ? null : +t.dataset.threshold, G.project); } catch (e) { toast(e.message); }
      const open = C.walk(G.tree).find(n => !n.split && n.depth < level().depth[1] && C.gini(C.nodeRows(G.project, n), G.project.labels) > 1e-10);
      G.selected = open ? open.id : null; render(); return;
    }
    if (t.dataset.check) {
      const n = G.notes[+t.dataset.check]; if (!G.checks || n.checked) return; G.checks--;
      if (n.gear !== n.real) { n.gear = n.real; n.checked = '✓ Fixed!'; rebuild(); toast(`😴 Pip was wrong! ${n.name} needs the ${Q.gearLabel(n.real)}. Teach the tree again.`); }
      else { n.checked = '✓ Correct'; toast('This note was right.'); }
      render();
    }
  });
  document.addEventListener('keydown', event => { const n = event.target.closest?.('[data-node]'); if (n && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); G.selected = n.dataset.node; render(); } });
  document.addEventListener('input', event => { if (event.target.id === 'depth') { G.depth = +event.target.value; event.target.nextElementSibling.textContent = G.depth; if (G.taught) { G.tree = null; G.taught = false; render(); $('depth').focus(); } } });
  if (G.teacher) setTimeout(() => dialog(`<h2>📖 Teacher notes</h2><p>All levels are unlocked. Each level teaches one idea, which is named after a win.</p><table><tr><th>Level</th><th>Idea</th><th>How to win</th></tr>${Q.LEVELS.map((L, i) => `<tr><td>${i + 1}. ${escape(L.title)}</td><td>${REAL[i]}</td><td>${escape(L.hint)}</td></tr>`).join('')}</table><p style="margin-top:10px"><b>The hidden rule:</b> shadow → Sun Shield; heat over 60 → Ice Sword; can fly → Sky Bow; otherwise → Rock Hammer. Horns and armour never matter. The tree never sees this rule, only the notes.</p>`), 300);
  console.log('%c🌳 You found the secret! The real rule is in quest-data.js, in truth(). The Wise Tree never sees it. It only sees the notes, which is why we test it on villains it has never met.', 'font-size:14px;color:#2f6b22');
  render();
})();
