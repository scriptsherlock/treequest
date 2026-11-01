# Asset manifest

Existing inventory: 37 local images/vectors. Full paths, byte sizes and PNG dimensions are in [functional-baseline.json](audit/functional-baseline.json), under assets. Existing licence: assets/gear/LICENSE-Kenney-CC0.txt. No new art was downloaded/generated in this pass.

| Family | Coverage | Reuse decision | Provenance |
| --- | --- | --- | --- |
| Heroes | Ava/Max × idle/attack1/hurt/cheer0; 8 PNGs, 192×256 | Preserve identity, canvas and ground pivot | Existing Kenney CC0 set |
| Monsters | Fire/rock/sky/shadow/phoenix, with/without horns; 10 PNGs | Preserve silhouettes; consistent scale | Existing Kenney CC0 set |
| Places | Grass/castles/forest/fall/desert; 5 JPGs | Palette references; evaluate native scale before reuse | Existing Kenney CC0 set |
| Gear/HUD | Sword/bow/shield/hammer and status/journal/award/tree; 14 files | Reuse gear mapping/icons with essential text labels | Existing local licence set; hammer is SVG |

## Planned additions, not shipped

| Asset | Role / states | Technical contract | Production path |
| --- | --- | --- | --- |
| Village/trail terrain | One compact background/foreground family | Slightly angled top-down; world grid 32; compatible scale | Original code-native geometry first |
| Enchanted chest | Base/lid/lock/glow/item/shadow | Shared pivot; vector layers; existing gear sprite | CSS/SVG transforms, no 3D renderer |
| Signs/colliders | Wayfinding and obstacles | Visible geometry agrees with collision data | Original local SVG |
| Walking family | Optional 6 frames per hero | 192×256 RGBA, unchanged pivot/palette | Only after movement testing proves need |
| Quiet effects | Lock/chest/hit/victory cues | Optional SFX/UI buses, conservative gain, saved mute | Local Web Audio synthesis initially |

Approval requires native-scale inspection against terrain, alpha/pivot/scale/motion checks, every local/packaged URL verified and documented rights. No unsupported claim that generated art is production-ready.
