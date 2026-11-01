# Full-screen fantasy expansion

The user authorised a full-screen fantasy HUD inspired by strategy/MOBA game layouts, more tree questions, and waves for harder lessons. Retain Ava/Max and the repaired simple monsters.

Palette: deep fir #172b28, aged brass #bd9652, candlelight #f0dfac, parchment #f3edda, moss #8ea67a, coral #d88072. Cinzel for titles; Alegreya Sans for readable interface/body text, both local with OFL and FONTLOG records. Fonts sourced from the official Google Fonts repository.

The world fills the viewport. HUD groups anchor to corners: crest/location above, quests upper right, hero/equipment lower left, command bar bottom centre, minimap lower right. The tree remains a large readable manuscript with selected leaf questions beneath it and context to its right. The battle uses a wave roster above the arena and the actual chosen path below.

```text
[crest]                    [region]                    [tools]
[                                                           ]
[                 full-screen world                 ] [quest]
[                                                           ]
[hero / hearts / gear] [journal / tree / kingdom]    [minimap]
```

Review: the earlier wide page heading and permanent sidebar took space from exploration. Replace those with anchored game HUD groups. Keep learning data stable while editing; reserve motion for reveal, impact and meaningful overlay entry. Reuse native dialogs, reduced motion, 120ms press feedback and 200ms ease-out modal entry. No motion library is needed.

Progression uses the existing five datasets. Wildwood begins with one question and one enemy. Sky Raiders adds a depth limit up to three and three enemies; later lessons use up to four questions on a path and six-enemy waves. The same frozen trained tree predicts equipment for every enemy in a wave. Missing features, noisy notes and rare classes retain their explicit data-repair tools. Save version 1 migrates without losing hero, tree or previous wins.

## Implemented and verified

All five chapters are playable in the expanded adventure. Each chapter currently reuses the base map geometry, tinted by biome, with its own name, dataset, trained tree and evidence. The original campaign and standalone lab are preserved. Browser full screen is optional: the game already fills its browser viewport.

| Before | After | Why |
| --- | --- | --- |
| Page heading and a permanent sidebar outside the map | Edge-anchored HUD over a viewport-filling world | Exploration becomes the main surface |
| One root question only | Selectable mixed leaves, depth limits, manual cut-offs, undo and optional automatic growth | More specific decisions can equip different enemy types |
| One creature at a time throughout | One, three, then six enemies with a visible wave roster | More complex trees are tested against diverse creatures |
| HUD could overlap a creature at short desktop sizes | Compact quest details and a warpath staged farther from the quest corner | Monster silhouettes and the explicit Engage prompt remain visible |
| Repeated nested vertical scrolling in the tree | Tighter branch spacing and one manuscript scroll surface | Questions and gear labels stay readable as the tree grows |

Checks: `npm run check` passes 24 tests. The browser playthrough passes 18 scenarios, completing all five chapters through actual UI actions. It verifies weak-tree losses, two-/three-question manual trees, undo, missing clues, noisy-label checks, rare-class scouting, per-enemy equipment previews, cancellation, saved chapter trees, browser full screen, scaled movement and keyboard/reduced motion. There are no browser exceptions or missing local assets. Captures cover 1440 x 900, 1280 x 720 and 1920 x 1080: see [fullscreen/browser-check.json](fullscreen/browser-check.json).

Sprites: ten reference-image repairs, generated with the built-in image tool, normalised to 512 x 512 WebP with verified alpha and a shared ground anchor. Full prompts/references are in `assets/woodland/monsters/SOURCES.json`. Typography sources and included licences are recorded in `assets/woodland/fonts/SOURCES.json`.

Skill discovery (`npx skills find "game ui"`) confirmed the installed `gamedev-skills/awesome-gamedev-agent-skills@game-ui-ux` as the leading match. Applied that skill with Emil design engineering, frontend design, animation, game feel and save-system guidance. No additional animation library was needed. Motion uses transform/opacity, 120ms press feedback, 200ms modal entry and brief attack/recoil feedback; reduced motion and keyboard-triggered UI remain immediate.

Final package verification passes: 16 runtime files and 57 asset/provenance files match the source. A browser smoke test loads the packaged game, migrates a version-one save, restores a damaged save from backup and plays/resets with storage denied. The classifier, quest data, standalone lab and original campaign match the original checkout. See [fullscreen/package-check.json](fullscreen/package-check.json).
