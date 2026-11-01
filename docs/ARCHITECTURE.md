# Architecture recommendation

## Choose modular vanilla JavaScript first

| Option | Cost / dependency footprint | Benefit | Limit / reason |
| --- | --- | --- | --- |
| A. Modular vanilla JS + SVG/DOM sprites — selected | No new runtime package; a few explicit modules | Reuses learner, HTML accessibility, assets, file mode and static hosting | Requires deliberate movement/collision/state boundaries |
| B. Lightweight Canvas world beside HTML overlays | Custom renderer/camera/sprite bridge | Useful if a dense scene needs batching | No demonstrated rendering bottleneck; introduces another rendering abstraction |
| C. Phaser for world only | Engine dependency, asset pipeline, scene lifecycle integration | Mature tilemaps, animation, cameras, collision/input | First compact region does not justify added maintenance; reconsider after measured needs |

These are engineering estimates, not engine bundle benchmarks. No React rewrite, framework migration or bundler is needed for the first slice. Preserve classifier.js and quest-data.js as authoritative learning logic/content.

## Planned boundaries

- `classifier.js`: untouched pure learner and validation/restore helpers.
- `quest-data.js`: existing lessons and hidden combat rule; no silent content edits.
- `quest-world.js` (future): pure location definitions, movement, collision and deliberate interaction eligibility; world units independent of viewport pixels.
- `quest-save.js` (future): plain versioned checkpoints, validation, storage failure/backup policy and reconstruction.
- `game.js`: explicit encounter/battle coordinator and event orchestration. Extract existing tree view helpers only where it reduces coupling.
- `game.html` + `game.css` (future): mounted world root, semantic overlays, progressive disclosure and coherent tokens. Standalone lab styles/app remain working.

Keep world DOM mounted during exploration. requestAnimationFrame updates sprite/camera transforms; HUD changes only on events. Bounded movement steps and collision shapes prevent frame-rate-dependent tunnelling. Never replace all main HTML at walking-frame frequency.

## State and evidence

Selection → Explore → Inspect → Tune → Predict → Chest → Battle → Debrief → Explore. Help/journal/settings are overlays that suspend movement. Proximity only makes an interaction eligible. Engage captures a unique encounter token, monster ID/values and return position.

Predict creates one immutable plain record: tree snapshot, project/schema version, feature values, exact path/answers, leaf and predicted gear ID. Chest and battle read that record. No manual weapon override; the hidden answer rule never chooses chest contents. Battle alone compares predicted gear against the existing combat rule. Leave/cancel invalidates tokens and clears scheduled effects, preventing stale callbacks or duplicate damage.

## Persistence

New adventure slot only; preserve lab Save/Open. Store hero, location/position, unlocked/completed encounters, reward flags/stars, stable scene/dialogue checkpoint and relevant project/tree/depth/tools. Include a schema version; reject future/malformed data safely. Validate IDs, finite coordinates, notes and feature schema; restore trees through BranchCore.restoreTree. Save at stable boundaries, avoiding duplicate rewards or half-applied hits on reload. Handle storage failure visibly; require no accounts/personal information.

## Deployment

Add new runtime modules/styles/assets to scripts/package.cjs in the same task that introduces them. Test root and GitHub project subpaths. All URLs stay relative; requests stay local. Existing check → package → Pages CI remains the deployment path. No publishing action is part of this planning task.
