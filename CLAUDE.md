# CLAUDE.md

Guidance for working in this repository.

## What this is

**Tree Quest**: a buildless, dependency-free, offline-capable browser lab that teaches decision trees to pupils in Years 6–9. Plain HTML/CSS/JS, no npm packages, no network requests at runtime, no back end. It's deployed to GitHub Pages (remote: `scriptsherlock/treequest`). The user-facing docs are in [README.md](README.md). Its line saying the folder has "no `.git` checkout" is out of date.

## Commands

```sh
npm start          # static server at http://127.0.0.1:4173 (PORT env to change)
npm test           # node:test suite for the classifier
npm run check      # syntax-check classifier.js + app.js, then run tests (CI runs this)
npm run package    # copy the six public files into dist/
```

There is no `npm install`, because there are no dependencies. Node 22 is used in CI. Run a single test with `node --test --test-name-pattern="<substring>" tests/classifier.test.cjs`. Opening `index.html` directly from disk also works.

## Architecture

The live app is just these files: `index.html`, `styles.css`, `classifier.js`, `app.js`, `favicon.svg`, `.nojekyll`. [scripts/package.cjs](scripts/package.cjs) copies exactly those into `dist/`, and [.github/workflows/pages.yml](.github/workflows/pages.yml) deploys `dist/` on every push to `main`. **If you add a new runtime file, add it to the list in `package.cjs` too**, or the deployed site won't have it.

### [classifier.js](classifier.js): learning engine
- Pure logic with no DOM. It's a UMD wrapper: in the browser it exposes `window.BranchCore`, and in Node it uses `module.exports` (the tests rely on this).
- It's a small CART-style learner with binary splits only. Boolean features split on `=== true`. Numeric features split on `value > threshold`, so equality goes to No. Automatic thresholds are midpoints between distinct training values.
- `candidates()` ranks splits by Gini gain, then by `remaining` mistakes, then by feature order (the sort is stable). `nextSplit`/`growStep`/`train` grow greedily, breadth-first via `walk()` (No branch before Yes). `MAX_DEPTH = 4`, and the UI's automatic depth defaults to 3.
- Tree nodes look like `{ id, depth, prediction, rowIds, split: {featureId, threshold} | null, no, yes }`. Node ids encode the path: `'r'` is the root, then `+'0'` for No and `+'1'` for Yes (e.g. `'r10'`).
- A project looks like `{ version: 1, name, description, labels[2–6], features[≤8]: {id, name, type:'boolean'|'number', question?, unit?}, rows[≤120]: {id, name, label, set:'train'|'test', values} }`.
- `validateProject()` is the trust boundary for loaded JSON files. It enforces the limits above, rejects `__proto__`-style feature ids, and requires every value to be a finite number up to ±1e6. `restoreTree()` rebuilds a saved tree by re-applying its splits, so stale counts can't survive a load.
- `starter()` holds the built-in game-item dataset: 15 train rows and 6 test rows. The tests pin its behaviour. A depth-3 tree scores 15/15 on training and 5/6 on test, and the "Counter shield" miss is intentional. Changing the starter data or tie-breaking will break those tests.

### [app.js](app.js): UI
- An IIFE around a single `state` object (project, tree, mode `build|test|challenge`, selected node, history for undo, test results, zoom, and so on). Every change goes through `render()`, which rebuilds the views with `innerHTML` template strings and then puts focus back on the matching `data-*` element.
- Events are delegated at `document` level: clicks dispatch on `data-action`, `data-mode`, `data-node`, `data-filter` and `data-close`. To add a button, give it a `data-action` and handle it in the click listener near the bottom of the file.
- Any user text that goes into HTML must pass through `escape()`.
- Call `remember()` before changing the tree so Undo works. Editing data resets the tree and the results. Save/Open writes and reads JSON through download and file input. Nothing is auto-saved, and there's no localStorage, by design.
- Test-set rows must never influence training. There's a test for this. Keep it true in any new code path.

### Styling
[styles.css](styles.css) is dense, mostly single-line CSS with tokens on `:root`, a blocky "game" look and monospace system fonts. Keep everything local: no web fonts, CDNs or images loaded at runtime.

## Other files (not part of the deployed lab)

- `.qa/browser-check.cjs`: a manual smoke test using headless Chrome. It starts `serve.cjs`, drives the UI over the DevTools protocol on port 9226 and saves screenshots to `.qa/`. It hard-codes the Windows Chrome path. `.qa/` is gitignored.
- `dist/` is a build output and is gitignored.

## Conventions

- Language is British English, aimed at children, in both UI copy and error messages (e.g. "Defence", "armour").
- Accessibility matters here. Keep the ARIA roles and tab semantics, keyboard navigation, native `<dialog>`, reduced-motion support and text labels next to colours.
- Code style: `'use strict'`, semicolons, compact arrow functions and few comments. Match the density of the surrounding code.
