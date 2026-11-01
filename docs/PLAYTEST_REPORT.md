# Desktop playtest report

1 November 2026. Completed an agent-operated browser playtest in fresh isolated profiles. The user's browser save was not changed. This is not an outside human-player study.

## Result

All five chapters were completed through the actual interface, including deliberately weak trees, failed waves, retries, the missing clue, noisy-label checks and rare-class scouting. No blocking gameplay defect remains in the tested scenarios. Incorrect model predictions remain intentional learning outcomes; the playtest fixes do not replace them with correct weapons.

- 24 unit/engine tests pass.
- 18 full-campaign Chromium scenarios pass.
- 17 additional exploratory/regression scenarios pass: **35 Chromium checks total**.
- Firefox and WebKit smoke tests pass four groups each: startup/fonts, menus/tree/evidence, the complete six-enemy final wave and save reload, and layout/error checks.
- The static package matches 16 runtime files and 57 asset/provenance files. Packaged startup, version-one migration, backup recovery and storage-denied play/reset pass.
- Desktop coverage: 1280 x 720, 1366 x 768, 1440 x 900 and 1920 x 1080. No document overflow or inaccessible modal footer was found.

## Findings and fixes

| Before | After | Why |
| --- | --- | --- |
| The fourth-world hint referred to a magnifier, but the control is called Verify report; fifth-world scouting/depth steps were vague | Adaptive guidance names the actual buttons, explains suspicious reports, both scout expeditions and a depth of three | Players can discover the lesson tools without an external walkthrough |
| Every report check reset the tree, even when the recorded gear was already correct; feedback was generic and checking a lower card jumped the view to the top | Correct reports preserve the tree. Wrong reports show the old and corrected gear, reset stale counts and keep the checked card/verdict in view | Checking evidence has a clear, accurate consequence and does not discard valid work |
| Spending all three checks left every unchecked report disabled, without a local retry | Restart report checks restores the budget and resets only this chapter's evidence/tree; other chapter progress stays saved | Mistaken investigations have a recoverable path without restarting the campaign |
| A correct final enemy could trigger a cheer even when an earlier prediction had failed; wave status relied on coloured roster tiles | Visible correct/total count, explicit Correct/Wrong labels, a stated clear condition and retry feedback for an unsuccessful wave | Beating the last creature is clearly different from clearing every prediction in the wave |
| The last victory looked like another Wave cleared screen and the live announcement said another region was unlocked | Explicit Campaign complete title/banner, all-five-chapters confirmation, completed quest title and accurate announcement | The game now clearly communicates when the campaign is finished |

Also corrected return-to-world copy so it uses the current region rather than always referring to the Wildwood.

## Evidence

- [Summary JSON](playtest/summary.json)
- [Full-campaign checks and screenshots](playtest/after-campaign/browser-check.json)
- [Focused regressions](playtest/regressions/browser-check.json)
- [Firefox/WebKit results](playtest/cross-browser/results.json)
- [Package checks](fullscreen/package-check.json)
- [Corrected-report view](playtest/regressions/01-corrected-report.png)
- [Partial-wave failure feedback](playtest/regressions/03-partial-wave-is-not-victory.png)
- [Campaign-complete screen](playtest/after-campaign/09-shadow-king.png)

The full campaign uses normal progression without teacher unlocks. Focused lesson probes and cross-browser smoke tests use the teacher shortcut to reach the relevant chapter quickly. Firefox initially crashed on a blank page inside the workspace sandbox; the isolated-profile retry outside that sandbox passed before any game issue was reported.

## Reproduce

## GitHub Pages verification

Published to [scriptsherlock/treequest](https://github.com/scriptsherlock/treequest). The [Actions deployment](https://github.com/scriptsherlock/treequest/actions/runs/41307946902) succeeded. The [live adventure](https://scriptsherlock.github.io/treequest/game.html) then passed all **18 full-campaign Chromium checks**, including real incorrect predictions, all five worlds, evidence tools, waves, movement, full screen, cancellation, reload and desktop layouts. No browser exceptions or failed asset responses were recorded. The live lab and original campaign also match their source. [Live verification record](playtest/live-publication.json).

## Reproduce locally

Start the static server on port 4174. The optional QA scripts use an installed Playwright module; it is not a game runtime dependency.

```powershell
$env:PLAYWRIGHT_MODULE = 'path/to/node_modules/playwright'
# Optional if Playwright's default Chromium installation is unavailable:
$env:PLAYTEST_CHROMIUM = 'path/to/chrome.exe'
node docs/playtest/campaign.cjs
node docs/playtest/regression.cjs
npm run check
npm run package
```

`PLAYTEST_URL` can point the scripts at another local game URL. Human classroom sessions, mobile and physical Safari testing were outside this desktop pass. The WebKit smoke test is an engine test, not a claim of testing Safari on a physical Mac or iPhone.
