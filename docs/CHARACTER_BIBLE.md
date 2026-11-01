# Character bible

| Character | Motivation / voice | Gameplay role | Existing source |
| --- | --- | --- | --- |
| Ava | Curious, observant, willing to revise; short encouraging lines | Selectable Treekeeper; same abilities as Max | femaleAdventurer family |
| Max | Practical, persistent, likes testing ideas; clear direct lines | Selectable Treekeeper; same abilities as Ava | maleAdventurer family |
| Wise Tree | Wants reliable evidence; wise about questions, explicitly not omniscient | Embodies the actual classifier | wise-tree.png and real tree SVG |
| Pip | Well meaning and sometimes sleepy; admits mistakes without humiliating pupils | Journal and noisy-note checking | Existing dialogue/data |
| Shadow King | Existing final model challenge | Tests rare shadow-class observations | Existing shadow/horns/crown assets |

Selection previews Ava/Max, one short personality description, clear selection and Confirm. Hero choice must not imply improved classifier accuracy.

Existing coverage: four poses each (idle, attack1, hurt, cheer0), all 192×256. No true walk, directional, interact or chest-opening frames exist. Reuse the existing family. A transform-driven step can be an explicitly limited interim walk treatment; animate the chest while the hero prepares with existing poses.

Minimum extra walking family if later feel-testing requires it: two east-facing steps mirrored west, two north and two south per hero (six each, twelve total). Preserve canvas, pivot, palette and identity. Dedicated interaction/chest frames are optional refinements. These are specifications, not generated assets.

Dialogue is short, skippable and data-driven. Show full readable lines initially. Any later typewriter effect must instantly complete on input and preserve wrapping. Failure explanation uses the actual path/features, without claiming the Tree understood a creature or forcing a scolding.
