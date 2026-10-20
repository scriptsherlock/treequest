'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const C = require('../classifier.js');
test('starter data is valid and every label has multiple training and test examples', () => {
  const p = C.validateProject(C.starter());
  assert.equal(C.trainingRows(p).length, 15);
  assert.equal(p.rows.filter(r => r.set === 'test').length, 6);
  for (const label of p.labels) assert.equal(p.rows.filter(r => r.label === label && r.set === 'train').length, 5);
});
test('manual split routes by feature values and accurately counts mistakes', () => {
  const p = C.starter(), tree = C.newTree(p);
  const feature = p.features[0];
  const preview = C.evaluate(C.trainingRows(p), feature, null, p.labels);
  assert.equal(preview.yes.length, 5); assert.equal(preview.no.length, 10);
  assert.equal(preview.remaining, 5);
  assert.ok(Math.abs(preview.gain - 1 / 3) < 1e-10);
  C.applySplit(tree, 'r', feature, null, p);
  const result = C.predict(tree, p.rows.find(r => r.name === 'Repair kit'), p);
  assert.deepEqual(result.path, ['r', 'r1']); assert.equal(result.label, 'Recovery');
});
test('automatic tree learns the training examples and exposes a genuine held-out mistake', () => {
  const p = C.starter(), tree = C.train(p, 3);
  assert.deepEqual(C.accuracy(tree, C.trainingRows(p), p), { correct: 15, total: 15 });
  assert.deepEqual(C.accuracy(tree, p.rows.filter(r => r.set === 'test'), p), { correct: 5, total: 6 });
  const counter = p.rows.find(r => r.name === 'Counter shield');
  assert.equal(C.predict(tree, counter, p).label, 'Attack'); assert.equal(counter.label, 'Defence');
});
test('held-out labels and values cannot influence the learned tree', () => {
  const p = C.starter(), altered = C.copy(p);
  altered.rows.filter(r => r.set === 'test').forEach(r => { r.label = 'Recovery'; r.values.damage = 100000; r.values.heals = true; });
  assert.deepEqual(C.train(p), C.train(altered));
});
test('depth limit constrains training, stepwise growth equals full training', () => {
  const p = C.starter(), shallow = C.train(p, 1), incremental = C.newTree(p);
  assert.equal(Math.max(...C.walk(shallow).map(n => n.depth)), 1);
  while (C.growStep(incremental, p, 3)) {}
  assert.deepEqual(incremental, C.train(p, 3));
});
test('numeric thresholds use the midpoint of observed values and equality takes No', () => {
  const p = { version: 1, name: 'Numbers', labels: ['Low', 'High'], features: [{ id: 'x', name: 'Value', type: 'number' }], rows: [1, 3, 7, 9].map((x, i) => ({ id: '' + i, name: '' + x, label: i < 2 ? 'Low' : 'High', set: 'train', values: { x } })) };
  const tree = C.train(p); assert.equal(tree.split.threshold, 5);
  assert.equal(C.predict(tree, { values: { x: 5 } }, p).label, 'Low');
});
test('constant or contradictory data stops without an invalid split', () => {
  const p = C.starter(); p.rows = p.rows.filter(r => r.set === 'train').slice(0, 2);
  p.rows[1].label = 'Defence'; p.rows[1].values = { ...p.rows[0].values };
  const tree = C.train(p); assert.equal(tree.split, null); assert.equal(tree.prediction, 'Attack');
  assert.equal(C.nextSplit(tree, p), null);
  assert.throws(() => C.applySplit(tree, 'r', p.features[0], null, p), /same side/);
});
test('valid save data and tree round-trip, but tampered trees are rejected', () => {
  const p = C.starter(), tree = C.train(p);
  const json = JSON.parse(JSON.stringify({ ...p, tree }));
  const restoredProject = C.validateProject(json);
  assert.deepEqual(C.restoreTree(json.tree, restoredProject), tree);
  json.tree.split.featureId = 'missing'; assert.throws(() => C.restoreTree(json.tree, restoredProject), /invalid question/);
});
test('validation rejects missing values, invalid numbers and unsafe feature identifiers', () => {
  const missing = C.starter(); delete missing.rows[0].values.heals;
  assert.throws(() => C.validateProject(missing), /Check Restores health/);
  const bad = C.starter(); bad.rows[0].values.damage = Infinity;
  assert.throws(() => C.validateProject(bad), /Check Damage/);
  const unsafe = C.starter(); unsafe.features[0].id = '__proto__';
  assert.throws(() => C.validateProject(unsafe), /identifiers/);
  const duplicate = C.starter(); duplicate.rows[1].id = duplicate.rows[0].id;
  assert.throws(() => C.validateProject(duplicate), /unique ID/);
});
test('empty custom project is valid and can grow after examples are supplied', () => {
  const p = C.validateProject({ version: 1, name: 'My project', labels: ['A', 'B'], features: [], rows: [] });
  assert.equal(C.newTree(p).prediction, 'A'); assert.equal(C.nextSplit(C.newTree(p), p), null);
});
test('question text preserves the numerical threshold used for routing', () => {
  const f = { id: 'small', name: 'Measurement', type: 'number' };
  assert.match(C.question(f, 0.000015), /0\.000015/);
  assert.match(C.question(f, 4.56789), /4\.56789/);
});
