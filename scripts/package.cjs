'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
(async () => {
  const output = path.join(root, 'dist');
  await fs.mkdir(output, { recursive: true });
  for (const file of ['index.html', 'styles.css', 'classifier.js', 'app.js', 'favicon.svg', '.nojekyll']) {
    await fs.copyFile(path.join(root, file), path.join(output, file));
  }
  console.log('Packaged the six static site files in dist/.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
