# Minimal-style monster repair

1 November 2026. The user chose to retain the minimal Woodland Atlas appearance because it suits Ava and Max, then requested proper monster images based on the mangled originals. Painterly experiments were not integrated.

Used `imagegen` and `create-game-assets` to repair source sprites; consulted `emil-design-eng`, `frontend-design`, `game-ui-ux` and `game-feel` for layout and presentation. The accepted page composition, heroes, map, palette and game rules remain intact.

## Repair review

| Before | After | Why |
| --- | --- | --- |
| Fire arms and hands cut off at source-image boundaries | Complete connected arms and hands with transparent padding | Scaling could not recover pixels missing from the original artwork |
| Detached-looking limb joints | Coherent short limbs joined to the familiar body shapes | Retains the simple visual identity while fixing the silhouette |
| Horn tips clipped at image edges | Complete horned and unhorned variants | Horn presence remains a readable learning feature |
| Different source canvases and apparent foot heights | 512 x 512 WebP sprites, common bottom-centre anchor, aspect-preserving display | Keeps the family stable across the world, journal and battle |

Four images are shipped under `assets/woodland/monsters/`: fire, fire-horns, rock and rock-horns. They cover all creatures used in the first area. The original files remain available to the legacy campaign. The repaired family totals about 100 KB. Full prompts, reference paths, generation identifiers and technical QA are recorded in `assets/woodland/monsters/SOURCES.json`; the built-in image generation tool was used. The original Kenney CC0 license is retained, with generated edits recorded separately.

18 existing tests pass; packaging passes; all 16 desktop browser scenarios pass. All four variants load in the journal. Screenshots, a contact sheet and `browser-check.json` are in `docs/monster-repair/`.

## Layout ideas for the next slice

Preserve the current minimal style. These are future arrangements, not applied redesigns.

**Exploration:** keep the world as the main surface. If more quest information is needed, reveal it from the current quest panel rather than adding another permanent column.

```text
[brand]       [Explore / Journal / Tree]       [hero/settings]
[                  world                  ] [current quest]
[                  world                  ] [gear         ]
[Village ------ Camp ------ Grove ------ Trail            ]
```

**Teaching:** retain the current tree-first workspace. When a second question is available, put the selected mixed leaf and its candidate questions next to one another; leave the journal in the context column or its existing tab.

```text
[                 decision tree               ] [creature]
[ selected leaf -> choose its next question    ] [evidence]
[                                       Predict equipment]
```

**Battle:** keep the hero and complete monster balanced across the arena, then show the chosen branch and observed consequence directly below. Reserve motion for the equipment reveal and impact; keyboard navigation and reduced-motion transitions remain immediate.

```text
[hero             arena              monster]
[tree chose ...        ] [battle showed ...  ]
[hearts                     Retry / Return  ]
```

The next gameplay milestone should connect a second location to the existing underfitting lesson: unlock it after a first-area victory, allow two tree questions, and introduce a creature that one split cannot classify well. Reuse the current training-data separation, deliberate Engage and faithful chest prediction.
