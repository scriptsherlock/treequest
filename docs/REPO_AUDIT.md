# Repository audit

Audited 1 November 2026 against the original brief. Scope: its FIRST TASK, audit and documentation only. Production source is preserved.

## Actual implementation

- `classifier.js`: independent UMD learner shared by both apps. Boolean/numeric binary splits, weighted Gini improvement, majority leaves, maximum depth 4, numeric equality follows No. Training reads only training rows. `restoreTree` reconstructs splits/counts against the project rather than trusting saved counts.
- `app.js`, `index.html`, `styles.css`: standalone Build/Test/Challenge lab; manual/automatic training, Undo, data editor, explicit JSON Save/Open and native dialogs. Preserve its deliberate lack of autosave.
- `quest-data.js`: authoritative five lessons, feature/gear definitions, seeded notes/waves, hidden feature, noisy labels, checking/scouting tools and hidden combat rule. Names are display content, not predictive features.
- `game.js`: one mutable `G` object; title → story → camp → battle → result. Level entry resets notes/tree. Teaching grows on timers. Battles call the real predictor and compare predicted equipment with the monster's hidden rule. `render` replaces main HTML; delegated events dispatch actions. No continuous world position or adventure persistence.
- `game.html` owns a separate embedded stylesheet. Tree SVG, controls, notes and combat presentation are composed inside game.js.
- `scripts/package.cjs` copies 9 explicit runtime files and assets/gear. GitHub Actions checks, packages and deploys dist to Pages. Earlier README/CLAUDE statements about no Git checkout or only six shipped files are stale.

## Executed checks

`npm run check`: PASS, 11 existing classifier tests and four JS syntax checks. `npm run package`: PASS after an elevated retry permitted writes to existing dist; the first restricted attempt failed with EPERM. No source fix was required.

Browser fallback: Playwright with cached Chromium 149.0.7827.55, because in-app Node browser execution was unavailable. Captured selection, trainer and battle at all four requested sizes. No page exceptions, failed asset responses or broken img elements were recorded in those twelve captures. This is not a complete accessibility/device certification.

| Viewport | Selection document width | Trainer width | Battle width | Observation |
| --- | --- | --- | --- | --- |
| 1440×900 | 1440 | 1440 | 1440 | Competing columns; unused centre space |
| 1280×720 | 1280 | 1280 | 1280 | Battle document extends vertically to 779px |
| 768×1024 | 768 | 768 | 768 | Trainer height 1416px; controls below an 874px notes panel |
| 390×844 | 457 | 508 | 594 | Horizontal overflow in every captured mode |

On mobile the tree starts at y≈854, below the initial viewport, and its SVG is only ≈110px tall. On tablet the tree is ≈111px tall while the notes panel is 874px tall. Evidence: [desktop](audit/desktop-trainer.png), [tablet](audit/tablet-trainer.png), [mobile](audit/mobile-trainer.png), [mobile battle](audit/mobile-battle.png), and exact geometry in [browser-baseline.json](audit/browser-baseline.json).

A deterministic seed-1 browser run completed all 6 enemies with the heat split and reached Victory. The horns split genuinely chose incorrect gear 3 times and retreated before the boss. A different seed let that weak split win, so educational failure must not be forced. Records and asset metadata: [functional-baseline.json](audit/functional-baseline.json).

## Prioritised findings

Relative costs: S = local component/style work; M = bounded state/module integration; L = engine-scale rewrite. These are estimates, not measured implementation times.

| Priority / severity | Finding and source | Proposed fix | Cost | Educational impact |
| --- | --- | --- | --- | --- |
| P0 Broken | Header overflows mobile, further widened by hearts; game.html:17 | Compact/wrapping anchored HUD; min-width:0; retain accessible actions | S | Controls remain reachable |
| P0 Broken | Notes precede and dwarf the tree; game.html:46,89–90 | Focused teaching mode; bounded expandable journal | M | Actual learning task is discoverable |
| P1 High | Main replacement couples UI, state and timers; game.js:186–198 | Mounted exploration root; explicit transitions and cancellable transient effects | M | Prevent mismatched encounter/path state |
| P1 High | No exploration, interaction prompt or return position; game.js:12,72 | One bounded village/trail with deliberate E/Engage interaction | M | Connect observations to learning without involuntary combat |
| P1 High | No prediction chest or frozen decision record; game.js:88–109 | Capture tree/project/monster/path once; chest and combat read that record | M | Wrong predictions remain faithful and explainable |
| P1 High | Adventure progress exists only in memory | Versioned local checkpoint saves; preserve lab manual saving | M | Classroom continuation and revisits |
| P1 High | Tests cover classifier, not game/world flow | Add transition, cancellation, gear mapping, save and browser tests | M | Protect educational invariants |
| P2 Ugly | Tree shrinks while cards/background dominate; game.html:55 | Readable SVG minimum size, internal scroll and restrained hierarchy | S | Questions and thresholds remain readable |
| P2 Fragile | Rerender discards focused controls; title lacks primary replacement | Stable DOM/focus restoration by semantic ID; labelled dialogs | S | Keyboard users can follow the lesson |
| P2 Motion | Projectile animates left/bottom with 700ms ease-in; game.html:72 | Short transform-only movement and skippable explanation | S | Faster, clearer feedback |
| P2 Fragile | Fixed credit overlays content; game.html:86 | Normal-flow footer outside play/teaching surface | S | Preserve text legibility |
| P2 Art gap | Four hero poses each; no walking/directional/chest frames | Reuse roster and specify minimum missing frames | S/M | Maintain character consistency |
| P2 Packaging | New runtime files require explicit registration | Update package manifest with each build task; test dist URLs | S | Published version matches local version |

The engine already supports authentic errors and should not change to make an animation succeed. Keep fresh evaluations separate from any encounter feedback admitted to training. Repeated feedback is practice, not independent evidence.
