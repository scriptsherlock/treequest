/* Gear Up: villains, levels and the hidden rule. No DOM, so it can be tested in Node. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.QuestData = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const GEAR = {
    ice: { label: 'Ice Sword', icon: '❄️', beats: 'hot villains', color: '#3d9bd6', img: 'sword' },
    bow: { label: 'Sky Bow', icon: '🏹', beats: 'flying villains', color: '#4f9a3c', img: 'bow' },
    hammer: { label: 'Rock Hammer', icon: '🔨', beats: 'everyone else', color: '#8a6446', img: 'hammer' },
    lantern: { label: 'Sun Shield', icon: '🔆', beats: 'shadow villains', color: '#e3a21a', img: 'shield' }
  };
  const CLUES = {
    heat: { id: 'heat', name: 'Heat', type: 'number', icon: '🔥' },
    flies: { id: 'flies', name: 'Can fly', question: 'Can it fly?', type: 'boolean', icon: '🪽' },
    shadow: { id: 'shadow', name: 'Shadow', question: 'Is it made of shadow?', type: 'boolean', icon: '🌑' },
    armour: { id: 'armour', name: 'Armour', type: 'number', icon: '🛡️' },
    horns: { id: 'horns', name: 'Horns', question: 'Does it have horns?', type: 'boolean', icon: '🦌' }
  };
  const KINDS = {
    fire: { emoji: '🐉', first: ['Lava', 'Cinder', 'Ember', 'Blaze', 'Magma', 'Scorch'], last: ['Drake', 'Imp', 'Beast', 'Lizard'], heat: [70, 100], flies: false, shadow: false },
    sky: { emoji: '🦅', first: ['Storm', 'Gale', 'Gust', 'Cloud', 'Thunder', 'Breeze'], last: ['Hawk', 'Harpy', 'Bat', 'Raven'], heat: [10, 40], flies: true, shadow: false },
    rock: { emoji: '🗿', first: ['Stone', 'Boulder', 'Granite', 'Pebble', 'Crag', 'Gravel'], last: ['Troll', 'Golem', 'Giant', 'Ogre'], heat: [10, 40], flies: false, shadow: false },
    shadow: { emoji: '👻', first: ['Gloom', 'Murk', 'Dusk', 'Shade', 'Night', 'Smudge'], last: ['Ghost', 'Wisp', 'Moth', 'Phantom'], heat: [10, 40], flies: null, shadow: true },
    phoenix: { emoji: '🐦‍🔥', first: ['Flame', 'Sun', 'Spark', 'Ash'], last: ['Bird', 'Phoenix', 'Wing'], heat: [80, 100], flies: true, shadow: false }
  };
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const pick = (r, list) => list[Math.floor(r() * list.length)];
  const between = (r, lo, hi, step = 1) => lo + step * Math.floor(r() * ((hi - lo) / step + 1));
  function truth(v, gears) {
    if (v.shadow && gears.includes('lantern')) return 'lantern';
    if (v.heat > 60) return 'ice';
    if (v.flies && gears.includes('bow')) return 'bow';
    return 'hammer';
  }
  function makeVillain(kind, r, extra = {}) {
    const k = KINDS[kind];
    const values = { heat: between(r, k.heat[0], k.heat[1], 10), flies: k.flies === null ? r() < .5 : k.flies, shadow: k.shadow, armour: between(r, 1, 9), horns: r() < .5, ...extra.values };
    return { kind, emoji: extra.emoji || k.emoji, name: extra.name || pick(r, k.first) + ' ' + pick(r, k.last), values };
  }
  const LEVELS = [
    {
      title: 'Training Grounds', place: '🏕️', gears: ['ice', 'hammer'], clues: ['heat', 'armour', 'horns'], manual: true, depth: [1, 1, 1], seed: 11,
      story: ['Welcome, hero! Villains are coming to the village.', 'You have two weapons: the ❄️ Ice Sword and the 🔨 Rock Hammer.', 'Read the scout notes. Then help the Wise Tree pick ONE good question that sorts the villains.'],
      notes: ['fire', 'rock', 'fire', 'rock', 'fire', 'rock', 'rock', 'fire', 'fire', 'rock'],
      battle: ['fire', 'rock', 'rock', 'fire', 'rock'], boss: { kind: 'fire', name: 'Lava King', emoji: '🐲', values: { heat: 100, armour: 9, horns: true } },
      hint: 'Look at the notes. Which clue is different for Ice Sword villains and Rock Hammer villains?',
      lesson: ['Learning from examples', 'The Wise Tree never saw the Lava King before. It learned a rule from the scout notes, then used it on a new villain. That is what machine learning is!']
    },
    {
      title: 'Sky Raiders', place: '⛰️', gears: ['ice', 'bow', 'hammer'], clues: ['heat', 'flies', 'armour', 'horns'], depth: [1, 3, 1], seed: 22,
      story: ['Look up! Some villains can FLY now.', 'You have a new weapon: the 🏹 Sky Bow.', 'Choose how many questions the Wise Tree may ask, then press Teach.'],
      notes: ['fire', 'sky', 'rock', 'sky', 'fire', 'rock', 'sky', 'rock', 'fire', 'sky', 'rock', 'fire'],
      battle: ['rock', 'sky', 'rock', 'fire', 'rock'], boss: { kind: 'rock', name: 'Cliff Giant', emoji: '🗿', values: { heat: 20, armour: 9, horns: true } },
      hint: 'With 1 question the tree can only give 2 answers. But you have 3 weapons!',
      lesson: ['Too simple', 'A tree with too few questions cannot tell everything apart. It needed at least 2 questions for 3 weapons.']
    },
    {
      title: 'The Hidden Clue', place: '🌲', gears: ['ice', 'bow', 'hammer', 'lantern'], clues: ['heat', 'flies', 'shadow', 'armour', 'horns'], hidden: 'shadow', depth: [1, 4, 3], seed: 33,
      story: ['Spooky! Shadow villains live in this forest.', 'Only the 🔆 Sun Shield can beat them.', 'But the scouts forgot to write down one clue…'],
      notes: ['fire', 'shadow', 'sky', 'rock', 'shadow', 'fire', 'sky', 'rock', 'shadow', 'fire', 'sky', 'rock', 'shadow', 'rock'],
      battle: ['shadow', 'rock', 'fire', 'shadow', 'sky'], boss: { kind: 'shadow', name: 'Gloom Phantom', emoji: '👻', values: { heat: 20, flies: true, armour: 2, horns: false } },
      hint: 'The tree cannot see what makes a shadow villain. Try the 🔍 Magic Glass.',
      lesson: ['Missing clues', 'A computer can only learn from the clues it is given. With no "shadow" clue, the tree could never spot shadow villains, however hard it tried.']
    },
    {
      title: 'The Sleepy Scout', place: '🌙', gears: ['ice', 'bow', 'hammer', 'lantern'], clues: ['heat', 'flies', 'shadow', 'armour', 'horns'], depth: [1, 4, 4], seed: 44, checks: 3,
      story: ['Our scout Pip was very sleepy last night. 😴', 'Pip wrote that trolls with horns need the Ice Sword. Hmm…', 'Will the Wise Tree copy Pip’s mistakes?'],
      notes: ['fire', 'rock', 'sky', 'shadow', 'rock', 'fire', 'sky', 'rock', 'shadow', 'fire', 'rock', 'sky', 'rock', 'fire', 'shadow', 'rock'],
      wrong: { 4: { label: 'ice', values: { horns: true } }, 10: { label: 'ice', values: { horns: true } } },
      fixValues: { 1: { horns: false }, 7: { horns: false }, 12: { horns: false }, 15: { horns: false } },
      battle: ['rock', 'fire', 'sky', 'rock', 'shadow'], battleValues: { 0: { horns: true }, 3: { horns: true } }, boss: { kind: 'rock', name: 'Horned Mountain', emoji: '🦬', values: { heat: 30, armour: 8, horns: true } },
      hint: 'The tree believes every note, even the wrong ones. Use the 🔎 magnifier to check Pip’s notes about horned trolls.',
      lesson: ['Learning mistakes', 'The tree learned Pip’s mistakes as if they were true. Bad examples teach bad rules. Checking and fixing the notes helped it learn the real rule.']
    },
    {
      title: 'The Shadow King', place: '🏰', gears: ['ice', 'bow', 'hammer', 'lantern'], clues: ['heat', 'flies', 'shadow', 'armour', 'horns'], depth: [1, 3, 3], seed: 55, scouts: 2,
      story: ['This is it. The Shadow King is coming! 👑', 'Shadow villains are rare, so the scouts only saw ONE.', 'Can the Wise Tree learn from just one example?'],
      notes: ['fire', 'rock', 'sky', 'fire', 'rock', 'sky', 'shadow', 'rock', 'fire', 'sky', 'rock', 'fire', 'sky', 'rock', 'phoenix', 'fire'],
      noteValues: { 6: { flies: false, heat: 40 } },
      battle: ['fire', 'sky', 'rock', 'phoenix', 'sky'], boss: { kind: 'shadow', name: 'Shadow King', emoji: '👑', values: { heat: 70, flies: true, armour: 9, horns: true } },
      scoutKinds: ['shadow', 'shadow', 'shadow'],
      hint: 'One example is not enough. Send the 🧭 scouts to find more shadow villains.',
      lesson: ['Too few examples', 'The tree saw lots of dragons and trolls, but only one shadow villain, so it hardly learned about them. Rare things need enough examples too.']
    }
  ];
  function gearLabel(id) { return GEAR[id].label; }
  function gearId(label) { return Object.keys(GEAR).find(id => GEAR[id].label === label); }
  function notes(levelIndex) {
    const level = LEVELS[levelIndex];
    const r = rng(level.seed);
    return level.notes.map((kind, i) => {
      const extra = { values: { ...(level.fixValues || {})[i], ...(level.noteValues || {})[i] } };
      const wrong = (level.wrong || {})[i];
      if (wrong) Object.assign(extra.values, wrong.values);
      const v = makeVillain(kind, r, extra);
      const real = truth(v.values, level.gears);
      return { ...v, id: 'note-' + i, gear: wrong ? wrong.label : real, real };
    });
  }
  function scoutNotes(levelIndex, round) {
    const level = LEVELS[levelIndex];
    const r = rng(level.seed * 100 + round);
    return level.scoutKinds.map((kind, i) => { const v = makeVillain(kind, r); return { ...v, id: `scout-${round}-${i}`, gear: truth(v.values, level.gears), real: truth(v.values, level.gears), fresh: true }; });
  }
  function battle(levelIndex, seed) {
    const level = LEVELS[levelIndex];
    const r = rng(seed);
    const list = level.battle.map((kind, i) => makeVillain(kind, r, { values: { ...(level.battleValues || {})[i] } }));
    const boss = makeVillain(level.boss.kind, r, level.boss);
    boss.boss = true;
    return [...list, boss].map((v, i) => ({ ...v, id: 'foe-' + i, gear: truth(v.values, level.gears) }));
  }
  function project(levelIndex, noteList, revealed) {
    const level = LEVELS[levelIndex];
    const clues = level.clues.filter(id => id !== level.hidden || revealed);
    return {
      version: 1, name: level.title, description: '', labels: level.gears.map(gearLabel),
      features: clues.map(id => ({ ...CLUES[id] })),
      rows: noteList.map(n => ({ id: n.id, name: n.name, label: gearLabel(n.gear), set: 'train', values: Object.fromEntries(clues.map(id => [id, n.values[id]])) }))
    };
  }
  return { GEAR, CLUES, KINDS, LEVELS, rng, truth, makeVillain, notes, scoutNotes, battle, project, gearLabel, gearId };
});
