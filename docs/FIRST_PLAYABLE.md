# Woodland Atlas: first playable

Built on 1 November 2026 after the user authorised implementation and selected desktop, click-to-walk plus WASD/arrows, deliberate Engage, and Ava/Max in Woodland Atlas.

## Play

From the repository, run `npm start` and open `/game.html` on the server. There are no dependencies to install. For the current workspace preview, port 4174 is running: http://127.0.0.1:4174/game.html. Port 4173 belongs to another project.

1. Choose Ava or Max and begin.
2. Walk with a ground click, WASD or arrows. The destination buttons walk to each landmark around solid obstacles.
3. Approach the creature on Forest Trail and press E or choose Engage. Proximity alone never starts combat.
4. Inspect its clues, read the ten scout reports, and choose a question for the Wise Tree.
5. Open the animated chest, inspect the highlighted prediction path, and equip its gear.
6. See the result, improve a weak question or return to the exact world position. After a victory, find a fresh encounter.

For a quick comparison on the first creature: horns selects a Rock Hammer and loses; heat greater than 55 selects an Ice Sword and wins. The equipment comes from `BranchCore.predict`; the hidden rule is consulted only to resolve combat. Encounter evidence copies the tree, training project, monster and return position. Animation cannot replace an incorrect prediction.

## Scope

One connected map contains Village Square, Scout camp, Ancient Grove and Forest Trail. It offers repeated individual encounters drawn from the existing first lesson, one manual tree split, chest opening, combat, three hearts, optional synthesised sound, reduced motion, a local checkpoint with recovery, export and reset. Reloading during an encounter resumes its world checkpoint. After losing all hearts, "Try another question" restores three hearts for the retry.

This is the first area, not the five-region redesign. The original five-level game remains at `campaign.html`, including `#teacher`; the standalone lab remains at `index.html`. `classifier.js`, `quest-data.js`, `game.js` and the lab are unchanged. Export downloads a checkpoint for inspection; import is not implemented. Existing sprites provide idle, attack, hurt and cheer poses; walking uses a restrained sprite bob rather than a new walking sheet. Mobile was excluded by the user.

## Verification

- `npm run check`: 18 passing tests. Seven new tests cover normalised movement, collision, routes, deliberate proximity, correct/incorrect predictions, snapshot integrity and checkpoint validation.
- `npm run package`: passes; the explicit manifest includes the new adventure, original campaign and all gear art.
- Chromium desktop automation: 16 checks pass, zero runtime exceptions and zero missing assets. See [browser-check.json](playable/browser-check.json).
- Browser checks exercise hero selection, ground/keyboard/waypoint movement, actual losing and winning gear, exact return position, reload persistence, cancelled battle timers, modal input suspension, reduced motion, blur handling, corrupt saves and denied storage.
- Screenshots reviewed at 1440 x 1000, 1440 x 900 and 1280 x 720. No document horizontal overflow. Short desktop modals scroll their content while retaining the action footer. Captures are in [playable/](playable/).

No external player study or physical-device testing has been performed. The next useful feedback is whether a fresh player discovers Engage and understands why changing the question changes the chest's equipment.
