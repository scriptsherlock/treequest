/* The learning engine has no DOM, network or third-party dependencies. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BranchCore = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const MAX_DEPTH = 4;
  const PALETTE = ['#e78f72', '#7f9fe0', '#69ac94', '#b096d6', '#c7a14c', '#c17c9d'];
  const copy = value => JSON.parse(JSON.stringify(value));
  const trainingRows = project => project.rows.filter(row => row.set === 'train');
  function counts(rows, labels) {
    return labels.map(label => rows.filter(row => row.label === label).length);
  }
  function gini(rows, labels) {
    if (!rows.length) return 0;
    return 1 - counts(rows, labels).reduce((sum, n) => sum + (n / rows.length) ** 2, 0);
  }
  function majority(rows, labels) {
    const totals = counts(rows, labels);
    return labels[totals.indexOf(Math.max(...totals))] || labels[0];
  }
  function mistakes(rows, labels) {
    return rows.length ? rows.length - Math.max(...counts(rows, labels)) : 0;
  }
  function answer(row, feature, threshold) {
    return feature.type === 'boolean' ? row.values[feature.id] === true : row.values[feature.id] > threshold;
  }
  function partition(rows, feature, threshold) {
    return { yes: rows.filter(row => answer(row, feature, threshold)), no: rows.filter(row => !answer(row, feature, threshold)) };
  }
  function question(feature, threshold) {
    if (feature.type === 'boolean') return feature.question || feature.name;
    return `Is ${feature.name.toLowerCase()} greater than ${threshold}${feature.unit ? ' ' + feature.unit : ''}?`;
  }
  function evaluate(rows, feature, threshold, labels) {
    const { yes, no } = partition(rows, feature, threshold);
    const weighted = rows.length ? (yes.length * gini(yes, labels) + no.length * gini(no, labels)) / rows.length : 0;
    return { featureId: feature.id, threshold: feature.type === 'boolean' ? null : threshold, yes, no, gain: gini(rows, labels) - weighted, remaining: mistakes(yes, labels) + mistakes(no, labels), valid: !!yes.length && !!no.length };
  }
  function candidates(rows, features, labels) {
    const result = [];
    for (const feature of features) {
      const values = [...new Set(rows.map(row => row.values[feature.id]))].sort((a, b) => a - b);
      const thresholds = feature.type === 'boolean' ? [null] : values.slice(0, -1).map((value, i) => value / 2 + values[i + 1] / 2);
      for (const threshold of thresholds) {
        const candidate = evaluate(rows, feature, threshold, labels);
        if (candidate.valid) result.push(candidate);
      }
    }
    return result.sort((a, b) => b.gain - a.gain || a.remaining - b.remaining);
  }
  function leaf(rows, labels, id = 'r', depth = 0) {
    return { id, depth, prediction: majority(rows, labels), rowIds: rows.map(row => row.id), split: null };
  }
  function newTree(project) { return leaf(trainingRows(project), project.labels); }
  function findNode(tree, id) {
    if (tree.id === id) return tree;
    return tree.split ? findNode(tree.no, id) || findNode(tree.yes, id) : null;
  }
  function walk(tree) { return [tree, ...(tree.split ? [...walk(tree.no), ...walk(tree.yes)] : [])]; }
  function nodeRows(project, node) {
    const ids = new Set(node.rowIds);
    return trainingRows(project).filter(row => ids.has(row.id));
  }
  function applySplit(tree, id, feature, threshold, project) {
    const node = findNode(tree, id);
    if (!node || node.split || node.depth >= MAX_DEPTH) throw new Error('Choose an end group below the depth limit.');
    const result = evaluate(nodeRows(project, node), feature, threshold, project.labels);
    if (!result.valid) throw new Error('This question puts every example on the same side. Try another question or threshold.');
    node.split = { featureId: feature.id, threshold: result.threshold };
    node.no = leaf(result.no, project.labels, id + '0', node.depth + 1);
    node.yes = leaf(result.yes, project.labels, id + '1', node.depth + 1);
    return node;
  }
  function nextSplit(tree, project, maxDepth = MAX_DEPTH) {
    for (const node of walk(tree)) {
      if (node.split || node.depth >= maxDepth) continue;
      const rows = nodeRows(project, node);
      if (gini(rows, project.labels) < 1e-10) continue;
      const best = candidates(rows, project.features, project.labels)[0];
      if (best && best.gain > 1e-10) return { node, candidate: best };
    }
    return null;
  }
  function growStep(tree, project, maxDepth = MAX_DEPTH) {
    const next = nextSplit(tree, project, maxDepth);
    if (!next) return null;
    const feature = project.features.find(f => f.id === next.candidate.featureId);
    applySplit(tree, next.node.id, feature, next.candidate.threshold, project);
    return { id: next.node.id, question: question(feature, next.candidate.threshold), gain: next.candidate.gain };
  }
  function train(project, maxDepth = MAX_DEPTH) {
    const tree = newTree(project);
    while (growStep(tree, project, maxDepth)) { /* bounded by maximum tree depth */ }
    return tree;
  }
  function predict(tree, row, project) {
    let node = tree;
    const path = [node.id];
    const decisions = [];
    while (node.split) {
      const feature = project.features.find(f => f.id === node.split.featureId);
      const yes = answer(row, feature, node.split.threshold);
      decisions.push({ question: question(feature, node.split.threshold), answer: yes ? 'Yes' : 'No' });
      node = yes ? node.yes : node.no;
      path.push(node.id);
    }
    return { label: node.prediction, path, decisions, node };
  }
  function accuracy(tree, rows, project) {
    return { correct: rows.filter(row => predict(tree, row, project).label === row.label).length, total: rows.length };
  }
  function starter() {
    const features = [
      { id: 'heals', name: 'Restores health', question: 'Does it restore health?', type: 'boolean' },
      { id: 'damage', name: 'Damage', type: 'number', unit: 'pts' },
      { id: 'shield', name: 'Shield', type: 'number', unit: 'pts' },
      { id: 'glows', name: 'Glows', question: 'Does it glow?', type: 'boolean' }
    ];
    const specs = [
      ['Pulse blade', 8, 0, false, true, 'Attack'], ['Spark bow', 6, 1, false, false, 'Attack'], ['Sonic hammer', 10, 0, false, false, 'Attack'], ['Arc wand', 7, 2, false, true, 'Attack'], ['Frost spear', 9, 1, false, false, 'Attack'],
      ['Barrier pack', 0, 9, false, true, 'Defence'], ['Stone shield', 2, 10, false, false, 'Defence'], ['Guard ring', 1, 6, false, false, 'Defence'], ['Iron cloak', 0, 8, false, false, 'Defence'], ['Reflector', 3, 7, false, true, 'Defence'],
      ['Repair kit', 0, 0, true, false, 'Recovery'], ['Life crystal', 1, 0, true, true, 'Recovery'], ['Healing mist', 0, 2, true, true, 'Recovery'], ['Energy flask', 2, 1, true, false, 'Recovery'], ['Revive charm', 3, 0, true, false, 'Recovery'],
      ['Nova axe', 9, 2, false, true, 'Attack'], ['Echo dagger', 5, 0, false, false, 'Attack'], ['Prism armour', 1, 8, false, true, 'Defence'], ['Counter shield', 8, 9, false, false, 'Defence'], ['Med drone', 0, 1, true, true, 'Recovery'], ['Regen orb', 2, 0, true, false, 'Recovery']
    ];
    return { version: 1, name: 'Game item classifier', description: 'Predict the designer’s assigned category for a fictional game item. Some items have more than one ability. Categories are supplied labels, not universal rules.', labels: ['Attack', 'Defence', 'Recovery'], features, rows: specs.map((s, i) => ({ id: 'item-' + (i + 1), name: s[0], values: { damage: s[1], shield: s[2], heals: s[3], glows: s[4] }, label: s[5], set: i < 15 ? 'train' : 'test' })) };
  }
  function validateProject(input) {
    if (!input || input.version !== 1) throw new Error('Choose a Branch project file (version 1).');
    const text = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
    if (!text(input.name, 70)) throw new Error('Give the project a name of 1–70 characters.');
    if (!Array.isArray(input.labels) || input.labels.length < 2 || input.labels.length > 6 || input.labels.some(l => !text(l, 25)) || new Set(input.labels).size !== input.labels.length) throw new Error('Use 2–6 unique labels, each up to 25 characters.');
    if (!Array.isArray(input.features) || input.features.length > 8) throw new Error('Use up to 8 features.');
    const ids = new Set();
    const features = input.features.map(f => {
      if (!f || !text(f.id, 50) || !/^[a-zA-Z0-9_-]+$/.test(f.id) || ['__proto__', 'constructor', 'prototype'].includes(f.id) || ids.has(f.id)) throw new Error('Feature IDs must be unique plain identifiers.');
      ids.add(f.id);
      if (!text(f.name, 45) || !['boolean', 'number'].includes(f.type)) throw new Error('Each feature needs a name and a Yes/No or number type.');
      if (f.question != null && (typeof f.question !== 'string' || f.question.length > 100)) throw new Error('Keep feature questions under 100 characters.');
      return { id: f.id, name: f.name.trim(), type: f.type, question: f.question || '', unit: typeof f.unit === 'string' ? f.unit.slice(0, 15) : '' };
    });
    if (!Array.isArray(input.rows) || input.rows.length > 120) throw new Error('A project can hold up to 120 examples.');
    const rowIds = new Set();
    const rows = input.rows.map(row => {
      if (!row || !text(row.id, 60) || rowIds.has(row.id) || !text(row.name, 60)) throw new Error('Each example needs a unique ID and a name.');
      rowIds.add(row.id);
      if (!input.labels.includes(row.label) || !['train', 'test'].includes(row.set) || !row.values || typeof row.values !== 'object') throw new Error('Each example needs a valid label, feature values and a training/test group.');
      const values = Object.fromEntries(features.map(f => {
        const value = row.values[f.id];
        if (f.type === 'boolean' ? typeof value !== 'boolean' : typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > 1000000) throw new Error(`Check ${f.name} for ${row.name}. Use Yes/No or a finite number between −1,000,000 and 1,000,000.`);
        return [f.id, value];
      }));
      return { id: row.id, name: row.name.trim(), label: row.label, set: row.set, values };
    });
    return { version: 1, name: input.name.trim(), description: typeof input.description === 'string' ? input.description.slice(0, 600) : '', labels: [...input.labels], features, rows };
  }
  function restoreTree(input, project) {
    const tree = newTree(project);
    let visited = 0;
    function restore(saved, node) {
      if (!saved || ++visited > 31) throw new Error('Invalid saved tree.');
      if (!saved.split) return;
      const feature = project.features.find(f => f.id === saved.split.featureId);
      if (!feature || (feature.type === 'number' && (typeof saved.split.threshold !== 'number' || !Number.isFinite(saved.split.threshold)))) throw new Error('The saved tree contains an invalid question.');
      applySplit(tree, node.id, feature, saved.split.threshold, project);
      restore(saved.no, node.no); restore(saved.yes, node.yes);
    }
    restore(input, tree);
    return tree;
  }
  return { MAX_DEPTH, PALETTE, copy, trainingRows, counts, gini, majority, mistakes, answer, partition, question, evaluate, candidates, leaf, newTree, findNode, walk, nodeRows, applySplit, nextSplit, growStep, train, predict, accuracy, starter, validateProject, restoreTree };
});
