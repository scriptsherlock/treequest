# UI and motion review

Read with REPO_AUDIT.md. This reviews the existing game; corrections are planned, not applied, because the brief's first task stops after audit/documentation.

| Before | After (proposed) | Why |
| --- | --- | --- |
| Non-wrapping header grows from 508px trainer width to 594px battle width on a 390px viewport; game.html:17 | Compact/wrapping HUD with stable health/action slots | Current actions can be off-screen |
| Notes occupy 694px before the tree at mobile; game.html:46,90 | Tree first, journal in a bounded expandable surface | Learning controls need primary spatial priority |
| Tablet tree approximately 111px tall while notes occupy 874px; game.html:55,89 | Readable diagram minimum size and intentional supporting layout | Avoid scaling educational text into an unreadable miniature |
| Projectile animates left/bottom for 700ms with ease-in; game.html:72 | Animate transform with short strong ease-out; explanation remains skippable | Layout animation and slow initial response add avoidable cost/delay |
| Hover styles are unconditional; game.html:22,27 | Gate hover by hover/pointer capabilities, keep press feedback | Touch can retain a misleading hover state |
| Floating credit is fixed over content; game.html:86 | Normal-flow footer | Actual screenshots show the credit near teaching text |
| Full main HTML replacement on updates; game.js:186–195 | Stable exploration DOM and semantic focus restoration for overlays | Walking must not rerender the whole application or strand focus |
| No chest or immutable equipment record | One real prediction record plus layered chest reveal | Animation must preserve even an incorrect predicted weapon |

## Motion verdict

**Block for a polished release in its current form.** Confirmed mobile overflow and diagram hierarchy need correction. The projectile has an easy transform-only alternative. A reduced-motion CSS rule already exists; it is a useful baseline to retain, and the new game-feedback timeline needs skip/cancel as well.

Planned chest motion belongs to deliberate equipment feedback: lock 120ms, lid 240ms, item/light 200ms, transform/opacity only. Total optional reveal around one second; skip immediately exposes the identical prediction. Ordinary keyboard navigation stays instant. Do not add a motion library for these effects.

No frame-time, audio-output, real-touch, screen-reader or pupil-playtest measurement was performed. Proposed fixes should be verified during the first build slice at the four captured widths plus 320px/200% text.
