'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../classifier.js'),Q=require('../quest-data.js'),W=require('../adventure-core.js');
const project=()=>Q.project(0,Q.notes(0),false);
function split(p,id,threshold){const tree=C.newTree(p);C.applySplit(tree,'r',p.features.find(f=>f.id===id),threshold,p);return tree;}
test('movement normalises diagonals, caps delayed frames and rejects invalid input',()=>{
  const p={x:900,y:600},a=W.move(p,{x:1,y:0},.05),b=W.move(p,{x:1,y:1},.05);
  assert.ok(Math.abs(W.distance(p,a)-W.distance(p,b))<1e-9);
  assert.ok(W.distance(p,W.move(p,{x:1,y:0},10))<=10.75001);
  assert.deepEqual(W.move(p,{x:Infinity,y:0},.05),p);
});
test('solid obstacles and map edges block movement while permitting wall sliding',()=>{
  const p={x:110,y:280};assert.equal(W.move(p,{x:1,y:0},.05).x,110);
  assert.ok(W.move({x:1238,y:500},{x:1,y:0},.05).x<=1240);
  const slide=W.move(p,{x:1,y:1},.05);assert.equal(slide.x,p.x);assert.ok(slide.y>p.y);
});
test('click routes reach every landmark and route around the village house',()=>{
  for(const landmark of Object.values(W.LANDMARKS)){
    const path=W.pathfind(W.WORLD.spawn,landmark.target);assert.ok(path.length);
    assert.deepEqual(path.at(-1),landmark.target);let anchor=W.WORLD.spawn;
    for(const step of path){assert.ok(W.clear(anchor,step));anchor=step;}
  }
  const path=W.pathfind({x:80,y:300},{x:490,y:280});assert.ok(path.length>1);
  let anchor={x:80,y:300};for(const step of path){assert.ok(W.clear(anchor,step));anchor=step;}
});
test('proximity reports an interaction without mutating the world checkpoint',()=>{
  const state=W.fresh(),before=C.copy(state);
  assert.equal(W.nearby(W.LANDMARKS.monster.target).id,'monster');
  assert.equal(W.nearby({x:60,y:710}),null);assert.deepEqual(state,before);
});
test('the chest reveals a genuine weak prediction and improved training changes the outcome',()=>{
  const p=project(),foe=W.monster(0),position=W.LANDMARKS.monster.target;
  const weak=W.predict(split(p,'horns',null),p,foe,position);
  assert.equal(weak.gearId,'hammer');
  assert.deepEqual(W.resolve(weak,3),{correct:false,gearId:'hammer',required:'ice',hearts:2});
  const strong=W.predict(split(p,'heat',55),p,foe,position);
  assert.equal(strong.gearId,'ice');assert.equal(W.resolve(strong,3).correct,true);
  assert.deepEqual(strong.returnPoint,position);
});
test('encounter evidence snapshots isolate training data and prevent prediction substitution',()=>{
  const p=project(),tree=split(p,'heat',55),foe=W.monster(0);
  const record=W.predict(tree,p,foe,W.WORLD.spawn),heat=foe.values.heat;
  tree.split.threshold=1000;foe.values.heat=0;p.rows[0].values.heat=0;
  assert.equal(record.monster.values.heat,heat);assert.equal(record.tree.split.threshold,55);
  assert.equal(W.resolve(record,3).correct,true);
  assert.ok(!record.project.rows.some(row=>row.id===record.monster.id));
  record.gearId='hammer';assert.throws(()=>W.resolve(record,3),/snapshot/);
});
test('checkpoints reconstruct trained trees and reject damaged positions, versions and questions',()=>{
  const state=W.fresh();state.started=true;state.hero='maleAdventurer';
  state.position={...W.LANDMARKS.monster.target};state.tree=split(project(),'heat',55);
  state.completed=[0];state.visits=['monster','tree'];state.lastGear='ice';
  assert.deepEqual(W.restore(JSON.parse(JSON.stringify(state))),state);
  assert.throws(()=>W.restore({...state,position:{x:200,y:280}}),/save/);
  assert.throws(()=>W.restore({...state,version:99}),/save/);
  const bad=C.copy(state);bad.tree.split.featureId='__proto__';assert.throws(()=>W.restore(bad));
});


test('version-one adventure saves migrate without losing the hero, question or victories',()=>{
 const old={version:1,started:true,hero:'maleAdventurer',position:{x:905,y:500},tree:split(project(),'heat',55),trial:2,hearts:2,completed:[0,1],visits:['monster','tree'],lastGear:'ice',muted:false,reduced:true};
 const restored=W.restore(old);assert.equal(restored.version,2);assert.equal(restored.hero,old.hero);assert.deepEqual(restored.position,old.position);assert.deepEqual(restored.tree,old.tree);assert.deepEqual(restored.completed,old.completed);assert.equal(restored.unlocked,1);assert.equal(restored.hearts,2);
});
test('Skyreach needs a second question to distinguish three equipment labels',()=>{
 const p=W.projectFor(1),shallow=C.train(p,1),deeper=C.train(p,2),foes=W.wave(1);
 assert.equal(foes.length,3);assert.ok(C.accuracy(shallow,p.rows,p).correct<p.rows.length);assert.equal(C.accuracy(deeper,p.rows,p).correct,p.rows.length);
 assert.ok(W.predictWave(shallow,p,foes,W.WORLD.spawn).some(r=>!W.resolve(r,3).correct));
 assert.ok(W.predictWave(deeper,p,foes,W.WORLD.spawn).every(r=>W.resolve(r,3).correct));
});
test('wave predictions share frozen training evidence and recognise bow and shield equipment',()=>{
 const p=W.projectFor(2,{revealed:true}),tree=C.train(p,4),foes=W.wave(2),records=W.predictWave(tree,p,foes,W.WORLD.spawn);
 assert.equal(records.length,6);assert.ok(records.some(r=>r.gearId==='bow'));assert.ok(records.some(r=>r.gearId==='lantern'));assert.ok(records.every(r=>W.resolve(r,3).correct));
 tree.prediction='Changed';foes[0].values.shadow=false;p.rows[0].label='Changed';
 assert.ok(records.every(r=>W.resolve(r,3).correct));for(const r of records)assert.ok(!r.project.rows.some(n=>n.id===r.monster.id));
});
test('evidence tools reveal a missing feature, correct labelled reports and add rare examples explicitly',()=>{
 assert.ok(!W.projectFor(2).features.some(f=>f.id==='shadow'));assert.ok(W.projectFor(2,{revealed:true}).features.some(f=>f.id==='shadow'));
 const before=Q.notes(3),checked=W.notes(3,{checked:['note-4','note-10']});assert.notEqual(before[4].gear,before[4].real);assert.equal(checked[4].gear,checked[4].real);assert.equal(Q.notes(3)[4].gear,before[4].gear);
 const rare=W.projectFor(4),scouted=W.projectFor(4,{scoutRounds:2});assert.equal(scouted.rows.length,rare.rows.length+6);assert.equal(new Set(scouted.rows.map(r=>r.id)).size,scouted.rows.length);
 const predictions=W.predictWave(C.train(scouted,3),scouted,W.wave(4),W.WORLD.spawn);assert.ok(predictions.every(r=>W.resolve(r,3).correct));
});
test('chapter travel preserves each region tree, enforces unlocks and validates depth limits',()=>{
 let s=W.fresh();assert.throws(()=>W.changeLevel(s,1),/previous/);s.unlocked=1;s.tree=split(project(),'heat',55);const first=C.copy(s.tree);s=W.changeLevel(s,1);const p=W.projectFor(1);s.tree=C.train(p,2);const second=C.copy(s.tree);s=W.restore(JSON.parse(JSON.stringify(s)));s=W.changeLevel(s,0);assert.deepEqual(s.tree,first);s=W.changeLevel(s,1);assert.deepEqual(s.tree,second);
 assert.throws(()=>W.restore({...s,depth:1}),/depth/);assert.throws(()=>W.restore({...s,scoutRounds:1}),/save/);assert.throws(()=>W.restore({...s,level:4}),/save/);
});
test('later waves include a boss and a wrong boss prediction consumes all three hearts',()=>{
 assert.deepEqual([0,1,2,3,4].map(l=>W.wave(l).length),[1,3,6,6,6]);const p=W.projectFor(2,{revealed:true}),boss=W.wave(2).at(-1);assert.equal(boss.boss,true);const record=W.predict(C.newTree(p),p,boss,W.WORLD.spawn);assert.equal(W.resolve(record,3).correct,false);assert.equal(W.resolve(record,3).hearts,0);
});
