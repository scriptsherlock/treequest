# Tree Quest — Decision tree lab

A hands-on HTML/CSS/JavaScript decision tree lab for Years 6–9, with an original blocky game theme, local monospace fonts and emoji item icons. No build step, accounts, API keys, packages, analytics or runtime network requests. The original car demo is preserved alongside it.

The first screen focuses on choosing a question, seeing named items in Yes/No groups, and using that question. The large introductory banner has been removed. Extra questions, automatic training, mathematical explanations, scores and the full example list are expandable. Save, Open, project editing and teacher notes live in the **🎒 Project** menu. In Test, the first unseen item is selected automatically and **Try another item** moves through the set.

## Open the lab

Double-click `index.html`. All scripts and styles are local, so it also works offline. For a local HTTP preview with Node.js installed:

```sh
npm start
```

Open **http://127.0.0.1:4173**. There is no `npm install` step. Stop the server with Ctrl+C. Use `PORT` to change the port if needed.

## Classroom flow

1. **Build:** choose between two initial Yes/No questions. Read the item names in both preview groups, use the question, then choose another question for a mixed group. More questions include numerical cut-offs. Undo allows comparing questions.
2. **Compare:** expand “Let the computer help”. “One split” chooses one question automatically. “Build the rest” grows the remaining branches. Change the automatic depth limit to explore simple versus complex trees.
3. **Test:** use six examples held out of training. Labels and category icons are hidden until the prediction finishes. Follow the path one question at a time, or test the whole set. A fully trained starter tree gets 15/15 training examples and 5/6 test examples right. The Counter shield is intentionally unusual.
4. **Challenge:** supply an example and its correct label before predicting. A disagreement can reveal missing features, ambiguous labels or an inadequate split. Add an example to training, rebuild and test on fresh data.
5. **Create:** open **🎒 Project → Your own project** to start an empty dataset with your chosen labels. Add features and examples in the data editor. A custom Yes/No question requires an answer for every example; numerical features use thresholds. “Add your own question” below the workspace also opens the editor.

The starter predicts a **fictional designer’s assigned category**, not whether an item objectively must belong to a category. Items can have multiple abilities. Encourage pupils to question labels and missing measurements.

Teacher notes and a field guide are built into the app. Use approximately 30–40 minutes in pairs. Years 6–7 can focus on questions, groups and paths. Years 8–9 can explore Gini impurity, depth limits and evaluation.

## Save and open

**Save project** downloads JSON containing the dataset, tree and depth preference. **Open project** validates a saved file and restores its tree. There is deliberately no automatic saving: refreshing or closing loses unsaved work. Files stay on the student's device; a teacher can receive them through the school's usual submission system.

Changing data resets the tree and test scores, so a tree cannot silently keep old counts or missing feature values. New features default to No/0; fill in their actual values before applying. The editor supports up to 120 examples, 8 features and 2–6 labels.

## Publish on GitHub Pages

The folder supplied in this workspace has no `.git` checkout or configured remote. Create a GitHub repository (or copy the files into your existing repository) and push them there.

**Included deployment workflow (recommended):**

1. Push these files, including `.github/workflows/pages.yml`, to the repository's `main` branch.
2. In the repository, select **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Open **Actions → Publish Branch lab to GitHub Pages → Run workflow**, or push another change to `main`.
4. Open the deployment URL shown by the completed workflow, usually `https://OWNER.github.io/REPOSITORY/`.

The workflow runs the checks, packages only the six public lab files in `dist/`, and publishes those. The old `uploads/` folder and original exports are not included in that deployment. No dependencies are installed.

**Without Actions:** run `npm run package`, copy the six files from `dist/` to a repository's root or `docs/`, and choose that folder under **Settings → Pages → Deploy from a branch**. Alternatively publish the current root directly; that also exposes the original files and uploads at their paths.

All assets use relative URLs, so GitHub project subpaths work. No back end or Python server is required. You must enable Pages in the repository and have permission to publish it. GitHub Pages sites are normally public; keep student project files out of the public repository.

## How the classifier works

`classifier.js` is an independent, testable learning engine:

- Binary splits: boolean Yes/No or numerical `value > threshold` (equality follows No).
- Automatic numerical thresholds are midpoints between distinct training values.
- Select the greatest reduction in weighted Gini impurity. Ties use the remaining training mistake count and then feature order.
- Grow greedily; stop at a pure group, no positive improvement or the selected depth limit. This is a small educational CART-style learner, not the complete CART implementation with pruning.
- Each leaf predicts its most common training label. Tied labels use project label order.
- Automatic growth never reads test examples. Manual splits may be weaker than the automatic choice and are permitted for experimentation.
- Maximum four questions on any path. Automatic depth defaults to three.
- Names are display identifiers, never predictive features. No language model interprets typed questions or looks up facts.

The displayed “mistakes remaining” counts minority labels if both proposed child groups became majority-label leaves. It explains a preview; automatic training scores Gini improvement instead.

Test results are only evidence for the small supplied test set. Once pupils use them to adjust the model, they are development feedback; use fresh examples for the next independent evaluation.

## Verify

```sh
npm run check
```

Tests cover manual splits, numeric boundaries, stepwise and complete training, depth limits, contradictory data, save/open reconstruction, malformed input and separation of test data. `npm run package` copies the static website into `dist/`.

The app is keyboard accessible, supports reduced motion, responsive layouts and native modal focus handling. It uses local system fonts and SVG diagrams, with text labels alongside colours.
