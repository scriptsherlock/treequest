# Test plan

## Baseline executed 1 November 2026

- npm run check: 11/11 classifier tests and four JS syntax checks pass.
- npm run package: passes after permission retry for existing dist.
- Selection/trainer/battle captured at 1440×900, 1280×720, 768×1024, 390×844. No page exceptions, asset404s or broken img elements in those captures.
- Seed 1: heat split learns 10/10 notes, beats all 6 foes and reaches Victory. Horns split makes 3 real combat misses and retreats before the boss. No forced outcomes.
- New world/chest/saves are planned, not implemented or tested. No physical-device, screen-reader, pupil or performance-study claim.

## Required implementation checks

| Boundary | Assertions |
| --- | --- |
| Movement | Cardinal/diagonal speeds agree; bounded finite steps; collision/camera bounds; resize preserves world coordinates |
| Interaction | Proximity only prompts; E/button captures correct monster; cancel returns to exact position; no duplicate trigger |
| Learning | Existing tests pass; max depth 4; equality No; names/IDs excluded; unseen monsters never silently enter training |
| Prediction | Features/tree version/path/answers/leaf match BranchCore; snapshot stays fixed during chest/combat |
| Chest | Item equals predicted-label mapping; actual weak-tree wrong prediction retained; skip/reduced-motion content identical |
| Combat | Captured prediction determines success/hearts; no manual bypass; cancellation cannot cause a late hit; repeated input applies damage once |
| Return/retry | Position/progress retained; tuning affects later predictions; feedback admitted for training becomes practice; independent retry uses fresh cases |
| Save/reset | Plain versioned schema, corrupt/future saves, safe coordinates/IDs, restoreTree reconstruction, no duplicate rewards; lab unaffected |
| Teacher mode | Relevant encounter access, objectives, reset and quick demonstrations; normal progression separate |
| Packaging | Every new runtime URL exists in dist; relative project-subpath/file paths as applicable; lab still loads |

## Browser coverage

Desktop 1440×900, laptop 1280×720, tablet 768×1024, mobile 390×844; stress 320px and 200% text/zoom. Check overflow, reachable actions, contrast, focus restoration, labelled dialogs, reduced motion, touch targets and pause/blur/skip/cancel. Use a dev-only Demo/Worst/Empty/One fixture surface outside production packaging for long names, deep trees, accepted note limits and empty states. Supply data through the real boundary, not hand-edited markup.

Exercise successful and genuine weak-tree loops. Inspect screenshots alongside assertions. Record hardware/frame intervals only when measured; a fast desktop is not physical-device evidence.

## Classroom evaluation to perform later

With consent and adult facilitation, ask a pupil pair to explore, inspect, choose a split, predict gear, explain the path, investigate an actual miss and retry. Observe whether exploration helps or hides learning. Ask what the Tree learns, what a split does, why gear appeared, what evidence was missing and what changed after correction. Keep observations separate from interpretations. Do not invent participants, quotes or learning gains.
