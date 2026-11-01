'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
(async () => {
  const output = path.join(root, 'dist');
  await fs.mkdir(output, { recursive: true });
  for (const file of ['index.html', 'styles.css', 'classifier.js', 'app.js', 'favicon.svg', '.nojekyll', 'game.html', 'game.js', 'quest-data.js', 'campaign.html', 'adventure.css', 'fantasy.css', 'adventure-core.js', 'adventure-save.js', 'adventure-art.js', 'adventure.js']) {
    await fs.copyFile(path.join(root, file), path.join(output, file));
  }
  await fs.cp(path.join(root, 'assets', 'gear'), path.join(output, 'assets', 'gear'), { recursive: true });
  await fs.cp(path.join(root, 'assets', 'woodland'), path.join(output, 'assets', 'woodland'), { recursive: true });
  console.log('Packaged the lab, Gear Up and its art in dist/.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
