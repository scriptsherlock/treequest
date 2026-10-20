(function () {
  'use strict';
  const C = window.BranchCore;
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const uid = prefix => prefix + '-' + (globalThis.crypto?.randomUUID?.() || Date.now() + '-' + Math.random().toString(36).slice(2));
  const state = { project: C.starter(), tree: null, mode: 'build', selected: 'r', featureId: 'heals', threshold: null, filter: 'all', history: [], trace: null, tested: Object.create(null), challenge: null, maxDepth: 3, zoom: 1, origin: 'Your tree' };
  state.tree = C.newTree(state.project);
  let draft = null;
  let toastTimer;
  const colors = () => state.project.labels.map((label, i) => ({ label, color: C.PALETTE[i] }));
  const colorFor = label => C.PALETTE[state.project.labels.indexOf(label)] || '#9aab8d';
  const classDot = label => `<span class="class-dot" style="--class-color:${colorFor(label)}"></span>`;
  function announce(message) {
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4200);
  }
  function remember() {
    state.history.push({ tree: C.copy(state.tree), selected: state.selected, origin: state.origin });
    if (state.history.length > 40) state.history.shift();
  }
  function clearResults() { state.trace = null; state.tested = Object.create(null); state.challenge = null; }
  function selectedNode() { return C.findNode(state.tree, state.selected) || state.tree; }
  function chooseBest(node = selectedNode()) {
    const best = C.candidates(C.nodeRows(state.project, node), state.project.features, state.project.labels)[0];
    state.featureId = best?.featureId || state.project.features[0]?.id || null;
    state.threshold = best?.threshold ?? null;
  }
  function replaceProject(project, tree = null) {
    state.project = project; state.tree = tree || C.newTree(project); state.selected = 'r';
    state.mode = 'build'; state.filter = 'all'; state.history = []; state.zoom = 1; state.origin = tree ? 'Saved tree' : 'Your tree';
    clearResults(); chooseBest(); render();
  }
  function glyph(label, hidden = false, name = '') {
    const itemIcons = { 'Pulse blade': '🗡️', 'Spark bow': '🏹', 'Sonic hammer': '🔨', 'Arc wand': '🪄', 'Frost spear': '🔱', 'Guard ring': '💍', 'Iron cloak': '🧥', 'Repair kit': '🧰', 'Life crystal': '💎', 'Healing mist': '✨', 'Energy flask': '🧪', 'Revive charm': '💚' };
    const icon = hidden ? '❔' : itemIcons[name] || ['⚔️', '🛡️', '💚', '💎', '🧪', '🔮'][state.project.labels.indexOf(label)] || '📦';
    return `<span class="pixel-glyph" aria-hidden="true">${icon}</span>`;
  }
  function formatValue(value, feature) { return feature.type === 'boolean' ? value ? 'Yes' : 'No' : value + (feature.unit ? ' ' + feature.unit : ''); }
  function featureReadout(row) {
    return `<dl class="feature-readout">${state.project.features.map(f => `<div class="feature-value"><dt>${escape(f.name)}</dt><dd>${escape(formatValue(row.values[f.id], f))}</dd></div>`).join('')}</dl>`;
  }
  function render() {
    const focused = document.activeElement;
    const focusKey = ['action', 'node', 'row', 'feature'].find(key => focused?.dataset?.[key]);
    const focusValue = focusKey ? focused.dataset[focusKey] : null;
    $('project-name').textContent = state.project.name;
    document.querySelectorAll('[data-mode]').forEach(button => {
      const active = button.dataset.mode === state.mode;
      button.setAttribute('aria-selected', active); button.tabIndex = active ? 0 : -1;
    });
    $('lab-panel').setAttribute('aria-labelledby', 'tab-' + state.mode);
    const guidance = {
      build: '<strong>Choose a question.</strong> Watch the loot split into Yes and No groups.',
      test: '<strong>Try a new item.</strong> Follow the questions to see where it lands.',
      challenge: '<strong>Can you trick your tree?</strong> Make an unusual item and give it the correct category.'
    };
    $('stage-guidance').innerHTML = `<span class="guidance-number">${{ build: 1, test: 2, challenge: 3 }[state.mode]}</span><span>${guidance[state.mode]}</span>`;
    renderData(); renderTree(); renderInspector();
    document.querySelector('[data-action=undo]').disabled = !state.history.length;
    if (focusKey && !document.contains(focused)) {
      const replacement = [...document.querySelectorAll('[data-' + focusKey + ']')].find(element => element.dataset[focusKey] === focusValue && !element.disabled);
      if (replacement) replacement.focus({ preventScroll: true });
      else if (focusKey === 'action' && ['split', 'auto-step', 'auto-all'].includes(focusValue)) document.querySelector(`[data-node="${state.selected}"]`)?.focus({ preventScroll: true });
      else if (focusKey === 'action' && ['go-test', 'next-test', 'start-trace', 'trace-next', 'replay-trace'].includes(focusValue)) $('inspector').querySelector('.button.primary')?.focus({ preventScroll: true });
    }
  }
  function renderData() {
    const isTest = state.mode === 'test';
    const rows = state.project.rows.filter(row => row.set === (isTest ? 'test' : 'train'));
    $('data-heading').textContent = isTest ? 'Unseen examples' : 'Training examples';
    $('data-count').textContent = rows.length;
    $('data-caption').textContent = isTest ? 'These examples were not used to build the tree.' : 'The supplied labels are what your tree learns to predict.';
    $('data-filter').innerHTML = isTest ? '' : `<button class="filter-chip ${state.filter === 'all' ? 'active' : ''}" data-filter="all">All</button>${colors().map(({ label }) => `<button class="filter-chip ${state.filter === label ? 'active' : ''}" data-filter="${escape(label)}">${classDot(label)}${escape(label)}</button>`).join('')}`;
    const filtered = rows.filter(row => isTest || state.filter === 'all' || row.label === state.filter);
    $('data-list').innerHTML = filtered.length ? filtered.map(row => {
      const tested = state.tested[row.id];
      const hidden = isTest && !tested;
      const color = hidden ? '#8a9880' : colorFor(row.label);
      const meta = hidden ? 'Label hidden · click to test' : isTest ? `Predicted: ${tested.label}` : row.label;
      return `<button class="item-card ${state.trace?.row.id === row.id ? 'selected' : ''}" data-row="${escape(row.id)}" aria-label="${escape(row.name)}${hidden ? ', label hidden' : ', ' + escape(meta)}"><span class="item-glyph" style="background:${color}18;color:${color}">${glyph(row.label, hidden, row.name)}</span><span><span class="item-name">${escape(row.name)}</span><span class="item-meta">${!hidden && !isTest ? classDot(row.label) : ''}${escape(meta)}</span></span>${tested ? `<span class="item-indicator" style="color:${tested.label === row.label ? '#528c70' : '#b37955'}" aria-label="${tested.label === row.label ? 'Correct' : 'Incorrect'}">${tested.label === row.label ? '✓' : '×'}</span>` : ''}</button>`;
    }).join('') : '<div class="empty-data">No examples here yet.<br>Add some in the data editor.</div>';
    if (isTest) {
      const completed = rows.filter(row => state.tested[row.id]);
      const correct = completed.filter(row => state.tested[row.id].label === row.label).length;
      $('data-footer').innerHTML = `<strong>${completed.length ? correct + ' of ' + completed.length + ' tested examples correct' : 'Labels stay hidden until you finish the prediction.'}</strong><br>${completed.length ? 'Test results describe this small set, not guaranteed accuracy.' : 'Click any item to inspect its features.'}<br><button class="text-button" data-action="test-all" ${!rows.length || !C.trainingRows(state.project).length ? 'disabled' : ''}>Test all ${rows.length} examples →</button>`;
    } else {
      $('data-footer').innerHTML = state.trace ? `<strong>${escape(state.trace.row.name)}</strong><br>${state.project.features.map(f => `${escape(f.name)}: ${escape(formatValue(state.trace.row.values[f.id], f))}`).join(' · ')}<br><button class="text-button" data-action="clear-trace">Clear highlighted path ×</button>` : `<strong>Different colours = different labels.</strong><br>${state.mode === 'challenge' ? 'Training data stays separate from your challenges.' : 'Click an item to see its path through your tree.'}<br><button class="button accent" data-action="add-example">➕ Add an example</button>`;
    }
  }
  function renderTree() {
    const nodes = C.walk(state.tree);
    const leaves = nodes.filter(node => !node.split);
    const depth = Math.max(...nodes.map(node => node.depth));
    const width = Math.max(470, leaves.length * 195 + 35);
    const height = Math.max(340, (depth + 1) * 148 + 75);
    const positions = new Map();
    let leafIndex = 0;
    function locate(node) {
      let x;
      if (!node.split) x = 20 + (leafIndex++ + .5) * ((width - 40) / leaves.length);
      else x = (locate(node.no) + locate(node.yes)) / 2;
      positions.set(node.id, { x, y: 30 + node.depth * 148 });
      return x;
    }
    locate(state.tree);
    const activePath = state.trace ? state.trace.result.path.slice(0, state.trace.index + 1) : [];
    const edges = nodes.filter(node => node.split).map(node => {
      const parent = positions.get(node.id);
      return ['no', 'yes'].map(branch => {
        const child = node[branch]; const p = positions.get(child.id);
        const startY = parent.y + 93, endY = p.y;
        const path = `M${parent.x},${startY} C${parent.x},${startY + 30} ${p.x},${endY - 30} ${p.x},${endY}`;
        return `<path d="${path}" class="tree-edge ${activePath.includes(child.id) ? 'active' : ''}"/><text class="edge-label" x="${p.x + (branch === 'no' ? -12 : 12)}" y="${endY - 13}" text-anchor="middle">${branch === 'no' ? 'No' : 'Yes'}</text>`;
      }).join('');
    }).join('');
    const cards = nodes.map(node => {
      const p = positions.get(node.id); const rows = C.nodeRows(state.project, node);
      const totals = C.counts(rows, state.project.labels);
      const pure = C.gini(rows, state.project.labels) < 1e-10 && rows.length;
      const feature = node.split && state.project.features.find(f => f.id === node.split.featureId);
      const title = feature ? C.question(feature, node.split.threshold) : pure ? node.prediction : node.depth === 0 ? 'Choose your first question' : 'Choose the next question';
      const type = feature ? 'Question ' + (node.depth + 1) : pure ? 'Prediction' : 'Mixed group';
      return `<foreignObject x="${p.x - 85}" y="${p.y}" width="170" height="96"><button xmlns="http://www.w3.org/1999/xhtml" class="tree-node ${feature ? 'is-split' : ''} ${state.mode === 'build' && state.selected === node.id ? 'is-selected' : ''} ${activePath.includes(node.id) ? 'is-path' : ''}" data-node="${node.id}" title="${escape(title)}" aria-label="${escape(type + ': ' + title + ', ' + rows.length + ' training examples')}" ${state.mode === 'build' ? '' : 'tabindex="-1"'}><span class="node-type">${escape(type)}</span><span class="node-question">${pure && !feature ? classDot(node.prediction) : ''}${escape(title)}</span><span class="node-foot"><span>${rows.length} example${rows.length === 1 ? '' : 's'}</span><span>${pure && !feature ? 'All same label' : !feature ? totals.filter(n => n > 0).length + ' labels' : ''}</span></span><span class="node-bar">${totals.map((total, i) => `<span style="width:${rows.length ? total / rows.length * 100 : 0}%;background:${C.PALETTE[i]}"></span>`).join('')}</span></button></foreignObject>`;
    }).join('');
    const note = !state.tree.split ? `<path d="M${width / 2},135v43m0 0h-95v30m95-30h95v30" stroke="#acba92" stroke-width="3" fill="none" stroke-dasharray="6 6"/><text x="${width / 2 - 95}" y="231" class="canvas-note canvas-note-small">No</text><text x="${width / 2 + 95}" y="231" class="canvas-note canvas-note-small">Yes</text><text x="${width / 2}" y="290" class="canvas-note">Choose a question to start growing.</text>` : '';
    $('tree-canvas').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width:${width * state.zoom}px;height:${height * state.zoom}px" role="group" aria-label="Decision tree with ${nodes.filter(n => n.split).length} questions and ${leaves.length} end groups">${edges}${cards}${note}</svg>`;
    $('tree-subtitle').textContent = state.trace ? `Following: ${state.trace.row.name}` : state.origin + ' · ' + (depth ? 'Click an end group to keep building.' : 'One question at a time.');
    $('tree-legend').innerHTML = colors().map(({ label }) => `<span>${classDot(label)}${escape(label)}</span>`).join('');
    const trainScore = C.accuracy(state.tree, C.trainingRows(state.project), state.project);
    const testRows = state.project.rows.filter(r => r.set === 'test' && state.tested[r.id]);
    const testCorrect = testRows.filter(r => state.tested[r.id].label === r.label).length;
    $('tree-stats').innerHTML = `<div class="stat"><div class="stat-value">${nodes.filter(n => n.split).length}</div><div class="stat-label">Questions</div></div><div class="stat"><div class="stat-value">${depth}</div><div class="stat-label">Deepest path</div></div><div class="stat"><div class="stat-value">${trainScore.correct}<small> / ${trainScore.total}</small></div><div class="stat-label">Training correct</div></div><div class="stat"><div class="stat-value">${testRows.length ? testCorrect + '<small> / ' + testRows.length + '</small>' : '—'}</div><div class="stat-label">Test correct</div></div>`;
  }
  function autoControls() {
    const available = !!C.nextSplit(state.tree, state.project, state.maxDepth);
    return `<details class="auto-section"><summary>🤖 Let the computer help</summary><p>It compares questions and chooses one that separates the categories.</p><div class="auto-buttons"><button class="button quiet" data-action="auto-step" ${available ? '' : 'disabled'}>One split</button><button class="button quiet" data-action="auto-all" ${available ? '' : 'disabled'}>Build the rest</button></div><label class="depth-control">Questions per path<select id="max-depth" aria-label="Automatic depth limit">${[1, 2, 3, 4].map(d => `<option value="${d}" ${state.maxDepth === d ? 'selected' : ''}>${d}</option>`).join('')}</select></label></details>`;
  }
  function renderInspector() {
    if (state.mode === 'test') return renderTest();
    if (state.mode === 'challenge') return renderChallenge();
    const node = selectedNode(); const rows = C.nodeRows(state.project, node);
    const all = C.candidates(rows, state.project.features, state.project.labels);
    let body = '<h2>🧱 Pick a question</h2><p class="panel-caption">Can you separate the different categories?</p>';
    if (!rows.length || !state.project.features.length) {
      $('inspector').innerHTML = body + '<div class="notice">Start by adding training examples and at least one feature in the data editor.</div><button class="button primary full" data-action="edit">Add data & questions →</button>';
      return;
    }
    if (node.split) {
      body = '<h3>This question is in your tree.</h3><p class="panel-caption">Choose an end group in the diagram to add another question.</p><div class="notice">' + escape(C.question(state.project.features.find(f => f.id === node.split.featureId), node.split.threshold)) + '</div><button class="button quiet full" data-action="prune">Remove this question & its branches</button>';
    } else if (C.gini(rows, state.project.labels) < 1e-10) {
      const mixed = C.walk(state.tree).find(n => !n.split && n.depth < C.MAX_DEPTH && C.gini(C.nodeRows(state.project, n), state.project.labels) > 1e-10);
      body = `<h2>✅ This group is sorted!</h2><div class="success-panel"><strong>${glyph(node.prediction)} ${escape(node.prediction)}</strong>All ${rows.length} items have the same category.</div><p class="panel-caption">${mixed ? 'Another group still has different categories. Give it a question too.' : 'Will your tree work on an item it hasn’t seen?'}</p><button class="button primary full" data-action="${mixed ? 'next-group' : 'go-test'}">${mixed ? '🧱 Sort the next group →' : '🎯 Try a new item →'}</button>`;
    } else if (node.depth >= C.MAX_DEPTH) {
      body += `<div class="notice warning">This path has reached ${C.MAX_DEPTH} questions. Its prediction is the most common label in this group: <strong>${escape(node.prediction)}</strong>.</div>`;
    } else {
      const current = state.project.features.find(f => f.id === state.featureId) || state.project.features[0];
      state.featureId = current.id;
      const currentBest = all.find(c => c.featureId === current.id);
      if (current.type === 'number' && (state.threshold === null || !Number.isFinite(state.threshold))) state.threshold = currentBest?.threshold ?? rows[0].values[current.id];
      const preview = C.evaluate(rows, current, state.threshold, state.project.labels);
      const useful = state.project.features.filter(f => all.some(c => c.featureId === f.id) || f.id === current.id);
      const bools = useful.filter(f => f.type === 'boolean');
      const shown = node.depth === 0 && bools.length >= 2 && current.type === 'boolean' ? bools.slice(0, 2) : useful.slice(0, 3);
      if (!shown.includes(current)) shown.push(current);
      const others = state.project.features.filter(f => !shown.includes(f));
      const option = feature => {
        const best = all.find(c => c.featureId === feature.id);
        const title = feature.type === 'boolean' ? C.question(feature, null) : C.question(feature, feature.id === current.id ? state.threshold : best?.threshold ?? 0);
        return `<button class="question-choice ${current.id === feature.id ? 'active' : ''}" data-feature="${escape(feature.id)}" aria-pressed="${current.id === feature.id}"><span class="radio-mark"></span><span class="question-text">${escape(title)}</span></button>`;
      };
      body += `<div class="question-options">${shown.map(option).join('')}</div>${others.length ? `<details class="more-questions"><summary>More questions</summary>${others.map(option).join('')}</details>` : ''}`;
      if (current.type === 'number') {
        const values = rows.map(r => r.values[current.id]); const min = Math.min(...values), max = Math.max(...values);
        body += `<div class="threshold-control"><label for="threshold-number">${escape(C.question(current, state.threshold))}</label><div class="threshold-inputs"><input id="threshold-slider" type="range" min="${min}" max="${max === min ? max + 1 : max}" step="any" value="${state.threshold}" aria-label="Question threshold slider"><input id="threshold-number" type="number" step="any" min="-1000000" max="1000000" value="${state.threshold}" aria-label="Question threshold"></div></div>`;
      }
      const items = group => group.map(r => `<div class="preview-item" style="--class-color:${colorFor(r.label)}"><span class="preview-item-name">${glyph(r.label, false, r.name)} ${escape(r.name)}</span><small>${classDot(r.label)}${escape(r.label)}${current.type === 'number' ? ' · ' + escape(formatValue(r.values[current.id], current)) : ''}</small></div>`).join('') || '<p class="empty-group">No items</p>';
      body += `<div class="split-preview"><h3>Here’s what happens:</h3><div class="preview-groups"><div class="preview-group"><div class="branch-label"><strong>↙ No</strong><span>${preview.no.length}</span></div><div class="preview-items">${items(preview.no)}</div></div><div class="preview-group"><div class="branch-label"><strong>Yes ↘</strong><span>${preview.yes.length}</span></div><div class="preview-items">${items(preview.yes)}</div></div></div><p class="preview-note">${preview.valid ? preview.remaining ? 'Different categories in one group? It may need another question.' : 'Each group has just one category. Nice split!' : 'Everything goes the same way. Try another question.'}</p></div><button class="button primary full" data-action="split" ${preview.valid ? '' : 'disabled'}>🌱 Use this question →</button><details class="math-detail"><summary>📐 How does the computer choose?</summary><p>The computer compares <strong>Gini impurity</strong>: 0 means every label in a group is the same. It picks the biggest drop in weighted impurity.</p><p>This question: ${C.gini(rows, state.project.labels).toFixed(3)} → ${(C.gini(rows, state.project.labels) - preview.gain).toFixed(3)}. Improvement: ${preview.gain.toFixed(3)}.</p>${state.project.features.map(f => { const b = all.find(c => c.featureId === f.id); return `<div class="candidate-ranking"><span>${escape(f.name)}</span><span>${b ? 'gain ' + b.gain.toFixed(3) : 'no split'}</span></div>`; }).join('')}<p>If both groups stopped here, ${preview.remaining} training mistakes would remain. Ties use feature order.</p></details>`;
    }
    $('inspector').innerHTML = body + autoControls();
  }
  function renderTest() {
    const rows = state.project.rows.filter(r => r.set === 'test');
    const trace = state.trace?.row.set === 'test' ? state.trace : null;
    let html = '<h2>🎯 Try a new item</h2><p class="panel-caption">Guess its category. Then follow your tree.</p>';
    if (!C.trainingRows(state.project).length) html += '<div class="notice warning">Add training examples before testing a model.</div>';
    else if (!rows.length) html += '<div class="notice">No held-out examples yet. Add examples marked “Test” in the editor. Keep them out of training while you evaluate.</div><button class="button quiet full" data-action="edit">Add test examples →</button>';
    else if (trace) {
      html += `<div class="section-label">UNSEEN ITEM</div><h3>${escape(trace.row.name)}</h3>${featureReadout(trace.row)}`;
      if (!trace.started) html += '<button class="button primary full" data-action="start-trace">Follow its prediction →</button>';
      else {
        const done = trace.index >= trace.result.path.length - 1;
        const decisions = trace.result.decisions.slice(0, trace.index);
        if (decisions.length) html += `<ol class="trace-list">${decisions.map(d => `<li>${escape(d.question)}<strong>${d.answer}</strong></li>`).join('')}</ol>`;
        else if (!done) html += '<div class="notice">Start at the root. What answer do the item’s features give to the first question?</div>';
        if (!done) html += '<button class="button primary full" data-action="trace-next">Next question →</button>';
        else html += `<div class="prediction-box"><div class="eyebrow">YOUR TREE SAYS</div><div class="prediction-label">${glyph(trace.result.label)} ${escape(trace.result.label)}</div><p>Correct category: <strong>${escape(trace.row.label)}</strong><br>${trace.result.label === trace.row.label ? '✅ It matches!' : '🤔 A mistake. What could you change?'}</p></div>${!trace.result.decisions.length ? '<p class="panel-caption">Your tree has no questions yet. It guesses the most common category.</p>' : ''}<button class="button primary full" data-action="next-test">🎒 Try another item →</button><button class="text-button" data-action="replay-trace">↺ Follow this path again</button>`;
      }
    } else if (rows.length) html += '<div class="notice">Try predicting the category yourself first. Then compare your reasoning with the tree’s path.</div>';
    const tested = rows.filter(r => state.tested[r.id]);
    if (tested.length) {
      const correct = tested.filter(r => state.tested[r.id].label === r.label).length;
      html += `<div class="score-summary"><strong>${correct} / ${tested.length}</strong>new items sorted correctly</div><details class="math-detail"><summary>About this score</summary><p>Once you use these results to improve your tree, use fresh examples for the next independent test.</p></details>`;
    }
    html += '<section class="auto-section"><h4>What would improve it?</h4><p>Try a different question or a shallower tree. Compare training results with new examples.</p><button class="button quiet full" data-action="go-build">← Back to building</button></section>';
    $('inspector').innerHTML = html;
  }
  function renderChallenge() {
    if (state.challenge) {
      const { row, result, added } = state.challenge;
      const matched = row.label === result.label;
      $('inspector').innerHTML = `<h3>${matched ? 'Your tree passed this one.' : 'You found a blind spot.'}</h3><p class="panel-caption">${escape(row.name)}</p>${featureReadout(row)}<div class="prediction-box"><div class="eyebrow">TREE PREDICTION</div><div class="prediction-label">${escape(result.label)}</div><p>Your supplied label: <strong>${escape(row.label)}</strong></p></div><p class="challenge-result">${matched ? 'Can you create a more difficult example? Try an unusual combination of features.' : 'Is a feature missing, is the label ambiguous, or does the model need a different split? The data alone cannot settle a disagreement about what a label should mean.'}</p>${added ? '<div class="success-panel">Added to training. Rebuild the tree to learn from the new example. This is no longer an independent test.</div><button class="button primary full" data-action="go-build">Rebuild your tree →</button>' : `<button class="button primary full" data-action="add-challenge">Add to training & rebuild →</button>`}<button class="button quiet full" style="margin-top:9px" data-action="another-challenge">Try another example</button>`;
      return;
    }
    $('inspector').innerHTML = `<h3>Can you catch it out?</h3><p class="panel-caption">Create an example with an unusual mix of features. Decide its correct label before testing.</p><form id="challenge-form" class="challenge-form"><label>Example name<input name="name" maxlength="60" required placeholder="e.g. A shield that heals"></label><div class="form-grid">${state.project.features.map(f => `<label>${escape(f.name)}${f.type === 'boolean' ? `<select name="feature-${escape(f.id)}"><option value="false">No</option><option value="true">Yes</option></select>` : `<input name="feature-${escape(f.id)}" type="number" step="any" min="-1000000" max="1000000" required value="0">`}</label>`).join('')}</div><label>The correct label<select name="label">${state.project.labels.map(label => `<option>${escape(label)}</option>`).join('')}</select></label><button class="button primary full" type="submit" ${!C.trainingRows(state.project).length || !state.project.features.length ? 'disabled' : ''}>Challenge my tree <span aria-hidden="true">↗</span></button></form><div class="notice">Swap with a partner: can their example break your tree? Explain why, then change one thing and try again.</div><p class="panel-caption">Adding a question about a new property also means recording that property for your training examples.</p>`;
  }
  function setMode(mode) {
    if (!['build', 'test', 'challenge'].includes(mode)) return;
    state.mode = mode; state.trace = null; state.filter = 'all';
    if (mode === 'test') {
      const row = state.project.rows.find(r => r.set === 'test' && !state.tested[r.id]) || state.project.rows.find(r => r.set === 'test');
      if (row) makeTrace(row);
    }
    render();
  }
  function makeTrace(row, started = false, complete = false) {
    const result = C.predict(state.tree, row, state.project);
    state.trace = { row, result, started, index: complete ? result.path.length - 1 : 0 };
    if (row.set === 'test' && started && state.trace.index === result.path.length - 1) state.tested[row.id] = result;
  }
  function splitAutomatically(all) {
    remember(); clearResults();
    let steps = 0, last;
    do { last = C.growStep(state.tree, state.project, state.maxDepth); if (last) { steps++; state.selected = last.id; } } while (all && last);
    state.origin = 'Computer-assisted tree';
    const next = C.nextSplit(state.tree, state.project, state.maxDepth);
    state.selected = next ? next.node.id : C.walk(state.tree).find(n => !n.split)?.id || 'r';
    chooseBest(); render(); announce(steps ? `${steps === 1 ? last?.question || 'Added one question.' : 'Added ' + steps + ' questions.'} Test it on unseen examples next.` : 'No improving split remains within this depth limit.');
  }
  function showInfo(kind) {
    const teacher = kind === 'teacher';
    $('info-content').innerHTML = `<div class="dialog-heading"><div><div class="eyebrow">${teacher ? 'FOR THE CLASSROOM' : 'A QUICK FIELD GUIDE'}</div><h2 id="info-title">${teacher ? 'Make room for good questions.' : 'A tree is a chain of questions.'}</h2></div><button class="icon-button" data-close="info-dialog" aria-label="Close guide">×</button></div>${teacher ? `<p>Designed for Years 6–9. Aim for a 30–40 minute experiment in pairs. Let pupils make a prediction before each click.</p><ol><li><strong>Build (10 minutes):</strong> Choose a first question. Compare “Does it glow?” with a more useful feature. What changed about the groups?</li><li><strong>Compare (5 minutes):</strong> Undo a split, try another threshold, then let the computer add one question. It scores possible splits; it does not understand game items.</li><li><strong>Test (5–10 minutes):</strong> Use unseen items. The Counter shield has an unusual combination of abilities. Can pupils explain the path and the error?</li><li><strong>Challenge (10 minutes):</strong> Swap invented examples. Decide labels first. Change one thing—data, feature or split—and explain what happened.</li></ol><h3>When a pupil disputes the question</h3><p>Ask “What exactly are we predicting?” and “What information would settle it?” The starter predicts a fictional designer’s assigned category. It makes no claim that a shield cannot deal damage. If a label is ambiguous, agree a definition or record the disagreement.</p><h3>Different levels of stretch</h3><p><strong>Years 6–7:</strong> Explain features, labels, branches and missing information. <strong>Years 8–9:</strong> Open the Gini explanation, vary the depth, compare training and test results, and discuss overfitting.</p><h3>Project ideas</h3><p>Classify game items, museum objects or fictional messages. A music preference sorter predicts the student’s own supplied preferences. Avoid collecting classmates’ personal details. New projects begin empty so pupils can choose their own categories and questions.</p><h3>Evaluation and practical notes</h3><p>Test labels never influence automatic training. Once pupils adjust their model using test results, use fresh held-out examples for a new evaluation. One small test set gives limited evidence. Save/Open downloads and reads JSON project files; there is no server storage or automatic saving. All work is lost on refresh unless saved.</p><p>The original car lesson remains in the folder. This lab uses a real greedy binary tree learner with weighted Gini improvement and a maximum of four questions per path.</p>` : `<ol><li><strong>Features are the information.</strong> A game item’s damage and whether it restores health are features. Its name is only for display.</li><li><strong>Labels are the answers in your examples.</strong> Here they are Attack, Defence and Recovery. Humans supplied them.</li><li><strong>A question makes two branches.</strong> Yes goes one way; No goes the other. Another question can split a mixed group again.</li><li><strong>An end group makes a prediction.</strong> It chooses its most common training label. If labels tie, the first project label wins.</li><li><strong>Training chooses questions.</strong> “One split” tries possible feature tests and chooses the biggest reduction in mixed labels, measured using Gini impurity.</li><li><strong>New examples reveal mistakes.</strong> A tree can fit all its training data and still get a new item wrong.</li></ol><h3>Your first experiment</h3><p>Choose “Does it restore health?” and add it. Click the mixed group, choose another question, then open “Test”. You can also try a weak question first and undo it.</p><h3>Ask your own questions</h3><p>Open “Edit data & questions”. Add a Yes/No feature, such as “Can it fly?”, then give every example an answer. For numerical features, enter measurements and explore thresholds. A typed sentence needs corresponding data before the tree can use it.</p><h3>What the computer cannot do</h3><p>It cannot look up facts, infer missing properties, understand words, or decide whose label is right. It only compares the values and labels you provide.</p>`}<div class="dialog-actions"><button class="button primary" data-close="info-dialog">Let’s experiment →</button></div>`;
    $('info-dialog').showModal();
  }
  function openEditor() { draft = C.copy(state.project); renderEditor(); $('editor-dialog').showModal(); }
  function renderEditor() {
    $('editor-content').innerHTML = `<div class="dialog-heading"><div><div class="eyebrow">YOUR DATA. YOUR QUESTIONS.</div><h2 id="editor-title">What can your tree learn from?</h2></div><button class="icon-button" data-close="editor-dialog" aria-label="Close data editor">×</button></div><label>Project name<input id="draft-name" maxlength="70" required value="${escape(draft.name)}"></label><p>${escape(draft.description || 'Supply examples and correct labels. Use consistent meanings for your categories.')}</p><h3>Features & questions <span class="count-pill">${draft.features.length} / 8</span></h3><div class="feature-list">${draft.features.map(f => `<span class="feature-pill">${escape(f.name)} · ${f.type === 'boolean' ? 'Yes/No' : 'Number'}<button data-remove-feature="${escape(f.id)}" aria-label="Remove ${escape(f.name)} feature">×</button></span>`).join('') || '<p>No features yet. Add a property your tree can ask about.</p>'}</div><form id="add-feature-form" class="feature-add"><label>Feature name<input name="name" required maxlength="45" placeholder="e.g. Can fly"></label><label>Answer type<select name="type" id="feature-type"><option value="boolean">Yes / No</option><option value="number">Number</option></select></label><label>Question wording <span style="font-weight:400">(Yes/No only)</span><input name="question" maxlength="100" placeholder="e.g. Can it fly?"></label><button class="button quiet" ${draft.features.length >= 8 ? 'disabled' : ''}>＋ Add feature</button></form><div class="editor-toolbar"><h3>Examples <span class="count-pill">${draft.rows.length} / 120</span></h3><button class="button quiet small" data-action="add-row" ${draft.rows.length >= 120 ? 'disabled' : ''}>＋ Add example</button></div><div class="table-scroll"><table class="editor-table"><thead><tr><th scope="col">Example</th>${draft.features.map(f => `<th scope="col">${escape(f.name)}</th>`).join('')}<th scope="col">Correct label</th><th scope="col">Use for</th><th scope="col"><span class="sr-only">Remove</span></th></tr></thead><tbody>${draft.rows.map(row => `<tr><td><input data-edit-row="${escape(row.id)}" data-field="name" value="${escape(row.name)}" maxlength="60" aria-label="Name for ${escape(row.name)}"></td>${draft.features.map(f => `<td>${f.type === 'boolean' ? `<select data-edit-row="${escape(row.id)}" data-value="${escape(f.id)}" aria-label="${escape(f.name + ' for ' + row.name)}"><option value="false" ${!row.values[f.id] ? 'selected' : ''}>No</option><option value="true" ${row.values[f.id] ? 'selected' : ''}>Yes</option></select>` : `<input data-edit-row="${escape(row.id)}" data-value="${escape(f.id)}" type="number" min="-1000000" max="1000000" step="any" required value="${escape(row.values[f.id])}" aria-label="${escape(f.name + ' for ' + row.name)}">`}</td>`).join('')}<td><select data-edit-row="${escape(row.id)}" data-field="label" aria-label="Label for ${escape(row.name)}">${draft.labels.map(label => `<option ${label === row.label ? 'selected' : ''}>${escape(label)}</option>`).join('')}</select></td><td><select data-edit-row="${escape(row.id)}" data-field="set" aria-label="Training or test for ${escape(row.name)}"><option value="train" ${row.set === 'train' ? 'selected' : ''}>Training</option><option value="test" ${row.set === 'test' ? 'selected' : ''}>Test</option></select></td><td><button class="icon-button" data-remove-row="${escape(row.id)}" aria-label="Remove ${escape(row.name)}">×</button></td></tr>`).join('') || `<tr><td colspan="${draft.features.length + 4}" style="padding:20px">Add examples, give them labels and record their features.</td></tr>`}</tbody></table></div><p class="editor-note">New features start at No or 0. Fill in their real values before applying. Changing data resets the tree so every count and split uses the updated examples.</p><div id="editor-error" class="form-error" role="alert"></div><div class="dialog-actions"><button class="text-button" data-action="load-starter">Restore game dataset</button><button class="button quiet" data-close="editor-dialog">Cancel</button><button class="button primary" data-action="apply-data">Apply data & start tree →</button></div>`;
  }
  function syncDraftName() { if (draft && $('draft-name')) draft.name = $('draft-name').value; }
  function saveProject() {
    const payload = { ...state.project, tree: state.tree, maxDepth: state.maxDepth };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = (state.project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 55) || 'branch-project') + '.json';
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
    announce('Project downloaded. Use Open project to continue later.');
  }
  const actions = {
    help: () => showInfo('help'), teacher: () => showInfo('teacher'),
    edit: openEditor, new: () => $('new-dialog').showModal(), open: () => $('project-file').click(), save: saveProject,
    'go-test': () => setMode('test'), 'go-build': () => setMode('build'),
    'next-group': () => { const next = C.walk(state.tree).find(n => !n.split && n.depth < C.MAX_DEPTH && C.gini(C.nodeRows(state.project, n), state.project.labels) > 1e-10); if (next) { state.selected = next.id; state.trace = null; chooseBest(); render(); } },
    'next-test': () => { const rows = state.project.rows.filter(r => r.set === 'test'); const next = rows.find(r => !state.tested[r.id] && r.id !== state.trace?.row.id) || rows[(rows.findIndex(r => r.id === state.trace?.row.id) + 1) % rows.length]; if (next) { makeTrace(next); render(); } },
    reset: () => { remember(); state.tree = C.newTree(state.project); state.selected = 'r'; state.origin = 'Your tree'; clearResults(); chooseBest(); render(); announce('Tree reset. Your examples and questions are kept.'); },
    undo: () => { const last = state.history.pop(); if (!last) return; Object.assign(state, last); clearResults(); chooseBest(); render(); announce('Undid the last tree change.'); },
    split: () => {
      remember();
      const feature = state.project.features.find(f => f.id === state.featureId);
      const node = C.applySplit(state.tree, state.selected, feature, state.threshold, state.project);
      clearResults(); state.origin = 'Your tree';
      state.selected = C.gini(C.nodeRows(state.project, node.no), state.project.labels) > 0 ? node.no.id : node.yes.id;
      chooseBest(); render(); announce('Question added. Click a mixed end group to continue.');
    },
    prune: () => { remember(); const node = selectedNode(); delete node.no; delete node.yes; node.split = null; clearResults(); chooseBest(); render(); announce('Removed this question and its branches.'); },
    'auto-step': () => splitAutomatically(false), 'auto-all': () => splitAutomatically(true),
    'zoom-in': () => { state.zoom = Math.min(1.6, state.zoom + .15); renderTree(); }, 'zoom-out': () => { state.zoom = Math.max(.55, state.zoom - .15); renderTree(); },
    'clear-trace': () => { state.trace = null; render(); },
    'start-trace': () => { if (!state.trace) return; state.trace.started = true; if (state.trace.result.path.length === 1) state.tested[state.trace.row.id] = state.trace.result; render(); },
    'trace-next': () => { if (!state.trace) return; state.trace.index = Math.min(state.trace.index + 1, state.trace.result.path.length - 1); if (state.trace.index === state.trace.result.path.length - 1) state.tested[state.trace.row.id] = state.trace.result; render(); },
    'replay-trace': () => { if (state.trace) { state.trace.index = 0; state.trace.started = true; render(); } },
    'test-all': () => { const rows = state.project.rows.filter(r => r.set === 'test'); rows.forEach(row => { state.tested[row.id] = C.predict(state.tree, row, state.project); }); if (rows.length) makeTrace(rows.find(row => state.tested[row.id].label !== row.label) || rows[0], true, true); render(); announce('Tested the held-out examples. Review mistakes and their paths.'); },
    'another-challenge': () => { state.challenge = null; state.trace = null; render(); },
    'add-challenge': () => {
      if (!state.challenge || state.challenge.added) return;
      if (state.project.rows.length >= 120) throw new Error('This project already has 120 examples. Remove one before adding another.');
      const row = { ...state.challenge.row, set: 'train' }; state.project.rows.push(row);
      state.tree = C.newTree(state.project); state.selected = 'r'; state.history = []; state.tested = Object.create(null); state.trace = null;
      state.challenge.added = true; state.origin = 'Your tree'; chooseBest(); render(); announce('Added the example to training. The old tree was reset; rebuild to learn from the updated data.');
    },
    'add-example': () => { openEditor(); actions['add-row'](); $('editor-dialog').querySelector('.editor-table tbody tr:last-child input[data-field=name]')?.select(); },
    'add-row': () => { syncDraftName(); draft.rows.push({ id: uid('example'), name: 'New example ' + (draft.rows.length + 1), label: draft.labels[0], set: 'train', values: Object.fromEntries(draft.features.map(f => [f.id, f.type === 'boolean' ? false : 0])) }); renderEditor(); const table = $('editor-dialog').querySelector('.table-scroll'); table.scrollTop = table.scrollHeight; },
    'apply-data': () => { syncDraftName(); try { const project = C.validateProject(draft); $('editor-dialog').close(); replaceProject(project); announce('Data updated. Your tree is ready for new questions.'); } catch (error) { $('editor-error').textContent = error.message; } },
    'load-starter': () => { if (confirm('Replace the data in this editor with the game starter dataset? Apply to keep the change.')) { draft = C.starter(); renderEditor(); } }
  };
  document.addEventListener('click', event => {
    const target = event.target.closest('button'); if (!target || target.disabled) return;
    const projectMenu = target.closest('.project-menu');
    if (projectMenu) { projectMenu.open = false; projectMenu.querySelector('summary').focus({ preventScroll: true }); }
    try {
      if (target.dataset.close) return $(target.dataset.close).close();
      if (target.dataset.action) return actions[target.dataset.action]?.();
      if (target.dataset.mode) return setMode(target.dataset.mode);
      if (target.dataset.filter) { state.filter = target.dataset.filter; renderData(); return; }
      if (target.dataset.node) {
        if (state.mode !== 'build') return;
        state.selected = target.dataset.node; state.trace = null; chooseBest(); render(); return;
      }
      if (target.dataset.feature) {
        state.featureId = target.dataset.feature;
        const best = C.candidates(C.nodeRows(state.project, selectedNode()), state.project.features, state.project.labels).find(c => c.featureId === state.featureId);
        state.threshold = best?.threshold ?? null; renderInspector(); document.querySelector(`[data-feature="${state.featureId}"]`)?.focus({ preventScroll: true }); return;
      }
      if (target.dataset.row) {
        const row = state.project.rows.find(r => r.id === target.dataset.row);
        makeTrace(row, state.mode !== 'test', state.mode !== 'test'); render(); return;
      }
      if (target.dataset.removeRow) { syncDraftName(); draft.rows = draft.rows.filter(r => r.id !== target.dataset.removeRow); renderEditor(); return; }
      if (target.dataset.removeFeature) { syncDraftName(); draft.features = draft.features.filter(f => f.id !== target.dataset.removeFeature); draft.rows.forEach(r => delete r.values[target.dataset.removeFeature]); renderEditor(); }
    } catch (error) { announce(error.message); }
  });
  document.addEventListener('change', event => {
    const target = event.target;
    if (target.id === 'max-depth') { state.maxDepth = Number(target.value); renderInspector(); return; }
    if (target.id === 'threshold-number' || target.id === 'threshold-slider') {
      if (!target.value.trim() || !Number.isFinite(Number(target.value)) || Math.abs(Number(target.value)) > 1000000) { announce('Enter a number between −1,000,000 and 1,000,000.'); renderInspector(); return; }
      state.threshold = Number(target.value); renderInspector(); $(target.id)?.focus({ preventScroll: true }); return;
    }
    if (target.dataset.editRow) {
      const row = draft.rows.find(r => r.id === target.dataset.editRow);
      if (target.dataset.field) row[target.dataset.field] = target.value;
      else if (target.dataset.value) {
        const feature = draft.features.find(f => f.id === target.dataset.value);
        row.values[feature.id] = feature.type === 'boolean' ? target.value === 'true' : target.value.trim() ? Number(target.value) : null;
      }
    }
    if (target.id === 'feature-type') {
      const input = $('add-feature-form').elements.question;
      input.disabled = target.value === 'number';
      input.placeholder = target.value === 'number' ? 'Numerical questions use a threshold.' : 'e.g. Can it fly?';
    }
  });
  document.addEventListener('submit', event => {
    event.preventDefault(); const form = event.target; const data = new FormData(form);
    try {
      if (form.id === 'new-project-form') {
        const project = C.validateProject({ version: 1, name: data.get('name').trim(), description: '', labels: data.get('labels').split(',').map(l => l.trim()), features: [], rows: [] });
        $('new-dialog').close(); replaceProject(project); form.reset(); openEditor();
      } else if (form.id === 'add-feature-form') {
        syncDraftName();
        if (draft.features.length >= 8) throw new Error('Use up to 8 features.');
        const feature = { id: uid('feature'), name: data.get('name').trim(), type: data.get('type'), question: data.get('question')?.trim() || data.get('name').trim() };
        if (!feature.name) throw new Error('Give your feature a name.');
        draft.features.push(feature); draft.rows.forEach(row => { row.values[feature.id] = feature.type === 'boolean' ? false : 0; }); renderEditor();
      } else if (form.id === 'challenge-form') {
        const row = { id: uid('challenge'), name: data.get('name').trim(), label: data.get('label'), set: 'train', values: Object.fromEntries(state.project.features.map(f => [f.id, f.type === 'boolean' ? data.get('feature-' + f.id) === 'true' : Number(data.get('feature-' + f.id))])) };
        C.validateProject({ ...state.project, rows: [row] });
        const result = C.predict(state.tree, row, state.project); state.challenge = { row, result, added: false }; makeTrace(row, true, true); render();
      }
    } catch (error) { announce(error.message); }
  });
  $('project-file').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    try {
      if (file.size > 1000000) throw new Error('Choose a Branch project file smaller than 1 MB.');
      const input = JSON.parse(await file.text()); const project = C.validateProject(input);
      const tree = input.tree ? C.restoreTree(input.tree, project) : null;
      if ((state.history.length || state.project.name !== 'Game item classifier') && !confirm('Open this project and replace the current experiment? Save your work first if you need it.')) return;
      state.maxDepth = [1, 2, 3, 4].includes(input.maxDepth) ? input.maxDepth : 3;
      replaceProject(project, tree); announce('Opened ' + project.name + '.');
    } catch (error) { announce('Could not open project: ' + error.message); }
    finally { event.target.value = ''; }
  });
  document.querySelector('.mode-tabs').addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); const modes = ['build', 'test', 'challenge']; const index = modes.indexOf(state.mode);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
    setMode(modes[next]); $('tab-' + modes[next]).focus();
  });
  // No auto-save: Save project creates an explicit, portable download.
  render();
})();

