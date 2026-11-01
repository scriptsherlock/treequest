# World design

## Canon and first location

Existing canon: Ava/Max, the Wise Tree, scout Pip, fire/rock/sky/shadow creatures and Shadow King. Creatures require different gear; the Tree learns from scout examples and can be wrong. No new faction/economy system is needed for the slice.

Build one handcrafted Village Square/Forest Trail, with an Ancient Grove landmark and Scout Camp interaction in the same compact region. These are subareas, not seven independently loaded worlds.

Blockout: village entry → marked path → scout journal stop → grove teaching landmark → forest clearing with one visible monster. Add a short loop back to the village; the monster must not occupy the only exit. Signs and nearby prompts explain interactions without cluttering the map.

Slightly angled top-down terrain accommodates existing front/three-quarter sprites. Follow/clamp the camera when a viewport cannot show the whole region. Teaching/journal overlays use readable HTML rather than tiny terrain text.

Movement: WASD/arrows; normalised diagonals; collision/camera boundaries; bounded time steps; stop on blur/overlay. Optional click/tap movement must not cross cottages/water. Touch targets are at least 44px. World coordinates are independent of CSS viewport pixels.

## Interaction contract

Proximity identifies an eligible target but does not initiate encounters. Explicit input captures encounter ID, monster values, return position and tree state. Cancel restores that position, clears effects and invalidates callbacks. Defeated and retreated states differ; returning must not immediately retrigger the same monster.

## Later data-driven regions

Rocky Pass can host Sky Raiders; Mistwood hosts Hidden Clue and Unreliable Reports; Shadow Citadel hosts The Shadow King. Region data includes ID, bounds, paths, colliders, spawn, landmarks and encounters. Unlocked locations remain freely revisitable. Normal unlocks and teacher direct access are separate policies. The same controller/renderer serves later areas.

## Coherence / quest registry

| Quest | Existing thread and participants | Location | Reward | Dependency |
| --- | --- | --- | --- | --- |
| training-grounds | Wise Tree learns from Pip's reports; Ava/Max acts | Village/Forest Trail | Existing hearts/stars outcome | None |
| sky-raiders | Three gear categories need enough questions | Future Rocky Pass | Existing lesson reward | Progression / teacher override |
| hidden-clue | Missing shadow measurement | Future Mistwood | Existing lesson reward | Progression / teacher override |
| sleepy-scout | Pip's fallible labels can be checked | Future Mistwood camp | Existing lesson reward | Progression / teacher override |
| shadow-king | Rare shadow examples matter | Future Shadow Citadel | Existing finale reward | Progression / teacher override |

Checked against quest-data.js: no unrelated quest, changed motivation, retroactively defeated boss or duplicate reward. Proposed location labels do not alter the feature schema.
